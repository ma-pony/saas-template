import type { JobDefinition } from './types'

/**
 * JobRegistry - Singleton registry for all background job definitions.
 *
 * Jobs are registered at startup via `src/lib/jobs/index.ts`.
 * The registry is used by both the scheduler adapters and the HTTP trigger endpoint.
 */
export class JobRegistry {
  private jobs: Map<string, JobDefinition> = new Map()

  /**
   * Register a job definition. Throws if a job with the same name is already registered.
   */
  register(job: JobDefinition): void {
    if (this.jobs.has(job.name)) {
      throw new Error(`Job "${job.name}" is already registered.`)
    }
    this.jobs.set(job.name, job)
  }

  /**
   * Find a job by its unique name slug.
   */
  findJob(name: string): JobDefinition | undefined {
    return this.jobs.get(name)
  }

  /**
   * Return all registered jobs.
   */
  getAllJobs(): JobDefinition[] {
    return Array.from(this.jobs.values())
  }
}

// Singleton instance
let _registry: JobRegistry | null = null

export const getJobRegistry = (): JobRegistry => {
  if (!_registry) {
    _registry = new JobRegistry()
  }
  return _registry
}
