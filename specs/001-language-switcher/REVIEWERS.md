# Review Guide: 语言切换功能

**Branch**: `001-language-switcher`
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Tasks**: [tasks.md](tasks.md)

## 功能概述

为 SaaS 模板添加完整的语言切换功能：LanguageSwitcher 下拉组件（Globe 图标 + Dropdown）部署到应用、认证、营销三个区域，并将 Blog 从 `(site)/blog/` 迁移至 `[locale]/blog/` 实现完整 locale 路由覆盖。

## Reviewer Checklist

### Spec 质量

- [x] 需求清晰且可测试（11 条 FR，均有明确动词和验证条件）
- [x] 无 [NEEDS CLARIFICATION] 标记
- [x] 成功标准可度量（6 条 SC，含具体指标）
- [x] 范围界定明确（排除 Admin 面板、博客内容翻译）
- [x] Constitution 对齐（扩展原则 V，已标注需更新）

### Plan 覆盖度

| 需求 | 覆盖 | 任务 |
|------|------|------|
| FR-001 LanguageSwitcher 组件 | ✅ | T001, T002 |
| FR-002 Main 区域 | ✅ | T003 |
| FR-003 Auth 区域 | ✅ | T006 |
| FR-004 Marketing 区域 | ✅ | T008 |
| FR-005 路径保持 | ✅ | T002 |
| FR-006 Cookie 写入 | ✅ | T002 |
| FR-007 营销页迁移 | ✅ | T009-T014 |
| FR-008 检测优先级 | ✅ | T017 |
| FR-009 hreflang/lang | ✅ | T014, T019 |
| FR-010 翻译回退 | ✅ | T020 |
| FR-011 原始语言名称 | ✅ | T001 |

**覆盖率**: 11/11 (100%)

### Task 质量

- [x] 所有任务包含具体文件路径
- [x] 按用户故事分组，支持独立实现
- [x] 标注了并行机会（T008/T009, T019/T020/T021）
- [x] 每个 phase 有 checkpoint 和独立测试描述
- [x] MVP 策略明确（Phase 1 + Phase 2 即可交付）

### 风险与关注点

1. **Blog 迁移是最大变更**（T009-T014, 6 个任务）：
   - 迁移后内部链接需全部更新为 locale 感知路径
   - RSS feed route 在 `[locale]/blog/feed.xml` 下需确保可访问
   - `generateStaticParams` 需要为 4 个 locale × N 篇文章 = 4N 个静态页面

2. **中间件 matcher 变更**（T013）：
   - 移除 `blog` 排除项后，所有 `/blog` 请求都会走中间件 locale 重定向
   - 现有书签/外链 `/blog/some-post` 会被重定向到 `/en/blog/some-post`（新行为）

3. **Main layout 扩展**（T003）：
   - 当前 `(main)/layout.tsx` 仅做 session 检查，无 UI
   - 添加导航栏会影响所有 Dashboard 子页面的视觉布局

4. **Constitution 更新**（T022）：
   - 原则 V 的变更需要 review，确认是正式扩展而非临时偏离

## 验证步骤

Review 时建议按以下顺序验证：

1. `bun run typecheck` — 类型安全
2. `bun lint` — 代码规范
3. `bun build` — 构建成功
4. 手动测试 4 种语言 × 3 个区域 = 12 个组合
5. 验证 Blog 迁移后所有页面可访问
6. 验证 hreflang 输出（查看页面源码）
