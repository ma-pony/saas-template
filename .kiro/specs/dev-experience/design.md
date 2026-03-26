# 设计文档

## 概述

本文档描述"开发体验优化"功能的技术设计，涵盖三个子模块：
1. 项目初始化脚本（`scripts/setup.ts`）
2. API Rate Limiting 中间件（`src/lib/rate-limit/`）
3. CLAUDE.md 通用模板化改造

设计遵循项目现有的适配器模式、目录结构规范和代码风格。

---

## 架构决策

### 决策 1：初始化脚本使用 TypeScript（.ts）
与现有的 `scripts/migrate.ts` 保持一致，使用 Bun 直接运行 TypeScript 脚本，无需编译步骤。

### 决策 2：Rate Limiting 使用内存存储（LRU Map）
- 不引入外部依赖（如 Redis），保持模板零配置即可运行
- 使用滑动窗口（sliding window）算法，内存实现适合单实例部署
- 后续可通过适配器模式扩展 Redis 后端（与支付/邮件适配器同风格）

### 决策 3：Rate Limiter 以工厂函数形式提供
不采用 Next.js middleware（`middleware.ts`），而是提供可在任意 API 路由中按需引入的工厂函数，与现有路由风格一致，粒度更细。

---

## 模块 1：项目初始化脚本

### 文件路径
- 新增：`scripts/setup.ts`
- 修改：`package.json`（添加 `setup` 脚本）

### 脚本流程

```
启动
  ↓
1. 检查 .env 是否存在
   ├─ 不存在 → 从 .env.example 复制 → 提示用户填写
   └─ 存在 → 跳过
  ↓
2. 检查 DATABASE_URL 是否已配置
   ├─ 未配置 → 打印警告，跳过迁移
   └─ 已配置 → 继续
  ↓
3. 运行数据库迁移（bun run migrate:local）
   ├─ 失败 → 打印错误，退出码 1
   └─ 成功 → 继续
  ↓
4. 打印摘要 + 下一步提示（bun dev）
  ↓
结束
```

### 核心实现

```typescript
// scripts/setup.ts
import { existsSync, copyFileSync, readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import process from 'node:process'

const ROOT = process.cwd()

async function setup() {
  console.log('🚀 ShipFree 项目初始化...\n')

  // Step 1: .env 检查
  const envPath = `${ROOT}/.env`
  const envExamplePath = `${ROOT}/.env.example`

  if (!existsSync(envPath)) {
    if (!existsSync(envExamplePath)) {
      console.error('❌ 未找到 .env.example，请先创建该文件')
      process.exit(1)
    }
    copyFileSync(envExamplePath, envPath)
    console.log('✅ 已从 .env.example 创建 .env 文件')
    console.log('⚠️  请编辑 .env 文件，填写必要的环境变量\n')
  } else {
    console.log('✅ .env 文件已存在，跳过复制\n')
  }

  // Step 2 & 3: 数据库迁移
  const envContent = readFileSync(envPath, 'utf-8')
  const hasDatabaseUrl = envContent.includes('DATABASE_URL=') &&
    !envContent.match(/^DATABASE_URL=\s*$/m) &&
    !envContent.match(/^#\s*DATABASE_URL/m)

  if (!hasDatabaseUrl) {
    console.warn('⚠️  DATABASE_URL 未配置，跳过数据库迁移')
    console.warn('   配置后可手动运行：bun run migrate:local\n')
  } else {
    try {
      console.log('📦 运行数据库迁移...')
      execSync('bun run migrate:local', { stdio: 'inherit', cwd: ROOT })
      console.log('✅ 数据库迁移完成\n')
    } catch (error) {
      console.error('❌ 数据库迁移失败，请检查 DATABASE_URL 配置')
      process.exit(1)
    }
  }

  // Step 4: 完成摘要
  console.log('🎉 初始化完成！')
  console.log('   下一步：bun dev')
}

setup().catch((err) => {
  console.error('初始化失败:', err)
  process.exit(1)
})
```

### package.json 修改

在 `scripts` 字段添加：
```json
"setup": "bun scripts/setup.ts"
```

---

## 模块 2：API Rate Limiting 中间件

### 文件结构

```
src/lib/rate-limit/
├── index.ts        # 公共导出
├── types.ts        # 类型定义
└── limiter.ts      # 核心实现
```

### 类型设计（`types.ts`）

```typescript
export interface RateLimitConfig {
  /** 时间窗口，单位毫秒，默认 60_000（1分钟）*/
  windowMs: number
  /** 窗口内最大请求数，默认 60 */
  max: number
  /** 自定义键生成函数，默认使用 IP */
  keyGenerator?: (request: Request) => string
  /** 触发限制时的错误消息 */
  message?: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  reset: number // Unix timestamp（秒）
}

export interface RateLimitResult {
  success: boolean
  info: RateLimitInfo
}
```

### 核心实现（`limiter.ts`）

采用**固定窗口（Fixed Window）**算法，简单高效，适合模板场景：

```typescript
import type { RateLimitConfig, RateLimitResult } from './types'
import { NextResponse } from 'next/server'

interface WindowEntry {
  count: number
  resetAt: number
}

// 全局内存存储（进程级别）
const store = new Map<string, WindowEntry>()

// 定期清理过期条目（避免内存泄漏）
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 60_000)
}

const DEFAULT_CONFIG: Required<RateLimitConfig> = {
  windowMs: 60_000,
  max: 60,
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for')
    return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
  },
  message: 'Too many requests, please try again later.',
}

export const createRateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  return async (request: Request): Promise<RateLimitResult | NextResponse> => {
    const key = cfg.keyGenerator(request)
    const now = Date.now()

    let entry = store.get(key)
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + cfg.windowMs }
      store.set(key, entry)
    }

    entry.count += 1
    const remaining = Math.max(0, cfg.max - entry.count)
    const reset = Math.ceil(entry.resetAt / 1000)

    const info = { limit: cfg.max, remaining, reset }

    if (entry.count > cfg.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return NextResponse.json(
        { error: cfg.message, retryAfter },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(cfg.max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(reset),
          },
        }
      )
    }

    return { success: true, info }
  }
}
```

### 公共导出（`index.ts`）

```typescript
export { createRateLimiter } from './limiter'
export type { RateLimitConfig, RateLimitInfo, RateLimitResult } from './types'
```

### 使用示例（在现有 API 路由中）

```typescript
// src/app/api/payments/checkout/route.ts 示例用法
import { createRateLimiter } from '@/lib/rate-limit'
import { NextResponse } from 'next/server'

const rateLimiter = createRateLimiter({ windowMs: 60_000, max: 10 })

export const POST = async (request: Request) => {
  const limitResult = await rateLimiter(request)
  if (limitResult instanceof NextResponse) return limitResult

  // ... 原有逻辑
}
```

---

## 模块 3：CLAUDE.md 通用模板化

### 改造原则

1. 将 "ShipFree" 相关的专有描述替换为通用占位符或泛化描述
2. 在文件头部添加 `## 使用此模板` 章节，指导首次使用者
3. 保留所有技术架构描述（准确、完整）
4. 保留 AI-DLC / Kiro spec-driven development 章节（完整不变）

### 文件结构变更

**新增章节**（置于文件顶部，`# CLAUDE.md` 标题之后）：

```markdown
## 使用此模板

在使用此模板时，请更新以下占位符：

- `[YOUR_PROJECT_NAME]` — 替换为你的项目名称
- `[YOUR_PROJECT_DESCRIPTION]` — 替换为你的项目一句话描述

完成替换后删除此章节。
```

**修改 Project Overview 章节**：

将：
> ShipFree is a Next.js SaaS boilerplate (free ShipFast alternative) using...

改为：
> [YOUR_PROJECT_NAME] is a Next.js SaaS application using Bun runtime, PostgreSQL, Drizzle ORM, Better-Auth, and TailwindCSS 4. Built on the ShipFree template.
>
> [YOUR_PROJECT_DESCRIPTION]

其余章节（Commands、Architecture、Code Style、AI-DLC）保持原文不变。

---

## 依赖与兼容性

| 模块 | 新增依赖 | 兼容性说明 |
|------|---------|-----------|
| 初始化脚本 | 无 | 仅使用 Node.js 内置模块 |
| Rate Limiting | 无 | 纯内存实现，无外部依赖 |
| CLAUDE.md | 无 | 纯文档修改 |

---

## 测试策略

- **初始化脚本**：手动测试（删除 `.env` 后运行，验证复制和迁移流程）
- **Rate Limiting**：在开发环境调低 `max` 值（如 3），验证 429 响应和响应头
- **CLAUDE.md**：视觉审查，确认占位符可读性和技术内容准确性

---

## 变更文件清单

| 文件 | 操作 |
|------|------|
| `scripts/setup.ts` | 新增 |
| `package.json` | 修改（添加 `setup` 脚本） |
| `src/lib/rate-limit/index.ts` | 新增 |
| `src/lib/rate-limit/types.ts` | 新增 |
| `src/lib/rate-limit/limiter.ts` | 新增 |
| `CLAUDE.md` | 修改（通用模板化） |
