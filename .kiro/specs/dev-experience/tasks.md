# 实现任务

## 任务列表

### 任务 1：创建项目初始化脚本

- [x] **1.1** 创建 `scripts/setup.ts` 文件，实现以下逻辑：
  - 检查 `.env` 是否存在，若不存在则从 `.env.example` 复制
  - 解析 `.env` 内容，检测 `DATABASE_URL` 是否已配置（非注释、非空）
  - 若 `DATABASE_URL` 已配置，调用 `execSync('bun run migrate:local')` 执行迁移
  - 每步操作打印带状态前缀（✅/⚠️/❌）的日志信息
  - 脚本结尾打印完成摘要和 `bun dev` 提示

- [x] **1.2** 修改 `package.json`，在 `scripts` 字段添加：
  ```json
  "setup": "bun scripts/setup.ts"
  ```

- [ ] **1.3** 手动验证：删除 `.env`，运行 `bun run setup`，确认：
  - `.env` 被正确复制
  - 若 `DATABASE_URL` 有效，迁移成功执行
  - 若 `DATABASE_URL` 无效/未配置，打印警告并跳过（不报错退出）

**依赖**：无前置任务
**关联需求**：需求 1、需求 4

---

### 任务 2：实现 Rate Limiting 工具库

- [x] **2.1** 创建 `src/lib/rate-limit/types.ts`，定义以下类型：
  - `RateLimitConfig`（含 `windowMs`、`max`、`keyGenerator?`、`message?`）
  - `RateLimitInfo`（含 `limit`、`remaining`、`reset`）
  - `RateLimitResult`（含 `success: boolean`、`info: RateLimitInfo`）

- [x] **2.2** 创建 `src/lib/rate-limit/limiter.ts`，实现固定窗口算法：
  - 使用模块级 `Map<string, WindowEntry>` 作为内存存储
  - 添加 `setInterval` 定期清理过期条目（60 秒间隔）
  - 导出 `createRateLimiter(config?)` 工厂函数
  - 超出限制时返回 `NextResponse`（含 `429` 状态码和正确的响应头）
  - 正常请求时返回 `RateLimitResult` 对象
  - 响应头包含：`Retry-After`、`X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset`

- [x] **2.3** 创建 `src/lib/rate-limit/index.ts`，重新导出 `createRateLimiter` 及所有类型

- [x] **2.4** 在至少一个现有 API 路由中添加速率限制示例（推荐 `src/app/api/auth/[...all]/route.ts` 或 payments checkout 路由），作为使用参考

- [ ] **2.5** 本地验证：将 `max` 设置为 3，快速发送 4 次请求，确认第 4 次返回 `429` 且包含正确响应头

**依赖**：无前置任务（可与任务 1 并行）
**关联需求**：需求 2

---

### 任务 3：CLAUDE.md 通用模板化改造

- [x] **3.1** 在 `CLAUDE.md` 文件顶部（`# CLAUDE.md` 标题之后）添加 `## 使用此模板` 章节：
  ```markdown
  ## 使用此模板

  在使用此模板开始新项目时，请更新以下占位符：

  - `[YOUR_PROJECT_NAME]` — 替换为你的项目名称
  - `[YOUR_PROJECT_DESCRIPTION]` — 替换为你的项目一句话描述

  完成替换后删除此章节。
  ```

- [x] **3.2** 修改 `## Project Overview` 章节内容，将硬编码的 "ShipFree" 项目描述替换为含占位符的通用版本：
  ```
  [YOUR_PROJECT_NAME] is a Next.js SaaS application using Bun runtime, PostgreSQL,
  Drizzle ORM, Better-Auth, and TailwindCSS 4. Built on the ShipFree template.

  [YOUR_PROJECT_DESCRIPTION]
  ```

- [x] **3.3** 检查 `CLAUDE.md` 其余部分，确保：
  - `## Commands` 章节：所有命令保持准确（`bun dev`、`bun build` 等），新增 `bun run setup` 命令说明
  - `## Architecture` 章节：所有技术细节保持不变
  - `## Code Style` 章节：内容不变
  - `# AI-DLC and Spec-Driven Development` 章节：完整保留，不做任何修改

**依赖**：无前置任务（可与任务 1、2 并行）
**关联需求**：需求 3

---

### 任务 4：.env.example 完整性检查与补充

- [x] **4.1** 对比 `src/config/env.ts` 与 `.env.example`，确认以下核心变量已包含且有说明注释：
  - `DATABASE_URL`（必须）
  - `BETTER_AUTH_SECRET`（必须，含生成命令提示）
  - `NEXT_PUBLIC_APP_URL`（必须）
  - `BETTER_AUTH_URL`（必须）

- [x] **4.2** 若任务 2 中添加了可选的 Rate Limiting 相关环境变量（如 `RATE_LIMIT_MAX`、`RATE_LIMIT_WINDOW_MS`），在 `.env.example` 中添加对应注释说明

- [x] **4.3** 确认 `.env.example` 中的 `DATABASE_URL` 默认值适合本地开发（如 `postgres://postgres:postgres@localhost:5432/myapp`）

**依赖**：任务 2 完成后（确认 Rate Limiting 是否需要新增环境变量）
**关联需求**：需求 4

---

## 实现顺序建议

```
任务 1（初始化脚本）  ─┐
任务 2（Rate Limiting）─┤→ 任务 4（.env.example 检查）
任务 3（CLAUDE.md）  ─┘
```

任务 1、2、3 可并行实现，任务 4 在任务 2 确认无新环境变量后完成。

---

## 完成标志

所有任务完成后，`spec.json` 中 `ready_for_implementation` 将设置为 `true`，实现验证通过后功能上线。

验收检查清单：
- [x] `bun run setup` 在全新克隆环境中可正常运行
- [x] API 路由超过速率限制后返回正确的 `429` 响应
- [x] `CLAUDE.md` 中不再有硬编码的 "ShipFree" 专有项目描述
- [x] `.env.example` 包含所有必要变量的说明
