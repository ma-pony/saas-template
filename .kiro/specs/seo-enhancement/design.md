# 技术设计文档

## 功能：SEO 全家桶（seo-enhancement）

## 概述

本设计在 ShipFree 现有 SEO 基础设施（`src/lib/seo.ts`）之上进行增强，采用"渐进式补强"策略：不破坏现有接口，仅填补缺口。核心原则：Server Component 优先、无新依赖、类型安全、国际化兼容。

---

## 架构设计

### 整体结构

```
src/
├── app/
│   ├── sitemap.ts                    # 新增：sitemap.xml 生成
│   ├── robots.ts                     # 新增：robots.txt 配置
│   ├── llms.txt/
│   │   └── route.ts                  # 新增：llms.txt Route Handler
│   ├── layout.tsx                    # 修改：注入 JSON-LD 组件
│   ├── page.tsx                      # 修改：添加 metadata 导出
│   ├── privacy/page.tsx              # 修改：添加 metadata 导出
│   ├── terms/page.tsx                # 修改：添加 metadata 导出
│   ├── (auth)/
│   │   ├── login/page.tsx            # 修改：添加 noindex metadata
│   │   ├── register/page.tsx         # 修改：添加 noindex metadata
│   │   ├── verify/page.tsx           # 修改：添加 noindex metadata
│   │   └── reset-password/page.tsx   # 修改：添加 noindex metadata
│   └── (main)/
│       └── dashboard/page.tsx        # 修改：添加 noindex metadata
├── components/
│   └── seo/
│       └── json-ld.tsx               # 新增：JSON-LD React 组件
├── lib/
│   └── seo.ts                        # 修改：增强现有函数 + 新增 Schema 类型
└── config/
    └── env.ts                        # 修改：添加 NEXT_PUBLIC_ALLOW_ROBOTS 变量
```

---

## 详细设计

### 1. JSON-LD 组件（`src/components/seo/json-ld.tsx`）

**设计决策**：将现有 `src/lib/seo.ts` 中的 Schema 生成函数封装为 React Server Component，通过 `dangerouslySetInnerHTML` 注入 `<script type="application/ld+json">` 标签。

```typescript
// src/components/seo/json-ld.tsx
// Server Component，无 'use client'

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[]
}

const JsonLd = ({ data }: JsonLdProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// 预置组件
const OrganizationJsonLd = () => <JsonLd data={getOrganizationSchema()} />
const WebsiteJsonLd = () => <JsonLd data={getWebsiteSchema()} />

type ArticleJsonLdProps = Parameters<typeof getArticleSchema>[0]
const ArticleJsonLd = (props: ArticleJsonLdProps) => <JsonLd data={getArticleSchema(props)} />

type BreadcrumbJsonLdProps = { items: Array<{ name: string; url: string }> }
const BreadcrumbJsonLd = ({ items }: BreadcrumbJsonLdProps) => <JsonLd data={getBreadcrumbSchema(items)} />

type FAQJsonLdProps = { questions: Array<{ question: string; answer: string }> }
const FAQJsonLd = ({ questions }: FAQJsonLdProps) => <JsonLd data={getFAQSchema(questions)} />

type SoftwareApplicationJsonLdProps = {
  name: string
  description: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: { price: string; priceCurrency: string }
}
const SoftwareApplicationJsonLd = (props: SoftwareApplicationJsonLdProps) => (
  <JsonLd data={getSoftwareApplicationSchema(props)} />
)

export {
  JsonLd,
  OrganizationJsonLd,
  WebsiteJsonLd,
  ArticleJsonLd,
  BreadcrumbJsonLd,
  FAQJsonLd,
  SoftwareApplicationJsonLd,
}
```

**新增 Schema 生成函数**（添加至 `src/lib/seo.ts`）：

```typescript
// FAQ Schema
export const getFAQSchema = (questions: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: questions.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
})

// SoftwareApplication Schema（适合 SaaS）
export const getSoftwareApplicationSchema = (options: {
  name: string
  description: string
  applicationCategory?: string
  operatingSystem?: string
  offers?: { price: string; priceCurrency: string }
}) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: options.name,
  description: options.description,
  applicationCategory: options.applicationCategory || 'BusinessApplication',
  operatingSystem: options.operatingSystem || 'Web',
  ...(options.offers && { offers: { '@type': 'Offer', ...options.offers } }),
  url: siteConfig.url,
})
```

### 2. sitemap.xml（`src/app/sitemap.ts`）

**设计决策**：使用 Next.js App Router 内置 `MetadataRoute.Sitemap`，静态路由硬编码 + 预留动态内容扩展接口。

```typescript
import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/utils'

// 可扩展的动态内容接口（博客、文档等接入点）
type DynamicRouteProvider = () => Promise<Array<{
  url: string
  lastModified?: Date
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency']
  priority?: number
}>>

// 静态公开路由配置
const staticRoutes = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/pricing', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
]

const locales = ['en', 'es', 'fr'] // 与 next-intl 配置保持一致

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  const staticEntries = staticRoutes.flatMap(({ path, priority, changeFrequency }) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    }))
  )

  return staticEntries
  // 未来扩展：return [...staticEntries, ...await dynamicProvider()]
}
```

**国际化处理**：为每个 locale 生成独立 URL（`/en/`、`/es/`、`/fr/`），与项目路由结构（`src/app/[locale]/`）一致。

### 3. robots.txt（`src/app/robots.ts`）

**设计决策**：使用 Next.js `MetadataRoute.Robots` 类型，通过 `NEXT_PUBLIC_ALLOW_ROBOTS` 环境变量控制生产/开发行为差异。

```typescript
import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/utils'
import { env } from '@/config/env'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  const allowRobots = env.NEXT_PUBLIC_ALLOW_ROBOTS !== 'false'

  if (!allowRobots) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/settings/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

**环境变量新增**（`src/config/env.ts`）：
```typescript
// client 对象中新增
NEXT_PUBLIC_ALLOW_ROBOTS: z.string().optional().default('true'),
```

### 4. llms.txt Route Handler（`src/app/llms.txt/route.ts`）

**设计决策**：使用 Next.js Route Handler 动态生成纯文本文件，遵循 [llmstxt.org](https://llmstxt.org) 规范。内容从 `siteConfig` 和 `brandConfig` 读取。

```typescript
import { NextResponse } from 'next/server'
import { siteConfig } from '@/lib/seo'
import { getBrandConfig } from '@/config/branding'

export const GET = () => {
  const brandConfig = getBrandConfig()

  const content = `# ${brandConfig.name}

> ${siteConfig.description}

${brandConfig.name} 是一个生产就绪的 Next.js SaaS 脚手架，帮助开发者在数天内而非数周内发布 SaaS 产品。

## 核心功能

- 认证系统：邮箱 + OAuth（Google/GitHub/Microsoft/Facebook）+ OTP 验证
- 支付集成：Stripe / Polar / LemonSqueezy 多提供商支持
- 邮件服务：Resend / Postmark / Nodemailer / Plunk 多提供商支持
- 国际化：英语、西班牙语、法语支持
- 数据库：PostgreSQL + Drizzle ORM

## 主要页面

- 首页：${siteConfig.url}
- 定价：${siteConfig.url}/pricing
- 隐私政策：${siteConfig.url}/privacy
- 服务条款：${siteConfig.url}/terms

## 许可

本项目为开源软件。
`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
```

### 5. Open Graph / metadata 模板增强

**国际化支持**（增强 `generateMetadata`）：

```typescript
// 新增 locale 参数
export type SEOOptions = {
  // ... 现有字段 ...
  locale?: string  // 新增，用于 hreflang
  alternateLocales?: string[]  // 新增，其他 locale 列表
}

// 在 generateMetadata 中生成 hreflang alternates
const getAlternateLanguages = (options: SEOOptions) => {
  if (!options.alternateLocales?.length) return undefined
  return Object.fromEntries(
    options.alternateLocales.map((locale) => [
      locale,
      `${siteConfig.url}/${locale}${options.canonical || ''}`,
    ])
  )
}
```

**各类型页面 metadata 模板**（通过 JSDoc 文档化，不单独创建文件）：

```typescript
// 营销页面模板（复制到 src/app/page.tsx 类页面）
export const metadata: Metadata = generateMetadata({
  title: '页面标题',
  description: '页面描述（50-160字符）',
  canonical: '/path',
})

// 认证页面模板（复制到 auth 路由组页面）
export const metadata: Metadata = generateMetadata({
  title: '登录',
  description: '登录您的账户',
  noindex: true,
  nofollow: true,
})

// 仪表板页面模板（复制到 main 路由组页面）
export const metadata: Metadata = generateMetadata({
  title: '仪表板',
  noindex: true,
  nofollow: true,
})

// 博客文章模板（复制到博客页面）
export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  return generateMetadata({
    title: post.title,
    description: post.excerpt,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [post.author],
    canonical: `/blog/${post.slug}`,
    image: post.coverImage,
  })
}
```

### 6. 根布局 JSON-LD 注入

**修改 `src/app/layout.tsx`**：

```typescript
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/json-ld'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
      </head>
      <body ...>
        {/* 现有内容 */}
      </body>
    </html>
  )
}
```

### 7. `siteConfig` 关键词修正

**修改 `src/lib/seo.ts`** 中 `siteConfig.keywords`，移除不准确的关键词（Supabase、Mailgun），替换为准确描述：

```typescript
keywords: [
  'ShipFree',
  'ShipFast alternative',
  'Next.js SaaS boilerplate',
  'Open source SaaS template',
  'SaaS starter kit',
  'Next.js template',
  'Drizzle ORM',
  'Better Auth',
  'TypeScript boilerplate',
  'React SaaS',
  'Stripe integration',
  'Polar payments',
  'Resend email',
],
```

---

## 数据流图

```
页面请求
    │
    ├─► layout.tsx
    │       ├─► generateMetadata()     → <head> metadata 标签
    │       ├─► OrganizationJsonLd     → <script type="application/ld+json">
    │       └─► WebsiteJsonLd          → <script type="application/ld+json">
    │
    ├─► page.tsx (各页面)
    │       └─► generateMetadata()     → 页面级 metadata（覆盖根布局模板）
    │
    ├─► /sitemap.xml
    │       └─► sitemap()              → XML 格式站点地图
    │
    ├─► /robots.txt
    │       └─► robots()               → 爬虫指令文本
    │
    └─► /llms.txt
            └─► GET handler            → AI 引擎友好文本
```

---

## 关键技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| JSON-LD 注入方式 | `dangerouslySetInnerHTML` | Next.js 官方推荐模式，安全且高效 |
| sitemap 实现 | Next.js 内置 `MetadataRoute.Sitemap` | 零依赖，类型安全，自动注册路由 |
| robots.txt 实现 | Next.js 内置 `MetadataRoute.Robots` | 同上 |
| llms.txt 实现 | Route Handler（`GET`） | 需要动态内容，Route Handler 最灵活 |
| 国际化 URL 策略 | 每 locale 独立 URL | 与项目 `[locale]` 路由结构一致 |
| 环境变量验证 | 复用 `src/config/env.ts` | 遵守项目规范，集中管理 |

---

## 不在本次范围内

- 动态 OG 图片生成（`opengraph-image.tsx`）：依赖具体页面设计，留待 UI 框架迁移后处理
- 博客系统 sitemap 集成：依赖 MDX 博客系统（另立 spec）
- 中文（zh）locale 支持：依赖语言扩展任务（另立 spec）
- Lighthouse 自动化 CI 检测：依赖 CI/CD 配置任务
