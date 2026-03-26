# 实施计划

## 概述

共分为 6 个主要任务组，按依赖顺序排列。数据层和类型定义先行，服务层次之，API 层最后，最终补充示例任务和开发者体验优化。

---

- [ ] 1. 环境变量与数据库 Schema 准备
- [ ] 1.1 在 `src/config/env.ts` 注册新增环境变量 (P)
  - 在 `server` 对象中添加 `CRON_PROVIDER`（可选枚举 `node-cron | vercel`）
  - 添加 `CRON_SECRET`（可选字符串，生产环境建议 `.min(32)`）
  - 添加 `JOB_LOG_RETENTION_DAYS`（可选数字，`z.coerce.number().default(30)`）
  - 在 `runtimeEnv` 中绑定对应 `process.env.*`
  - _需求：5_

- [ ] 1.2 在 `src/database/schema.ts` 新增 `jobExecutionLogs` 表 (P)
  - 字段：`id`（text PK）、`jobName`、`status`（5 态枚举）、`startedAt`、`finishedAt`、`durationMs`（integer）、`errorMessage`、`metadata`（jsonb）、`createdAt`
  - 添加三个索引：`job_name`、`started_at`、`status`
  - 不添加外键（独立系统表）
  - _需求：4_

- [ ] 1.3 生成并验证 Drizzle 迁移文件
  - 运行 `bun run generate-migration`，检查生成的 SQL 文件
  - 确认索引和字段类型与设计文档一致
  - _需求：4, 5_

---

- [ ] 2. 核心类型定义（src/lib/jobs/types.ts）
- [ ] 2.1 创建 `src/lib/jobs/types.ts`，定义所有核心接口 (P)
  - `JobDefinition`、`JobHandler`、`JobContext`、`JobLogger`
  - `ExecutionResult`、`JobSchedulerAdapter`、`CronProvider`
  - `Pipeline<TInput, TOutput>`、`PipelineRunResult`
  - _需求：1, 3_

---

- [ ] 3. 任务调度器适配器层
- [ ] 3.1 创建 `src/lib/jobs/adapters/node-cron.ts`（NodeCronAdapter） (P)
  - 安装依赖：`bun add node-cron`（及 `@types/node-cron`）
  - 实现 `JobSchedulerAdapter` 接口
  - `start(registry)`：遍历注册表，用 `cron.schedule()` 注册每个任务
  - `stop()`：调用所有 cron task 的 `.stop()`
  - 每次触发时调用 `JobRunner.execute(job)`
  - _需求：1_

- [ ] 3.2 创建 `src/lib/jobs/adapters/vercel-cron.ts`（VercelCronAdapter） (P)
  - 实现 `JobSchedulerAdapter` 接口（`start` 和 `stop` 为 no-op）
  - 提供 `getJobNames()` 方法，供 API 路由用于注册表查找
  - 说明：Vercel 模式下调度由平台控制，代码侧只负责 HTTP 端点响应
  - _需求：1, 2_

- [ ] 3.3 创建 `src/lib/jobs/job-service.ts`（单例工厂）
  - 实现自动检测逻辑：`CRON_PROVIDER` 未设置时检测 `process.env.VERCEL`
  - 导出 `getJobAdapter()`、`getJobRegistry()`、`startScheduler()`
  - 在 Next.js 启动时（`src/app/layout.tsx` 或独立初始化文件）调用 `startScheduler()`（仅 node-cron 模式）
  - _需求：1, 5_

---

- [ ] 4. JobRunner 与 JobRegistry
- [ ] 4.1 创建 `src/lib/jobs/job-registry.ts`（JobRegistry）
  - 实现 `register(job: JobDefinition): void`
  - 实现 `findJob(name: string): JobDefinition | undefined`
  - 实现 `getAllJobs(): JobDefinition[]`
  - 单例模式，模块级变量存储任务映射
  - _需求：1, 2_

- [ ] 4.2 创建 `src/lib/jobs/job-runner.ts`（JobRunner）
  - 实现 `execute(job: JobDefinition): Promise<ExecutionResult>`
  - 执行前：INSERT `job_execution_logs`（status=running），生成 `executionId`（nanoid）
  - 超时：`Promise.race([handler(context), timeout(job.timeoutMs ?? 30000)])`
  - 成功：UPDATE status=success，写入 durationMs
  - 失败/超时：UPDATE status=failed/timeout，写入 errorMessage（截断 2000 字符）和 metadata.stack
  - Sentry 集成：有 `env.SENTRY_DSN` 时上报异常
  - _需求：4_

- [ ] 4.3 创建 `src/lib/jobs/pipeline/pipeline-runner.ts`（PipelineRunner）
  - 实现 `run<TInput, TOutput>(pipeline, context): Promise<PipelineRunResult>`
  - 按阶段顺序执行，用 `Date.now()` 记录各阶段耗时
  - 阶段级 try/catch：失败时通过 `context.logger.error()` 记录，向上抛出以终止管道
  - 将 `stageDurations` 写入 `metadata`（通过 JobRunner 传递 context）
  - _需求：3_

---

- [ ] 5. API 端点
- [ ] 5.1 创建 `src/app/api/jobs/[jobName]/route.ts`（触发端点）
  - POST handler：验证 `Authorization: Bearer` header
  - 生产环境：`CRON_SECRET` 未配置或不匹配时返回 401
  - 开发环境：允许无鉴权（写入 `console.warn`）
  - 从 `JobRegistry` 查找任务，不存在返回 404
  - 调用 `JobRunner.execute(job)`，返回 `ExecutionResult` JSON
  - _需求：2_

- [ ] 5.2 创建 `src/app/api/jobs/logs/route.ts`（日志查询端点）
  - GET handler：解析 `jobName`、`status`、`from`（ISO 日期）、`to`、`page`（默认 1）、`limit`（默认 20，最大 100）
  - 使用 Drizzle 构建动态查询（`where`、`orderBy startedAt desc`、`limit/offset`）
  - 返回 `{ data: JobExecutionLog[], total: number, page: number, totalPages: number }`
  - 400 处理：无效的日期格式或超出范围的 limit
  - _需求：4_

---

- [ ] 6. 内置任务与示例
- [ ] 6.1 创建 `src/lib/jobs/built-in/cleanup-logs.ts`（日志清理任务） (P)
  - 每日 02:00 UTC 执行（cron: `0 2 * * *`）
  - 删除 `started_at < NOW() - INTERVAL 'X days'`（X 来自 `env.JOB_LOG_RETENTION_DAYS`）
  - 将删除行数写入执行日志 metadata
  - _需求：4_

- [ ] 6.2 创建 `src/lib/jobs/built-in/example-stats.ts`（示例统计任务） (P)
  - 实现 `Pipeline<RawStats, ProcessedStats>` 演示数据管道用法
  - collect：查询活跃用户数（session 表中 24h 内活跃）
  - process：格式化为统计对象
  - store：`console.log`（模板演示，无需真实存储）
  - _需求：3_

- [ ] 6.3 创建 `src/lib/jobs/index.ts`（注册入口）
  - 导入并注册所有内置任务到 `JobRegistry`
  - 添加注释说明如何添加新任务（作为开发者文档替代）
  - _需求：5_

- [ ] 6.4 更新 `vercel.json`，添加示例 cron 配置
  - 添加 `crons` 数组，包含 `cleanup-logs` 和 `example-stats` 示例条目
  - 注释说明如何添加新 cron 路径
  - _需求：2, 5_

---

- [ ]* 7. 测试覆盖（可延后）
- [ ]* 7.1 为 JobRunner 编写单元测试
  - mock Drizzle db，验证 status 流转：running → success / failed / timeout
  - _需求：4_

- [ ]* 7.2 为 PipelineRunner 编写单元测试
  - mock pipeline 三个阶段，验证顺序执行、阶段耗时记录、阶段失败终止
  - _需求：3_

- [ ]* 7.3 为 API 端点编写集成测试
  - `/api/jobs/[jobName]`：有效 token 200、无效 token 401、不存在任务 404
  - `/api/jobs/logs`：过滤参数、分页、无效参数 400
  - _需求：2, 4_
