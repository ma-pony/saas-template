# Implementation Plan: 语言切换功能

**Branch**: `001-language-switcher` | **Date**: 2026-04-01 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-language-switcher/spec.md`

## Summary

创建 LanguageSwitcher 下拉组件（Globe 图标 + DropdownMenu），部署到应用、认证、营销三个区域，并将 blog 页面从 `(site)/blog/` 迁移到 `[locale]/blog/` 实现完整 locale 路由覆盖。切换时保持当前路径，仅替换 locale 前缀，同时写入 `NEXT_LOCALE` cookie 持久化偏好。

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15 (App Router)
**Primary Dependencies**: next-intl、lucide-react、@radix-ui/react-dropdown-menu (via Shadcn)
**Storage**: 无数据库变更（cookie 持久化）
**Testing**: 手动验证 + `bun run typecheck` + `bun lint`
**Target Platform**: Web (SSR + CSR)
**Project Type**: Web application (Next.js SaaS template)
**Constraints**: 必须复用现有 next-intl 基础设施，不引入新 i18n 库

## Constitution Check

*GATE: 通过*

| 原则 | 状态 | 说明 |
|------|------|------|
| I. 适配器优先 | N/A | 无外部服务集成 |
| II. 服务端组件默认 | 符合 | LanguageSwitcher 需 `'use client'`（交互组件），其余保持服务端 |
| III. 环境变量驱动 | N/A | 无新 env var |
| IV. 统一基础设施 | 符合 | 复用 next-intl、cookie 机制、hreflang 工具 |
| V. 国际化就绪 | **扩展** | 将营销 blog 纳入 locale 路由，是对此原则的正向扩展 |

**注**：Constitution V 提到「营销页和博客不在 locale 路由下」——本次变更有意扩展此状态。实施后需更新 constitution 相关描述。

## Project Structure

### Documentation (this feature)

```text
specs/001-language-switcher/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究发现
├── data-model.md        # 数据模型
├── quickstart.md        # 快速开始指南
└── tasks.md             # 任务分解（/speckit.tasks 生成）
```

### Source Code (变更范围)

```text
src/
├── lib/i18n/
│   └── config.ts                          # 新增 LOCALE_DISPLAY_NAMES
├── components/
│   └── language-switcher.tsx               # [新建] LanguageSwitcher 组件
├── app/
│   ├── (site)/
│   │   ├── navbar.tsx                      # 集成 LanguageSwitcher
│   │   └── blog/                           # [迁移] → [locale]/blog/
│   ├── [locale]/
│   │   ├── (auth)/layout.tsx               # 集成 LanguageSwitcher
│   │   ├── (main)/layout.tsx               # 集成 LanguageSwitcher
│   │   └── blog/                           # [新位置] 从 (site)/blog/ 迁移
│   │       ├── layout.tsx                  # 简化（移除冗余 Provider）
│   │       ├── page.tsx                    # 添加 locale params
│   │       ├── [slug]/page.tsx             # 添加 locale params
│   │       ├── category/[category]/page.tsx
│   │       ├── tag/[tag]/page.tsx
│   │       └── feed.xml/route.ts           # 保持兼容
│   └── middleware.ts                        # 更新 matcher
```

**Structure Decision**: 在现有目录结构中操作，仅新建 1 个组件文件，其余为修改和移动。

## 实施阶段

### Phase 1: LanguageSwitcher 组件（FR-001, FR-005, FR-006, FR-011）

1. **i18n 配置扩展**：在 `src/lib/i18n/config.ts` 新增 `LOCALE_DISPLAY_NAMES` 常量
2. **创建 LanguageSwitcher 组件**：
   - 文件：`src/components/language-switcher.tsx`
   - 客户端组件（`'use client'`）
   - 使用 `Globe` 图标（lucide-react）+ `DropdownMenu`（现有 UI 组件）
   - Props：接收当前 locale（通过 `useParams` 或 prop）
   - 切换逻辑：
     - 获取 `usePathname()` 返回的路径（next-intl 自动去除 locale 前缀）
     - 设置 `document.cookie`（NEXT_LOCALE，1 年有效期）
     - `useRouter().push('/{newLocale}{pathname}')`
   - 当前语言高亮显示
   - 每种语言以原始名称显示（English、Español、Français、中文）

### Phase 2: 三区域集成（FR-002, FR-003, FR-004）

3. **营销 Navbar 集成**：
   - 修改 `src/app/(site)/navbar.tsx`
   - 在 GitHub stars 和登录按钮之间添加 LanguageSwitcher
   - 移动端菜单中也添加语言切换选项

4. **Auth 区域集成**：
   - 修改 `src/app/[locale]/(auth)/layout.tsx`
   - 在右上角绝对定位添加 LanguageSwitcher（不干扰表单布局）

5. **Main 应用集成**：
   - 修改 `src/app/[locale]/(main)/layout.tsx`
   - 在页面顶部添加紧凑的导航栏，包含 LanguageSwitcher

### Phase 3: Blog 迁移（FR-007）

6. **移动 blog 文件**：
   - 将 `src/app/(site)/blog/` 整体移至 `src/app/[locale]/blog/`
   - 删除 blog layout 中的 `NextIntlClientProvider`（改用上层 `[locale]/layout.tsx`）
   - 更新所有 blog 页面的 params 类型，添加 `locale` 参数
   - 更新 `generateStaticParams` 为每个 locale 生成参数

7. **更新中间件 matcher**：
   - 从 matcher 正则中移除 `blog` 排除项
   - 确保 `/en/blog`、`/zh/blog` 等路径正确匹配

8. **更新 blog 内部链接**：
   - Blog 页面中的 `/blog` 硬编码链接需改为 locale 感知的相对路径
   - 使用 `usePathname` 或传入 locale 参数构建链接

### Phase 4: SEO 与收尾（FR-008, FR-009, FR-010）

9. **hreflang 元标签**：
   - 为迁移后的 blog 页面添加 `generateHreflangMetadata()` 调用
   - 验证所有页面的 `<html lang>` 属性正确

10. **翻译缺失回退**：
    - 验证 next-intl 的 fallback 配置已启用默认语言回退
    - 确保 blog 相关翻译 key 在所有 4 个语言文件中存在

11. **Constitution 更新**：
    - 更新 `.specify/memory/constitution.md` 中原则 V 的描述，反映 blog 已纳入 locale 路由

## Complexity Tracking

无 Constitution 违规需要辩护。
