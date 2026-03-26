# 设计文档

---

**用途**：提供足够的实现细节，确保各实现者之间的一致性，防止解读偏差。

---

## 概述

本功能将 ShipFree SaaS 样板模板从其原有的自我品牌中剥离，使其成为开发者可以直接应用自己品牌的通用起点。

**用途**：通过清除所有 ShipFree 特有的名称、链接、营销文案、付费购买流程，使模板能被任何开发者无缝接管并快速品牌化。

**用户**：使用此模板启动 SaaS 项目的开发者将直接受益，无需手动搜索并替换分散在代码库中的 ShipFree 引用。

**影响**：从代码库中移除 Premium Purchase 专项功能（约 8 个文件/目录），更新品牌配置入口点（`branding.ts`、`seo.ts`、`constants.ts`、`package.json`、`README.md`），替换 Landing Page 各组件中的文案为通用占位符。

### 目标

- 使模板中所有面向用户可见的品牌标识与 ShipFree 解耦
- 完整移除 Premium Purchase 功能（付费购买 ShipFree 模板本身的流程），消除代码冗余和安全隐患
- 更新品牌集中配置点，使开发者只需修改少数文件即可完成品牌化
- 提供清晰的占位符注释，指引开发者替换 logo、favicon 等视觉资产

### 非目标

- 不修改应用的订阅支付系统（Stripe/Polar/LemonSqueezy 集成）
- 不更改认证、数据库、邮件等核心功能模块
- 不设计新的 Landing Page 内容或 UI 样式
- 不自动生成 Drizzle 数据库迁移文件（仅删除 schema 中的表定义，迁移由开发者手动执行）
- 不处理国际化翻译文件中的品牌文案（`src/messages/*.json`，范围外）

---

## 架构

### 现有架构分析

品牌信息当前分散在多个层级：

1. **配置层**：`src/config/branding.ts`（品牌主配置）、`src/lib/seo.ts`（SEO/元数据）、`src/lib/constants.ts`（常量）
2. **UI 层**：`src/app/(site)/` 下各 Landing Page 组件（navbar、hero、footer、faq、pricing）
3. **包层**：`package.json`（项目名称）
4. **文档层**：`README.md`
5. **独立功能层**：Premium Purchase 功能（散布于 `src/app/(site)/premium-purchase/`、`src/app/api/premium-purchase/`、`src/app/actions/`、`src/lib/premium-purchase*`、`src/database/schema.ts`、`src/config/env.ts`）

### 架构模式与边界映射

变更分为两类：

**A. 内容替换**（修改现有文件，保留结构）
- `package.json`、`src/config/branding.ts`、`src/lib/seo.ts`、`src/lib/constants.ts`
- `src/app/layout.tsx`、`src/app/manifest.ts`
- Landing Page 组件：`navbar.tsx`、`hero.tsx`、`footer.tsx`、`faq.tsx`、`pricing.tsx`
- `README.md`

**B. 功能删除**（移除 Premium Purchase 相关文件和代码引用）
- 删除文件/目录
- 从 `hero.tsx` 和 `pricing.tsx` 中移除 PremiumButton 组件引用
- 从 `src/config/env.ts` 中移除 Premium Purchase 相关环境变量
- 从 `src/database/schema.ts` 中删除 `premiumPurchase` 表定义

### 技术栈

| 层级 | 选择 | 功能角色 | 说明 |
|------|------|----------|------|
| 前端 | Next.js / React TSX | Landing Page 组件替换 | 仅修改文案和组件引用 |
| 配置 | TypeScript | 品牌和 SEO 配置更新 | 集中修改 `branding.ts`、`seo.ts` |
| 数据库 schema | Drizzle ORM | 删除 premiumPurchase 表定义 | 需手动执行迁移 |
| 环境变量 | @t3-oss/env-nextjs | 移除 Premium Purchase 相关变量 | 确保 env.ts 类型安全 |

---

## 需求可追溯性

| 需求 | 摘要 | 组件 | 接口 | 流程 |
|------|------|------|------|------|
| 1 | 更新 package.json | package.json | — | — |
| 2 | 替换 Landing Page 内容 | hero, navbar, footer, faq, pricing | — | — |
| 3 | 更新品牌配置和 SEO 元数据 | branding.ts, seo.ts, constants.ts, layout.tsx, manifest.ts | — | — |
| 4 | 更新 logo/favicon 占位符 | navbar, footer, layout.tsx | — | — |
| 5 | 更新 README | README.md | — | — |
| 6 | 完整移除 Premium Purchase | 多个文件/目录删除 + env.ts + schema.ts | — | — |

---

## 组件与接口

### 配置层

#### package.json

| 字段 | 详情 |
|------|------|
| 意图 | 项目元数据，移除 ShipFree 品牌 |
| 需求 | 1 |

**变更**：
- `name`: `"shipfree"` → `"my-saas-app"`
- 新增 `"description"`: `"A production-ready Next.js SaaS boilerplate"`

---

#### src/config/branding.ts

| 字段 | 详情 |
|------|------|
| 意图 | 品牌配置集中入口，替换默认值为占位符 |
| 需求 | 3 |

**变更**：
- `defaultConfig.name`: `'ShipFree'` → `'My SaaS App'`
- `defaultConfig.supportEmail`: `'hi@revoks.dev'` → `'support@example.com'`

---

#### src/lib/seo.ts

| 字段 | 详情 |
|------|------|
| 意图 | SEO 配置，移除 ShipFree 特有描述和关键词 |
| 需求 | 3 |

**变更**：
- `siteConfig.description`：替换为通用 SaaS 描述
- `siteConfig.twitterHandle`: `'@codedoesdev'` → `'@yourhandle'`
- `siteConfig.creator`: `'The Revoks Company'` → `'Your Company'`
- `siteConfig.keywords`：移除 `'ShipFree'`、`'ShipFast alternative'`，替换为通用 SaaS 关键词
- `getOrganizationSchema()` 中的 `sameAs` 链接替换为占位符

---

#### src/lib/constants.ts

| 字段 | 详情 |
|------|------|
| 意图 | 应用级常量，避免 cookie 名称暴露模板来源 |
| 需求 | 3 |

**变更**：
- `APP_COOKIE_NAME`: `'shipfree'` → `'app'`

---

#### src/app/manifest.ts

| 字段 | 详情 |
|------|------|
| 意图 | PWA manifest，替换 ShipFree 特有描述 |
| 需求 | 3、5 |

**变更**：
- `description`：替换为通用描述
- `shortcuts[0].description`：移除 ShipFree 引用

---

#### src/config/env.ts

| 字段 | 详情 |
|------|------|
| 意图 | 环境变量验证，移除 Premium Purchase 专属变量 |
| 需求 | 6 |

**变更（删除）**：
- server 对象中删除：`PREMIUM_PURCHASE_STRIPE_SECRET_KEY`、`PREMIUM_PURCHASE_STRIPE_PRICE_ID`、`PREMIUM_PURCHASE_STRIPE_WEBHOOK_SECRET`
- client 对象中删除：`NEXT_PUBLIC_PREMIUM_PURCHASE_STRIPE_PUBLISHABLE_KEY`、`NEXT_PUBLIC_PREMIUM_PURCHASE_DISCORD_INVITE_LINK`
- runtimeEnv 对象中删除对应的 `process.env.*` 条目

---

### 数据库层

#### src/database/schema.ts

| 字段 | 详情 |
|------|------|
| 意图 | 数据库 schema，移除 Premium Purchase 专属表 |
| 需求 | 6 |

**变更（删除）**：
- 删除 `premiumPurchase` 表定义（`pgTable('premium_purchase', {...})`）
- 删除相关导出

**实现说明**：
- 删除 schema 后，开发者需手动运行 `bun run generate-migration` 和 `bun run migrate:local` 以使数据库与 schema 同步
- 生产环境迁移需谨慎处理，若表中存有数据需先备份

---

### UI 层 - Landing Page 组件

#### src/app/(site)/navbar.tsx

| 字段 | 详情 |
|------|------|
| 意图 | 导航栏，移除 ShipFree 品牌名和 GitHub 仓库链接 |
| 需求 | 2、4 |

**变更**：
- `const repo = 'revokslab/shipfree'` → `const repo = 'your-org/your-repo'`
- logo `alt` 属性：`'ShipFree Logo'` → `'App Logo'`
- 品牌名 span：`ShipFree` → `My App` （并添加注释说明此处应替换）
- 保留 GitHub star 显示逻辑，仅替换仓库路径

---

#### src/app/(site)/hero.tsx

| 字段 | 详情 |
|------|------|
| 意图 | Hero 区，移除 PremiumButton，替换文案 |
| 需求 | 2、3、6 |

**变更**：
- 删除 `import { PremiumButton } from './pricing/premium-button'`
- 将 `<PremiumButton className='text-white' />` 替换为通用 CTA 按钮：
  ```tsx
  <Button className='h-12! px-8 text-base font-semibold text-white'>
    Get Started
  </Button>
  ```
- 标题文案替换为通用内容（如 `"A production-ready Next.js boilerplate for your SaaS"`）
- 描述文案替换为通用内容

---

#### src/app/(site)/footer.tsx

| 字段 | 详情 |
|------|------|
| 意图 | 页脚，移除 ShipFree 品牌、版权归属和社交链接 |
| 需求 | 2、4 |

**变更**：
- logo `alt`：`'ShipFree Logo'` → `'App Logo'`
- 品牌名 span：`ShipFree` → `My App`
- 版权文字：`The Revoks Company` → `Your Company`（添加注释说明）
- Community 栏 GitHub 链接：`revokslab/shipfree` → `your-org/your-repo`
- X/Twitter 链接：`x.com/shipfree_dev` → `x.com/yourhandle`（或删除）
- 口号文字：`Turn ideas into products, fast` → 通用占位符

---

#### src/app/(site)/faq.tsx

| 字段 | 详情 |
|------|------|
| 意图 | FAQ，移除 ShipFree 特定定价和功能列表 |
| 需求 | 2 |

**变更**：
- 联系邮件链接：`mailto:support@shipfree.app` → `mailto:support@example.com`
- FAQ 内容中提及 `$90 lifetime`、Discord 社区等 ShipFree 特有内容替换为通用文案
- `RevoksCompany` 相关引用替换

---

#### src/app/(site)/pricing.tsx

| 字段 | 详情 |
|------|------|
| 意图 | 定价区，移除 PremiumButton 并替换为通用 CTA，更新定价内容 |
| 需求 | 2、6 |

**变更**：
- 删除 `import { PremiumButton } from './pricing/premium-button'`
- 将 `<PremiumButton />` 替换为通用按钮（带注释说明此处为 CTA 占位符）：
  ```tsx
  {/* TODO: 替换为您的结账按钮或 CTA */}
  <Button className='w-full h-12! text-sm font-medium' size='lg'>
    Get Started
  </Button>
  ```
- Premium 卡片定价 `$90`/`$150` 替换为占位符（`$XX`）并添加注释
- 功能列表中与 ShipFree 特有服务相关的条目替换为通用描述

---

### 要删除的文件清单

#### Premium Purchase 功能文件（需完全删除）

| 文件路径 | 需求 |
|---------|------|
| `src/app/(site)/premium-purchase/cancel/page.tsx` | 6 |
| `src/app/(site)/premium-purchase/success/page.tsx` | 6 |
| `src/app/(site)/premium-purchase/success/success-client.tsx` | 6 |
| `src/app/(site)/pricing/premium-button.tsx` | 6 |
| `src/app/api/premium-purchase/checkout/route.ts` | 6 |
| `src/app/api/premium-purchase/verify/route.ts` | 6 |
| `src/app/actions/premium-purchase.ts` | 6 |
| `src/lib/premium-purchase.ts` | 6 |
| `src/lib/premium-purchase/hooks.ts` | 6 |

---

### 文档层

#### README.md

| 字段 | 详情 |
|------|------|
| 意图 | 项目文档，去除 ShipFree 自我品牌，转为通用模板说明 |
| 需求 | 5 |

**变更**：
- 文档标题改为 `# Next.js SaaS Boilerplate`
- 移除/替换 ShipFree 官网链接、GitHub 仓库链接、Discord 邀请链接
- 新增"品牌自定义指南"章节，列出开发者需修改的文件：
  - `package.json` → 项目名称和描述
  - `src/config/branding.ts` → 品牌名称、支持邮箱
  - `src/lib/seo.ts` → SEO 配置、社交账号
  - `public/image.png` → Logo（建议 128x128 PNG）
  - `public/opengraph-image.png` → OG 图片（建议 1200x630）
  - `public/twitter-image.png` → Twitter 卡片图片
  - `public/favicon/` → Favicon 套件
  - `src/app/(site)/` 下各组件 → Landing Page 文案

---

## 数据模型

### 数据模型变更

删除 `src/database/schema.ts` 中的 `premiumPurchase` 表定义：

```typescript
// 需要删除以下代码块：
export const premiumPurchase = pgTable(
  'premium_purchase',
  {
    id: text('id').primaryKey(),
    stripeSessionId: text('stripe_session_id').notNull().unique(),
    stripeCustomerEmail: text('stripe_customer_email'),
    // ... 其余字段
  }
)
```

删除后，执行 Drizzle 迁移以从数据库中移除 `premium_purchase` 表（仅在本地/生产数据库中已存在该表时需要）。

---

## 错误处理

### 错误策略

本功能主要为代码修改和文件删除，无运行时错误处理需求。需要注意的潜在问题：

- **编译错误**：删除 `premium-button.tsx` 后，若 `hero.tsx` 和 `pricing.tsx` 中仍有导入则会报错 → 确保所有导入引用一并移除
- **环境变量引用残留**：若代码中仍有对已删除的 `env.PREMIUM_PURCHASE_*` 变量的引用则会报类型错误 → 确保 `premium-purchase.ts` 等文件完整删除后再修改 `env.ts`
- **数据库 schema 类型错误**：若 `actions/premium-purchase.ts` 等文件被删除，但其他文件仍引用 `premiumPurchase` schema 导出则报错 → 确保删除顺序正确

---

## 测试策略

### 单元测试

不需要新增单元测试（仅为内容替换和代码删除）。

### 手动验证清单

- [ ] `bun run typecheck` 无类型错误
- [ ] `bun build` 构建成功
- [ ] `bun lint` 无 lint 错误
- [ ] 访问首页，验证无 ShipFree 品牌名出现在 Navbar、Hero、Footer
- [ ] 访问 `/premium-purchase/success` 路由返回 404（路由已删除）
- [ ] 访问 `/api/premium-purchase/checkout` 返回 404（API 路由已删除）
- [ ] 浏览器开发工具中 `localStorage` 中不存在 `shipfree_premium_purchased` 键逻辑（代码已删除）

---

## 安全考量

移除 Premium Purchase 功能消除了以下潜在安全面：
- 不再暴露 Stripe Premium Purchase 相关 API 端点（`/api/premium-purchase/checkout`、`/api/premium-purchase/verify`）
- 不再在环境变量中要求配置 `PREMIUM_PURCHASE_STRIPE_SECRET_KEY`
- 减少应用的攻击面

---

## 迁移策略

Premium Purchase 功能的移除为破坏性变更，适用于以下场景：
- **新项目**：直接从更新后的模板初始化，无需数据库迁移
- **已部署项目（数据库中已有 `premium_purchase` 表）**：
  1. 备份 `premium_purchase` 表中的数据（如有需要）
  2. 删除 schema 中的表定义
  3. 运行 `bun run generate-migration` 生成 DROP TABLE 迁移
  4. 运行 `bun run migrate:local`（本地）或 `bun run migrate:prod`（生产）
