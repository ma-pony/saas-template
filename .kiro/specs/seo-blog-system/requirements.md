# 需求文档

## 简介

SEO 博客系统是 ShipFree SaaS 模板的内容引擎模块，旨在为开发者提供开箱即用的 MDX 博客能力，同时兼顾搜索引擎优化（SEO）和 AI 引擎优化（GEO）双重目标。系统基于 Next.js App Router 原生 MDX 支持，无需额外的数据库表，内容以文件系统形式管理。核心功能包括：文章列表页、文章详情页、分类/标签体系、RSS feed、JSON-LD 结构化数据以及 FAQ 组件。

## 需求

### 需求 1：MDX 博客内容管理

**目标：** 作为开发者，我希望使用 MDX 文件管理博客内容，以便在 Markdown 中嵌入 React 组件，同时保持内容与代码的分离。

#### 验收标准

1. 当在 `content/blog/` 目录下创建 `.mdx` 文件时，系统应自动将其识别为博客文章
2. 每篇 MDX 文章的 frontmatter 应支持以下字段：`title`、`description`、`date`、`author`、`categories`（数组）、`tags`（数组）、`coverImage`（可选）、`published`（布尔值，控制是否发布）
3. 当 `published: false` 时，系统不应在任何公开页面展示该文章
4. MDX 文件应支持在内容中直接使用 React 组件，包括自定义 MDX 组件
5. 系统应支持代码高亮、图片、链接等标准 Markdown 元素的渲染

### 需求 2：文章列表页

**目标：** 作为访客，我希望浏览所有已发布的博客文章列表，以便发现感兴趣的内容。

#### 验收标准

1. 当访问 `/blog` 路径时，系统应展示所有已发布文章的列表，按发布日期倒序排列
2. 列表中每篇文章应展示：标题、描述摘要、发布日期、分类标签、封面图（若有）
3. 列表页应支持分页，默认每页展示 10 篇文章
4. 列表页应包含正确的 `<title>`、`<meta description>` 及 Open Graph 元数据
5. 列表页的 URL 格式应为 `/[locale]/blog`，支持国际化路由

### 需求 3：文章详情页

**目标：** 作为访客，我希望阅读完整的博客文章内容，以便获取有价值的信息。

#### 验收标准

1. 当访问 `/blog/[slug]` 时，系统应渲染对应 MDX 文件的完整内容
2. 详情页应展示：文章标题、作者、发布日期、分类标签、封面图（若有）、正文内容
3. 详情页应包含文章专属的 `<title>`、`<meta description>` 及 Open Graph 元数据，内容来自 frontmatter
4. 当访问不存在的 slug 时，系统应返回 404 页面
5. 详情页应支持文章内的锚点导航（目录 TOC），自动从 h2/h3 标题提取

### 需求 4：分类与标签系统

**目标：** 作为访客，我希望按分类或标签筛选文章，以便快速找到特定主题的内容。

#### 验收标准

1. 系统应自动从所有已发布文章的 frontmatter 中聚合所有分类和标签
2. 当访问 `/blog/category/[category]` 时，系统应展示该分类下的所有文章
3. 当访问 `/blog/tag/[tag]` 时，系统应展示包含该标签的所有文章
4. 分类和标签页面应包含正确的元数据，标题格式为"[分类名] - 博客"
5. 文章列表和详情页中的分类/标签应为可点击链接，链接到对应的筛选页面

### 需求 5：RSS Feed

**目标：** 作为订阅者，我希望通过 RSS 阅读器订阅博客更新，以便及时获取新文章通知。

#### 验收标准

1. 系统应在 `/blog/feed.xml` 路径提供标准的 RSS 2.0 格式 feed
2. RSS feed 应包含最新的 20 篇已发布文章，按发布日期倒序排列
3. 每条 RSS 条目应包含：`title`、`link`、`description`（文章 description 字段）、`pubDate`、`author`、`category`
4. RSS feed 应设置正确的 `Content-Type: application/xml` 响应头
5. 博客列表页的 `<head>` 应包含 RSS feed 的 `<link rel="alternate">` 自动发现标签

### 需求 6：JSON-LD 结构化数据

**目标：** 作为 SEO 优化者，我希望每篇文章都包含标准的 JSON-LD 结构化数据，以便搜索引擎和 AI 引擎更好地理解并展示文章内容。

#### 验收标准

1. 每篇文章详情页应在 `<head>` 中注入 `Article` 类型的 JSON-LD 结构化数据
2. JSON-LD 数据应包含：`@type: "BlogPosting"`、`headline`、`description`、`author`（`Person` 类型）、`datePublished`、`dateModified`（若有）、`image`（若有封面图）、`url`
3. 博客列表页应注入 `Blog` 类型的 JSON-LD，包含站点名称和描述
4. JSON-LD 数据中的日期格式应符合 ISO 8601 标准
5. 结构化数据应通过 Google Rich Results Test 验证无错误

### 需求 7：FAQ 组件

**目标：** 作为内容创作者，我希望在 MDX 文章或独立页面中使用 FAQ 组件，以便同时满足用户问答需求和搜索引擎的 FAQ 结构化数据要求。

#### 验收标准

1. 系统应提供一个可在 MDX 中使用的 `<FAQ>` 组件，接受问答对数组作为 props
2. FAQ 组件应自动在页面 `<head>` 注入 `FAQPage` 类型的 JSON-LD 结构化数据
3. FAQ 组件的 UI 应使用 Accordion 交互模式（折叠/展开）
4. FAQ 组件应支持纯 SEO 模式（无交互，全部展开）和交互模式两种显示方式
5. FAQ 组件渲染的问答内容应符合 Google FAQPage 结构化数据规范，适合出现在搜索引擎特色摘要

### 需求 8：Sitemap 集成

**目标：** 作为 SEO 优化者，我希望博客文章自动包含在站点地图中，以便搜索引擎爬虫高效发现所有内容。

#### 验收标准

1. 系统应自动将所有已发布博客文章的 URL 加入 `sitemap.xml`
2. 每个博客 URL 的 `<changefreq>` 应为 `monthly`，`<priority>` 应为 `0.7`
3. 分类页面和标签页面的 URL 也应包含在 sitemap 中
4. sitemap 生成应使用 Next.js 原生的 `sitemap.ts` 路由处理器实现

### 需求 9：国际化支持

**目标：** 作为多语言用户，我希望博客 UI 文本（如"阅读更多"、"发布于"等）能以用户选择的语言显示，以便获得一致的本地化体验。

#### 验收标准

1. 博客相关的所有 UI 文本应使用 `next-intl` 翻译系统管理
2. 博客翻译键应添加到 `src/messages/en.json`、`es.json`、`fr.json` 三个文件
3. 博客文章内容本身（MDX 文件）不需要多语言，使用单一语言（英文）即可
4. 博客路由应遵循现有的 `[locale]/blog` 路由结构
