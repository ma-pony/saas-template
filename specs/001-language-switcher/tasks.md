# Tasks: 语言切换功能

**Input**: Design documents from `specs/001-language-switcher/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: 未请求自动化测试。通过手动验证 + `bun run typecheck` + `bun lint` 确保正确性。

**Organization**: 按用户故事分组，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3, US4）

---

## Phase 1: Setup（共享基础设施）

**Purpose**: i18n 配置扩展和 LanguageSwitcher 核心组件创建

- [ ] T001 在 `src/lib/i18n/config.ts` 新增 `LOCALE_DISPLAY_NAMES` 常量映射（en→English, es→Español, fr→Français, zh→中文）
- [ ] T002 创建 `src/components/language-switcher.tsx` 客户端组件：Globe 图标 + DropdownMenu，接收当前 locale，切换时设置 NEXT_LOCALE cookie 并 router.push 到新路径

**Checkpoint**: LanguageSwitcher 组件可独立渲染和使用

---

## Phase 2: User Story 1 — 应用内切换语言 (Priority: P1) 🎯 MVP

**Goal**: 已登录用户在 Dashboard 等主应用页面通过导航栏语言切换器切换语言

**Independent Test**: 登录后在 `/en/dashboard` 点击语言切换器选择中文，验证页面导航至 `/zh/dashboard`，文案变中文，刷新后仍为中文

### Implementation for User Story 1

- [ ] T003 [US1] 修改 `src/app/[locale]/(main)/layout.tsx`：添加顶部导航栏，包含 LanguageSwitcher 组件，从 URL params 获取当前 locale 传入
- [ ] T004 [US1] 运行 `bun run typecheck` 和 `bun lint` 验证无错误
- [ ] T005 [US1] 手动验证：启动 `bun dev`，登录后在 Dashboard 页面切换语言，确认 URL 变化、文案切换、cookie 写入

**Checkpoint**: 主应用区域语言切换可用，US1 独立可测

---

## Phase 3: User Story 2 — 认证页面切换语言 (Priority: P1)

**Goal**: 未登录用户在登录/注册页面可切换语言

**Independent Test**: 在 `/en/login` 点击语言切换器选择 Español，验证页面导航至 `/es/login`，表单文案变为西班牙语

### Implementation for User Story 2

- [ ] T006 [US2] 修改 `src/app/[locale]/(auth)/layout.tsx`：在右上角绝对定位添加 LanguageSwitcher 组件，不干扰居中的表单布局
- [ ] T007 [US2] 手动验证：在登录页和注册页切换语言，确认表单文案、验证错误提示均以目标语言显示

**Checkpoint**: 认证区域语言切换可用，US2 独立可测

---

## Phase 4: User Story 3 — 营销页面国际化与语言切换 (Priority: P2)

**Goal**: 营销 Navbar 集成语言切换器，Blog 迁移到 locale 路由下

**Independent Test**: 访问首页，切换语言后页面内容变为目标语言且 URL 正确；访问 `/en/blog` 博客列表页正常渲染

### Implementation for User Story 3

- [ ] T008 [P] [US3] 修改 `src/app/(site)/navbar.tsx`：在 GitHub stars 图标与登录按钮之间添加 LanguageSwitcher；移动端菜单中也添加语言切换选项
- [ ] T009 [P] [US3] 将 `src/app/(site)/blog/` 整体移至 `src/app/[locale]/blog/`：移动所有文件（layout.tsx、page.tsx、[slug]/page.tsx、category/[category]/page.tsx、tag/[tag]/page.tsx、feed.xml/route.ts）
- [ ] T010 [US3] 简化 `src/app/[locale]/blog/layout.tsx`：移除冗余的 `NextIntlClientProvider` 包装（上层 `[locale]/layout.tsx` 已提供）
- [ ] T011 [US3] 更新所有 blog 页面的 params 类型：添加 `locale` 参数，更新 `generateStaticParams` 为每个 locale 生成参数（`page.tsx`、`[slug]/page.tsx`、`category/[category]/page.tsx`、`tag/[tag]/page.tsx`）
- [ ] T012 [US3] 更新 blog 页面内部链接：将 `/blog` 硬编码链接改为 locale 感知路径（如 `/${locale}/blog`）
- [ ] T013 [US3] 更新 `src/middleware.ts`：从 matcher 正则中移除 `blog` 排除项，使 `/en/blog`、`/zh/blog` 等路径被中间件正确处理
- [ ] T014 [US3] 为 blog 页面的 `generateMetadata` 添加 `generateHreflangMetadata()` 调用
- [ ] T015 [US3] 运行 `bun run typecheck` 和 `bun lint` 验证所有变更无错误
- [ ] T016 [US3] 手动验证：首页 Navbar 语言切换、Blog 列表页、Blog 文章页、分类页、标签页在所有 4 种语言下正常访问

**Checkpoint**: 营销区域 + Blog 完全国际化，US3 独立可测

---

## Phase 5: User Story 4 — 语言自动检测与偏好持久化 (Priority: P3)

**Goal**: 首次访问自动匹配浏览器语言，手动选择后 cookie 持久化

**Independent Test**: 清除 cookie，设置浏览器语言为法语，访问根路径，验证自动重定向至 `/fr`

### Implementation for User Story 4

- [ ] T017 [US4] 验证 `src/middleware.ts` 的现有检测优先级（cookie → geo → Accept-Language → 默认）符合 FR-008 要求，如有差异则修复
- [ ] T018 [US4] 手动验证：清除 cookie + 设置浏览器 Accept-Language 为 `es`，访问 `/`，确认重定向至 `/es`；然后手动切换为 `zh`，关闭重开浏览器确认保持 `/zh`

**Checkpoint**: 自动检测和持久化完整可用，US4 独立可测

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: SEO 完善、翻译回退验证、Constitution 更新

- [ ] T019 [P] 验证所有页面的 `<html lang>` 属性正确输出（检查 `src/app/layout.tsx` 或 `[locale]/layout.tsx`）
- [ ] T020 [P] 验证 next-intl 的翻译缺失回退配置：确保缺失 key 回退显示英文而非空白（检查 `src/lib/i18n/request.ts` 或 next-intl 配置）
- [ ] T021 [P] 确认 Blog RSS feed（`feed.xml/route.ts`）在 locale 路由下仍可正常访问
- [ ] T022 更新 `.specify/memory/constitution.md` 中原则 V 的描述：反映 Blog 已纳入 locale 路由
- [ ] T023 运行最终 `bun run typecheck`、`bun lint`、`bun build` 全量验证

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 无依赖，立即开始
- **Phase 2 (US1)**: 依赖 Phase 1（LanguageSwitcher 组件必须存在）
- **Phase 3 (US2)**: 依赖 Phase 1（同上），可与 Phase 2 **并行**
- **Phase 4 (US3)**: 依赖 Phase 1，可与 Phase 2/3 **并行**（但 Blog 迁移工作量最大）
- **Phase 5 (US4)**: 依赖 Phase 1，主要是验证现有中间件逻辑
- **Phase 6 (Polish)**: 依赖所有用户故事完成

### User Story Dependencies

- **US1 (P1)**: 仅依赖 Phase 1 → 可作为 MVP 独立交付
- **US2 (P1)**: 仅依赖 Phase 1 → 可与 US1 并行
- **US3 (P2)**: 仅依赖 Phase 1 → Blog 迁移是独立工作流
- **US4 (P3)**: 仅依赖 Phase 1 → 主要是验证，工作量最小

### Parallel Opportunities

- T008 和 T009 可并行（不同文件：navbar vs blog 目录）
- T019、T020、T021 可并行（不同验证任务）
- US1、US2、US3 理论上可并行（不同 layout 文件），但建议顺序执行以减少冲突

---

## Parallel Example: User Story 3

```bash
# 可并行启动：
Task T008: "修改 navbar.tsx 添加 LanguageSwitcher"
Task T009: "移动 blog 目录到 [locale]/blog/"

# 上述完成后顺序执行：
Task T010 → T011 → T012 → T013 → T014 → T015 → T016
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: 创建 LanguageSwitcher 组件
2. 完成 Phase 2: 集成到 Main 区域
3. **停止验证**: 在 Dashboard 测试语言切换
4. 可立即部署/演示

### Incremental Delivery

1. Phase 1 → LanguageSwitcher 组件就绪
2. Phase 2 (US1) → 主应用可切换语言 → 可部署
3. Phase 3 (US2) → 认证页面可切换语言 → 可部署
4. Phase 4 (US3) → 营销页 + Blog 完全国际化 → 可部署（最大变更）
5. Phase 5 (US4) → 自动检测验证 → 可部署
6. Phase 6 → 收尾打磨 → 最终部署

---

## Notes

- Blog 迁移（T009-T014）是最大的工作块，需特别注意内部链接更新
- LanguageSwitcher 是纯客户端组件，需 `'use client'` 标记
- RSS feed route 在 locale 路由下可能需要特殊处理（确保 `/en/blog/feed.xml` 可访问）
- 不需要数据库迁移，不需要新的 env var
