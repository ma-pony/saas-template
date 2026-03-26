# 需求文档

## 简介

本功能旨在将 ShipFree 模板的品牌标识从原有的 "ShipFree" 品牌中剥离，使其成为一个通用的、中性化的 SaaS 样板项目。需要完成的工作包括：替换 `package.json` 中的项目名称与描述、将 Landing Page 内容替换为通用模板内容（不再宣传 ShipFree 品牌）、更新 logo 和 favicon 占位符、更新 README 文档、以及完整移除 Premium Purchase 功能（该功能是 ShipFree 模板本身的付费购买流程，与模板所构建的应用程序付费系统无关）。

执行此操作后，开发者 fork 或克隆该模板时，将不会看到任何 ShipFree 特有的品牌信息，可以直接替换为自己的产品品牌。

## 需求

### 需求 1：更新 package.json 项目元数据

**目标：** 作为开发者，我希望 `package.json` 中不包含 ShipFree 特有的项目名称和描述，以便我能以此作为通用起点构建自己的项目。

#### 验收标准

1. 当读取 `package.json` 时，`name` 字段应为通用占位符（如 `my-saas-app`），而非 `shipfree`
2. 当读取 `package.json` 时，应新增或更新 `description` 字段，内容为通用 SaaS 模板描述（不含 ShipFree 品牌名）

---

### 需求 2：替换 Landing Page 内容为通用模板

**目标：** 作为开发者，我希望 Landing Page 所有组件中不再出现 ShipFree 专属的品牌名称、营销文案和链接，以便我能快速替换为自己产品的内容。

#### 验收标准

1. 当访问首页时，Navbar 中的品牌名称应显示为通用占位符（如 `My App`），logo 图片应指向通用占位符路径
2. 当访问首页时，Hero 区域的标题和描述应为通用的 SaaS 产品文案，不含 ShipFree 特有的文字
3. 当访问首页时，Hero 区域不再包含 `PremiumButton` 组件，应替换为通用的 CTA 按钮
4. 当访问首页时，Navbar 中指向 `revokslab/shipfree` GitHub 仓库的链接应被移除或替换为通用占位符
5. 当访问首页时，FAQ 中提及 ShipFree 特定定价（如 $90、$150）和服务（如 Pro 版特性列表）的内容应替换为通用模板文案
6. 当访问首页时，Footer 中的版权归属（如 `The Revoks Company`）、社交链接（如 `x.com/shipfree_dev`）和 GitHub 仓库链接应替换为通用占位符

---

### 需求 3：更新品牌配置和 SEO 元数据

**目标：** 作为开发者，我希望所有品牌配置文件中的 ShipFree 相关信息都被替换为通用内容，以便应用的元数据和 SEO 标签不再宣传 ShipFree 品牌。

#### 验收标准

1. 当读取 `src/config/branding.ts` 时，`defaultConfig.name` 应为通用占位符（如 `My SaaS App`），`supportEmail` 应替换为通用占位符
2. 当读取 `src/lib/seo.ts` 时，`siteConfig.description`、`twitterHandle`、`creator` 以及 `keywords` 数组中的 ShipFree 相关关键词应被替换为通用内容
3. 当读取 `src/app/layout.tsx` 时，页面 `metadata.title` 和 `metadata.description` 中的 ShipFree 品牌名应被替换
4. 当读取 `src/lib/constants.ts` 时，`APP_COOKIE_NAME` 的值 `shipfree` 应替换为通用值（如 `app`）
5. 当读取 `src/app/manifest.ts` 时，manifest 的 `description` 和 `shortcuts[0].description` 中的 ShipFree 引用应被替换

---

### 需求 4：更新 logo 和 favicon 占位符

**目标：** 作为开发者，我希望项目中所有引用 ShipFree logo 文件（如 `/image.png`）的地方都提供明确的占位符说明或注释，以便我能轻松替换为自己的品牌资产。

#### 验收标准

1. 当读取 Navbar 和 Footer 组件时，logo 图片的 `alt` 属性应从 `ShipFree Logo` 改为通用描述（如 `App Logo`）
2. 当读取 `src/app/layout.tsx` 时，`metadata.icons` 中的 logo 图片引用应保留但 alt/title 相关配置应去除 ShipFree 引用
3. 系统应提供注释说明开发者需要替换的 logo 和 favicon 文件路径（`/image.png`, `/opengraph-image.png`, `/twitter-image.png`, `/favicon/` 目录）

---

### 需求 5：更新 README 文档

**目标：** 作为开发者，我希望 `README.md` 不再以 ShipFree 项目的身份介绍自身，而是作为通用模板的使用说明，以便我理解如何基于此模板构建自己的项目。

#### 验收标准

1. 当读取 `README.md` 时，文档标题和开篇介绍应不含 ShipFree 专属品牌名称
2. 当读取 `README.md` 时，文档应包含"如何自定义品牌"的指引章节，说明开发者需要修改哪些文件来替换品牌
3. 当读取 `README.md` 时，指向 ShipFree 官方网站、GitHub 仓库或 Discord 社区的链接应被替换为占位符或删除

---

### 需求 6：完整移除 Premium Purchase 功能

**目标：** 作为开发者，我希望模板中不存在任何 Premium Purchase（ShipFree 模板付费购买）相关的代码，以防止模板构建的应用意外暴露或激活此功能。

#### 验收标准

1. 当构建应用时，以下文件应被删除：
   - `src/app/(site)/premium-purchase/` 目录（含 `cancel/page.tsx`、`success/page.tsx`、`success/success-client.tsx`）
   - `src/app/(site)/pricing/premium-button.tsx`
   - `src/app/api/premium-purchase/` 目录（含 `checkout/route.ts`、`verify/route.ts`）
   - `src/app/actions/premium-purchase.ts`
   - `src/lib/premium-purchase.ts`
   - `src/lib/premium-purchase/hooks.ts`
2. 当读取 `src/app/(site)/hero.tsx` 时，对 `PremiumButton` 的导入和使用应被替换为通用 CTA 按钮
3. 当读取 `src/app/(site)/pricing.tsx` 时，对 `PremiumButton` 的导入和使用应被替换为占位符按钮，且 Premium 定价卡片中的 ShipFree 特有定价内容（$90/$150）应替换为通用占位符
4. 当读取 `src/config/env.ts` 时，`PREMIUM_PURCHASE_STRIPE_SECRET_KEY`、`PREMIUM_PURCHASE_STRIPE_PRICE_ID`、`PREMIUM_PURCHASE_STRIPE_WEBHOOK_SECRET`、`NEXT_PUBLIC_PREMIUM_PURCHASE_STRIPE_PUBLISHABLE_KEY`、`NEXT_PUBLIC_PREMIUM_PURCHASE_DISCORD_INVITE_LINK` 等环境变量声明应被移除
5. 当读取 `src/database/schema.ts` 时，`premiumPurchase` 表定义应被删除
6. 如果存在关联数据库迁移文件，应生成新的迁移文件以删除 `premium_purchase` 表
