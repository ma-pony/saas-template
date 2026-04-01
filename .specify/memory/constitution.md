# SaaS Template Constitution

## 核心原则

### I. 适配器优先
所有外部服务（支付、邮件、分析）通过策略模式封装为可替换适配器。切换提供商仅需修改环境变量，不改代码。每个适配器实现统一接口，工厂单例根据 env var 选择实现。

### II. 服务端组件默认
Next.js App Router + React Server Components 为默认范式。仅在需要交互时降级为客户端组件（`'use client'`）。服务端数据获取优先，客户端状态管理使用 Zustand + TanStack Query。

### III. 环境变量驱动
功能启用/禁用通过环境变量控制。OAuth 提供商按 env var 是否存在条件启用。所有 env var 通过 `@t3-oss/env-nextjs` 在 `src/config/env.ts` 统一校验。`LOG_LEVEL` 例外——直接读 `process.env` 以避免模块缓存。

### IV. 统一基础设施
- **日志**：所有业务代码使用 `createLogger()` 结构化日志，不直接调用 `console.*`
- **错误处理**：`AppError` 层级 + `withApiErrors()` 路由包装 + `captureError()` Sentry 上报
- **认证守卫**：`requireSession()` / `requireAdmin()` 保护 API 端点
- **数据库**：text PK（非 serial/uuid），cascade delete from user，`provider` 列保证多提供商安全

### V. 国际化就绪
`next-intl` 支持 `en`/`es`/`fr`/`zh` 四语。翻译 key 统一管理于 `src/messages/*.json`。Locale 感知页面位于 `src/app/[locale]/` 下，包括博客（`[locale]/blog/`）。营销页共享组件（Navbar、Footer）通过 `useParams()` 获取 locale 实现链接前缀。LanguageSwitcher 组件部署于 App、Auth、Marketing 三个区域，切换时写入 `NEXT_LOCALE` cookie 持久化偏好。

## 架构约束

### 路由分层
- `[locale]/(auth)` — 认证流程
- `[locale]/(main)` — 登录后页面
- `(site)` — 营销页共享组件（Navbar、Footer，无 locale 路由但链接 locale 感知）
- `admin/` — 管理后台（实际路径段，角色保护）
- `api/` — API 路由

### 代码风格
- Biome 格式化：2 空格缩进、单引号、按需分号、ES5 尾逗号、100 字符行宽
- TailwindCSS only，条件类名使用 `cn()`
- PascalCase 组件名，kebab-case 文件名，`const` 箭头函数优先

### 安全边界
- 支付表查询必须包含 `provider` 列过滤，防止跨提供商 ID 碰撞
- Webhook 处理必须验证签名
- 速率限制：平台头（Vercel/CF）优先于代理头（x-real-ip）

## 治理

Constitution 定义项目不可违反的架构和风格约束。所有 spec/plan/task 生成必须遵循此文件中的原则。

**Version**: 1.0.0 | **Ratified**: 2026-03-31
