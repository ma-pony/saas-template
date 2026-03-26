# 实现任务

## 任务列表

### 任务 1：扩展品牌配置以支持 GEO 字段

**文件**：`src/config/branding.ts`

**描述**：在现有 `BrandConfig` 接口基础上新增 `GeoConfig` 接口，并在默认配置中提供合理默认值。

**实现步骤**：
1. 在文件顶部新增 `GeoConfig` 接口定义，包含字段：`aiDescription: string`、`primaryKeywords: string[]`、`socialLinks?: { github?: string; twitter?: string; discord?: string; website?: string }`、`softwareCategory?: string`、`pricingType?: string`、`operatingSystem?: string`
2. 在 `BrandConfig` 接口中新增可选字段 `geo?: GeoConfig`
3. 在 `defaultConfig` 中添加默认 `geo` 配置，填充 ShipFree 相关的 AI 描述、关键词和社交链接
4. 更新 `getBrandConfig()` 函数，确保返回值包含 `geo` 字段（合并默认值）

**验收标准**：
- [ ] `GeoConfig` 接口正确定义所有字段，TypeScript 编译无报错
- [ ] `BrandConfig` 包含可选 `geo` 字段
- [ ] `getBrandConfig()` 返回包含完整 `geo` 配置的对象
- [ ] 默认 `aiDescription` 简洁描述 ShipFree 的核心价值（≤160字符）
- [ ] 默认 `primaryKeywords` 包含 3-5 个核心关键词

**依赖**：无

---

### 任务 2：扩展 SEO 库，添加 GEO Schema 函数

**文件**：`src/lib/seo.ts`

**描述**：在现有 `seo.ts` 文件末尾追加三个新的 Schema.org 生成函数，不修改现有函数。

**实现步骤**：
1. 追加 `getFAQPageSchema(faqs: Array<{question: string, answer: string}>)` 函数，生成符合 Schema.org `FAQPage` 规范的 JSON-LD 对象
2. 追加 `getSoftwareApplicationSchema()` 函数，从 `getBrandConfig()` 读取品牌信息，生成 `SoftwareApplication` 类型的 JSON-LD 对象，包含 `name`、`description`、`applicationCategory`、`operatingSystem`、`offers`（价格信息）
3. 追加 `getProductSchema(options?: {price?: string, currency?: string, availability?: string})` 函数，生成 `Product` 类型的 JSON-LD 对象
4. 确保所有新函数从 `getBrandConfig()` 读取品牌数据

**验收标准**：
- [ ] `getFAQPageSchema()` 返回包含 `@context: https://schema.org`、`@type: FAQPage` 的对象
- [ ] `getSoftwareApplicationSchema()` 正确读取品牌配置并填充 Schema 字段
- [ ] `getProductSchema()` 支持可选定价参数
- [ ] 所有函数为纯函数，输入相同则输出相同
- [ ] TypeScript 类型正确，无 `any` 类型

**依赖**：任务 1

---

### 任务 3：创建 GEO 工具库

**文件**：`src/lib/geo.ts`（新建）

**描述**：新建 GEO 专用工具库，包含 `llms.txt` 和 `llms-full.txt` 内容生成函数。

**实现步骤**：
1. 定义 `LlmsPage` 接口：`{ title: string; url: string; description?: string }`
2. 实现 `generateLlmsTxt(pages: LlmsPage[]): string` 函数，生成符合 llms.txt 规范的纯文本格式
   - 第一行：`# {品牌名}`
   - 第三行：`> {aiDescription}`
   - `Keywords:` 行（如果配置了 `primaryKeywords`）
   - `## Pages` 章节，每页一行 Markdown 链接格式
3. 实现 `generateLlmsFullTxt(pages: LlmsPage[]): string` 函数，生成包含每页详细描述的完整版本
4. 导出 `DEFAULT_PAGES` 常量，包含 ShipFree 的核心页面列表（首页、定价、文档、条款、隐私）

**验收标准**：
- [ ] `generateLlmsTxt()` 输出符合 llms.txt 规范格式
- [ ] `generateLlmsFullTxt()` 输出包含详细页面描述
- [ ] 两个函数均从 `getBrandConfig()` 读取品牌配置
- [ ] URL 使用 `getBaseUrl()` 生成绝对路径
- [ ] 函数为纯函数，无副作用

**依赖**：任务 1

---

### 任务 4：创建 llms.txt 路由处理器

**文件**：`src/app/llms.txt/route.ts`（新建目录和文件）

**描述**：创建 Next.js Route Handler，响应 `/llms.txt` 请求并返回符合规范的纯文本内容。

**实现步骤**：
1. 创建目录 `src/app/llms.txt/`
2. 创建 `route.ts`，导出 `GET` 函数
3. 在函数内定义页面列表（包含首页、定价、文档、条款、隐私页面）
4. 调用 `generateLlmsTxt(pages)` 生成内容
5. 返回 `NextResponse`，设置响应头：
   - `Content-Type: text/plain; charset=utf-8`
   - `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`

**验收标准**：
- [ ] `GET /llms.txt` 返回 200 状态码和纯文本内容
- [ ] 响应头包含正确的 `Content-Type`
- [ ] 内容包含品牌名称、描述和页面链接列表
- [ ] 响应包含合理的缓存头

**依赖**：任务 3

---

### 任务 5：创建 llms-full.txt 路由处理器

**文件**：`src/app/llms-full.txt/route.ts`（新建目录和文件）

**描述**：创建 Next.js Route Handler，响应 `/llms-full.txt` 请求并返回包含详细描述的完整版本。

**实现步骤**：
1. 创建目录 `src/app/llms-full.txt/`
2. 创建 `route.ts`，导出 `GET` 函数
3. 在函数内定义页面列表，每个页面包含 `description` 字段（简明描述该页面的核心内容）
4. 调用 `generateLlmsFullTxt(pages)` 生成内容
5. 返回 `NextResponse`，设置与 `llms.txt` 相同的响应头

**验收标准**：
- [ ] `GET /llms-full.txt` 返回 200 状态码和纯文本内容
- [ ] 内容比 `llms.txt` 更详细，包含每页描述
- [ ] 格式符合 llms-full.txt 规范（`### [标题](URL)` + 描述段落）

**依赖**：任务 3

---

### 任务 6：创建动态 robots.txt

**文件**：`src/app/robots.ts`（新建）

**描述**：使用 Next.js `MetadataRoute.Robots` 类型创建动态 robots.txt，显式允许 AI 爬虫访问。

**实现步骤**：
1. 创建 `src/app/robots.ts`，导出 `default` 函数，返回类型为 `MetadataRoute.Robots`
2. 配置通用规则（`userAgent: '*'`）：允许 `/`，禁止 `/dashboard`、`/settings`、`/api/`
3. 配置 AI 爬虫专用规则（`userAgent` 数组包含：`GPTBot`、`ClaudeBot`、`PerplexityBot`、`Google-Extended`、`Amazonbot`、`anthropic-ai`、`cohere-ai`）：允许 `/`，禁止私有路由
4. 设置 `sitemap` 字段为 `${getBaseUrl()}/sitemap.xml`

**验收标准**：
- [ ] `GET /robots.txt` 返回正确格式的 robots.txt 内容
- [ ] 所有列出的 AI 爬虫均被显式允许
- [ ] 私有路由（`/dashboard`、`/api/` 等）对所有机器人禁止访问
- [ ] 包含 sitemap URL

**依赖**：无

---

### 任务 7：创建 FaqSchema 服务端组件

**文件**：`src/components/geo/faq-schema.tsx`（新建目录和文件）

**描述**：创建服务端组件，接受 FAQ 数组并将其序列化为 `<script type="application/ld+json">` 标签注入页面。

**实现步骤**：
1. 创建目录 `src/components/geo/`
2. 创建 `faq-schema.tsx`（不添加 `'use client'`，默认为 Server Component）
3. 定义 `FaqSchemaProps` 接口：`{ faqs: Array<{ question: string; answer: string }> }`
4. 组件内调用 `getFAQPageSchema(faqs)` 获取 Schema 对象
5. 使用 `dangerouslySetInnerHTML` 将 JSON.stringify 后的 Schema 注入 `<script>` 标签
6. 导出为默认导出

**验收标准**：
- [ ] 组件为 Server Component（无 `'use client'`）
- [ ] 渲染的 `<script>` 标签包含有效的 JSON-LD
- [ ] JSON-LD 符合 `FAQPage` Schema.org 规范
- [ ] 组件接受任意数量的 FAQ 项

**依赖**：任务 2

---

### 任务 8：创建 DirectAnswer 组件

**文件**：`src/components/geo/direct-answer.tsx`（新建）

**描述**：创建语义化"直接回答"组件，使用 Schema.org 微数据标注问答内容。

**实现步骤**：
1. 创建 `direct-answer.tsx`（Server Component，无 `'use client'`）
2. 定义 `DirectAnswerProps` 接口：`{ question: string; answer: string; headingLevel?: 'h2' | 'h3'; className?: string }`
3. 外层容器：`<div itemScope itemType="https://schema.org/Question">`
4. 问题部分：使用动态 `headingLevel`（默认 `h3`），添加 `itemProp="name"`
5. 回答部分：`<div itemScope itemType="https://schema.org/Answer" itemProp="acceptedAnswer">` 包裹 `<div itemProp="text">`
6. 使用 `cn()` from `@/lib/utils/css` 处理 className

**验收标准**：
- [ ] 组件渲染正确的语义 HTML 结构
- [ ] `itemScope`、`itemType`、`itemProp` 属性正确
- [ ] 支持 `h2` 和 `h3` 标题级别
- [ ] `className` prop 正确传递到外层容器

**依赖**：无

---

### 任务 9：创建 ComparisonTable 组件

**文件**：`src/components/geo/comparison-table.tsx`（新建）

**描述**：创建语义化比较表格组件，使用正确的 HTML 表格结构和 Schema.org Table 标注。

**实现步骤**：
1. 创建 `comparison-table.tsx`（Server Component，无 `'use client'`）
2. 定义 `ComparisonTableProps` 接口：`{ headers: string[]; rows: string[][]; caption?: string; ariaLabel?: string; withSchema?: boolean; className?: string }`
3. 外层 `<div>` 带有 `overflow-x-auto`，当 `withSchema=true` 时添加 `itemScope itemType="https://schema.org/Table"`
4. `<table>` 元素添加 `role="table"` 和 `aria-label`
5. 如有 `caption`，渲染 `<caption className="sr-only">`
6. `<thead>` 中每个 `<th>` 添加 `scope="col"`
7. `<tbody>` 中每行的第一列使用 `<th scope="row">`，其余列使用 `<td>`
8. 使用 TailwindCSS 添加基础样式（边框、间距）

**验收标准**：
- [ ] 渲染符合语义化标准的 `<table>` 结构
- [ ] 所有 `<th>` 正确设置 `scope` 属性
- [ ] `withSchema=true` 时添加 Schema.org Table 微数据
- [ ] 组件在无 `caption` 时也能正常工作
- [ ] 样式与现有 UI 风格一致（使用 TailwindCSS）

**依赖**：无

---

### 任务 10：增强 FAQ 组件，集成 Schema.org 数据

**文件**：`src/app/(site)/faq.tsx`（修改现有）

**描述**：保持现有 Accordion 交互逻辑，同时将 FAQ 数据结构化，为 `FaqSchema` 组件提供数据接口。FAQ 组件本身保持 `'use client'`，Schema 注入由父级 Server Component 处理。

**实现步骤**：
1. 将 FAQ 数据从组件内的 `faqs` 数组提取为导出常量 `export const FAQ_ITEMS`，格式为 `Array<{question: string, answer: string}>`，移动到文件顶部（在 `'use client'` 指令下方）
2. 在 `<section>` 标签上添加 `aria-labelledby="faq-heading"`
3. 在标题 `<h2 id="faq-heading">` 上添加 `id` 属性

**重要**：FAQ 数据暂保持英文硬编码（i18n 集成是独立的可选改进），本任务专注于 Schema 集成的最小变更。

**验收标准**：
- [ ] `FAQ_ITEMS` 常量被正确导出
- [ ] 现有 Accordion 交互功能正常
- [ ] `<section>` 有 `aria-labelledby` 属性
- [ ] `<h2>` 有对应的 `id` 属性
- [ ] 样式无变化

**依赖**：无

---

### 任务 11：在落地页注入 Schema.org 结构化数据

**文件**：`src/app/(site)/page.tsx` 或相关 Server Component 布局

**描述**：在落地页的 Server Component 层注入 `SoftwareApplication` Schema、`WebSite` Schema 和 FAQ Schema。

**实现步骤**：
1. 确定落地页的 Server Component 入口（检查 `src/app/(site)/` 目录下的 page.tsx 或 grid-layout.tsx）
2. 导入 `getSoftwareApplicationSchema`、`getWebsiteSchema` from `@/lib/seo`
3. 导入 `FaqSchema` from `@/components/geo/faq-schema`
4. 导入 `FAQ_ITEMS` from `./faq`（或相应路径）
5. 在组件 return 的根节点内，在现有内容之前（或 `<head>` 等效位置）渲染：
   - `<script type="application/ld+json">` 注入 `SoftwareApplication` Schema
   - `<script type="application/ld+json">` 注入 `WebSite` Schema
   - `<FaqSchema faqs={FAQ_ITEMS} />`

**验收标准**：
- [ ] 落地页 HTML 源码包含 `SoftwareApplication` JSON-LD
- [ ] 落地页 HTML 源码包含 `WebSite` JSON-LD
- [ ] 落地页 HTML 源码包含 `FAQPage` JSON-LD
- [ ] 所有 Schema 注入为服务端渲染，不增加客户端 JS
- [ ] 页面现有功能和样式不受影响

**依赖**：任务 2、任务 7、任务 10

---

### 任务 12：语义 HTML 微调（落地页组件）

**文件**：`src/app/(site)/navbar.tsx`、`src/app/(site)/footer.tsx`

**描述**：对落地页核心组件进行最小侵入的语义 HTML 增强，仅添加 ARIA 属性，不改变结构和样式。

**实现步骤**：

**navbar.tsx**：
1. 在 `<nav>` 标签上添加 `aria-label="主导航"`（英文项目中用 `"Main navigation"`）

**footer.tsx**：
1. 在 `<footer>` 标签上添加 `aria-label="站点页脚"`（英文项目中用 `"Site footer"`）

**验收标准**：
- [ ] `<nav>` 标签有 `aria-label` 属性
- [ ] `<footer>` 标签有 `aria-label` 属性
- [ ] 视觉样式无任何变化
- [ ] 组件的现有功能（菜单展开、链接等）正常

**依赖**：无

---

### 任务 13：添加 i18n 翻译键（多语言支持）

**文件**：`src/messages/en.json`、`src/messages/es.json`、`src/messages/fr.json`

**描述**：为新增的用户可见文本添加多语言翻译键。FAQ 内容迁移到翻译系统（可选，作为增强步骤）。

**实现步骤**：
1. 在 `en.json` 中新增 `"geo"` 命名空间，包含基础文本键（如 FAQ 区块的标题、联系链接文本等）
2. 在 `es.json` 中添加对应的西班牙语翻译
3. 在 `fr.json` 中添加对应的法语翻译

**最小翻译键集合**（首要任务）：
```json
{
  "geo": {
    "faqSection": {
      "title": "Frequently Asked Questions",
      "subtitle": "Have another question?",
      "contactLinkText": "Contact us by email"
    }
  }
}
```

**验收标准**：
- [ ] 所有三个语言文件均包含 `geo` 命名空间
- [ ] 翻译键命名遵循现有约定（camelCase 嵌套）
- [ ] 西班牙语和法语翻译准确（可使用机器翻译初稿，人工审核改善）
- [ ] 不破坏现有翻译键

**依赖**：无（可与其他任务并行）

---

## 实现顺序建议

```
第一阶段（基础设施）：
  任务 1 → 任务 2 → 任务 3

第二阶段（路由）：
  任务 4、5、6（可并行）

第三阶段（组件）：
  任务 7、8、9（可并行，依赖任务 2）
  任务 10（独立）
  任务 12（独立）

第四阶段（集成）：
  任务 11（依赖任务 2、7、10）

第五阶段（i18n）：
  任务 13（可并行，最低优先级）
```

## 测试检查清单

实现完成后，按以下清单验证：

- [ ] 访问 `/llms.txt`，响应为纯文本，包含品牌名和页面列表
- [ ] 访问 `/llms-full.txt`，响应包含详细页面描述
- [ ] 访问 `/robots.txt`，包含 `GPTBot`、`ClaudeBot` 等的 Allow 规则
- [ ] 访问落地页，检查页面源码中是否包含 3 个 `<script type="application/ld+json">` 标签
- [ ] 将落地页 URL 提交至 [Google Rich Results Test](https://search.google.com/test/rich-results)，验证 FAQ Schema 通过
- [ ] 将落地页 URL 提交至 Schema.org Validator，验证 `SoftwareApplication` Schema 无错误
- [ ] 检查 `<nav>` 是否有 `aria-label`，`<footer>` 是否有 `aria-label`
- [ ] 运行 `bun run typecheck` 无 TypeScript 错误
- [ ] 运行 `bun lint` 无 Biome 告警
