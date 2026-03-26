import type { Pipeline, PipelineRunResult, JobContext } from '../types'

/**
 * PipelineRunner - Executes a Pipeline in three ordered stages: collect → process → store.
 *
 * Each stage's duration is measured and returned in the result.
 * If any stage throws, the error is logged and re-thrown to terminate the pipeline.
 */
export class PipelineRunner {
  async run<TInput, TOutput>(
    pipeline: Pipeline<TInput, TOutput>,
    context: JobContext
  ): Promise<PipelineRunResult> {
    const stageDurations = { collect: 0, process: 0, store: 0 }
    let rawData: TInput[] = []
    let processedData: TOutput[] = []
    let storedCount = 0

    // ─── Stage 1: Collect ──────────────────────────────────────────────────
    {
      const t0 = Date.now()
      try {
        context.logger.info('Pipeline stage: collect - starting')
        rawData = await pipeline.collect(context)
        stageDurations.collect = Date.now() - t0
        context.logger.info(
          `Pipeline stage: collect - done (${rawData.length} items, ${stageDurations.collect}ms)`
        )
      } catch (err) {
        stageDurations.collect = Date.now() - t0
        context.logger.error(
          `Pipeline stage: collect - failed after ${stageDurations.collect}ms`,
          err
        )
        throw err
      }
    }

    // ─── Stage 2: Process ──────────────────────────────────────────────────
    {
      const t0 = Date.now()
      try {
        context.logger.info('Pipeline stage: process - starting')
        processedData = await pipeline.process(rawData, context)
        stageDurations.process = Date.now() - t0
        context.logger.info(
          `Pipeline stage: process - done (${processedData.length} items, ${stageDurations.process}ms)`
        )
      } catch (err) {
        stageDurations.process = Date.now() - t0
        context.logger.error(
          `Pipeline stage: process - failed after ${stageDurations.process}ms`,
          err
        )
        throw err
      }
    }

    // ─── Stage 3: Store ────────────────────────────────────────────────────
    {
      const t0 = Date.now()
      try {
        context.logger.info('Pipeline stage: store - starting')
        const result = await pipeline.store(processedData, context)
        storedCount = result.stored
        stageDurations.store = Date.now() - t0
        context.logger.info(
          `Pipeline stage: store - done (${storedCount} stored, ${stageDurations.store}ms)`
        )
      } catch (err) {
        stageDurations.store = Date.now() - t0
        context.logger.error(`Pipeline stage: store - failed after ${stageDurations.store}ms`, err)
        throw err
      }
    }

    return {
      collected: rawData.length,
      processed: processedData.length,
      stored: storedCount,
      stageDurations,
    }
  }
}

// Singleton instance
let _pipelineRunner: PipelineRunner | null = null

export const getPipelineRunner = (): PipelineRunner => {
  if (!_pipelineRunner) {
    _pipelineRunner = new PipelineRunner()
  }
  return _pipelineRunner
}
