# 实施计划

## 任务列表

- [x] 1. 移除 Premium Purchase 功能文件
- [x] 1.1 删除 Premium Purchase 页面目录
  - 删除 `src/app/(site)/premium-purchase/` 整个目录（含 `cancel/page.tsx`、`success/page.tsx`、`success/success-client.tsx`）
  - _需求：6_
- [x] 1.2 删除 Premium Purchase 定价按钮组件 (P)
  - 删除 `src/app/(site)/pricing/premium-button.tsx`
  - _需求：6_
- [x] 1.3 删除 Premium Purchase API 路由目录 (P)
  - 删除 `src/app/api/premium-purchase/` 整个目录（含 `checkout/route.ts`、`verify/route.ts`）
  - _需求：6_
- [x] 1.4 删除 Premium Purchase server action 和 lib 文件 (P)
  - 删除 `src/app/actions/premium-purchase.ts`
  - 删除 `src/lib/premium-purchase.ts`
  - 删除 `src/lib/premium-purchase/hooks.ts`（及空目录 `src/lib/premium-purchase/`）
  - _需求：6_

- [x] 2. 更新 Landing Page 组件中的 PremiumButton 引用
- [x] 2.1 更新 hero.tsx，移除 PremiumButton 并替换为通用 CTA 按钮
  - 删除 `import { PremiumButton } from './pricing/premium-button'`
  - 将 `<PremiumButton className='text-white' />` 替换为 `<Button className='h-12! px-8 text-base font-semibold text-white'>Get Started</Button>`
  - 替换 Hero 标题文案为通用内容（`A production-ready Next.js boilerplate for your SaaS`）
  - 替换 Hero 描述文案为通用内容
  - _需求：2、6_
- [x] 2.2 更新 pricing.tsx，移除 PremiumButton 并替换为占位符 CTA
  - 删除 `import { PremiumButton } from './pricing/premium-button'`
  - 将 `<PremiumButton />` 替换为带 `TODO` 注释的通用 CTA 按钮
  - 将 Premium 卡片定价 `$90`/`$150` 替换为占位符（`$XX`）并添加注释
  - _需求：2、6_

- [x] 3. 移除环境变量中的 Premium Purchase 配置
- [x] 3.1 更新 src/config/env.ts，删除 Premium Purchase 相关变量
  - 从 `server` 对象中删除：`PREMIUM_PURCHASE_STRIPE_SECRET_KEY`、`PREMIUM_PURCHASE_STRIPE_PRICE_ID`、`PREMIUM_PURCHASE_STRIPE_WEBHOOK_SECRET`
  - 从 `client` 对象中删除：`NEXT_PUBLIC_PREMIUM_PURCHASE_STRIPE_PUBLISHABLE_KEY`、`NEXT_PUBLIC_PREMIUM_PURCHASE_DISCORD_INVITE_LINK`
  - 从 `runtimeEnv` 对象中删除对应的 `process.env.*` 条目
  - _需求：6_

- [x] 4. 删除数据库 schema 中的 premiumPurchase 表定义
- [x] 4.1 更新 src/database/schema.ts，删除 premiumPurchase 表
  - 删除 `export const premiumPurchase = pgTable('premium_purchase', {...})` 整个代码块
  - _需求：6_

- [x] 5. 更新品牌配置和 SEO 元数据
- [x] 5.1 更新 src/config/branding.ts 中的默认品牌配置
  - `defaultConfig.name`: `'ShipFree'` → `'My SaaS App'`（添加注释说明需替换）
  - `defaultConfig.supportEmail`: `'hi@revoks.dev'` → `'support@example.com'`（添加注释说明需替换）
  - _需求：3_
- [x] 5.2 更新 src/lib/seo.ts 中的站点配置 (P)
  - `siteConfig.description` 替换为通用 SaaS 描述
  - `siteConfig.twitterHandle`: `'@codedoesdev'` → `'@yourhandle'`
  - `siteConfig.creator`: `'The Revoks Company'` → `'Your Company'`
  - `siteConfig.keywords` 移除 `'ShipFree'`、`'ShipFast alternative'`，替换为通用 SaaS 关键词
  - `getOrganizationSchema()` 中的 `sameAs` 替换为占位符数组
  - _需求：3_
- [x] 5.3 更新 src/lib/constants.ts (P)
  - `APP_COOKIE_NAME`: `'shipfree'` → `'app'`
  - _需求：3_
- [x] 5.4 更新 src/app/layout.tsx 页面元数据 (P)
  - `metadata.title` 中的 `'ShipFree - Turn Ideas Into Products, Fast'` 替换为通用标题
  - `metadata.description` 替换为通用描述
  - _需求：3、4_
- [x] 5.5 更新 src/app/manifest.ts (P)
  - `description` 替换为不含 ShipFree 品牌的通用描述
  - `shortcuts[0].description` 中的 `ShipFree` 引用移除
  - _需求：3_

- [x] 6. 更新 package.json 项目元数据
- [x] 6.1 修改 package.json 名称和描述字段
  - `"name"`: `"shipfree"` → `"my-saas-app"`
  - 新增 `"description"`: `"A production-ready Next.js SaaS boilerplate"`
  - _需求：1_

- [x] 7. 更新 Landing Page 组件品牌文案
- [x] 7.1 更新 src/app/(site)/navbar.tsx
  - `const repo` 值替换为 `'your-org/your-repo'`
  - logo `alt` 属性：`'ShipFree Logo'` → `'App Logo'`
  - 品牌名 span：`ShipFree` → `My App`（添加 TODO 注释）
  - _需求：2、4_
- [x] 7.2 更新 src/app/(site)/footer.tsx (P)
  - logo `alt`：`'ShipFree Logo'` → `'App Logo'`
  - 品牌名 span：`ShipFree` → `My App`
  - 版权文字：`The Revoks Company` → `Your Company`（添加 TODO 注释）
  - Community 栏 GitHub 链接：`revokslab/shipfree` → `your-org/your-repo`
  - X/Twitter 链接：`x.com/shipfree_dev` → `x.com/yourhandle`
  - 口号文字替换为通用占位符
  - _需求：2、4_
- [x] 7.3 更新 src/app/(site)/faq.tsx (P)
  - 联系邮件链接：`mailto:support@shipfree.app` → `mailto:support@example.com`
  - FAQ 答案中提及 $90 lifetime、Discord 社区等 ShipFree 特有内容替换为通用文案
  - _需求：2_

- [x] 8. 更新 README.md
- [x] 8.1 重写 README.md 为通用模板文档
  - 文档标题改为 `# Next.js SaaS Boilerplate`
  - 移除/替换 ShipFree 官网链接、GitHub 仓库链接、Discord 邀请链接
  - 新增"品牌自定义指南"章节，列出需要修改的文件及说明
  - 保留技术栈和命令说明章节
  - _需求：5_

- [ ] 9. 验证构建和代码质量
- [ ] 9.1 运行类型检查和 lint 验证
  - 执行 `bun run typecheck`，确保无类型错误
  - 执行 `bun lint`，确保无 lint 错误
  - 执行 `bun build`，确保构建成功
  - _需求：1、2、3、4、5、6_
