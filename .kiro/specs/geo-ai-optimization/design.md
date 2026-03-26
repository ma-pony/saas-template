# 设计文档

## 功能名称
GEO AI 生成引擎优化

## 概述

本设计基于现有 ShipFree 架构，在不破坏现有功能的前提下，通过最小侵入原则为项目添加全面的 AI 生成引擎优化（GEO）能力。设计核心原则：

1. **服务端优先**：所有结构化数据和语义标记均通过 Server Components 注入，零客户端 JS 开销
2. **配置驱动**：品牌数据、关键词、描述统一从 `src/config/branding.ts` 读取
3. **渐进增强**：新增功能作为独立模块，不修改现有组件的核心逻辑
4. **可复用性**：GEO 组件设计为通用模板组件，可被未来的博客、产品页面直接复用

## 架构概览

```
src/
├── app/
│   ├── robots.ts                    # 动态 robots.txt（修改现有）
│   ├── llms.txt/
│   │   └── route.ts                 # llms.txt 路由处理器（新建）
│   ├── llms-full.txt/
│   │   └── route.ts                 # llms-full.txt 路由处理器（新建）
│   └── (site)/
│       ├── page.tsx                 # 落地页（注入 GEO Schema）
│       ├── faq.tsx                  # FAQ 组件（添加 Schema.org）
│       ├── hero.tsx                 # Hero 组件（语义 HTML 增强）
│       ├── footer.tsx               # Footer（添加 <footer> 语义）
│       └── navbar.tsx               # Navbar（添加 aria-label）
├── components/
│   └── geo/
│       ├── faq-schema.tsx           # FAQ JSON-LD 注入组件（新建）
│       ├── direct-answer.tsx        # 直接回答型组件（新建）
│       └── comparison-table.tsx     # 比较表格组件（新建）
├── lib/
│   ├── seo.ts                       # 扩展 Schema 函数（修改现有）
│   └── geo.ts                       # GEO 专用工具函数（新建）
└── config/
    └── branding.ts                  # 扩展品牌配置（修改现有）
```

## 详细设计

### 1. 品牌配置扩展（`src/config/branding.ts`）

在现有 `BrandConfig` 接口基础上新增 GEO 相关字段：

```typescript
export interface GeoConfig {
  aiDescription: string        // AI 引擎优化专用描述（简洁直接，≤160字符）
  primaryKeywords: string[]    // 核心关键词（3-5个，用于 llms.txt）
  socialLinks?: {
    github?: string
    twitter?: string
    discord?: string
    website?: string
  }
  softwareCategory?: string    // Schema.org applicationCategory
  pricingType?: 'Free' | 'Paid' | 'FreemiumModel' | 'Subscription'
  operatingSystem?: string     // 默认 'Web'
}

export interface BrandConfig {
  // 现有字段保持不变 ...
  geo?: GeoConfig              // 新增 GEO 配置（可选，提供默认值）
}
```

**默认值策略**：`geo` 字段提供合理默认值，不强制要求修改配置。`getBrandConfig()` 在返回前合并默认 GEO 配置。

### 2. SEO 库扩展（`src/lib/seo.ts`）

在现有文件末尾追加以下新函数（不修改现有函数）：

#### 2.1 `getFAQPageSchema()`

```typescript
export const getFAQPageSchema = (
  faqs: Array<{ question: string; answer: string }>
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
```

#### 2.2 `getSoftwareApplicationSchema()`

```typescript
export const getSoftwareApplicationSchema = () => {
  const brand = getBrandConfig()
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: brand.name,
    description: brand.geo?.aiDescription || siteConfig.description,
    url: siteConfig.url,
    applicationCategory: brand.geo?.softwareCategory || 'DeveloperApplication',
    operatingSystem: brand.geo?.operatingSystem || 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free forever, open source',
    },
  }
}
```

#### 2.3 `getProductSchema()`

用于产品/定价页面的 Schema：

```typescript
export const getProductSchema = (options?: {
  price?: string
  currency?: string
  availability?: string
}) => {
  const brand = getBrandConfig()
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: brand.name,
    description: brand.geo?.aiDescription || siteConfig.description,
    offers: {
      '@type': 'Offer',
      price: options?.price || '0',
      priceCurrency: options?.currency || 'USD',
      availability: options?.availability || 'https://schema.org/InStock',
    },
  }
}
```

### 3. GEO 工具库（`src/lib/geo.ts`）

新建独立文件，处理 llms.txt 内容生成逻辑：

```typescript
import { getBrandConfig } from '@/config/branding'
import { getBaseUrl } from '@/lib/utils'

export interface LlmsPage {
  title: string
  url: string
  description?: string
}

export const generateLlmsTxt = (pages: LlmsPage[]): string => {
  const brand = getBrandConfig()
  const baseUrl = getBaseUrl()
  const lines: string[] = []

  // 标准 llms.txt 格式
  lines.push(`# ${brand.name}`)
  lines.push('')
  lines.push(`> ${brand.geo?.aiDescription || brand.name + ' - SaaS boilerplate'}`)
  lines.push('')

  if (brand.geo?.primaryKeywords?.length) {
    lines.push(`Keywords: ${brand.geo.primaryKeywords.join(', ')}`)
    lines.push('')
  }

  lines.push('## Pages')
  lines.push('')
  for (const page of pages) {
    lines.push(`- [${page.title}](${baseUrl}${page.url})`)
  }

  return lines.join('\n')
}

export const generateLlmsFullTxt = (pages: LlmsPage[]): string => {
  const brand = getBrandConfig()
  const baseUrl = getBaseUrl()
  const lines: string[] = []

  lines.push(`# ${brand.name}`)
  lines.push('')
  lines.push(`> ${brand.geo?.aiDescription || brand.name + ' - SaaS boilerplate'}`)
  lines.push('')

  lines.push('## Pages')
  lines.push('')

  for (const page of pages) {
    lines.push(`### [${page.title}](${baseUrl}${page.url})`)
    if (page.description) {
      lines.push('')
      lines.push(page.description)
    }
    lines.push('')
  }

  return lines.join('\n')
}
```

### 4. llms.txt 路由处理器

#### 4.1 `/llms.txt`（`src/app/llms.txt/route.ts`）

```typescript
import { NextResponse } from 'next/server'
import { generateLlmsTxt, type LlmsPage } from '@/lib/geo'

const PAGES: LlmsPage[] = [
  { title: 'Home', url: '/' },
  { title: 'Pricing', url: '/#pricing' },
  { title: 'Documentation', url: '/docs' },
  { title: 'Terms of Service', url: '/terms' },
  { title: 'Privacy Policy', url: '/privacy' },
]

export const GET = () => {
  const content = generateLlmsTxt(PAGES)
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  })
}
```

#### 4.2 `/llms-full.txt`（`src/app/llms-full.txt/route.ts`）

结构相同，使用 `generateLlmsFullTxt()` 并包含每页详细描述。

### 5. 动态 robots.txt（`src/app/robots.ts`）

创建/替换为 Next.js MetadataRoute.Robots 格式：

```typescript
import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl()
  return {
    rules: [
      // 标准搜索引擎
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/settings', '/api/'],
      },
      // AI 爬虫显式允许
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended',
                    'Amazonbot', 'anthropic-ai', 'cohere-ai'],
        allow: '/',
        disallow: ['/dashboard', '/settings', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

### 6. GEO 组件

#### 6.1 FaqSchema 组件（`src/components/geo/faq-schema.tsx`）

服务端组件，接受 FAQ 数组并注入 JSON-LD：

```typescript
import { getFAQPageSchema } from '@/lib/seo'

interface FaqSchemaProps {
  faqs: Array<{ question: string; answer: string }>
}

const FaqSchema = ({ faqs }: FaqSchemaProps) => {
  const schema = getFAQPageSchema(faqs)
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default FaqSchema
```

**注意**：此组件为服务端组件，无需 `'use client'`。

#### 6.2 DirectAnswer 组件（`src/components/geo/direct-answer.tsx`）

语义 HTML 的"直接回答"组件，带 Schema.org 微数据：

```typescript
interface DirectAnswerProps {
  question: string
  answer: string
  headingLevel?: 'h2' | 'h3'
  className?: string
}

const DirectAnswer = ({
  question,
  answer,
  headingLevel: Heading = 'h3',
  className,
}: DirectAnswerProps) => {
  return (
    <div
      itemScope
      itemType="https://schema.org/Question"
      className={cn('space-y-2', className)}
    >
      <Heading className="font-semibold" itemProp="name">
        {question}
      </Heading>
      <div
        itemScope
        itemType="https://schema.org/Answer"
        itemProp="acceptedAnswer"
      >
        <div itemProp="text" className="text-muted-foreground">
          {answer}
        </div>
      </div>
    </div>
  )
}
```

#### 6.3 ComparisonTable 组件（`src/components/geo/comparison-table.tsx`）

语义化比较表格，带 Schema.org Table 标注：

```typescript
interface ComparisonTableProps {
  headers: string[]
  rows: string[][]
  caption?: string
  ariaLabel?: string
  withSchema?: boolean
  className?: string
}

const ComparisonTable = ({
  headers,
  rows,
  caption,
  ariaLabel,
  withSchema = true,
  className,
}: ComparisonTableProps) => {
  return (
    <div
      className={cn('overflow-x-auto', className)}
      {...(withSchema && {
        itemScope: true,
        itemType: 'https://schema.org/Table',
      })}
    >
      <table
        role="table"
        aria-label={ariaLabel || caption || 'Comparison table'}
        className="w-full border-collapse"
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col" className="...">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                cellIndex === 0
                  ? <th key={cellIndex} scope="row">{cell}</th>
                  : <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 7. FAQ 组件增强（`src/app/(site)/faq.tsx`）

现有 FAQ 组件是 `'use client'` 组件（因为 Accordion 需要交互）。GEO 增强策略：

- **方案**：将 FAQ 改为混合架构——在父级页面（Server Component）注入 `FaqSchema`，FAQ 组件本身保持 `'use client'` 不变
- **实现**：在落地页的 `page.tsx` 或 `grid-layout.tsx` 中：
  ```tsx
  import FaqSchema from '@/components/geo/faq-schema'
  import { getFaqItems } from '@/lib/geo'  // 从翻译系统读取

  // Server Component 层
  <FaqSchema faqs={faqItems} />
  <FAQ />  // 客户端 Accordion 组件
  ```

### 8. 落地页 Schema 注入（`src/app/(site)/page.tsx` 或 Layout）

在落地页添加 `SoftwareApplication` 和 `WebSite` Schema：

```tsx
// 服务端组件
import { getSoftwareApplicationSchema, getWebsiteSchema } from '@/lib/seo'

export default function SitePage() {
  const softwareSchema = getSoftwareApplicationSchema()
  const websiteSchema = getWebsiteSchema()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* 现有页面内容 */}
    </>
  )
}
```

### 9. 语义 HTML 增强策略

对现有落地页组件进行最小侵入修改：

| 组件 | 当前问题 | 修改方案 |
|------|----------|----------|
| `navbar.tsx` | `<nav>` 无 `aria-label` | 添加 `aria-label="主导航"` |
| `hero.tsx` | `<main>` 已有但 `<h2>` 用于子标题 | 调整"BUILT WITH THE BEST TOOLS"为正确层级 |
| `footer.tsx` | 已有 `<footer>` | 添加 `aria-label="站点页脚"` |
| `features.tsx` | `<section>` 需验证 | 确保有 `aria-labelledby` 指向 `<h2>` |
| `faq.tsx` | `<section>` 需要 `aria-labelledby` | 添加 `id` 和 `aria-labelledby` |

**修改原则**：只添加属性，不改变 HTML 结构，确保样式不受影响。

### 10. i18n 翻译键规范

新增翻译键命名空间 `geo`，FAQ 内容迁移到翻译文件：

```json
// src/messages/en.json 新增
{
  "geo": {
    "faq": {
      "title": "Frequently Asked Questions",
      "subtitle": "Have another question?",
      "contactLinkText": "Contact us by email",
      "items": [
        {
          "question": "What's included in the free version?",
          "answer": "Everything you need to build..."
        }
        // ...
      ]
    }
  }
}
```

## 数据流

```
用户请求 /llms.txt
  → Next.js Route Handler
  → generateLlmsTxt(PAGES)
  → getBrandConfig() → defaultConfig + GEO 字段
  → 返回 text/plain 响应

AI 引擎抓取落地页
  → Next.js Server Component 渲染
  → getSoftwareApplicationSchema() → JSON-LD <script>
  → getFAQPageSchema(faqs) → JSON-LD <script>
  → 语义 HTML 结构 → AI 引擎理解页面层级
```

## 文件变更清单

### 新建文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `src/app/llms.txt/route.ts` | Route Handler | llms.txt 端点 |
| `src/app/llms-full.txt/route.ts` | Route Handler | llms-full.txt 端点 |
| `src/app/robots.ts` | Metadata Route | 动态 robots.txt |
| `src/components/geo/faq-schema.tsx` | Server Component | FAQ JSON-LD 注入 |
| `src/components/geo/direct-answer.tsx` | Server Component | 直接回答组件 |
| `src/components/geo/comparison-table.tsx` | Server Component | 比较表格组件 |
| `src/lib/geo.ts` | 工具库 | GEO 工具函数 |

### 修改文件

| 文件 | 修改内容 |
|------|----------|
| `src/config/branding.ts` | 新增 `GeoConfig` 接口和 `geo` 字段 |
| `src/lib/seo.ts` | 新增 `getFAQPageSchema`、`getSoftwareApplicationSchema`、`getProductSchema` 函数 |
| `src/app/(site)/faq.tsx` | 添加 `aria-labelledby`，FAQ 数据迁移到 i18n |
| `src/app/(site)/hero.tsx` | 语义 HTML 微调（无 `aria-label`） |
| `src/app/(site)/footer.tsx` | 添加 `aria-label="站点页脚"` |
| `src/app/(site)/navbar.tsx` | 添加 `aria-label="主导航"` |
| `src/app/(site)/page.tsx` 或 layout | 注入 `SoftwareApplication` + `WebSite` JSON-LD |
| `src/messages/en.json` | 新增 `geo.faq` 翻译键 |
| `src/messages/es.json` | 新增 `geo.faq` 翻译键（西班牙语） |
| `src/messages/fr.json` | 新增 `geo.faq` 翻译键（法语） |

## 关键技术决策

1. **llms.txt 使用 Route Handler 而非静态文件**：内容需要从品牌配置动态生成，且支持未来扩展为按语言生成不同版本
2. **FAQ Schema 分离为独立 Server Component**：FAQ 的 Accordion 交互需要 `'use client'`，而 JSON-LD 注入必须在服务端，采用混合架构解决
3. **不创建 `/geo` 路由目录**：GEO 组件放 `src/components/geo/` 而非路由，遵循项目"组件在 components，路由在 app"的架构哲学
4. **`robots.ts` 使用 Next.js MetadataRoute API**：比静态文件更灵活，可读取环境变量动态配置 disallow 规则
5. **品牌配置 `geo` 字段为可选**：模板使用者可以不配置 GEO 字段，系统提供合理默认值，保持零配置启动能力
