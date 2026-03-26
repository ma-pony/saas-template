/**
 * Background Jobs Registry Entry Point
 *
 * This file registers all background jobs with the JobRegistry.
 * Import and register new jobs here following the pattern below.
 *
 * ─── Adding a new job ──────────────────────────────────────────────────────────
 *
 * 1. Create a file at `src/lib/jobs/built-in/my-job.ts` (or anywhere in `src/lib/jobs/`)
 *    that exports a `JobDefinition`:
 *
 *    ```ts
 *    export const myJob: JobDefinition = {
 *      name: 'my-job',          // unique slug, used for routing & logs
 *      schedule: '0 * * * *',   // standard 5-segment cron expression
 *      description: 'Does something useful every hour',
 *      handler: async (context) => {
 *        context.logger.info('Running my job')
 *        // ... your logic here
 *      },
 *    }
 *    ```
 *
 * 2. Import and register it below:
 *
 *    ```ts
 *    import { myJob } from './built-in/my-job'
 *    registry.register(myJob)
 *    ```
 *
 * 3. If using Vercel Cron Jobs, also add an entry to `vercel.json`:
 *
 *    ```json
 *    { "path": "/api/jobs/my-job", "schedule": "0 * * * *" }
 *    ```
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { getJobRegistry } from './job-registry'
import { cleanupLogsJob } from './built-in/cleanup-logs'
import { exampleStatsJob } from './built-in/example-stats'

const registry = getJobRegistry()

// Built-in jobs
registry.register(cleanupLogsJob)
registry.register(exampleStatsJob)

// ↑ Add your custom jobs above this line

export { registry }
