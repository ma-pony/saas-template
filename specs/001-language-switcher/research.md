# 研究发现：语言切换功能

## 决策 1：营销页面迁移范围

**决策**：`(site)/` 下仅包含共享组件（navbar、hero、features 等）和 blog 页面。首页已在 `[locale]/page.tsx` 下，导入 `(site)/` 组件。真正需要迁移的是 **blog 页面**——从 `(site)/blog/` 移到 `[locale]/blog/`。

**依据**：
- `src/app/(site)/` 没有 `page.tsx`，只有组件文件（navbar.tsx、hero.tsx、features.tsx 等）
- 首页 `src/app/[locale]/page.tsx` 已导入这些组件并正确处理 locale
- Blog 页面（`(site)/blog/*`）有自己的 layout，通过读 cookie 获取 locale，但不在 `[locale]` 路由下
- 中间件 matcher 排除了 `blog`：`/((?!api|_next/static|...|blog|.*\\..*).*)` 

**备选方案**：不迁移 blog，保持 cookie 驱动方式 → 被拒绝：URL 中无 locale 前缀导致 SEO 不佳，且与其他页面体验不一致

## 决策 2：LanguageSwitcher 集成点

**决策**：三个独立的集成位置

| 区域 | 集成点 | 类型 |
|------|--------|------|
| 营销/首页 | `(site)/navbar.tsx` 中添加 | 客户端组件 |
| 认证页面 | `[locale]/(auth)/layout.tsx` 中添加 | 绝对定位在右上角 |
| 主应用 | `[locale]/(main)/layout.tsx` 中添加 | 需要创建应用导航栏或在页面顶部添加 |

**依据**：
- `(site)/navbar.tsx` 是 `'use client'` 组件，已有 `useTranslations`，可直接添加
- Auth layout 极简（只有背景 + 居中内容），无导航栏，需要独立放置
- Main layout 仅做 session 检查和 redirect，无 UI 组件，需要扩展

## 决策 3：路径替换策略

**决策**：使用 `usePathname()` 获取当前路径，替换 locale 前缀，通过 `router.push()` 导航

**依据**：
- `src/app/(auth)/components/use-locale-path.ts` 已有 `getLocaleFromCookie()` 和 `localePath()` 工具函数
- next-intl 的 `usePathname` 返回不含 locale 前缀的路径
- 结合 `useRouter` 可实现无刷新的客户端导航

## 决策 4：Cookie 策略

**决策**：复用中间件已有的 cookie 机制（`NEXT_LOCALE`，maxAge 1 年，sameSite lax）

**依据**：
- `src/middleware.ts` 已定义 `LOCALE_COOKIE = 'NEXT_LOCALE'`，`COOKIE_MAX_AGE = 31536000`
- 中间件已处理 cookie → locale 的优先级逻辑
- LanguageSwitcher 只需 `document.cookie` 设置 + 导航，中间件自动处理后续请求

## 决策 5：Blog 迁移方案

**决策**：将 `(site)/blog/` 整体移至 `[locale]/blog/`，删除 blog 自有的 `NextIntlClientProvider` layout（改用 `[locale]/layout.tsx` 提供的 provider）

**依据**：
- Blog layout 当前自行读 cookie 并创建 `NextIntlClientProvider` → 冗余，`[locale]/layout.tsx` 已有相同功能
- Blog 页面已使用 `getTranslations('blog')` → 迁移后直接可用
- Blog 文章内容（MDX）保持英文不变，只有 UI 框架切换语言

**风险**：
- 中间件 matcher 需更新：移除 `blog` 排除项
- RSS feed route（`blog/feed.xml/route.ts`）需确保在 locale 路由下仍可访问
- `generateStaticParams` 需要为每个 locale 生成页面

## 决策 6：现有 UI 组件

**决策**：使用 `src/components/ui/menu.tsx`（DropdownMenu 组件）构建语言选择下拉菜单

**依据**：
- 项目已有基于 Shadcn/Radix 的 DropdownMenu 组件
- `lucide-react` 已在使用（navbar 中有 `X`、`Menu`、`LogOut` 图标），`Globe` 图标可直接导入

## 决策 7：hreflang 处理

**决策**：复用现有 `src/lib/i18n/hreflang.ts` 的 `generateHreflangMetadata()` 函数

**依据**：
- 函数已支持所有 4 个 locale
- 首页已在 `generateMetadata` 中使用
- Blog 和其他新迁移页面可直接调用

## 现有基础设施总结

| 模块 | 路径 | 状态 |
|------|------|------|
| i18n 配置 | `src/lib/i18n/config.ts` | 完整（4 locale） |
| 中间件 | `src/middleware.ts` | 完整（cookie→geo→Accept-Language） |
| hreflang | `src/lib/i18n/hreflang.ts` | 完整 |
| 翻译文件 | `src/messages/*.json` | 有 `site`/`common`/`auth`/`dashboard`/`blog` 命名空间 |
| Locale 路由 | `src/app/[locale]/` | 已有 auth + main + 首页 |
| Cookie 工具 | `src/app/(auth)/components/use-locale-path.ts` | 有 `getLocaleFromCookie()` |
| UI 组件 | `src/components/ui/menu.tsx` | DropdownMenu 可用 |
| 图标库 | `lucide-react` | Globe 图标可用 |
