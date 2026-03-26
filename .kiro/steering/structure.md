# 项目结构

## 组织哲学

按职责分层：`app/` 负责路由和页面，`lib/` 负责业务逻辑和服务，`components/` 负责 UI，`database/` 负责数据层。路由组（`(auth)` / `(main)` / `(site)`）用括号语法，不影响 URL，仅做逻辑分组。

## 目录模式

### 页面路由（`src/app/[locale]/`）
国际化路由的根节点，所有页面都在此目录下，分三个路由组：
- `(auth)`：登录、注册、验证等认证流程页面
- `(main)`：Dashboard、设置等登录后才能访问的页面
- `(site)`：营销/落地页等公开页面

API 路由在 `src/app/api/`，不在 `[locale]` 下。

### 服务层（`src/lib/`）
按功能域划分的业务逻辑：
- `auth/`：Better-Auth 配置，`auth.ts`（服务端）和 `auth-client.ts`（客户端，计费操作用独立 client）
- `payments/`：适配器模式，`types.ts`（接口）、`service.ts`（单例工厂）、`hooks.ts`（TanStack Query hooks）
- `messaging/email/`：同样的适配器模式，含自动发现逻辑
- `utils/`：通用工具函数，`css.ts` 导出 `cn()`

### UI 组件（`src/components/`）
- `ui/`：无业务逻辑的基础 UI 组件（当前基于 BaseUI，规划迁移至 Shadcn UI）
- `emails/`：React Email 邮件模板，仅用于邮件渲染

### 数据层（`src/database/`）
- `schema.ts`：所有表定义 + relations，单文件集中管理
- 迁移文件由 `drizzle-kit generate` 自动生成

### 配置（`src/config/`）
- `env.ts`：所有环境变量的 Zod 验证，唯一真相来源
- 支付方案配置、品牌配置、Feature Flags 也放此目录

### 国际化（`src/messages/`）
每个语言一个 JSON 文件（`en.json` / `es.json` / `fr.json`），翻译 key 按页面/功能模块分组。

## 命名规范

- **文件**：kebab-case（`user-profile.tsx`、`payment-hooks.ts`）
- **组件**：PascalCase（`UserProfile`、`PaymentButton`）
- **函数/变量**：camelCase
- **类型/接口**：PascalCase（`PaymentAdapter`、`UserSession`）
- **常量**：SCREAMING_SNAKE_CASE（环境变量）或 camelCase（代码内常量）

## 导入规范

```typescript
// 绝对路径（优先）
import { auth } from '@/lib/auth'
import { cn } from '@/lib/utils/css'
import { env } from '@/config/env'

// 相对路径（同目录/子目录）
import { stripeAdapter } from './stripe'
```

路径别名：`@/` 映射到 `src/`。

## 代码组织原则

- **服务端优先**：默认 Server Component，只在必要时 `'use client'`
- **适配器隔离**：外部服务（支付/邮件）通过接口抽象，实现可替换
- **环境变量集中**：所有环境变量必须在 `src/config/env.ts` 注册，不直接读 `process.env`
- **级联删除**：数据库外键从用户级联，Schema 变更后必须生成并运行迁移
- **翻译覆盖**：新增用户可见文本必须同步添加到所有语言的翻译文件

---
_记录模式，而非文件树。遵循现有模式的新文件不需要更新此文档_
