# 需求文档

## 项目描述（输入）
UI 框架替换：将所有 BaseUI 组件替换为 Shadcn UI（基于 Radix UI + Tailwind），保留 TailwindCSS 4

---

## 需求

### 背景与动机

ShipFree 模板当前使用 `@base-ui/react`（MUI 团队出品的无头 UI 库，尚处 beta 阶段）作为所有交互组件的底层原语。计划将其全量替换为 **Shadcn UI**——一种基于 **Radix UI** + **TailwindCSS** 的"可复制"组件方案。

**替换原因：**
1. **生态成熟度**：Shadcn UI 拥有庞大社区、海量示例和插件，而 BaseUI 生态较小、版本不稳定
2. **完全可控**：Shadcn UI 组件直接复制到 `src/components/ui/` 目录，无黑盒依赖，可随意修改
3. **与 Radix UI 对齐**：大量开源项目、教程、AI 生成代码均使用 Radix UI，降低协作和二次开发门槛
4. **减少包体积**：去除 `@base-ui/react` 依赖，改为按需引入 `@radix-ui/*` 子包
5. **与 steering 目标一致**：`product.md` 明确将"UI 框架替换为 Shadcn UI"列为当前改造方向

### 约束条件
- 保留 **TailwindCSS 4**（不降级到 v3）
- 保留 `class-variance-authority`（CVA）作为变体管理工具
- 保留 `lucide-react` 作为图标库
- 保留 `cn()` 工具函数（`tailwind-merge` + `clsx`）
- 现有的所有页面和功能必须在迁移后保持**视觉等效**和**功能完整**
- 现有的 TypeScript 类型接口需相应更新
- 现有的所有导出别名（如 `DialogContent` = `DialogPopup`）尽量保留，降低上层消费代码的改动量

---

## 功能需求

### FR-01：安装 Shadcn UI 依赖
**优先级：P0（必须）**

系统必须安装 Shadcn UI 所需的 Radix UI 原语包和工具库，以替代 `@base-ui/react`。

**验收标准：**
- `package.json` 中新增 `@radix-ui/*` 相关子包（按实际使用的组件按需引入）
- `package.json` 中移除 `@base-ui/react` 依赖
- Shadcn UI 标准工具依赖（`cmdk` 用于 Command、`sonner` 或 `vaul` 视情况引入）已就绪
- 构建命令 `bun build` 无因依赖缺失引起的错误

### FR-02：替换核心无状态组件
**优先级：P0（必须）**

以下使用 `@base-ui/react/merge-props` 和 `@base-ui/react/use-render` 的无状态/纯样式组件必须改写为标准 HTML 元素 + CVA/TailwindCSS 方案：

- `button.tsx`：移除 `mergeProps`/`useRender`，改用原生 `<button>` + Radix UI `Slot`（支持 `asChild` 模式）
- `badge.tsx`：移除 BaseUI 工具函数，改为纯 div + CVA
- `card.tsx`：移除 BaseUI 工具函数，改为纯 div 组件
- `label.tsx`：改用 `@radix-ui/react-label`
- `breadcrumb.tsx`：移除 BaseUI 工具函数，改为纯 HTML nav 结构
- `pagination.tsx`：移除 BaseUI 工具函数，改为纯 HTML nav 结构
- `group.tsx`：移除 BaseUI 工具函数，改为纯 div

**验收标准：**
- 以上组件文件中不再 import 任何 `@base-ui/react/*`
- 组件支持 `className` prop 和标准 HTML 属性透传
- `button.tsx` 支持 `asChild` 模式（通过 `@radix-ui/react-slot` 实现）

### FR-03：替换交互式对话框类组件
**优先级：P0（必须）**

以下基于 `@base-ui/react/dialog` 或 `@base-ui/react/alert-dialog` 的组件必须迁移到对应的 Radix UI 原语：

- `dialog.tsx`：改用 `@radix-ui/react-dialog`
- `alert-dialog.tsx`：改用 `@radix-ui/react-alert-dialog`
- `sheet.tsx`（复用 Dialog 实现抽屉）：改用 `@radix-ui/react-dialog` + 侧边滑入样式

**迁移映射：**
- `DialogPrimitive.Root` → `DialogRadix.Root`
- `DialogPrimitive.Backdrop/Viewport/Popup` → `DialogRadix.Overlay` + `DialogRadix.Content`
- 导出别名 `DialogContent`（原 `DialogPopup`）须保留

**验收标准：**
- Dialog、AlertDialog、Sheet 功能正常（打开/关闭/ESC/遮罩点击）
- 动画效果通过 TailwindCSS 的 `data-[state=open]` / `data-[state=closed]` 实现
- 键盘焦点陷阱和 ARIA 属性正确

### FR-04：替换浮层定位类组件
**优先级：P0（必须）**

以下依赖 BaseUI 定位器（Positioner）的浮层组件必须迁移到 Radix UI 等效原语：

- `tooltip.tsx`：改用 `@radix-ui/react-tooltip`
- `popover.tsx`：改用 `@radix-ui/react-popover`
- `menu.tsx`（DropdownMenu）：改用 `@radix-ui/react-dropdown-menu`

**注意：**BaseUI 的 `Positioner` / `Viewport` 子组件概念在 Radix 中不存在，需直接使用 `Content` 组件，定位参数（side、align、sideOffset）通过 Radix 的 props 传递。

**验收标准：**
- 浮层弹出、定位、关闭行为与原实现等效
- 动画通过 `data-[state]` 属性驱动
- `PopoverContent`（原 `PopoverPopup`）、`TooltipContent`、`DropdownMenuContent` 别名保留

### FR-05：替换表单控件类组件
**优先级：P0（必须）**

以下表单控件组件必须迁移到 Radix UI 对应原语：

- `checkbox.tsx`：改用 `@radix-ui/react-checkbox`
- `radio-group.tsx`：改用 `@radix-ui/react-radio-group`
- `switch.tsx`：改用 `@radix-ui/react-switch`
- `select.tsx`：改用 `@radix-ui/react-select`
- `slider.tsx`：改用 `@radix-ui/react-slider`
- `progress.tsx`：改用 `@radix-ui/react-progress`
- `input.tsx`：移除 `@base-ui/react/input` 依赖，改为原生 `<input>` 包装
- `textarea.tsx`：移除 `@base-ui/react/field` 依赖，改为原生 `<textarea>` 包装

**验收标准：**
- 表单控件在受控/非受控模式下均正常工作
- `disabled`、`aria-invalid`、`required` 等状态样式正确渲染
- 与 `react-hook-form` 的集成不受影响

### FR-06：替换导航/布局类组件
**优先级：P0（必须）**

以下导航和布局组件必须完成迁移：

- `tabs.tsx`：改用 `@radix-ui/react-tabs`
- `accordion.tsx`：改用 `@radix-ui/react-accordion`
- `collapsible.tsx`：改用 `@radix-ui/react-collapsible`
- `separator.tsx`：改用 `@radix-ui/react-separator`
- `scroll-area.tsx`：改用 `@radix-ui/react-scroll-area`
- `avatar.tsx`：改用 `@radix-ui/react-avatar`
- `toggle.tsx`：改用 `@radix-ui/react-toggle`
- `toggle-group.tsx`：改用 `@radix-ui/react-toggle-group`
- `toolbar.tsx`：改用 `@radix-ui/react-toolbar`

**验收标准：**
- 组件行为（展开/折叠、切换选中等）与原实现等效
- 样式与设计系统一致（颜色、间距、动画）

### FR-07：处理无 Radix UI 等效的 BaseUI 专属组件
**优先级：P1（重要）**

以下组件在 Radix UI 中没有直接等效物，需要特殊处理策略：

- **`toast.tsx`**（`@base-ui/react/toast`）：Radix UI 不提供 Toast 原语。采用 **Sonner**（`sonner` 包）替换，提供原生 API 兼容的 toast 管理
- **`combobox.tsx`**（`@base-ui/react/combobox`）：改用 **cmdk**（`cmdk` 包）+ Radix UI Popover 实现
- **`autocomplete.tsx`**（`@base-ui/react/autocomplete`）：同上，基于 `cmdk` 重写
- **`command.tsx`**（复用 autocomplete + dialog）：改用标准 Shadcn `Command` 组件实现（基于 `cmdk`）
- **`preview-card.tsx`**（`@base-ui/react/preview-card`）：Radix 无等效，降级为 Shadcn Popover 实现
- **`meter.tsx`**（`@base-ui/react/meter`）：无 Radix 等效，改为纯 HTML `<meter>` + TailwindCSS 样式
- **`number-field.tsx`**（`@base-ui/react/number-field`）：无 Radix 等效，改为自定义 Input + 增减按钮组合
- **`field.tsx`** / **`fieldset.tsx`** / **`form.tsx`**（`@base-ui/react/field`、`/fieldset`、`/form`）：改为原生 HTML 元素 + 自定义样式封装

**验收标准：**
- Toast 功能（success/error/warning/info/loading 类型、action 按钮、位置控制）完整保留
- Command/Combobox/Autocomplete 搜索过滤功能正常
- 以上组件不再依赖 `@base-ui/react`

### FR-08：更新 sidebar.tsx
**优先级：P0（必须）**

`sidebar.tsx` 是最大的组件文件（22KB），混合使用了 `mergeProps`/`useRender` 和多个子组件。需要：
- 移除 `mergeProps` / `useRender` 依赖
- 改用标准 React `forwardRef` 或 `asChild`（Radix Slot）模式
- 保留全部公开 API（`SidebarProvider`、`Sidebar`、`SidebarHeader`、`SidebarContent` 等）

**验收标准：**
- Sidebar 在桌面端折叠/展开功能正常
- Sidebar 在移动端 Sheet 抽屉模式功能正常
- 键盘快捷键（默认 `b`）触发功能正常

### FR-09：更新所有消费组件
**优先级：P1（重要）**

迁移后，以下消费 UI 组件的页面文件可能需要更新导入路径或使用方式：
- `src/app/(auth)/login/login-form.tsx`
- `src/app/(auth)/register/register-form.tsx`
- `src/app/(auth)/reset-password/reset-password-form.tsx`
- `src/app/(auth)/verify/verify-content.tsx`
- `src/app/(auth)/components/social-login-buttons.tsx`
- `src/app/(site)/navbar.tsx`
- `src/app/(site)/pricing.tsx`
- `src/app/(site)/faq.tsx`
- `src/app/(site)/hero.tsx`
- `src/app/(site)/features.tsx`（仅图标引用，BaseUI logo 可替换为 Shadcn logo）
- `src/app/layout.tsx`（Toast Provider 需更新）
- `src/app/not-found.tsx`

**验收标准：**
- 所有页面编译无错误
- 业务功能（登录、注册、支付、导航）不受影响
- `src/app/(site)/features.tsx` 和 `hero.tsx` 中的 `base-ui.svg` 图标引用替换为 `shadcn.svg`（或移除）

### FR-10：清理并更新依赖
**优先级：P0（必须）**

完成所有组件迁移后，必须执行依赖清理：
- `package.json` 中删除 `@base-ui/react`
- 添加所有实际使用的 `@radix-ui/*` 子包
- 视需要添加 `sonner`（Toast）、`cmdk`（Command）等工具包
- 运行 `bun install` 确认无残留依赖

**验收标准：**
- `package.json` 中不再有 `@base-ui/react`
- `bun build` 构建成功
- `bun run typecheck` 无类型错误（或错误仅为预存问题，与本次迁移无关）
- `bun lint` 无新增 lint 错误

---

## 非功能需求

### NFR-01：视觉等效性
所有迁移后的组件必须在视觉上与原 BaseUI 版本等效。允许细微的动画差异（因两个库的过渡机制不同），但整体设计语言（颜色、间距、圆角、阴影）必须保持一致。

### NFR-02：性能不降级
迁移后的包体积不应显著增大。Radix UI 采用按需引入的子包模式，理论上体积与 BaseUI 相当或更小。

### NFR-03：无破坏性 API 变更（对上层消费者）
所有通过 `@/components/ui/*` 导入的组件，其公开 API（props 接口、导出名称）应尽量保持向后兼容。确实无法保持兼容时，需在任务中明确标注需同步更新的消费方文件。

### NFR-04：可测试性
迁移后应能通过浏览器手动测试所有主要交互流程（登录、注册、菜单导航、对话框、Toast 通知）。

---

## 组件迁移对照表（完整清单）

| 当前文件 | BaseUI 来源 | Shadcn/Radix 替代方案 | 优先级 |
|---|---|---|---|
| `accordion.tsx` | `@base-ui/react/accordion` | `@radix-ui/react-accordion` | P0 |
| `alert-dialog.tsx` | `@base-ui/react/alert-dialog` | `@radix-ui/react-alert-dialog` | P0 |
| `autocomplete.tsx` | `@base-ui/react/autocomplete` | `cmdk` + Popover | P1 |
| `avatar.tsx` | `@base-ui/react/avatar` | `@radix-ui/react-avatar` | P0 |
| `badge.tsx` | `mergeProps`/`useRender` | 纯 HTML + CVA | P0 |
| `breadcrumb.tsx` | `mergeProps`/`useRender` | 纯 HTML nav | P0 |
| `button.tsx` | `mergeProps`/`useRender` | 原生 button + Radix Slot | P0 |
| `card.tsx` | `mergeProps`/`useRender` | 纯 HTML div | P0 |
| `checkbox.tsx` | `@base-ui/react/checkbox` | `@radix-ui/react-checkbox` | P0 |
| `checkbox-group.tsx` | `@base-ui/react/checkbox-group` | 自定义组合 | P1 |
| `collapsible.tsx` | `@base-ui/react/collapsible` | `@radix-ui/react-collapsible` | P0 |
| `combobox.tsx` | `@base-ui/react/combobox` | `cmdk` + Popover | P1 |
| `command.tsx` | `@base-ui/react/dialog` + autocomplete | `cmdk` | P1 |
| `dialog.tsx` | `@base-ui/react/dialog` | `@radix-ui/react-dialog` | P0 |
| `field.tsx` | `@base-ui/react/field` | 纯 HTML | P1 |
| `fieldset.tsx` | `@base-ui/react/fieldset` | 纯 HTML | P1 |
| `form.tsx` | `@base-ui/react/form` | 纯 HTML + react-hook-form | P1 |
| `group.tsx` | `mergeProps`/`useRender` | 纯 HTML div | P0 |
| `input.tsx` | `@base-ui/react/input` | 原生 input | P0 |
| `label.tsx` | `mergeProps`/`useRender` | `@radix-ui/react-label` | P0 |
| `menu.tsx` | `@base-ui/react/menu` | `@radix-ui/react-dropdown-menu` | P0 |
| `meter.tsx` | `@base-ui/react/meter` | 纯 HTML meter | P1 |
| `number-field.tsx` | `@base-ui/react/number-field` | 自定义 Input 组合 | P1 |
| `pagination.tsx` | `mergeProps`/`useRender` | 纯 HTML nav | P0 |
| `popover.tsx` | `@base-ui/react/popover` | `@radix-ui/react-popover` | P0 |
| `preview-card.tsx` | `@base-ui/react/preview-card` | Radix Popover 降级 | P2 |
| `progress.tsx` | `@base-ui/react/progress` | `@radix-ui/react-progress` | P0 |
| `radio-group.tsx` | `@base-ui/react/radio` + `/radio-group` | `@radix-ui/react-radio-group` | P0 |
| `scroll-area.tsx` | `@base-ui/react/scroll-area` | `@radix-ui/react-scroll-area` | P0 |
| `select.tsx` | `@base-ui/react/select` | `@radix-ui/react-select` | P0 |
| `separator.tsx` | `@base-ui/react/separator` | `@radix-ui/react-separator` | P0 |
| `sheet.tsx` | `@base-ui/react/dialog` | `@radix-ui/react-dialog` + 侧边样式 | P0 |
| `sidebar.tsx` | `mergeProps`/`useRender` + Sheet | 移除 BaseUI util，保留自定义逻辑 | P0 |
| `slider.tsx` | `@base-ui/react/slider` | `@radix-ui/react-slider` | P0 |
| `switch.tsx` | `@base-ui/react/switch` | `@radix-ui/react-switch` | P0 |
| `tabs.tsx` | `@base-ui/react/tabs` | `@radix-ui/react-tabs` | P0 |
| `textarea.tsx` | `@base-ui/react/field` | 原生 textarea | P0 |
| `toast.tsx` | `@base-ui/react/toast` | `sonner` | P0 |
| `toggle.tsx` | `@base-ui/react/toggle` | `@radix-ui/react-toggle` | P0 |
| `toggle-group.tsx` | `@base-ui/react/toggle-group` | `@radix-ui/react-toggle-group` | P0 |
| `toolbar.tsx` | `@base-ui/react/toolbar` | `@radix-ui/react-toolbar` | P1 |

---

## 超出范围

- 不改变组件的视觉设计语言（颜色系统、主题变量）
- 不修改 TailwindCSS 配置（保留 v4）
- 不迁移到 `shadcn/ui` CLI 工具链（保持手动复制组件到 `src/components/ui/` 的方式）
- 不变更路由结构、认证逻辑、支付逻辑
- 不修改 `src/database/`、`src/lib/auth/`、`src/lib/payments/` 等非 UI 目录
- 不替换 `lucide-react` 图标库
- 不在此阶段添加新 UI 功能
