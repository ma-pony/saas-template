# 需求文档

## 项目描述（输入）
GEO AI 生成引擎优化：Schema.org 标记、语义 HTML、llms.txt、AI 爬虫配置、FAQ 模板、品牌一致性

## 需求

### 背景

GEO（Generative Engine Optimization，生成引擎优化）是针对 AI 引擎（ChatGPT、Perplexity、Claude、Google AI Overview 等）的新型内容优化方式。与传统 SEO 不同，GEO 的目标是让 AI 引擎在生成回答时能够准确引用和呈现本站内容。ShipFree 作为 SaaS 模板，需要在 AI 搜索时代保持品牌曝光度。

目前项目已有基础 SEO 能力（`src/lib/seo.ts`），包含部分 JSON-LD Schema、Open Graph、Twitter Card 支持，但缺乏专门面向 AI 引擎的优化能力：无 `llms.txt`/`llms-full.txt`、缺少 AI 爬虫友好的 `robots.txt` 配置、FAQ 组件无结构化数据、无直接回答型内容格式、无数据表格组件。

### 需求 1：llms.txt 和 llms-full.txt 支持

**用户故事**：作为 SaaS 模板的用户，我希望网站能够提供标准的 `llms.txt` 文件，使 AI 引擎在抓取内容时能快速理解网站结构和核心内容摘要，从而提升品牌在 AI 生成回答中的引用率。

**验收标准**：
- 必须在 `/llms.txt` 路由提供符合 llms.txt 规范的纯文本文件，包含网站名称、描述、核心页面链接列表
- 必须在 `/llms-full.txt` 路由提供完整版本，包含每个重要页面的标题、URL 和内容摘要
- 文件内容应从 `src/config/branding.ts` 读取品牌配置，确保品牌一致性
- 响应头必须包含 `Content-Type: text/plain; charset=utf-8`
- 支持国际化：根据 `Accept-Language` 或路由参数提供对应语言版本（可选但推荐）

### 需求 2：AI 爬虫友好的 robots.txt 配置

**用户故事**：作为网站管理员，我希望通过 `robots.txt` 文件显式允许主要 AI 爬虫访问，同时保留对特定路由的访问控制，以便 AI 引擎能够完整索引网站内容。

**验收标准**：
- 必须生成动态 `robots.txt`（通过 Next.js `MetadataRoute.Robots`）
- 必须显式允许以下 AI 爬虫：`GPTBot`、`ClaudeBot`、`PerplexityBot`、`Google-Extended`、`Amazonbot`、`anthropic-ai`、`cohere-ai`
- 私有路由（`/dashboard`、`/settings`、`/api/*`）必须对所有机器人禁止访问
- 必须包含指向 sitemap 的 `Sitemap` 指令

### 需求 3：增强型 FAQ 组件（带 Schema.org 标记）

**用户故事**：作为开发者，我希望 FAQ 组件能够自动输出 `FAQPage` Schema.org 结构化数据，使 AI 引擎和搜索引擎都能将 FAQ 内容作为直接回答的来源。

**验收标准**：
- 必须在现有 FAQ 组件基础上添加 `FAQPage` JSON-LD 结构化数据
- JSON-LD 必须包含 `@context: https://schema.org`、`@type: FAQPage` 以及每个 FAQ 项的 `Question` 和 `Answer` 类型
- 必须提供可复用的 `FaqSchema` 服务端组件，接受 FAQ 数组并注入 `<script type="application/ld+json">`
- FAQ 内容支持 i18n：从 `next-intl` 翻译系统读取，不硬编码英文
- 保持现有的 Accordion 交互样式不变

### 需求 4：直接回答型内容结构组件

**用户故事**：作为内容创建者，我希望有专门的组件来创建"直接回答"格式的内容块，这种格式能被 AI 引擎识别为权威答案来源，提升引用概率。

**验收标准**：
- 必须提供 `DirectAnswer` 组件，渲染带 `itemscope`、`itemtype="https://schema.org/Question"` 和 `itemtype="https://schema.org/Answer"` 微数据标注的语义 HTML
- 问题部分使用 `<h3>` 或 `<h2>` 标签，回答部分使用 `<div>` 包裹并添加 `itemprop="text"`
- 组件支持 Markdown/富文本内容渲染
- 组件应作为服务端组件实现，无需 `'use client'`

### 需求 5：数据表格组件（带 Schema.org 标记）

**用户故事**：作为内容创建者，我希望能够创建结构化的比较表格（如功能对比、定价对比），这类内容对 AI 引擎具有高价值，能显著提升引用率。

**验收标准**：
- 必须提供 `ComparisonTable` 组件，渲染语义化 HTML `<table>` 标签（`<thead>`、`<tbody>`、`<th scope>`）
- 表格必须自动添加 `role="table"` 和适当的 `aria-label`
- 支持可选的 Schema.org `Table` 类型标注（`itemscope itemtype="https://schema.org/Table"`）
- 组件接受 `headers: string[]` 和 `rows: string[][]` props，无业务逻辑耦合
- 与现有 `src/components/ui/table.tsx` 共存，作为内容层语义组件

### 需求 6：Schema.org 扩展（SoftwareApplication 和 Product 类型）

**用户故事**：作为开发者，我希望在落地页注入 `SoftwareApplication` 类型的结构化数据，使 AI 引擎能准确识别本产品的性质、定价和核心特性。

**验收标准**：
- 必须在 `src/lib/seo.ts` 中新增 `getSoftwareApplicationSchema()` 函数，返回符合 Schema.org 规范的 `SoftwareApplication` JSON-LD
- Schema 必须包含：`name`、`description`、`applicationCategory`（`DeveloperApplication`）、`operatingSystem`、`offers`（定价信息）、`aggregateRating`（可选）
- 必须新增 `getFAQPageSchema(faqs: Array<{question: string, answer: string}>)` 函数
- 所有 Schema 生成函数应从 `src/config/branding.ts` 读取品牌信息，确保品牌一致性
- 落地页（`src/app/(site)/` 的主页布局）应注入 `SoftwareApplication` Schema

### 需求 7：语义 HTML 增强

**用户故事**：作为开发者，我希望落地页的 HTML 结构使用正确的语义标签，以便 AI 爬虫能准确理解页面结构和内容层级。

**验收标准**：
- 导航区域使用 `<nav>` 标签（`aria-label="主导航"`）
- 主内容区域使用 `<main>` 标签
- 各区块使用 `<section>` 标签，并有 `aria-label` 或 `aria-labelledby` 属性
- 页脚使用 `<footer>` 标签
- Hero 区域的标题必须是 `<h1>`，其他区块标题使用 `<h2>`，子标题使用 `<h3>`
- 不破坏现有的 TailwindCSS 样式

### 需求 8：品牌一致性模板

**用户故事**：作为模板使用者，我希望所有 GEO 相关配置（llms.txt 内容、Schema 数据、品牌描述）都从统一的配置文件读取，修改品牌信息只需改一处。

**验收标准**：
- `src/config/branding.ts` 必须扩展以支持 GEO 相关字段：`seoDescription`（SEO 专用描述）、`aiDescription`（AI 引擎优化描述，更精简直接）、`primaryKeywords`（核心关键词列表）、`socialLinks`（社交媒体链接）
- `src/lib/seo.ts` 中的所有 Schema 函数必须从 `getBrandConfig()` 读取品牌数据
- `llms.txt` 路由处理器必须从品牌配置读取内容
- 提供迁移指南（代码注释形式）说明如何为特定项目自定义 GEO 配置

### 需求 9：i18n 翻译覆盖

**用户故事**：作为国际化用户，我希望所有新增的用户可见文本（FAQ 内容、组件说明文字等）都有对应的多语言翻译键，支持英/西/法语。

**验收标准**：
- 所有新增的用户可见文本必须添加到 `src/messages/en.json`、`src/messages/es.json`、`src/messages/fr.json`
- FAQ 内容应通过翻译键管理，不直接硬编码到组件中
- 翻译键命名遵循现有约定：按功能模块分组（如 `geo.faq.q1`、`geo.faq.a1`）

### 非功能性需求

- **性能**：所有新增 JSON-LD 脚本必须是服务端渲染，不增加客户端 JS bundle 大小
- **兼容性**：所有新增组件兼容 Next.js 16 App Router，默认为 Server Components
- **可维护性**：GEO 优化逻辑集中在 `src/lib/seo.ts`（Schema 函数）和新建的 `src/lib/geo.ts`（GEO 专用工具）
- **测试性**：Schema 生成函数必须是纯函数，便于单元测试
