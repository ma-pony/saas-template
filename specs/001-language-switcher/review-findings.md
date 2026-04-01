# Deep Review Findings

**Date:** 2026-04-01
**Branch:** 001-language-switcher
**Rounds:** 1
**Gate Outcome:** PASS
**Invocation:** superpowers

## Summary

| Severity | Found | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 2 | 2 | 0 |
| Important | 4 | 4 | 0 |
| Minor | 8 | - | 8 |
| **Total** | **14** | **6** | **8** |

**Agents completed:** 5/5 (+ 0 external tools)
**Agents failed:** none

## Findings

### FINDING-1
- **Severity:** Critical
- **Confidence:** 95
- **File:** `src/app/[locale]/blog/feed.xml/route.ts:13,36,40`
- **Category:** correctness + production-readiness
- **Source:** correctness-agent (also reported by: production-agent, architecture-agent)
- **Round found:** 1
- **Resolution:** fixed (round 1)

**What is wrong:**
RSS feed 路由位于 `[locale]/blog/feed.xml/` 下，但所有内部 URL（文章链接、channel link、atom:self）都硬编码为无 locale 前缀的路径（如 `/blog/feed.xml`）。同时 `force-static` 声明缺少 `generateStaticParams`，在 `[locale]` 动态段下会导致构建失败。

**Why this matters:**
构建会直接失败。即使绕过，RSS 阅读器会跟踪到 404 的 self-link URL，所有文章链接也会指向不存在的路径。

**How it was resolved:**
添加了 `generateStaticParams` 为每个 locale 生成参数。修改 `GET` 处理函数接收 `params`，将 locale 注入所有 URL（postUrl、channel link、atom:link）。移除了 force-static 下无效的 Cache-Control header。

---

### FINDING-2
- **Severity:** Critical
- **Confidence:** 97
- **File:** `src/components/blog/blog-post-card.tsx:43,61,70,85,97`
- **Category:** architecture
- **Source:** architecture-agent
- **Round found:** 1
- **Resolution:** fixed (round 1)

**What is wrong:**
`BlogPostCard` 组件中所有 `/blog/...` 链接硬编码为无 locale 前缀的路径。由于博客已从 `(site)/blog/` 迁移到 `[locale]/blog/`，这些链接全部指向不存在的路由。

**Why this matters:**
用户点击博客卡片上的任何链接（文章、分类、标签）都会 404 或触发重定向循环。

**How it was resolved:**
组件已从 cookie 读取 locale（预存代码）。添加 `blogBase = /${locale}/blog` 变量，所有内部链接改为使用 `${blogBase}/...` 前缀。同时修复 `getTranslations` 传入 locale 参数。

---

### FINDING-3
- **Severity:** Important
- **Confidence:** 90
- **File:** `src/app/[locale]/blog/page.tsx:47`
- **Category:** correctness
- **Source:** correctness-agent
- **Round found:** 1
- **Resolution:** fixed (round 1)

**What is wrong:**
`Number(sp.page ?? 1)` 对非数字查询参数（如 `?page=abc`）返回 `NaN`。`Math.max(1, NaN)` 返回 `NaN`，导致 `slice(NaN)` 返回空数组。

**Why this matters:**
用户访问 `?page=abc` 会看到空白页面而非第一页内容。

**How it was resolved:**
使用 `Number.isFinite()` 验证解析结果，并将 `currentPage` 夹紧到 `[1, totalPages]` 范围。同时改为单次 `getAllPosts()` 调用后 `slice()` 分页，消除重复调用。

---

### FINDING-4
- **Severity:** Important
- **Confidence:** 88
- **File:** `src/app/[locale]/blog/page.tsx:60`, `[slug]/page.tsx:117`, `category/page.tsx:48`, `tag/page.tsx:48`
- **Category:** correctness
- **Source:** correctness-agent
- **Round found:** 1
- **Resolution:** fixed (round 1)

**What is wrong:**
博客页面组件中 `getTranslations('blog')` 未传入 locale 参数。在 SSG 静态生成时，可能使用默认 locale 的翻译而非当前生成的 locale。

**Why this matters:**
非默认语言的静态生成页面可能烘焙错误语言的翻译文案。

**How it was resolved:**
所有 4 个文件的 `getTranslations` 调用改为 `getTranslations({ locale, namespace: 'blog' })`。

---

### FINDING-5
- **Severity:** Important
- **Confidence:** 85
- **File:** `src/app/[locale]/blog/[slug]/page.tsx:44-45`
- **Category:** production-readiness
- **Source:** production-agent
- **Round found:** 1
- **Resolution:** fixed (round 1)

**What is wrong:**
`generateMetadata` 对不存在的 slug 返回空对象 `{}`，而非调用 `notFound()`。

**Why this matters:**
爬虫和链接预览服务会收到 200 + 空 metadata 响应，可能导致幽灵索引。

**How it was resolved:**
将 `return {}` 替换为 `notFound()`。

---

### FINDING-6
- **Severity:** Important
- **Confidence:** 80
- **File:** `src/middleware.ts:69-79`
- **Category:** correctness
- **Source:** correctness-agent
- **Round found:** 1
- **Resolution:** fixed (round 1)

**What is wrong:**
Geo 检测分支在 `geoLocale === DEFAULT_LOCALE` 时跳过，直接回退到 Accept-Language。这导致英语国家用户如果浏览器设置了非英语的 Accept-Language，会被错误地重定向到非英语页面。

**Why this matters:**
违反 FR-008 的检测优先级要求（cookie → geo → Accept-Language → default）。

**How it was resolved:**
改为检查 `countryCode !== null`：有地理信息时使用 geo 结果，无论结果是否为默认语言；只有无地理信息时才回退到 Accept-Language。

---

## Remaining Findings (Minor)

以下 Minor 发现不影响功能正确性，建议在后续迭代中改进：

1. **Cookie 缺少 Secure flag** — `language-switcher.tsx` 和 `middleware.ts` 中设置 NEXT_LOCALE cookie 时未添加 `Secure` 标志
2. **LOCALE_COOKIE 常量重复** — 同一 cookie 名称在 6 个文件中分别硬编码
3. **LOCALE_TO_DATE_LOCALE 重复** — `[slug]/page.tsx` 和 `blog-post-card.tsx` 中重复定义
4. **Navbar/Footer locale 回退** — `(site)` 路由组下 `useParams()` 无法获取 locale，始终回退到 'en'
5. **displayName 大写逻辑重复** — category 和 tag 页面各有 2 处重复
6. **空 blog layout** — `[locale]/blog/layout.tsx` 是纯透传组件
7. **TOC heading ID 不支持 Unicode** — 非 ASCII 标题的 ID 生成可能与 rehype-slug 不一致
8. **Main layout LanguageSwitcher 浮动定位** — 固定高度的独立 div 未集成到实际导航组件中
