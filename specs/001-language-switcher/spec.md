# Feature Specification: 语言切换功能

**Feature Branch**: `001-language-switcher`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: 语言切换功能：1) 创建 LanguageSwitcher 下拉组件（Globe图标+Dropdown，支持 en/es/fr/zh）；2) 在 App/Auth/Marketing 三个区域部署；3) 将 (site) 营销页迁移到 [locale] 路由下实现完整国际化；4) 切换时保持当前路径仅替换 locale 前缀，同时写入 NEXT_LOCALE cookie 记住偏好

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 应用内切换语言 (Priority: P1)

已登录用户在 Dashboard 或 Settings 等主应用页面中，通过导航栏的语言切换器将界面语言从英文切换为中文。切换后页面立即以中文渲染，URL 中的 locale 前缀从 `/en/` 变为 `/zh/`，其余路径不变。用户关闭浏览器后再次访问时，系统自动以中文显示。

**Why this priority**: 主应用是用户日常使用的核心区域，语言切换的首要价值在于让非英语用户能以母语高效使用产品。

**Independent Test**: 登录后在 Dashboard 页面点击语言切换器选择中文，验证页面文案变为中文、URL 路径正确、刷新后仍为中文。

**Acceptance Scenarios**:

1. **Given** 用户已登录且当前语言为英文（URL 为 `/en/dashboard`），**When** 用户点击导航栏的 Globe 图标并选择「中文」，**Then** 页面导航至 `/zh/dashboard`，所有 UI 文案以中文显示，且浏览器写入 `NEXT_LOCALE=zh` cookie。
2. **Given** 用户浏览器中已有 `NEXT_LOCALE=zh` cookie，**When** 用户直接访问 `/dashboard`（无 locale 前缀），**Then** 系统自动重定向至 `/zh/dashboard`。
3. **Given** 用户当前在 `/en/settings/profile` 页面，**When** 用户切换语言为法语，**Then** 页面导航至 `/fr/settings/profile`，路径结构完全保留。

---

### User Story 2 - 认证页面切换语言 (Priority: P1)

未登录用户在登录页或注册页看到语言切换器，可在注册/登录流程中切换语言。切换后表单标签、验证提示、按钮文案等全部变为目标语言。

**Why this priority**: 认证页面是用户的第一接触点，语言障碍会直接导致用户流失，与主应用同等重要。

**Independent Test**: 在登录页点击语言切换器选择西班牙语，验证登录表单所有文案变为西班牙语，提交错误信息也以西班牙语显示。

**Acceptance Scenarios**:

1. **Given** 用户在 `/en/login` 页面，**When** 用户通过语言切换器选择「Español」，**Then** 页面导航至 `/es/login`，所有表单文案以西班牙语显示。
2. **Given** 用户在 `/fr/register` 页面填写注册表单，**When** 用户输入无效邮箱并提交，**Then** 验证错误提示以法语显示。

---

### User Story 3 - 营销页面国际化与语言切换 (Priority: P2)

潜在用户访问首页、定价页等营销页面时，页面以其偏好语言展示，并可通过语言切换器更换语言。营销页面从当前的非 locale 路由（`/(site)/`）迁移到 `[locale]` 路由下，实现完整国际化。

**Why this priority**: 营销页面面向全球潜在用户，但当前已有可用的英文版本，迁移工作量较大，优先级略低于核心功能。

**Independent Test**: 访问首页，点击语言切换器选择中文，验证首页内容以中文显示且 URL 包含 `/zh/` 前缀。

**Acceptance Scenarios**:

1. **Given** 用户访问根路径 `/`，**When** 系统检测到浏览器首选语言为中文，**Then** 自动重定向至 `/zh`（首页），内容以中文展示。
2. **Given** 用户在 `/en/pricing` 页面，**When** 用户通过语言切换器选择「Français」，**Then** 页面导航至 `/fr/pricing`，定价信息以法语显示。
3. **Given** 用户在 `/zh/blog` 页面，**When** 用户通过语言切换器切换语言，**Then** 博客列表页以目标语言显示（博客文章内容保持英文原文，仅 UI 框架文案切换）。

---

### User Story 4 - 语言自动检测与偏好持久化 (Priority: P3)

首次访问的用户无需手动选择语言，系统根据浏览器语言自动匹配最合适的语言。用户手动选择后，偏好通过 cookie 持久化，后续访问自动应用。

**Why this priority**: 自动检测是锦上添花的体验优化，系统已有 next-intl 中间件支持，主要需确保与手动切换的优先级协调。

**Independent Test**: 清除所有 cookie，设置浏览器语言为法语，访问网站根路径，验证自动显示法语版本。

**Acceptance Scenarios**:

1. **Given** 新用户首次访问，浏览器 Accept-Language 为 `es-ES`，且无 `NEXT_LOCALE` cookie，**When** 用户访问 `/`，**Then** 系统重定向至 `/es`。
2. **Given** 用户之前手动选择了中文（`NEXT_LOCALE=zh`），浏览器 Accept-Language 为 `en-US`，**When** 用户访问 `/`，**Then** 系统优先使用 cookie 值，重定向至 `/zh`（cookie 优先于浏览器语言）。

---

### Edge Cases

- 用户访问不支持的 locale 路径（如 `/de/dashboard`）时，系统应回退到默认语言（英文）并重定向。
- 用户在表单填写过程中切换语言时，已输入的数据不应丢失（客户端状态保留）。
- 某些翻译 key 缺失时，系统应回退显示英文原文而非空白或 key 本身。
- 博客文章内容为纯英文 MDX，切换语言时仅 UI 框架部分（导航、侧边栏、页脚）应切换语言。
- 并发切换（快速连续点击不同语言）应以最后一次选择为准，不出现竞态。
- SEO 相关：每个语言版本的页面应有正确的 `hreflang` 标签和 `<html lang>` 属性。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统必须提供 LanguageSwitcher 组件，包含 Globe 图标触发器和下拉菜单，列出所有支持的语言（English、Español、Français、中文）。
- **FR-002**: LanguageSwitcher 组件必须在主应用区域（Dashboard、Settings 等 `(main)` 路由组）的导航栏中可用。
- **FR-003**: LanguageSwitcher 组件必须在认证区域（Login、Register、Verify 等 `(auth)` 路由组）中可用。
- **FR-004**: LanguageSwitcher 组件必须在营销区域（首页、定价页等）中可用。
- **FR-005**: 用户切换语言时，系统必须保持当前页面路径不变，仅替换 URL 中的 locale 前缀（如 `/en/settings/profile` → `/zh/settings/profile`）。
- **FR-006**: 用户切换语言时，系统必须将选择的 locale 写入 `NEXT_LOCALE` cookie，以便后续访问自动应用。
- **FR-007**: 营销页面（当前 `(site)` 路由组下的首页、定价页、功能页等）必须迁移至 locale 感知路由下，支持多语言内容渲染。
- **FR-008**: 系统的语言检测优先级必须为：cookie（`NEXT_LOCALE`）→ 用户手动选择 → 浏览器 Accept-Language → 默认语言（英文）。
- **FR-009**: 每个语言版本的页面必须包含正确的 `<html lang>` 属性和 `hreflang` 元标签，以支持搜索引擎正确索引。
- **FR-010**: 当翻译内容缺失时，系统必须回退显示默认语言（英文）的对应内容。
- **FR-011**: LanguageSwitcher 中的每种语言必须以其原始语言名称显示（如「中文」而非「Chinese」），以便不懂当前语言的用户也能识别自己的语言。

### Key Entities

- **Locale**: 表示一种支持的语言，包含语言代码（如 `en`）和显示名称（如 `English`）。当前支持 4 种：en、es、fr、zh。
- **语言偏好**: 用户选择的首选语言，通过 `NEXT_LOCALE` cookie 持久化存储，有效期应足够长（至少 1 年）。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户可在 2 次点击内完成语言切换（点击 Globe 图标 → 选择目标语言），切换后页面在 1 秒内以目标语言完整渲染。
- **SC-002**: 语言切换后，当前页面路径 100% 保留，不出现 404 或路径丢失。
- **SC-003**: 用户的语言偏好在关闭浏览器后仍然生效，再次访问时自动以上次选择的语言显示。
- **SC-004**: 所有四种语言（en/es/fr/zh）在三个区域（App/Auth/Marketing）中均可正常切换和显示。
- **SC-005**: 营销页面迁移后，每个页面在所有支持的语言版本中均可正常访问，SEO 元数据（hreflang）正确输出。
- **SC-006**: 首次访问用户的语言自动检测准确率不低于 90%（基于浏览器 Accept-Language 匹配支持的 locale 列表）。

## Assumptions

- 现有的 `next-intl` 基础设施（中间件、翻译文件、`useTranslations`/`getTranslations`）将被复用，不引入新的 i18n 库。
- 翻译文件（`src/messages/*.json`）中已有的 key 覆盖了主应用和认证区域的基本文案；营销页面的翻译 key 需要在迁移时新增。
- 博客文章内容（MDX）保持英文单语，不在此功能范围内进行内容翻译，仅 UI 框架部分支持多语言。
- `NEXT_LOCALE` cookie 的设置采用客户端 `document.cookie`，不需要服务端 API 端点。
- 现有的 Shadcn UI 组件（DropdownMenu）将用于构建语言切换下拉菜单，不引入额外 UI 库。
- Admin 面板（`/admin`）不在此次国际化范围内，保持英文。
