# 需求文档

## 项目描述（输入）
开发体验优化：项目初始化脚本、API rate limiting 中间件、CLAUDE.md 通用模板

## 需求

### 需求 1：项目初始化脚本

**用户故事：** 作为开发者，我希望运行一个脚本就能完成新项目的初始化，包括复制 `.env` 文件、安装依赖、运行数据库迁移，从而节省重复配置的时间。

#### 验收标准

1. **GIVEN** 开发者克隆了仓库
   **WHEN** 运行 `bun run setup`（或 `scripts/init.ts`）
   **THEN** 脚本自动检查 `.env` 是否存在，若不存在则从 `.env.example` 复制

2. **GIVEN** `.env` 文件不存在
   **WHEN** 脚本运行
   **THEN** 从 `.env.example` 复制并提示开发者填写必要的变量

3. **GIVEN** 数据库连接变量已配置
   **WHEN** 脚本运行
   **THEN** 自动执行 `bun run migrate:local` 完成迁移

4. **GIVEN** 某一步骤失败（如数据库不可用）
   **WHEN** 脚本检测到错误
   **THEN** 打印清晰的错误信息，指明失败步骤，并以非零退出码退出

5. **GIVEN** 脚本成功完成
   **WHEN** 所有步骤通过
   **THEN** 打印摘要信息，提示下一步操作（如 `bun dev`）

6. **GIVEN** `package.json` 中缺少 `setup` 脚本入口
   **WHEN** 开发者查看可用命令
   **THEN** `bun run setup` 作为新命令列在 `package.json` 的 `scripts` 中

---

### 需求 2：API Rate Limiting 中间件

**用户故事：** 作为应用开发者，我希望 API 路由具备速率限制能力，防止滥用和暴力破解，从而提升应用安全性和稳定性。

#### 验收标准

1. **GIVEN** 客户端在 1 分钟内发送超过允许次数的请求
   **WHEN** 超出限制的请求到达
   **THEN** API 返回 `429 Too Many Requests`，并包含 `Retry-After` 响应头

2. **GIVEN** 开发者在 API 路由中引入速率限制器
   **WHEN** 配置限制规则（窗口时长、最大请求数）
   **THEN** 中间件函数可以接受自定义配置参数

3. **GIVEN** 速率限制基于 IP 地址
   **WHEN** 不同 IP 发送请求
   **THEN** 各 IP 的计数器互相独立，不相互影响

4. **GIVEN** 使用内存存储（开发/无状态场景）
   **WHEN** 进程重启
   **THEN** 计数器重置，不依赖外部存储（Redis 为可选扩展）

5. **GIVEN** 速率限制工具函数位于 `src/lib/rate-limit/`
   **WHEN** 任意 API 路由需要速率限制
   **THEN** 只需一行导入即可使用，符合现有适配器模式风格

6. **GIVEN** 速率限制被触发
   **WHEN** 返回 429 响应
   **THEN** 响应体为 JSON 格式，包含 `error` 字段和 `retryAfter`（秒数）

7. **GIVEN** 请求在限制范围内
   **WHEN** 正常处理
   **THEN** 响应头包含 `X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset`

---

### 需求 3：CLAUDE.md 调整为通用模板版本

**用户故事：** 作为使用此模板启动新项目的开发者，我希望 `CLAUDE.md` 中包含占位符说明而非硬编码的项目名称，从而减少初始化时的手动修改工作。

#### 验收标准

1. **GIVEN** `CLAUDE.md` 当前硬编码了 "ShipFree" 作为项目名
   **WHEN** 开发者 fork 或克隆此模板
   **THEN** `CLAUDE.md` 的项目概述部分使用通用描述或明确标注的占位符（如 `[YOUR_PROJECT_NAME]`）

2. **GIVEN** `CLAUDE.md` 包含通用化内容
   **WHEN** Claude Code 读取此文件
   **THEN** 文件仍准确描述技术栈（Next.js、Bun、PostgreSQL、Drizzle ORM、Better-Auth、TailwindCSS）

3. **GIVEN** 文件包含模板使用说明
   **WHEN** 开发者首次打开
   **THEN** 文件顶部有一个 `## 使用此模板` 章节，说明需要修改的关键占位符（项目名、项目概述）

4. **GIVEN** AI-DLC 相关内容已存在于 `CLAUDE.md`
   **WHEN** 通用化改造
   **THEN** Kiro spec-driven development 相关章节保持不变

5. **GIVEN** 通用化后的文件
   **WHEN** 作为新项目基础
   **THEN** 开发命令（`bun dev`、`bun build` 等）保持准确，无需修改

---

### 需求 4：`.env.example` 完整性保障

**用户故事：** 作为新接手项目的开发者，我希望 `.env.example` 包含所有必要变量的说明，从而能快速完成环境配置。

#### 验收标准

1. **GIVEN** `src/config/env.ts` 中定义了所有环境变量
   **WHEN** 对比 `.env.example` 与 `env.ts` 中的变量
   **THEN** `.env.example` 中包含所有非默认的必要变量（至少包含 `DATABASE_URL`、`BETTER_AUTH_SECRET`、`NEXT_PUBLIC_APP_URL`）

2. **GIVEN** `.env.example` 存在
   **WHEN** 初始化脚本（需求 1）检查
   **THEN** 可以直接用于复制生成 `.env` 文件

3. **GIVEN** 新增速率限制相关配置（如可选的 Redis URL）
   **WHEN** 添加环境变量
   **THEN** `.env.example` 同步更新，含注释说明用途
