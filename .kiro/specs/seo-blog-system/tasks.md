# 实现计划

## 任务列表

- [ ] 1. 安装依赖与基础配置
- [ ] 1.1 安装 MDX 相关依赖 (P)
  - 安装 `gray-matter`（frontmatter 解析）
  - 安装 `next-mdx-remote`（MDX 动态编译）
  - 安装 `rehype-highlight`（代码高亮）
  - 安装 `rehype-slug`、`rehype-autolink-headings`（标题锚点）
  - _需求：1_

- [ ] 1.2 安装排版样式依赖 (P)
  - 安装 `@tailwindcss/typography`
  - 在 `src/app/_styles/globals.css` 或 tailwind 配置中启用 typography 插件
  - _需求：1, 3_

- [ ] 1.3 创建博客内容目录与示例文章
  - 创建 `content/blog/` 目录
  - 创建 2 篇示例 MDX 文章，包含完整 frontmatter（title、description、date、author、categories、tags、published）
  - 创建 `public/images/blog/` 目录
  - _需求：1_

- [ ] 2. 实现 ContentReader 工具库
- [ ] 2.1 实现 PostMeta 和 Post 类型定义
  - 在 `src/lib/blog/types.ts` 定义 `PostMeta`、`Post`、`FAQItem` 接口
  - _需求：1_

- [ ] 2.2 实现 content-reader.ts
  - 在 `src/lib/blog/content-reader.ts` 实现 `getAllPosts`、`getPostBySlug`、`getPostsByCategory`、`getPostsByTag`、`getAllCategories`、`getAllTags` 函数
  - 使用 `gray-matter` 解析 frontmatter，过滤 `published: false`，按 `date` 倒序排列
  - 模块级缓存避免重复文件 I/O
  - _需求：1, 2, 3, 4, 5, 8_

- [ ] 2.3 实现 json-ld.ts
  - 在 `src/lib/blog/json-ld.ts` 实现 `generateArticleJsonLd`、`generateFaqJsonLd`、`generateBlogJsonLd` 函数
  - 确保日期格式为 ISO 8601，JSON 序列化转义防止注入
  - _需求：6, 7_

- [ ] 3. 实现博客 UI 组件
- [ ] 3.1 实现 BlogPostCard 组件
  - 在 `src/components/blog/blog-post-card.tsx` 实现文章卡片
  - 展示：标题、描述、发布日期、分类标签（可点击）、封面图（可选）
  - 使用 TailwindCSS 样式，遵循现有设计语言
  - _需求：2, 4_

- [ ] 3.2 实现 TableOfContents 组件
  - 在 `src/components/blog/table-of-contents.tsx` 实现目录导航
  - 从文章 HTML 中提取 h2/h3 标题列表，渲染为带锚点链接的列表
  - _需求：3_

- [ ] 3.3 实现 JsonLdScript 组件
  - 在 `src/components/blog/json-ld-script.tsx` 实现纯 Server Component
  - 渲染 `<script type="application/ld+json">` 标签，接受任意 JSON-LD 对象
  - _需求：6, 7_

- [ ] 3.4 实现 BlogFAQ 组件
  - 在 `src/components/blog/faq.tsx` 实现 FAQ 组件
  - `interactive` 模式（默认）：使用 `'use client'` + 现有 Accordion 组件
  - `static` 模式：Server Component，全部展开
  - 集成 `JsonLdScript` 注入 `FAQPage` JSON-LD
  - _需求：7_

- [ ] 3.5 实现 MDXComponents 映射
  - 在 `src/components/blog/mdx-components.tsx` 定义 MDX 组件映射
  - 注册 `FAQ` → `BlogFAQ`，以及 `h1`、`h2`、`a`、`img`、`pre` 等基础元素的自定义渲染
  - _需求：1, 7_

- [ ] 4. 实现博客路由页面
- [ ] 4.1 实现博客列表页
  - 创建 `src/app/[locale]/(site)/blog/page.tsx`
  - 使用 `getAllPosts` 获取文章列表，按分页展示 BlogPostCard
  - 使用 `generateMetadata` 生成 SEO 元数据，包含 RSS alternate link
  - 注入 `Blog` 类型 JSON-LD
  - _需求：2, 5, 9_

- [ ] 4.2 实现文章详情页
  - 创建 `src/app/[locale]/(site)/blog/[slug]/page.tsx`
  - 使用 `generateStaticParams` 预生成所有已发布文章路径
  - 使用 `next-mdx-remote/rsc` 编译 MDX 内容，传入 `MDXComponents`
  - 使用 `generateMetadata` 生成文章专属元数据（OG、twitter card）
  - 集成 `JsonLdScript` 注入 `ArticleJsonLd`
  - 访问不存在 slug 时调用 `notFound()`
  - _需求：3, 6_

- [ ] 4.3 实现分类筛选页
  - 创建 `src/app/[locale]/(site)/blog/category/[category]/page.tsx`
  - 使用 `getAllCategories` + `generateStaticParams` 预生成所有分类页
  - 使用 `getPostsByCategory` 获取文章列表
  - _需求：4, 9_

- [ ] 4.4 实现标签筛选页
  - 创建 `src/app/[locale]/(site)/blog/tag/[tag]/page.tsx`
  - 使用 `getAllTags` + `generateStaticParams` 预生成所有标签页
  - 使用 `getPostsByTag` 获取文章列表
  - _需求：4, 9_

- [ ] 5. 实现 RSS Feed
- [ ] 5.1 实现 RSS Route Handler
  - 创建 `src/app/[locale]/(site)/blog/feed.xml/route.ts`
  - 使用 `getAllPosts({ limit: 20 })` 获取最新 20 篇文章
  - 构建 RSS 2.0 XML 字符串，description 使用 CDATA 包裹
  - 设置响应头 `Content-Type: application/xml; charset=utf-8`
  - _需求：5_

- [ ] 6. 集成 Sitemap
- [ ] 6.1 扩展 sitemap.ts 纳入博客 URL
  - 在现有 `src/app/sitemap.ts`（或新建）中调用 `getAllPosts` 和 `getAllCategories`/`getAllTags`
  - 为每篇文章生成 URL 条目（changefreq: monthly，priority: 0.7）
  - 为分类/标签页面生成 URL 条目（priority: 0.5）
  - _需求：8_

- [ ] 7. 国际化集成
- [ ] 7.1 添加博客翻译键
  - 在 `src/messages/en.json`、`es.json`、`fr.json` 中添加 `blog` 命名空间
  - 覆盖所有 UI 文本：阅读更多、发布于、分类、标签、返回列表、无文章提示等
  - _需求：9_

- [ ] 7.2 在博客页面使用翻译
  - 在列表页、详情页、分类/标签页中使用 `getTranslations('blog')` 替换所有硬编码字符串
  - _需求：9_

- [ ] 8. 导航集成与收尾
- [ ] 8.1 在站点导航中添加博客入口
  - 在 `src/app/(site)/navbar.tsx` 的导航链接中添加博客链接（指向 `/blog`）
  - _需求：2_

- [ ] 8.2* 编写单元测试
  - 测试 `ContentReader` 的过滤、排序、slug 派生逻辑
  - 测试 `generateArticleJsonLd` 和 `generateFaqJsonLd` 的输出格式
  - _需求：1, 6, 7_

- [ ] 8.3* 编写集成测试
  - 测试列表页、详情页、RSS feed 的渲染结果
  - 验证 JSON-LD 在详情页 `<head>` 中正确注入
  - _需求：2, 3, 5, 6_
