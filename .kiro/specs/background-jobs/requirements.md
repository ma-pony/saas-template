# 需求文档

## 简介

本功能为 ShipFree SaaS 模板引入后台任务支持能力，包含三个核心模块：
1. **定时任务框架**：支持 node-cron（本地/自托管）和 Vercel Cron Jobs（云端托管）两种运行时，通过适配器模式统一接口
2. **数据管道模板**：提供采集 → 处理 → 存储的通用三段式管道结构，开箱即用，支持扩展
3. **任务执行日志**：记录每次任务触发、执行过程和结果，提供可查询的执行历史和可观测性

该功能与现有适配器模式（支付、邮件）保持一致，通过环境变量切换后端，零代码变更完成提供商切换。

---

## 需求

### 需求 1：定时任务框架

**目标：** 作为开发者，我希望能通过统一接口注册和触发定时任务，以便在不修改业务代码的情况下切换 node-cron 和 Vercel Cron Jobs 两种运行时。

#### 验收标准

1. 当 `CRON_PROVIDER` 环境变量设为 `node-cron` 时，系统应使用 node-cron 驱动在进程内调度任务
2. 当 `CRON_PROVIDER` 环境变量设为 `vercel` 时（或部署在 Vercel 上且未配置），系统应通过 `vercel.json` 的 `crons` 配置触发 HTTP 端点
3. 当未配置 `CRON_PROVIDER` 时，系统应自动检测运行环境（Vercel 环境变量存在时选 `vercel`，否则选 `node-cron`）
4. 系统应提供 `registerJob(name, schedule, handler)` 统一注册接口，不暴露底层驱动细节
5. 每个已注册任务应有唯一名称（slug），用于日志记录和 API 路由匹配
6. 系统应在 `src/lib/jobs/` 目录下提供至少一个示例任务（如清理过期会话）

### 需求 2：Vercel Cron 端点

**目标：** 作为开发者，我希望定时任务能通过标准 HTTP 端点触发，以便与 Vercel Cron Jobs 及其他外部调度服务集成。

#### 验收标准

1. 系统应为每个已注册任务暴露 `/api/jobs/[jobName]` HTTP 端点
2. 当收到 POST 请求时，系统应验证 `CRON_SECRET` 环境变量（Bearer token 或自定义 header），拒绝无效请求并返回 401
3. 当 `CRON_SECRET` 未配置时，系统应在开发环境允许无鉴权访问，在生产环境拒绝请求并记录警告
4. 端点应返回标准 JSON 响应：`{ success: boolean, jobName: string, executionId: string, durationMs: number }`
5. `vercel.json` 应包含示例 cron 配置，开发者可直接参考修改

### 需求 3：数据管道模板

**目标：** 作为开发者，我希望拥有一个可重用的采集→处理→存储三段式管道结构，以便快速构建新的数据处理任务而无需每次重新设计管道逻辑。

#### 验收标准

1. 系统应提供 `Pipeline<TInput, TOutput>` 泛型接口，包含 `collect`、`process`、`store` 三个方法
2. 管道运行器应按顺序执行三个阶段，并在每个阶段开始/结束时记录日志
3. 当任意阶段抛出异常时，管道运行器应捕获错误并记录到任务执行日志，不崩溃上层任务
4. 系统应提供至少一个具体管道实现作为模板（如：统计活跃用户数并存储到统计表）
5. 管道应支持阶段级超时配置（`timeoutMs` per stage），超时后终止当前阶段并记录超时错误

### 需求 4：任务执行日志

**目标：** 作为开发者，我希望所有任务执行记录被持久化到数据库，以便调试失败任务、审计执行历史并监控系统健康状态。

#### 验收标准

1. 系统应在数据库中创建 `job_execution_logs` 表，记录字段：`id`、`jobName`、`status`（pending/running/success/failed/timeout）、`startedAt`、`finishedAt`、`durationMs`、`errorMessage`、`metadata`（JSONB）
2. 每次任务开始时，系统应创建状态为 `running` 的日志记录，并在任务完成后更新最终状态
3. 当任务失败时，系统应将错误消息和堆栈摘要写入 `errorMessage` 字段（最多 2000 字符）
4. 系统应提供 `GET /api/jobs/logs` 端点，支持按 `jobName`、`status`、`startedAt` 范围过滤，并分页返回
5. 日志记录应自动清理：默认保留最近 30 天，可通过 `JOB_LOG_RETENTION_DAYS` 环境变量覆盖
6. 系统应提供一个定时清理任务（cleanup-logs job），由任务框架本身调度，每天执行一次

### 需求 5：开发者体验与配置

**目标：** 作为开发者，我希望通过修改少量配置即可完成集成，以便快速理解和应用该功能。

#### 验收标准

1. 所有新增环境变量（`CRON_PROVIDER`、`CRON_SECRET`、`JOB_LOG_RETENTION_DAYS`）应在 `src/config/env.ts` 中注册，并有清晰注释
2. `src/lib/jobs/` 目录应包含 `README` 风格的索引注释，说明如何添加新任务
3. 新增 Drizzle schema 变更后，应提供对应迁移文件
4. 系统应与现有 Sentry 集成（如已配置），在任务失败时上报异常
5. 所有面向用户的错误文本应通过 next-intl 翻译系统（英/西/法）提供，不硬编码英文字符串
