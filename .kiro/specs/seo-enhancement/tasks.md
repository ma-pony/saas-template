# 实施任务

## 功能：SEO 全家桶（seo-enhancement）

> 基于需求文档和技术设计文档生成。所有任务按依赖顺序排列，可独立执行。

---

- [x] 1. 修正 siteConfig 关键词并增强 seo.ts 基础函数
  - 修改 `src/lib/seo.ts`：更新 `siteConfig.keywords`，移除不准确的 Supabase、Mailgun 等关键词
  - 新增 `getFAQSchema()` 函数：生成 FAQPage Schema.org 结构
  - 新增 `getSoftwareApplicationSchema()` 函数：生成 SoftwareApplication Schema.org 结构
  - 新增 `SEOOptions` 的 `locale` 和 `alternateLocales` 可选字段
  - 在 `generateMetadata()` 中支持 `alternateLocales` 生成 `hreflang` alternates
  - 为所有导出函数添加完整 JSDoc 注释，包含使用示例
  - 运行 `bun run typecheck` 确认类型无误
  - _需求依据：需求 1、2、6_

- [x] 2. 创建 JSON-LD React 组件
  - 创建目录 `src/components/seo/`
  - 创建 `src/components/seo/json-ld.tsx`（Server Component，无 `'use client'`）
  - 实现通用 `JsonLd` 组件：接受 `data: Record<string, unknown>` prop，渲染 `<script type="application/ld+json">`
  - 实现 `OrganizationJsonLd`：调用 `getOrganizationSchema()`
  - 实现 `WebsiteJsonLd`：调用 `getWebsiteSchema()`
  - 实现 `ArticleJsonLd`：接受 `getArticleSchema()` 所需参数
  - 实现 `BreadcrumbJsonLd`：接受 `items` 数组参数
  - 实现 `FAQJsonLd`：接受 `questions` 数组参数，调用新增的 `getFAQSchema()`
  - 实现 `SoftwareApplicationJsonLd`：接受对应参数，调用新增的 `getSoftwareApplicationSchema()`
  - 导出所有组件
  - _需求依据：需求 1_

- [x] 3. 在根布局注入全局 JSON-LD
  - 修改 `src/app/layout.tsx`
  - 导入 `OrganizationJsonLd` 和 `WebsiteJsonLd`
  - 在 `<html>` 根元素内（`<head>` 位置）注入两个 JSON-LD 组件
  - 确认 Next.js 正确将 `<script>` 标签放入 `<head>`
  - _需求依据：需求 1_

- [x] 4. 添加 NEXT_PUBLIC_ALLOW_ROBOTS 环境变量
  - 修改 `src/config/env.ts`：在 `client` 对象中添加 `NEXT_PUBLIC_ALLOW_ROBOTS: z.string().optional().default('true')`
  - _需求依据：需求 4_

- [x] 5. 创建 robots.txt
  - 创建 `src/app/robots.ts`，使用 `MetadataRoute.Robots` 类型
  - 导入 `getBaseUrl` from `@/lib/utils` 和 `env` from `@/config/env`
  - 实现默认规则：允许所有公开路由，禁止 `/api/`、`/dashboard/`、`/settings/`、`/admin/`
  - 当 `env.NEXT_PUBLIC_ALLOW_ROBOTS === 'false'` 时，返回 `disallow: '/'`（禁止所有爬虫）
  - 包含指向 `/sitemap.xml` 的 `sitemap` 字段
  - _需求依据：需求 4_

- [x] 6. 创建 sitemap.xml
  - 创建 `src/app/sitemap.ts`，使用 `MetadataRoute.Sitemap` 类型
  - 定义静态路由列表，包含路径、优先级、更新频率
  - 配置首页 `priority: 1.0`，定价页 `priority: 0.8`，隐私/条款页 `priority: 0.3`
  - 为每个静态路由生成三个 locale 版本（`en`、`es`、`fr`）
  - 设置 `lastModified: new Date()`
  - 预留 `DynamicRouteProvider` 类型注释，说明未来博客文章扩展方式
  - _需求依据：需求 3_

- [x] 7. 创建 llms.txt Route Handler
  - 创建目录 `src/app/llms.txt/`
  - 创建 `src/app/llms.txt/route.ts`，导出 `GET` 函数
  - 导入 `siteConfig` from `@/lib/seo` 和 `getBrandConfig` from `@/config/branding`
  - 按 llmstxt.org 规范生成内容：品牌名称、描述、核心功能、主要页面 URL 列表、许可说明
  - 内容从 `siteConfig` 和 `brandConfig` 动态读取，无硬编码字符串（URL、品牌名等）
  - 返回 `Content-Type: text/plain; charset=utf-8`
  - _需求依据：需求 7_

- [x] 8. 为公开营销页面添加 metadata 导出
  - 修改 `src/app/page.tsx`：添加 `export const metadata: Metadata = generateMetadata({...})` 导出，包含首页标题、描述、canonical
  - 修改 `src/app/privacy/page.tsx`：添加隐私政策页面的 metadata 导出（已存在）
  - 修改 `src/app/terms/page.tsx`：添加服务条款页面的 metadata 导出（已存在）
  - 每个页面的描述控制在 50-160 字符内
  - _需求依据：需求 6_

- [x] 9. 为认证页面添加 noindex metadata 导出
  - 修改 `src/app/(auth)/login/page.tsx`：添加 `noindex: true, nofollow: true` 的 metadata 导出
  - 修改 `src/app/(auth)/register/page.tsx`：同上
  - 修改 `src/app/(auth)/verify/page.tsx`：同上
  - 修改 `src/app/(auth)/reset-password/page.tsx`：同上（拆分为 server page + client component）
  - _需求依据：需求 6_

- [x] 10. 为仪表板页面添加 noindex metadata 导出
  - 修改 `src/app/(main)/dashboard/page.tsx`：添加 `noindex: true, nofollow: true` 的 metadata 导出
  - _需求依据：需求 6_

- [x] 11. Lighthouse 优化项检查与修复
  - 检查 `src/app/layout.tsx`：确认 `<html lang>` 属性是否根据 locale 动态设置（当前为硬编码 `"en"`，需与路由结构对齐）
  - 检查 `src/app/manifest.ts`：确认 `theme_color`、`background_color`、`icons` 字段完整（已完整）
  - 在根布局 metadata 中添加 `themeColor: '#701ffc'` 字段
  - 确认所有字体加载使用 `next/font`（已有）：添加 `display: 'swap'` 配置
  - _需求依据：需求 5_

- [x] 12. 代码质量验证
  - 运行 `bun run typecheck`：确认所有新增/修改文件无 TypeScript 类型错误
  - 运行 `bun lint`：确认所有代码符合 Biome 规范
  - 运行 `bun format`：自动格式化不符合规范的代码
  - 验证 `/sitemap.xml` 路由可访问且格式正确（`bun dev` 后访问）
  - 验证 `/robots.txt` 路由可访问且内容正确
  - 验证 `/llms.txt` 路由可访问且 Content-Type 为 `text/plain`
  - _需求依据：所有需求_
