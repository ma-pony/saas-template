# 技术栈

## 架构概述

服务端优先的全栈应用。Next.js App Router + React Server Components 为默认范式，仅在必要交互时降级为客户端组件。适配器模式（策略模式）封装可替换的外部服务（支付、邮件），通过环境变量切换，不改代码。

## 核心技术

- **语言**：TypeScript 5
- **框架**：Next.js 16（App Router）+ React 19
- **运行时**：Bun
- **数据库**：PostgreSQL + Drizzle ORM（`postgres-js` 驱动）
- **认证**：Better-Auth（开源自托管，Drizzle 适配器）
- **样式**：TailwindCSS 4，条件类名使用 `cn()` from `@/lib/utils/css`
- **状态管理**：Zustand（客户端全局状态），TanStack Query（服务端数据获取）
- **表单验证**：Zod

## 关键库与模式

### 支付适配器（`src/lib/payments/`）
`PaymentAdapter` 接口定义 `createCheckout`、`createCustomer`、`processWebhook` 等方法。`service.ts` 中的单例工厂根据 `env.PAYMENT_PROVIDER` 选择实现（stripe / polar / lemonsqueezy）。客户端 hooks 通过 TanStack Query 调用 `/api/payments/*`。

### 邮件适配器（`src/lib/messaging/email/`）
同样的适配器模式，加上自动发现机制。未设置 `EMAIL_PROVIDER` 时按顺序检测：resend → postmark → nodemailer → plunk → log。开发环境默认 log 提供商，邮件流程不会因缺少凭证而抛出异常。

### 结构化日志（`src/lib/logger/`）
统一 4 级日志系统（debug/info/warn/error），封装 `console.*`。通过 `LOG_LEVEL` 环境变量过滤日志级别（直接读 `process.env`，不经过 t3-env，避免模块缓存问题）。使用 `createLogger({ module: 'xxx' })` 创建带作用域的 logger，支持 `child()` 进一步细分作用域。输出格式：`[LEVEL] [module:x] message key=value`。所有业务代码使用此 logger，不直接调用 `console.*`。

### 统一错误处理（`src/lib/errors/`）
`AppError` 错误类层级、`withApiErrors()` API 路由包装器、`apiError()` 响应构建、`captureError()`/`captureErrorSync()` Sentry 上报、`requireSession()`/`requireAdmin()` 认证守卫。

### 环境变量
通过 `@t3-oss/env-nextjs` 在 `src/config/env.ts` 集中验证。服务端变量放 `server` 对象，客户端变量放 `client` 对象（必须 `NEXT_PUBLIC_` 前缀）。新增变量必须在此文件登记。`LOG_LEVEL` 是例外——直接读 `process.env` 以支持运行时重新求值。

### 国际化
`next-intl`，支持 `en` / `es` / `fr` / `zh`。服务端组件用 `getTranslations`，客户端组件用 `useTranslations`。翻译文件在 `src/messages/*.json`，locale 配置在 `src/lib/i18n/config.ts`。

## 开发规范

### 代码风格（Biome）
- 2 空格缩进，单引号，无分号（除歧义处），ES5 尾逗号，100 字符行宽
- `bun lint` 运行检查，`bun format` 自动格式化
- 已禁用：a11y 规则、`noExplicitAny`、`useExhaustiveDependencies`

### 组件规范
- 默认使用 React Server Components，只有需要交互时才加 `'use client'`
- 组件名 PascalCase，文件名 kebab-case（如 `UserProfile` → `user-profile.tsx`）
- 优先使用 `const` 箭头函数，而非 `function` 声明
- 样式只用 TailwindCSS，条件类名用 `cn()`

### 类型安全
开发时通过 `bun run typecheck` 检查类型。

## 常用命令

```bash
bun dev                   # 启动开发服务器
bun build                 # 生产构建
bun run typecheck         # TypeScript 类型检查
bun lint                  # Biome lint
bun format                # Biome 格式化
bun run generate-migration  # 修改 schema 后生成迁移
bun run migrate:local     # 本地运行迁移
```

## 关键技术决策

- **文本主键**：数据库主键用 `text`（非 serial/uuid），Better-Auth 生成的 ID 直接用
- **级联删除**：所有关联表从 `user` 级联删除，保持数据一致性
- **`$onUpdate` 模式**：`updatedAt` 字段用 Drizzle 的 `$onUpdate` 自动更新，无需手动维护
- **provider 列**：支付相关表都有 `provider` 字段，支持多提供商共存和历史数据追踪
- **Analytics 适配器**：`src/lib/analytics/` 使用适配器模式支持 Plausible / Umami / Google Analytics
- **后台任务框架**：`src/lib/jobs/` 支持 node-cron（本地）和 vercel-cron（生产），执行日志持久化到数据库，支持自动重试和指数退避
- **结构化日志**：`src/lib/logger/` 统一日志系统，4 级过滤，带作用域的子 logger，替代所有 `console.*` 调用
- **统一错误处理**：`src/lib/errors/` AppError 层级、API 路由包装器、Sentry 上报、认证守卫

---
_记录标准和模式，而非所有依赖项_
