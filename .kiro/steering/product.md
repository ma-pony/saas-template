# 产品概览

通用 Next.js SaaS 模板/脚手架，目标是让开发者能在 30 分钟内从零搭建一个具备完整基础设施的 SaaS 产品，省去每个新项目重复配置 Auth、支付、邮件、国际化、部署的时间。

## 核心能力

- **认证即开箱**：邮箱 + 4 大 OAuth 提供商（Google/GitHub/Microsoft/Facebook），含 OTP 验证和多租户组织支持
- **支付多提供商**：策略模式封装 Stripe / Polar / LemonSqueezy，切换提供商只需改一个环境变量
- **邮件多提供商**：自动发现机制，支持 Resend / Postmark / Nodemailer / Plunk，开发环境降级为控制台输出
- **国际化就绪**：next-intl 支持 `en`/`es`/`fr`/`zh` 四语，翻译 key 统一管理
- **SEO/GEO 全家桶**：JSON-LD 结构化数据、Open Graph、sitemap、robots.txt、llms.txt（AI 引擎优化）
- **UI 框架**：Shadcn UI（Radix UI + Tailwind）
- **MDX 博客系统**：内容引擎，支持分类/标签/RSS
- **Analytics**：适配器模式支持 Plausible / Umami / Google Analytics
- **后台任务**：定时任务框架，支持 node-cron 和 Vercel Cron
- **Admin 后台**：基础管理面板，用户管理和数据概览
- **完整基础设施**：PostgreSQL + Drizzle ORM、Cloudflare R2 存储、Sentry 监控、Vercel 部署配置

## 目标场景

- 开发者快速启动新 SaaS 项目，避免重复搭建基础设施
- 需要灵活选择支付和邮件提供商的项目
- 需要多语言支持的面向国际用户的产品

## 验收标准

模板就绪 = 30 分钟内能跑通：注册登录 → Stripe 测试支付 → 正确的 SEO metadata → 中英文切换 → llms.txt 可访问 → MDX 博客发布。

---
_聚焦模式和目的，而非功能详单_
