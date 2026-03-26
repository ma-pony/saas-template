# 设计文档

## 概述

本文档描述将 ShipFree 模板的 UI 框架从 `@base-ui/react` 迁移到 Shadcn UI（Radix UI + TailwindCSS）的技术设计方案。迁移采用**逐组件替换**策略，最小化对上层消费代码的破坏，同时保持视觉和行为的等效性。

---

## 技术架构决策

### ADR-01：采用手动复制组件模式（非 CLI 生成）

**决策**：不使用 `shadcn/ui` CLI（`npx shadcn-ui add`），而是手动编写符合项目规范的组件文件。

**理由**：
- 项目使用 TailwindCSS v4（CLI 生成的代码基于 v3 语法，存在不兼容性）
- 现有 BaseUI 组件已有精心设计的自定义变体（如 Button 的 `destructive-outline`、size 系统），需要完整保留
- 项目代码风格（Biome、单引号、箭头函数）与 CLI 输出不匹配
- 手动复制可以精确控制每个组件的 API 设计

### ADR-02：保留现有设计 Token 和 CSS 变量

**决策**：不引入 Shadcn 默认主题，继续使用现有的 CSS 变量（`--color-primary`、`--color-background` 等）。

**理由**：
- 现有 TailwindCSS 4 配置已建立完整的颜色/尺寸 token 体系
- 替换库层即可，设计层不需要变动
- 避免全局视觉变化影响已有页面

### ADR-03：Toast 替换为 Sonner

**决策**：使用 `sonner` 替换 `@base-ui/react/toast`。

**理由**：
- Radix UI 没有 Toast 原语
- Shadcn 官方推荐的 Toast 方案已从自研迁移到 `sonner`
- Sonner 提供与现有 `toastManager` API 相似的命令式调用接口
- Sonner 内置位置控制、类型系统（success/error/info/loading）、action 支持

### ADR-04：Command/Combobox/Autocomplete 使用 cmdk

**决策**：使用 `cmdk` 库替换 BaseUI 的 `Combobox` 和 `Autocomplete`，`Command` 组件基于 `cmdk` 重写。

**理由**：
- Radix UI 不提供搜索/命令面板原语
- `cmdk` 是 Shadcn Command 组件的官方底层，已被大量项目验证
- 提供键盘导航、过滤、分组等完整功能

### ADR-05：迁移顺序——按依赖关系由底层到上层

**决策**：按以下顺序执行迁移，确保被依赖的组件先完成迁移：
1. 工具类（`button`、`label`、`separator`、`badge`、`card`）
2. 基础交互（`checkbox`、`radio-group`、`switch`、`slider`、`progress`）
3. 输入类（`input`、`textarea`、`select`、`number-field`）
4. 浮层类（`tooltip`、`popover`、`menu`）
5. 对话框类（`dialog`、`alert-dialog`、`sheet`）
6. 复合组件（`accordion`、`tabs`、`collapsible`、`scroll-area`、`avatar`）
7. 复杂组件（`toast`/Sonner、`command`/cmdk、`combobox`、`sidebar`）
8. 其余组件（`toggle`、`toggle-group`、`toolbar`、`breadcrumb`、`pagination`、`meter`、`field`、`fieldset`、`form`、`group`、`preview-card`）

---

## 组件设计详情

### 1. Button 组件重设计

**现有架构**：使用 `useRender` + `mergeProps` 实现 polymorphic render（可替换根元素）。

**新架构**：使用 `@radix-ui/react-slot` 的 `Slot` 组件实现 `asChild` 模式（Shadcn 标准模式）。

```tsx
// 新接口设计
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'destructive-outline' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'xs' | 'icon' | 'icon-sm' | 'icon-lg' | 'icon-xl' | 'icon-xs'
  asChild?: boolean  // 新增，替代原 render prop
}
```

**变体系统**：保留现有所有 CVA 变体定义，仅将触发机制从 `data-pressed` 适配到 `data-[state=active]`（Radix 约定）。

**API 变化**：
- 移除：`render` prop（BaseUI 专用）
- 新增：`asChild` prop（Radix Slot 模式）
- 保留：`variant`、`size`、`className` 及所有 HTML button 属性

### 2. Dialog 组件重设计

**现有架构**：BaseUI Dialog 有 `Root → Portal → Backdrop → Viewport → Popup` 层次结构，且有独特的 `data-starting-style`/`data-ending-style` 动画 API。

**新架构**：Radix Dialog 有 `Root → Portal → Overlay → Content` 层次结构，动画通过 `data-[state=open]`/`data-[state=closed]` 驱动。

**映射关系**：
```
DialogPrimitive.Root       → Dialog.Root
DialogPrimitive.Portal     → Dialog.Portal
DialogPrimitive.Backdrop   → Dialog.Overlay (fixed inset-0 backdrop)
DialogPrimitive.Viewport   → （集成到 Content 定位中）
DialogPrimitive.Popup      → Dialog.Content
DialogPrimitive.Title      → Dialog.Title
DialogPrimitive.Description → Dialog.Description
DialogPrimitive.Close      → Dialog.Close
DialogPrimitive.Trigger    → Dialog.Trigger
```

**动画迁移**：
- `data-starting-style:opacity-0` → `data-[state=closed]:opacity-0 data-[state=open]:opacity-100`
- `data-ending-style:scale-98` → `data-[state=closed]:scale-98`
- Radix 使用 CSS transition，无需 `will-change-transform` hack

**保留的导出别名**：`DialogContent = DialogPopup`、`DialogOverlay = DialogBackdrop`

### 3. Sheet 组件重设计

Sheet 是 Dialog 的变体（侧边抽屉）。在 Radix 中同样基于 `@radix-ui/react-dialog`，通过 `side` prop 控制方向。

**侧边动画**：
```css
/* 右侧抽屉 */
data-[state=closed]:translate-x-full data-[state=open]:translate-x-0

/* 左侧抽屉 */
data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0
```

### 4. Select 组件重设计

**现有架构**：BaseUI Select 有 `Root → Trigger → Icon → Portal → Positioner → Popup → ScrollUpArrow → List → Item → ItemIndicator → ItemText → ScrollDownArrow` 层次。

**新架构**：Radix Select 有 `Root → Trigger → Value → Icon → Portal → Content → ScrollUpButton → Viewport → Item → ItemText → ItemIndicator → ScrollDownButton`。

**关键 API 差异**：
- BaseUI 用 `SelectPopup`（包含 Positioner）；Radix 用 `SelectContent`（直接定位）
- BaseUI 的 `SelectValue` 是独立组件；Radix 的 `SelectValue` 是 `Trigger` 的子组件
- 保留导出别名：`SelectContent = SelectPopup`

### 5. Menu (DropdownMenu) 组件重设计

**映射关系**：
```
MenuPrimitive.Root          → DropdownMenu.Root
MenuPrimitive.Portal        → DropdownMenu.Portal
MenuPrimitive.Positioner    → （集成到 Content 中）
MenuPrimitive.Popup         → DropdownMenu.Content
MenuPrimitive.Trigger       → DropdownMenu.Trigger
MenuPrimitive.Item          → DropdownMenu.Item
MenuPrimitive.CheckboxItem  → DropdownMenu.CheckboxItem
MenuPrimitive.RadioGroup    → DropdownMenu.RadioGroup
MenuPrimitive.RadioItem     → DropdownMenu.RadioItem
MenuPrimitive.GroupLabel    → DropdownMenu.Label
MenuPrimitive.Separator     → DropdownMenu.Separator
MenuPrimitive.SubmenuRoot   → DropdownMenu.Sub
MenuPrimitive.SubmenuTrigger → DropdownMenu.SubTrigger
```

**子菜单**：Radix 用 `Sub` 包裹 `SubTrigger` + `SubContent`，与 BaseUI 的 `SubmenuRoot` 对应。

**保留所有 DropdownMenu 别名导出**（`DropdownMenu`、`DropdownMenuContent` 等）。

### 6. Toast → Sonner 迁移设计

**现有 API**：
```tsx
// 消费端当前用法
import { toastManager } from '@/components/ui/toast'
toastManager.add({ title: '成功', type: 'success' })
```

**新 API**（Sonner）：
```tsx
// 消费端新用法（需全局替换调用点）
import { toast } from 'sonner'
toast.success('成功')
toast.error('失败')
toast.loading('加载中')
```

**Provider 迁移**：
- 移除 `ToastProvider` 和 `AnchoredToastProvider` 包裹
- 在 `src/app/layout.tsx` 中添加 `<Toaster />` 组件（来自 `sonner`）
- `Toaster` 通过 props 配置位置、主题、样式

**toast.tsx 新导出**：
```tsx
export { toast } from 'sonner'
export { Toaster } from 'sonner'
// 兼容层：提供 toastManager 对象映射到 sonner API
export const toastManager = {
  add: (opts) => {
    if (opts.type === 'success') toast.success(opts.title, { description: opts.description })
    // ...等
  }
}
```

### 7. Accordion 组件重设计

**BaseUI 特殊命名** → **Radix 标准命名**：
```
AccordionPrimitive.Root     → Accordion.Root
AccordionPrimitive.Item     → Accordion.Item
AccordionPrimitive.Header   → Accordion.Header（Radix 有此组件）
AccordionPrimitive.Trigger  → Accordion.Trigger
AccordionPrimitive.Panel    → Accordion.Content
```

**动画迁移**：
- BaseUI 使用 `h-(--accordion-panel-height)` CSS 变量实现高度动画
- Radix 使用 `data-[state=open/closed]` + `overflow-hidden` + `h-0` / `h-auto` 实现
- 需添加 `data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up` CSS 动画

**保留导出别名**：`AccordionContent = AccordionPanel`

### 8. Tabs 组件重设计

**BaseUI 命名** → **Radix 命名**：
```
TabsPrimitive.Root  → Tabs.Root
TabsPrimitive.List  → Tabs.List
TabsPrimitive.Tab   → Tabs.Trigger（注意：BaseUI 叫 Tab，Radix 叫 Trigger）
TabsPrimitive.Panel → Tabs.Content
TabsPrimitive.Indicator → （移除，Radix 无 Indicator 概念，改用 active 状态样式）
```

**Indicator 动画**：BaseUI 有 CSS 变量驱动的 `TabsPrimitive.Indicator` 滑动效果。Radix 没有此组件，需改为：
- `underline` 变体：通过 `data-[state=active]` 的 border-bottom 样式实现
- `default` 变体：通过 `data-[state=active]` 的背景色切换实现（牺牲滑动动画）

**保留导出别名**：`TabsTrigger = TabsTab`、`TabsContent = TabsPanel`

### 9. Scroll Area 组件重设计

**映射关系**：
```
ScrollAreaPrimitive.Root      → ScrollArea.Root
ScrollAreaPrimitive.Viewport  → ScrollArea.Viewport
ScrollAreaPrimitive.Scrollbar → ScrollArea.Scrollbar
ScrollAreaPrimitive.Thumb     → ScrollArea.Thumb
ScrollAreaPrimitive.Corner    → ScrollArea.Corner
```

**功能差异**：
- BaseUI 支持 `scrollFade` 渐隐效果（通过 CSS mask）；Radix 无此功能，保留自定义 CSS 实现
- BaseUI 的 `data-hovering`/`data-scrolling` 状态 → Radix 的 `data-[state=visible]` 状态

### 10. Sidebar 组件迁移设计

Sidebar 是最复杂的组件，内部使用 `mergeProps`/`useRender`，依赖 Sheet、Tooltip、Input 等多个子组件。

**迁移策略**：
1. 将使用 `mergeProps`/`useRender` 的地方替换为 `asChild`（Radix Slot）或 `React.forwardRef`
2. 内部 Sheet 依赖在 sheet.tsx 完成迁移后自动解决
3. 内部 Tooltip 依赖在 tooltip.tsx 完成迁移后自动解决
4. 保留完整的 `SidebarProvider`、`useSidebar` context API

**useRender 替换模式**：
```tsx
// 原 BaseUI 模式
function SidebarMenuButton({ render, ...props }) {
  return useRender({ defaultTagName: 'button', props: mergeProps(defaultProps, props), render })
}

// 新 asChild 模式
function SidebarMenuButton({ asChild, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp {...defaultProps} {...props} />
}
```

### 11. Input 组件重设计

**现有**：BaseUI `Input` 包装在 `<span>` 容器中，通过 `data-slot` 实现样式关联。

**新设计**：保留 `<span>` 容器结构（许多消费组件依赖此 DOM 结构），但将 `InputPrimitive` 替换为原生 `<input>`。

```tsx
// 新实现（保留容器结构）
function Input({ className, size = 'default', unstyled = false, ref, ...props }: InputProps) {
  return (
    <span className={...} data-slot='input-control'>
      <input className={...} data-slot='input' ref={ref} {...props} />
    </span>
  )
}
```

### 12. Field / Fieldset / Form 组件重设计

这三个组件在 BaseUI 中有特殊的校验状态 API（`@base-ui/react/field` 的 `validity` 对象）。

**迁移策略**：改为纯 HTML 封装，与 `react-hook-form` 集成方式不变（通过 `aria-invalid` 属性传递）。

```tsx
// field.tsx 新实现
function FieldRoot({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-1.5', className)} data-slot='field' {...props} />
}
```

---

## 依赖变更方案

### 移除依赖
```
@base-ui/react (^1.0.0)
```

### 新增依赖
```json
{
  "@radix-ui/react-accordion": "^1.2.x",
  "@radix-ui/react-alert-dialog": "^1.1.x",
  "@radix-ui/react-avatar": "^1.1.x",
  "@radix-ui/react-checkbox": "^1.1.x",
  "@radix-ui/react-collapsible": "^1.1.x",
  "@radix-ui/react-dialog": "^1.1.x",
  "@radix-ui/react-dropdown-menu": "^2.1.x",
  "@radix-ui/react-label": "^2.1.x",
  "@radix-ui/react-popover": "^1.1.x",
  "@radix-ui/react-progress": "^1.1.x",
  "@radix-ui/react-radio-group": "^1.2.x",
  "@radix-ui/react-scroll-area": "^1.2.x",
  "@radix-ui/react-select": "^2.1.x",
  "@radix-ui/react-separator": "^1.1.x",
  "@radix-ui/react-slider": "^1.2.x",
  "@radix-ui/react-slot": "^1.1.x",
  "@radix-ui/react-switch": "^1.1.x",
  "@radix-ui/react-tabs": "^1.1.x",
  "@radix-ui/react-toggle": "^1.1.x",
  "@radix-ui/react-toggle-group": "^1.1.x",
  "@radix-ui/react-toolbar": "^1.1.x",
  "@radix-ui/react-tooltip": "^1.1.x",
  "sonner": "^1.5.x",
  "cmdk": "^1.0.x"
}
```

**注意**：版本号以实际 npm 最新稳定版为准，兼容 React 19。

---

## 文件影响范围

### 直接修改文件（src/components/ui/）
全部 44 个 UI 组件文件将被修改，具体影响参见需求文档的组件对照表。

### 可能需要修改的消费文件

| 文件 | 原因 |
|------|------|
| `src/app/layout.tsx` | Toast Provider → Sonner `<Toaster />` |
| `src/app/(site)/hero.tsx` | BaseUI logo 图片引用 |
| `src/app/(site)/features.tsx` | BaseUI logo 图片引用 |
| `src/app/(auth)/login/login-form.tsx` | 可能因 Input/Button API 变化需更新 |
| `src/app/(auth)/register/register-form.tsx` | 同上 |
| `src/app/(auth)/reset-password/reset-password-form.tsx` | 同上 |
| `src/app/(auth)/verify/verify-content.tsx` | 同上 |
| 其他使用 `toastManager.add()` 的文件 | 迁移到 `toast.success()` 等 Sonner API |

### 不受影响的文件
- `src/database/`
- `src/lib/auth/`
- `src/lib/payments/`
- `src/lib/messaging/`
- `src/config/`
- `src/messages/`（国际化文件）

---

## CSS 动画兼容方案

BaseUI 使用专有的 `data-starting-style`/`data-ending-style` 属性驱动动画（类似 CSS `@starting-style`）。Radix UI 使用 `data-[state=open]`/`data-[state=closed]` 属性。

**迁移规则**：
```
data-starting-style:opacity-0  →  data-[state=closed]:opacity-0 + transition-opacity
data-ending-style:opacity-0    →  data-[state=closed]:opacity-0
data-starting-style:scale-98   →  data-[state=closed]:scale-95
data-ending-style:scale-98     →  data-[state=closed]:scale-95
```

**Accordion/Collapsible 高度动画**：需在 `tailwind.config` 中添加 keyframes：
```css
/* 通过 TailwindCSS 4 的 @keyframes 语法 */
@keyframes accordion-down {
  from { height: 0 }
  to { height: var(--radix-accordion-content-height) }
}
@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height) }
  to { height: 0 }
}
```

---

## 风险与缓解措施

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Radix UI 与 React 19 不兼容 | 高 | 迁移前验证各 Radix 子包的 peer dependency |
| BaseUI `data-starting-style` 动画在 Radix 中无等效实现 | 中 | 改用 CSS transition + `data-[state]`，接受轻微动画差异 |
| Tabs Indicator 滑动动画丢失 | 低 | 该动画为增强效果，`data-[state=active]` 样式切换已足够 |
| `toastManager.add()` API 调用遍布代码库 | 中 | 提供兼容层包装，逐步替换 |
| Combobox/Autocomplete 功能复杂，`cmdk` 迁移成本高 | 高 | 在任务中单独列为独立任务，优先级 P1 |
| TailwindCSS v4 与 Radix 的 CSS 变量命名冲突 | 低 | Radix CSS 变量使用 `--radix-*` 前缀，不冲突 |

---

## 测试验证方案

迁移完成后，通过以下手动测试验收：

1. **登录/注册流程**：表单输入、验证错误状态、提交
2. **Toast 通知**：success/error/warning/loading 类型，action 按钮
3. **导航菜单**：DropdownMenu 打开/关闭，键盘导航
4. **对话框**：Dialog/AlertDialog 打开/关闭/ESC，焦点陷阱
5. **抽屉**：Sheet 四个方向的打开/关闭
6. **Sidebar**：桌面端折叠/展开，移动端 Sheet 模式
7. **Select/Combobox**：选项列表，搜索过滤，键盘选择
8. **复选框/单选/开关**：受控状态切换
9. **Tabs/Accordion/Collapsible**：展开/折叠动画
10. **构建验证**：`bun build` 通过，无类型错误（`bun run typecheck`）
