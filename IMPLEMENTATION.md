# SaaS 模板改造指南

> 基于 [ShipFree](https://github.com/Idee8/ShipFree) fork，目标：打造自己的通用 SaaS 项目脚手架。
> 分析文档：[ideas/kb/topics/product/saas-template.md](../ideas/kb/topics/product/saas-template.md)

## 做什么

将 ShipFree 改造为自己的通用 SaaS 模板，后续所有新项目（如 listing-predictor）都从这个模板起步。核心价值：省掉每个新项目重复搭建 Auth + 支付 + 邮件 + i18n + 部署的时间。

## 为什么

- 已有多个待启动的项目方向（listing-predictor 等），技术栈高度重叠
- ShipFree 已提供 80% 的基础设施，只需定制 20%
- 每个新项目省 2-3 天配置时间

## ShipFree 现有能力

已经开箱即用的：

| 模块 | 方案 | 状态 |
|------|------|------|
| 框架 | Next.js 16 + React 19 + TypeScript | ✅ 可直接用 |
| 运行时 | Bun | ✅ 可直接用 |
| Auth | Better-Auth（开源自托管）+ Google/GitHub/Microsoft/Facebook OAuth | ✅ 可直接用 |
| 支付 | Stripe + Polar + Lemon Squeezy + Dodo + Creem + Autumn | ✅ 可直接用，保留全部选项 |
| 数据库 | PostgreSQL + Drizzle ORM + 迁移脚本 | ✅ 可直接用 |
| 邮件 | Resend / Postmark / Plunk / Nodemailer | ✅ 可直接用 |
| i18n | next-intl（英/法/西） | ✅ 可直接用 |
| UI | TailwindCSS 4 + BaseUI | ⚠️ 需替换为 Shadcn UI |
| 监控 | Sentry | ✅ 可直接用 |
| 存储 | Cloudflare R2 | ✅ 可直接用 |
| 部署 | Vercel (vercel.json 已配) + Docker | ✅ 可直接用 |
| 邮件模板 | React Email | ✅ 可直接用 |
| 环境变量 | t3-env 校验 | ✅ 可直接用 |

## 竞品功能对比

对比 ShipFast ($199)、ixartz SaaS Boilerplate、Open SaaS (Wasp) 后，识别出 ShipFree 的短板：

| 功能 | ShipFast | ixartz | Open SaaS | ShipFree | 判断 |
|------|----------|--------|-----------|----------|------|
| SEO 博客系统 | ✅ 优化博客 | ❌ | ✅ Astro Starlight | ❌ | **必补** |
| JSON-LD + Open Graph | ✅ | ✅ | ✅ | ❌ | **必补** |
| sitemap + robots.txt | ✅ | ✅ | ✅ | ❌ | **必补** |
| Analytics | ✅ | ❌ | ✅ Plausible + GA | ❌ | **值得补** |
| Admin Dashboard | ✅ | ✅ 基础 | ✅ ShadCN | ❌ | **值得补** |
| Background Jobs/Cron | ❌ | ❌ | ✅ 内置 | ❌ | **必补** |
| Testing | ❌ | ✅ Vitest + Playwright | ✅ Playwright | ❌ | P2 |
| CI/CD | ❌ | ✅ GitHub Actions | ❌ | ❌ | P2 |
| Landing Page 转化优化 | ✅ 强项 | ✅ | ✅ | ✅ 有但一般 | 可优化 |
| 多租户/团队 | ❌ | ✅ | ❌ | ❌ | 暂不需要 |
| AI 集成模板 | ✅ | ❌ | ✅ OpenAI 示例 | ❌ | 按项目需要 |
| Logging | ❌ | ✅ Pino.js + Better Stack | ❌ | ✅ 统一结构化日志 | 可选 |
| GEO（AI 引擎优化） | ❌ | ❌ | ❌ | ❌ | **必补（差异化）** |

**核心结论**：ShipFree 最大短板集中在 **SEO/GEO 全家桶**和**后台任务**，恰好是 listing-predictor 的核心需求。所有竞品都没有 GEO 支持——这是差异化机会。

## 需要改造的部分

### 1. 品牌去 ShipFree 化
- 替换 package.json 中的 name、描述
- 替换 Landing Page 内容为通用模板
- 替换 logo、favicon
- 更新 README
- 移除 Premium Purchase 功能（ShipFree 特有的付费模板购买）

### 2. UI 框架替换：BaseUI → Shadcn UI
ShipFree 用 BaseUI，生态和社区远不如 Shadcn UI：
- 替换所有 BaseUI 组件为 Shadcn UI
- Shadcn UI 基于 Radix UI + Tailwind，组件可复制到项目中，完全可控
- ixartz 和 Open SaaS 都用 Shadcn，组件参考丰富
- 保留 TailwindCSS 4 不变

### 3. 补强 SEO（借鉴 ixartz + ShipFast）
ShipFree 的 SEO 是最大短板，其他三家都有而它没有：
- JSON-LD 结构化数据组件（借鉴 ixartz 实现）
- Open Graph / Twitter Card 元数据模板
- sitemap.xml 自动生成（借鉴 ixartz 的 next-sitemap）
- robots.txt 配置
- Lighthouse 满分优化（借鉴 ixartz "Maximize lighthouse score"）
- 每个页面的 metadata 导出模板

### 4. GEO — 面向 AI 的生成引擎优化（Generative Engine Optimization）
SEO 针对搜索引擎，GEO 针对 AI 引擎（ChatGPT、Perplexity、Claude、Google AI Overview）。AI 正在成为用户获取信息的主要入口，产品必须同时对两者可见。

**结构化数据（让 AI 能解析）**：
- Schema.org 标记（Product、FAQs、HowTo、Review 等），AI 引擎优先引用结构化内容
- 清晰的 HTML 语义标签（h1-h6 层级、article、section、nav）
- 每个页面提供机器可读的摘要（meta description 针对 AI 改写优化）

**内容策略模板（让 AI 愿意引用）**：
- 提供直接回答型内容结构（问题→答案→数据支撑），AI 偏好引用这类格式
- FAQ 页面模板（每个产品页附带 FAQ，AI 高频引用来源）
- 数据表格和对比表模板（AI 引用结构化数据的概率远高于纯文本）
- "统计/事实"区块组件（标注数据来源和时间，提升 AI 引用可信度）

**技术层面**：
- llms.txt / llms-full.txt 支持（向 AI 爬虫声明站点内容和结构）
- 确保关键内容不被 JS 渲染阻塞（SSR 已满足，但需避免 client-only 关键内容）
- robots.txt 中允许 AI 爬虫（GPTBot、ClaudeBot、PerplexityBot 等）
- 提供干净的纯文本版本或 API 端点，方便 AI 抓取

**品牌一致性**：
- 统一的品牌描述模板（确保 AI 在不同语境下引用时品牌信息一致）
- 权威信号：作者信息、数据来源标注、发布时间（AI 用这些判断可信度）

### 5. SEO 博客系统（借鉴 ShipFast + Open SaaS）
ShipFast 和 Open SaaS 都内置博客，这是 SEO + GEO 内容引擎的基础：
- MDX 博客模板（Next.js 原生支持，不引入额外框架）
- 文章列表页 + 文章详情页
- 分类/标签支持
- RSS feed
- 博文的 JSON-LD 结构化数据
- FAQ 组件（SEO + GEO 双重价值）

### 6. Background Jobs / Cron（借鉴 Open SaaS）
Open SaaS 内置 cron job 和队列，ShipFree 完全没有：
- 定时任务框架（可用 node-cron 或 Vercel Cron Jobs）
- 数据管道模板（采集→处理→存储的通用结构）
- 任务执行日志

### 7. Analytics（借鉴 Open SaaS）
- Plausible 或 Umami 集成（隐私友好，适合海外产品）
- 可选 Google Analytics
- 基础事件追踪模板

### 8. Admin Dashboard（借鉴 ixartz + Open SaaS）
- 基础管理后台框架（用户列表、数据概览）
- 借鉴 Open SaaS 的 ShadCN 组件方案

### 9. i18n 扩展 + Geo 优化
- 添加中文（zh）支持（必须）
- 建立翻译 key 的命名规范
- **Geo 相关优化**：
  - 基于用户 IP 自动检测地区，默认展示对应语言
  - 货币本地化：根据地区展示对应货币和定价（如 USD/CNY/EUR）
  - 支付方式适配：不同地区展示不同支付选项（如国内支付宝/微信，海外 Stripe）
  - hreflang 标签：告诉搜索引擎页面的语言/地区版本关系（SEO 必须）
  - CDN / Edge 就近分发：Vercel Edge Network 已自带，确认配置正确
  - 内容合规：隐私政策、Cookie 提示按地区适配（如 GDPR 针对欧洲用户）

### 10. 开发体验优化
- 补充常见操作的脚本（如一键初始化新项目）
- API rate limiting 中间件
- CLAUDE.md 调整为通用模板版本

## 项目结构概览（现有）

```
src/
├── app/
│   ├── (auth)/        # 登录/注册/重置密码
│   ├── (main)/        # 登录后主界面（Dashboard 等）
│   ├── (site)/        # 营销页面（Landing Page）
│   ├── api/           # API 路由（auth/payments/webhooks）
│   ├── _providers/    # React Context providers
│   └── _styles/       # 全局样式
├── components/
│   ├── emails/        # 邮件模板（React Email）
│   └── ui/            # UI 组件库
├── config/            # 环境变量、支付方案、品牌配置、Feature Flags
├── database/          # Drizzle schema + 连接
├── hooks/             # React hooks
├── i18n/              # i18n 路由和请求配置
├── lib/
│   ├── auth/          # Better-Auth 配置
│   ├── payments/      # 支付服务和适配器
│   ├── messaging/     # 邮件服务和 provider
│   ├── storage.ts     # R2 存储
│   └── utils/         # 工具函数
└── messages/          # 翻译文件（en.json / fr.json / es.json）
```

## 改造顺序建议

| 优先级 | 改造项 | 借鉴来源 | 理由 |
|--------|--------|---------|------|
| P0 | 品牌去 ShipFree 化 | — | 基础，避免后续混淆 |
| P0 | UI 替换 BaseUI → Shadcn UI | ixartz + Open SaaS | 生态更好，组件更丰富 |
| P1 | SEO 全家桶（JSON-LD/OG/sitemap） | ixartz | 所有竞品都有，ShipFree 最大短板 |
| P1 | GEO — AI 生成引擎优化 | — | AI 成为流量入口，必须同时对 AI 可见 |
| P1 | SEO 博客系统 | ShipFast + Open SaaS | SEO + GEO 内容引擎 |
| P1 | Background Jobs / Cron | Open SaaS | listing-predictor 数据管道核心 |
| P1 | i18n 扩展 + Geo 优化 | — | 中文必须，Geo 适配提升转化和 SEO |
| P2 | Analytics（Plausible/Umami） | Open SaaS | 产品运营基础 |
| P2 | Admin Dashboard | ixartz + Open SaaS | 通用管理需求 |
| P3 | Testing（Vitest + Playwright） | ixartz | 质量保障 |
| P3 | CI/CD（GitHub Actions） | ixartz | 自动化 |
| P3 | 开发体验优化 | — | 锦上添花 |

## 参考项目

改造过程中可直接参考这些项目的具体实现：

| 项目 | GitHub | 参考什么 |
|------|--------|---------|
| **ShipFree**（基础） | [Idee8/ShipFree](https://github.com/Idee8/ShipFree) | 基座项目，Auth / 支付 / 邮件 / i18n 保留其实现 |
| **ixartz SaaS Boilerplate** | [ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) | SEO 实现（JSON-LD、Open Graph、sitemap、robots.txt、Lighthouse 优化）、Shadcn UI 用法、Testing（Vitest + Playwright）、CI/CD（GitHub Actions）、Logging（Pino.js） |
| **Open SaaS (Wasp)** | [wasp-lang/open-saas](https://github.com/wasp-lang/open-saas) | Background Jobs / Cron 实现、Admin Dashboard（ShadCN）、Analytics（Plausible）、博客系统思路 |
| **shadcn/ui** | [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | UI 组件库，BaseUI 替换的目标 |
| **next-mdx-remote** | [hashicorp/next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) | MDX 博客系统实现参考 |
| **next-sitemap** | [iamvishnusankar/next-sitemap](https://github.com/iamvishnusankar/next-sitemap) | sitemap.xml + robots.txt 自动生成 |
| **llms.txt 规范** | [llmstxt.org](https://llmstxt.org/) | GEO 优化中 llms.txt 的标准格式和最佳实践 |
| **Umami** | [umami-software/umami](https://github.com/umami-software/umami) | 隐私友好的 Analytics 方案，可自托管 |
| **Taxonomy (Next.js)** | [shadcn-ui/taxonomy](https://github.com/shadcn-ui/taxonomy) | Next.js + Shadcn UI + MDX 博客的完整示例，SEO 实现参考 |

## 怎么验证

模板改造完成的标准：能在 **30 分钟内**从模板创建一个新项目并跑通以下流程：
1. 本地 dev server 启动
2. 用户注册/登录
3. Stripe 测试支付
4. 页面有正确的 SEO metadata（JSON-LD、Open Graph）
5. 中英文切换正常
6. llms.txt 可访问，AI 爬虫未被 robots.txt 屏蔽
7. 博客系统能发布 MDX 文章
