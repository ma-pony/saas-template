# 需求文档

## 项目描述（输入）
SEO 全家桶：JSON-LD 结构化数据、Open Graph/Twitter Card、sitemap.xml 自动生成、robots.txt、Lighthouse 优化、metadata 模板

## 背景与现状分析

当前项目（ShipFree SaaS 模板）已具备初步 SEO 基础：
- `src/lib/seo.ts` 包含 `generateMetadata()` 函数，支持 Open Graph 和 Twitter Card
- `src/lib/seo.ts` 包含若干 JSON-LD Schema 生成函数（Organization、Website、Breadcrumb、Article、Blog）
- `src/app/layout.tsx` 根布局已引用 `generateMetadata()`
- 尚无 `sitemap.xml`、`robots.txt`、`llms.txt` 文件
- 部分页面缺少 `metadata` 导出，SEO 覆盖不完整
- `siteConfig` 中部分关键词内容仍是占位值（如提及 Supabase、Mailgun 等不一致内容）
- JSON-LD 组件未封装为可复用 React 组件（目前仅为工具函数，需要手动注入 `<script>` 标签）
- 无 `llms.txt` 支持（AI 引擎优化，产品路线图中明确提及）

## 需求

### 需求 1：JSON-LD 结构化数据组件化

**用户故事**：作为开发者，我希望有可复用的 React 组件来注入 JSON-LD 结构化数据，使搜索引擎能正确理解页面内容结构，提升富结果展示概率。

**验收标准**：
1. 创建 `JsonLd` 通用组件，接受任意 Schema.org 对象并渲染为 `<script type="application/ld+json">` 标签
2. 提供以下预置 Schema 组件（或导出对应 Schema 生成函数）：
   - `OrganizationJsonLd`：组织/品牌信息
   - `WebsiteJsonLd`：网站信息（含 SearchAction）
   - `ArticleJsonLd`：文章/博客文章
   - `BreadcrumbJsonLd`：面包屑导航
   - `FAQJsonLd`：常见问题（新增）
   - `SoftwareApplicationJsonLd`：软件应用（适合 SaaS 场景，新增）
3. 组件为 Server Component，不引入客户端 JS
4. 根布局（`src/app/layout.tsx`）已注入 `OrganizationJsonLd` 和 `WebsiteJsonLd`
5. 每个组件有对应 TypeScript 类型定义，无 `any` 类型

### 需求 2：Open Graph / Twitter Card 元数据模板完善

**用户故事**：作为开发者，我希望有统一的 metadata 生成模板，使每个页面都能正确生成 OG 图片、Twitter Card 和 canonical URL，提升社交分享效果。

**验收标准**：
1. `generateMetadata()` 函数支持所有页面类型（网站首页、博客文章、仪表板等）
2. OG 图片支持动态生成（通过 Next.js `opengraph-image.tsx`），并提供静态 fallback
3. Twitter Card 默认使用 `summary_large_image` 类型
4. 每个页面的 canonical URL 正确设置，避免重复内容
5. 新增 `locale` 参数支持，与 `next-intl` 国际化集成（`hreflang` 标签）
6. 提供页面级 metadata 导出模板（供开发者复制使用）：
   - 营销页面模板
   - 认证页面模板（`noindex: true`）
   - 仪表板/应用页面模板（`noindex: true`）
   - 博客文章模板（含 `article` 类型、发布时间）

### 需求 3：sitemap.xml 自动生成

**用户故事**：作为网站所有者，我希望 sitemap.xml 自动生成并包含所有公开页面，使搜索引擎能高效爬取全部内容。

**验收标准**：
1. 创建 `src/app/sitemap.ts`，使用 Next.js `MetadataRoute.Sitemap` 类型
2. 自动包含所有静态公开路由（首页、关于页、功能页、定价页、隐私政策、服务条款等）
3. 排除认证页面（`/login`、`/register`、`/verify`、`/reset-password`）和仪表板页面
4. 排除 `noindex` 标记的页面
5. 支持国际化路由（为每个 locale 生成对应 URL，带 `hreflang` 信息）
6. 每个 URL 包含 `lastModified`、`changeFrequency`、`priority` 字段
7. 首页 `priority: 1.0`，功能/定价页 `priority: 0.8`，其他页面 `priority: 0.5`
8. 未来扩展：支持动态内容（如博客文章）接入，通过可配置接口预留扩展点

### 需求 4：robots.txt 配置

**用户故事**：作为网站所有者，我希望 robots.txt 能正确指引爬虫行为，保护私密路由，同时确保公开内容被充分爬取。

**验收标准**：
1. 创建 `src/app/robots.ts`，使用 Next.js `MetadataRoute.Robots` 类型
2. 默认允许所有爬虫爬取公开路由
3. 禁止爬取以下路径：`/api/*`、`/(main)/*`（仪表板）、`/admin/*`
4. 包含指向 `sitemap.xml` 的引用
5. 生产环境使用实际域名，开发环境使用 `localhost`
6. 支持通过 `env` 配置是否允许爬虫（`NEXT_PUBLIC_ALLOW_ROBOTS` 环境变量，默认生产环境为 `true`）

### 需求 5：Lighthouse 满分优化

**用户故事**：作为开发者，我希望项目在 Lighthouse 性能、SEO、最佳实践三个维度达到接近满分（90+），建立高质量 SEO 基线。

**验收标准**：
1. **性能优化**：
   - 所有图片使用 Next.js `<Image>` 组件，设置正确的 `width`、`height`、`alt` 属性
   - 关键路径 CSS 已内联（TailwindCSS 默认处理）
   - 字体使用 `next/font` 并设置 `display: swap`
   - 已设置 `<html lang>` 属性（根据当前 locale 动态设置）
2. **SEO 优化**：
   - 所有页面有唯一 `<title>` 和 `<meta name="description">`（长度 50-160 字符）
   - `<title>` 使用 `%s · 品牌名` 模板格式
   - 所有链接有描述性文本，无 "点击这里" 等无意义文本
3. **最佳实践**：
   - 添加 `theme-color` meta 标签（使用品牌主色 `#701ffc`）
   - 添加 `viewport` meta 标签（Next.js 默认处理）
   - 提供 `manifest.webmanifest`（已有 `manifest.ts`，需确认完整性）
4. 提供 Lighthouse 检查清单文档（`docs/lighthouse-checklist.md`）

### 需求 6：每个页面的 metadata 导出模板

**用户故事**：作为开发者，我希望有清晰的 metadata 使用指南和模板代码，使团队能快速为新页面添加正确的 SEO 元数据，保持全站 metadata 规范一致。

**验收标准**：
1. 现有所有公开页面（`(site)` 路由组）补充 `metadata` 或 `generateMetadata` 导出：
   - `src/app/page.tsx`（首页）
   - `src/app/privacy/page.tsx`（隐私政策）
   - `src/app/terms/page.tsx`（服务条款）
2. 认证页面统一添加 `noindex: true` 的 metadata 导出：
   - `src/app/(auth)/login/page.tsx`
   - `src/app/(auth)/register/page.tsx`
   - `src/app/(auth)/verify/page.tsx`
   - `src/app/(auth)/reset-password/page.tsx`
3. 仪表板页面添加 `noindex: true` 的 metadata 导出：
   - `src/app/(main)/dashboard/page.tsx`
4. 在 `src/lib/seo.ts` 中添加 JSDoc 注释，说明每个函数的使用场景和示例

### 需求 7：llms.txt 支持（AI 引擎优化）

**用户故事**：作为网站所有者，我希望提供 `llms.txt` 文件，使 AI 爬虫和大语言模型能正确理解网站内容，优化在 AI 搜索引擎中的可见性。

**验收标准**：
1. 创建 `src/app/llms.txt/route.ts`，动态生成 `llms.txt` 文件
2. 文件内容遵循 [llms.txt 规范](https://llmstxt.org/)，包含：
   - 网站名称、描述
   - 主要功能和用途说明
   - 关键页面 URL 列表
   - 使用限制说明
3. 内容从 `siteConfig` 和 `brandConfig` 动态读取，无硬编码
4. 响应 Content-Type 为 `text/plain`
5. 可通过 `/llms.txt` URL 直接访问

## 非功能需求

- **不引入新依赖**：所有功能使用 Next.js 内置能力（`MetadataRoute`、`generateMetadata`、Route Handlers）和现有工具函数实现
- **Server Component 优先**：JSON-LD 组件、metadata 生成均为服务端逻辑，不增加客户端 JS 体积
- **国际化兼容**：所有 metadata 生成函数接受 locale 参数，与 `next-intl` 协作
- **类型安全**：所有新增代码完整 TypeScript 类型，通过 `bun run typecheck`
- **代码风格一致**：遵循 Biome 配置（2 空格缩进、单引号、无分号），通过 `bun lint`
