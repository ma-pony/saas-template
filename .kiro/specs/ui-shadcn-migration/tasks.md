# 实现任务

## 概述

本任务列表按依赖关系排序，从底层基础依赖开始，逐步迁移到复杂的复合组件。每个任务包含明确的验收标准和实现指导。

---

## 第一阶段：环境准备

### T01：更新依赖包
**优先级**：P0 | **需求映射**：FR-01、FR-10

**实现步骤**：
1. 在 `package.json` 的 `dependencies` 中添加以下 Radix UI 子包：
   - `@radix-ui/react-accordion`
   - `@radix-ui/react-alert-dialog`
   - `@radix-ui/react-avatar`
   - `@radix-ui/react-checkbox`
   - `@radix-ui/react-collapsible`
   - `@radix-ui/react-dialog`
   - `@radix-ui/react-dropdown-menu`
   - `@radix-ui/react-label`
   - `@radix-ui/react-popover`
   - `@radix-ui/react-progress`
   - `@radix-ui/react-radio-group`
   - `@radix-ui/react-scroll-area`
   - `@radix-ui/react-select`
   - `@radix-ui/react-separator`
   - `@radix-ui/react-slider`
   - `@radix-ui/react-slot`
   - `@radix-ui/react-switch`
   - `@radix-ui/react-tabs`
   - `@radix-ui/react-toggle`
   - `@radix-ui/react-toggle-group`
   - `@radix-ui/react-toolbar`
   - `@radix-ui/react-tooltip`
   - `sonner`（Toast 替代）
   - `cmdk`（Command/Combobox 替代）
2. 验证各包与 React 19 的 peer dependency 兼容性
3. 运行 `bun install`

**验收标准**：
- `bun install` 执行无错误
- 所有 `@radix-ui/*` 包已在 `node_modules` 中可用

---

## 第二阶段：工具类组件（无外部 UI 依赖）

### T02：迁移 Button 组件
**优先级**：P0 | **需求映射**：FR-02 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/button.tsx`
2. 移除 `import { mergeProps } from '@base-ui/react/merge-props'` 和 `import { useRender } from '@base-ui/react/use-render'`
3. 添加 `import { Slot } from '@radix-ui/react-slot'`
4. 将 `ButtonProps` 改为继承 `React.ButtonHTMLAttributes<HTMLButtonElement>`，新增 `asChild?: boolean`，移除 `render` prop
5. 实现：当 `asChild=true` 时渲染 `<Slot>`，否则渲染 `<button>`
6. 保留所有 CVA 变体（`variant`、`size`）定义不变
7. 移除 `[data-pressed]` 相关样式，改为 `data-[state=on]` 或 `active:` 伪类（视使用场景）

**验收标准**：
- 组件文件不含任何 `@base-ui` import
- `asChild` prop 正常工作（渲染子组件根元素）
- 所有现有 variant/size 在浏览器中视觉正确
- `buttonVariants` 函数仍可独立导出使用

### T03：迁移 Label 组件
**优先级**：P0 | **需求映射**：FR-02 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/label.tsx`
2. 移除 `mergeProps`/`useRender`
3. 改用 `@radix-ui/react-label`：`import * as LabelPrimitive from '@radix-ui/react-label'`
4. 将组件改为 Radix Label 的封装，保留相同的 `className` 样式

**验收标准**：
- 不含 `@base-ui` import
- 与 HTML `<input>` 的 `htmlFor` 关联正常工作

### T04：迁移纯样式组件（Badge、Card、Group、Breadcrumb、Pagination）
**优先级**：P0 | **需求映射**：FR-02 | **依赖**：T01

**实现步骤**（逐个文件）：

**badge.tsx**：
1. 移除 `mergeProps`/`useRender`
2. 改为：`const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(...)` 或纯函数组件
3. 保留所有 CVA 变体

**card.tsx**：
1. 移除 `mergeProps`/`useRender`
2. 各子组件（`CardHeader`、`CardContent` 等）改为接受 `React.ComponentProps<'div'>` 的纯函数

**group.tsx**：
1. 移除 `mergeProps`/`useRender`
2. 改为原生 div 封装，保留 `data-slot` 属性

**breadcrumb.tsx**：
1. 移除 `mergeProps`/`useRender`
2. 改为原生 `<nav>`、`<ol>`、`<li>`、`<a>` 封装

**pagination.tsx**：
1. 移除 `mergeProps`/`useRender`
2. 改为原生 `<nav>` 封装，保留现有 API

**验收标准**：
- 以上文件不含 `@base-ui` import
- 组件在营销页（pricing.tsx、hero.tsx 等）正常渲染

### T05：迁移 Separator 组件
**优先级**：P0 | **需求映射**：FR-06 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/separator.tsx`
2. 将 `@base-ui/react/separator` 替换为 `@radix-ui/react-separator`
3. 保留 `orientation` prop 和现有样式

**验收标准**：不含 `@base-ui` import，水平/垂直方向分隔线正常渲染

---

## 第三阶段：基础表单控件

### T06：迁移 Checkbox 组件
**优先级**：P0 | **需求映射**：FR-05 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/checkbox.tsx`
2. 替换 `@base-ui/react/checkbox` 为 `@radix-ui/react-checkbox`
3. 映射状态：`data-checked` → `data-[state=checked]`，`data-unchecked` → `data-[state=unchecked]`，`data-indeterminate` → `data-[state=indeterminate]`
4. `CheckboxPrimitive.Indicator` → `Checkbox.Indicator`，内联 SVG 保留
5. 移除 `render` prop 用法（Radix Indicator 不支持此模式，改为条件渲染）

**验收标准**：
- checked/unchecked/indeterminate 三态视觉正确
- disabled 状态正确
- 不含 `@base-ui` import

### T07：迁移 RadioGroup 组件
**优先级**：P0 | **需求映射**：FR-05 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/radio-group.tsx`
2. 替换 `@base-ui/react/radio` 和 `/radio-group` 为 `@radix-ui/react-radio-group`
3. `RadioPrimitive.Root` → `RadioGroup.Item`（Radix 的单个 Radio 是 `Item`）
4. 映射：`data-checked` → `data-[state=checked]`
5. 导出：保留 `Radio`、`RadioGroup`、`RadioGroupItem` 别名

**验收标准**：选择/取消选择功能正常，视觉样式正确

### T08：迁移 Switch 组件
**优先级**：P0 | **需求映射**：FR-05 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/switch.tsx`
2. 替换 `@base-ui/react/switch` 为 `@radix-ui/react-switch`
3. 映射：`data-checked` → `data-[state=checked]`，`data-unchecked` → `data-[state=unchecked]`
4. Thumb 的 translate 动画保留，通过 `data-[state=checked]` 选择器驱动

**验收标准**：开关切换动画正常，样式正确

### T09：迁移 Slider 组件
**优先级**：P0 | **需求映射**：FR-05 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/slider.tsx`
2. 替换 `@base-ui/react/slider` 为 `@radix-ui/react-slider`
3. 映射：`SliderPrimitive.Control` → `Slider.Track` 容器（Radix 无 Control 概念）
4. `SliderPrimitive.Track` → `Slider.Track`
5. `SliderPrimitive.Indicator` → `Slider.Range`
6. `SliderPrimitive.Thumb` → `Slider.Thumb`（Radix 按 `value` 数组自动渲染多个 Thumb）
7. 移除手动的 `Array.from` 生成 Thumb 逻辑
8. `data-dragging` → `data-[disabled]` / focus 状态样式

**验收标准**：单值/多值 Slider 拖拽正常，视觉样式正确

### T10：迁移 Progress 组件
**优先级**：P0 | **需求映射**：FR-05 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/progress.tsx`
2. 替换 `@base-ui/react/progress` 为 `@radix-ui/react-progress`
3. `ProgressPrimitive.Root` → `Progress.Root`（`value` prop 相同）
4. `ProgressPrimitive.Track` → 包装 div（Radix Progress.Root 本身是容器）
5. `ProgressPrimitive.Indicator` → `Progress.Indicator`（样式通过 CSS `width` 驱动）
6. 注意：Radix Progress 无 `Label` 和 `Value` 子组件，改为自定义 div 实现

**验收标准**：进度条填充动画正常，`value` prop 驱动宽度

---

## 第四阶段：输入类组件

### T11：迁移 Input 组件
**优先级**：P0 | **需求映射**：FR-05 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/input.tsx`
2. 移除 `import { Input as InputPrimitive } from '@base-ui/react/input'`
3. 将 `<InputPrimitive>` 替换为原生 `<input ref={ref}`（添加 `React.forwardRef`）
4. 保留外层 `<span>` 容器结构（消费组件依赖此 DOM 结构）
5. 保留 `data-slot` 属性

**验收标准**：
- 输入、placeholder、disabled、类型（text/email/password/file/search）均正常
- `ref` forwarding 正常工作

### T12：迁移 Textarea 组件
**优先级**：P0 | **需求映射**：FR-05 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/textarea.tsx`
2. 移除 `@base-ui/react/field` 依赖（该文件仅用于 Field API）
3. 改为原生 `<textarea ref={ref}>` 封装
4. 保留现有样式类（`aria-invalid` 状态样式等）

**验收标准**：textarea 输入、resize、disabled 状态正常

### T13：迁移 Select 组件
**优先级**：P0 | **需求映射**：FR-05 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/select.tsx`
2. 替换 `@base-ui/react/select` 为 `@radix-ui/react-select`
3. 重新实现层次结构：`Root → Trigger → Value + Icon → Portal → Content → ScrollUpButton → Viewport → Item → ItemText + ItemIndicator → ScrollDownButton`
4. 将 `SelectPopup` 改为封装 `Select.Portal` + `Select.Content`
5. `SelectPrimitive.ScrollUpArrow/DownArrow` → `Select.ScrollUpButton/ScrollDownButton`
6. `SelectPrimitive.List` → `Select.Viewport`
7. 保留导出别名：`SelectContent = SelectPopup`

**注意**：Radix Select 的 `Value` 必须是 `Trigger` 的子组件，而不是独立渲染。

**验收标准**：
- Select 打开/关闭/选择功能正常
- placeholder 文本正常显示
- 键盘导航正常（上下方向键、Enter、Escape）

### T14：迁移 Field / Fieldset / Form 组件
**优先级**：P1 | **需求映射**：FR-07 | **依赖**：T01

**实现步骤**：

**field.tsx**：
1. 移除 `@base-ui/react/field`
2. 改为纯 div 容器，使用 React Context 传递 `id` 和校验状态

**fieldset.tsx**：
1. 移除 `@base-ui/react/fieldset`
2. 改为原生 `<fieldset>` 封装

**form.tsx**：
1. 移除 `@base-ui/react/form`
2. 改为原生 `<form>` 封装（或与 react-hook-form 的 FormProvider 集成）

**验收标准**：表单校验状态（`aria-invalid`）正确传递，不含 `@base-ui` import

---

## 第五阶段：浮层类组件

### T15：迁移 Tooltip 组件
**优先级**：P0 | **需求映射**：FR-04 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/tooltip.tsx`
2. 替换 `@base-ui/react/tooltip` 为 `@radix-ui/react-tooltip`
3. 新层次：`Provider → Root → Trigger → Portal → Content`
4. `TooltipPrimitive.Positioner` → 集成在 `Tooltip.Content` 的 `side`/`align`/`sideOffset` props
5. `TooltipPrimitive.Viewport` → 移除（Radix 无此概念）
6. 动画：`data-starting-style:scale-98` → `data-[state=closed]:scale-95 data-[state=open]:scale-100`
7. 保留导出别名：`TooltipContent = TooltipPopup`
8. 移除 `TooltipCreateHandle`（Radix 无等效，可保留为空导出）

**验收标准**：Tooltip 在 hover/focus 时弹出，side/align props 正常工作

### T16：迁移 Popover 组件
**优先级**：P0 | **需求映射**：FR-04 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/popover.tsx`
2. 替换 `@base-ui/react/popover` 为 `@radix-ui/react-popover`
3. 新层次：`Root → Trigger → Portal → Content + Close + Title + Description`
4. `PopoverPrimitive.Positioner` + `Popup` → `Popover.Content`（side/align/sideOffset 作为 Content 的 props）
5. `PopoverPrimitive.Viewport` → 移除
6. 动画适配：同 Tooltip
7. 保留 `tooltipStyle` prop（通过条件 className 实现）
8. 保留导出别名：`PopoverContent = PopoverPopup`

**验收标准**：Popover 打开/关闭/位置控制正常

### T17：迁移 Menu (DropdownMenu) 组件
**优先级**：P0 | **需求映射**：FR-04 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/menu.tsx`
2. 替换 `@base-ui/react/menu` 为 `@radix-ui/react-dropdown-menu`
3. 映射所有子组件（参见设计文档第 5 节）
4. 子菜单：`SubmenuRoot` → `DropdownMenu.Sub`，`SubmenuTrigger` → `DropdownMenu.SubTrigger`，子 Popup → `DropdownMenu.SubContent`
5. `data-highlighted` → `data-[highlighted]` 或 `focus:` 伪类（Radix 使用 `data-[highlighted]`）
6. `data-variant=destructive` 改为通过 className 传递
7. 保留所有 `DropdownMenu*` 别名导出

**验收标准**：菜单打开/关闭，子菜单，Checkbox/Radio 菜单项，键盘导航均正常

---

## 第六阶段：对话框类组件

### T18：迁移 Dialog 组件
**优先级**：P0 | **需求映射**：FR-03 | **依赖**：T02（Button）

**实现步骤**：
1. 修改 `src/components/ui/dialog.tsx`
2. 替换 `@base-ui/react/dialog` 为 `@radix-ui/react-dialog`
3. 新层次：`Root → Portal → Overlay → Content`（参见设计文档第 2 节）
4. 合并 `DialogViewport` + `DialogPopup` 为单一 `DialogContent` 组件
5. 遮罩（`DialogOverlay`）：`fixed inset-0 bg-black/50 backdrop-blur-sm`
6. 动画：`data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0`
7. 关闭按钮仍使用 `<Dialog.Close>` + `<Button size='icon' variant='ghost'>`（已迁移的 Button）
8. 保留所有导出别名

**验收标准**：
- Dialog 打开/关闭/ESC 键/遮罩点击关闭正常
- 焦点陷阱在 Dialog 内正常工作
- 动画效果流畅

### T19：迁移 AlertDialog 组件
**优先级**：P0 | **需求映射**：FR-03 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/alert-dialog.tsx`
2. 替换 `@base-ui/react/alert-dialog` 为 `@radix-ui/react-alert-dialog`
3. 层次与 Dialog 相同，但不允许点击遮罩关闭（AlertDialog 语义要求显式操作）
4. 保留所有导出别名

**验收标准**：AlertDialog 无法通过点击遮罩关闭，ESC 键也无法关闭（除非显式配置）

### T20：迁移 Sheet 组件
**优先级**：P0 | **需求映射**：FR-03 | **依赖**：T18（依赖 Dialog 迁移完成作为参考）

**实现步骤**：
1. 修改 `src/components/ui/sheet.tsx`
2. 替换 `@base-ui/react/dialog` 为 `@radix-ui/react-dialog`
3. Sheet 与 Dialog 共用同一套 Radix Dialog 原语，通过 `side` prop 控制滑入方向
4. 侧边动画（以右侧为例）：`data-[state=open]:translate-x-0 data-[state=closed]:translate-x-full transition-transform`
5. 保留 `inset` prop 和圆角样式
6. 保留所有导出别名

**验收标准**：四个方向（top/bottom/left/right）的抽屉打开/关闭动画正常

---

## 第七阶段：导航布局类组件

### T21：迁移 Tabs 组件
**优先级**：P0 | **需求映射**：FR-06 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/tabs.tsx`
2. 替换 `@base-ui/react/tabs` 为 `@radix-ui/react-tabs`
3. `TabsPrimitive.Tab` → `Tabs.Trigger`（Radix 命名为 Trigger）
4. `TabsPrimitive.Panel` → `Tabs.Content`
5. 移除 `TabsPrimitive.Indicator`，改用 `data-[state=active]` 样式实现选中效果
6. `underline` 变体：在 active Trigger 上添加 `border-b-2 border-primary`
7. `default` 变体：在 active Trigger 上添加背景色
8. 保留导出别名：`TabsTrigger = TabsTab`、`TabsContent = TabsPanel`

**验收标准**：Tab 切换正常，两种变体样式正确，键盘导航正常

### T22：迁移 Accordion 组件
**优先级**：P0 | **需求映射**：FR-06 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/accordion.tsx`
2. 替换 `@base-ui/react/accordion` 为 `@radix-ui/react-accordion`
3. `AccordionPrimitive.Header` → `Accordion.Header`（Radix 有此组件）
4. `AccordionPrimitive.Trigger` → `Accordion.Trigger`
5. `AccordionPrimitive.Panel` → `Accordion.Content`
6. 高度动画：使用 CSS 变量 `--radix-accordion-content-height`：
   ```css
   data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden
   ```
7. 在全局 CSS 中添加 `accordion-down`/`accordion-up` keyframes（或在 `tailwind.css` 中）
8. 保留 `AccordionContent = AccordionPanel` 别名

**验收标准**：展开/折叠动画流畅，不含 `@base-ui` import

### T23：迁移 Collapsible 组件
**优先级**：P0 | **需求映射**：FR-06 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/collapsible.tsx`
2. 替换 `@base-ui/react/collapsible` 为 `@radix-ui/react-collapsible`
3. `CollapsiblePrimitive.Panel` → `Collapsible.Content`
4. 高度动画：同 Accordion，使用 `--radix-collapsible-content-height`
5. 保留 `CollapsibleContent = CollapsiblePanel` 别名

**验收标准**：展开/折叠高度过渡动画正常

### T24：迁移 Scroll Area 组件
**优先级**：P0 | **需求映射**：FR-06 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/scroll-area.tsx`
2. 替换 `@base-ui/react/scroll-area` 为 `@radix-ui/react-scroll-area`
3. 保留 `scrollFade` prop（CSS mask 逻辑可保留，但需检查 Radix Viewport 是否兼容）
4. 映射状态：`data-hovering/data-scrolling` → `data-[state=visible]`（Radix Scrollbar 使用此状态）
5. `scrollbarGutter` prop 的实现需检查 Radix Viewport 数据属性

**验收标准**：滚动条出现/消失动画正常，滚动功能正常

### T25：迁移 Avatar 组件
**优先级**：P0 | **需求映射**：FR-06 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/avatar.tsx`
2. 替换 `@base-ui/react/avatar` 为 `@radix-ui/react-avatar`
3. 层次：`Avatar.Root → Avatar.Image + Avatar.Fallback`（与 BaseUI 相同概念）
4. 检查现有样式与 Radix 状态属性的兼容性

**验收标准**：头像图片加载、fallback 显示正常

### T26：迁移 Toggle 和 ToggleGroup 组件
**优先级**：P0 | **需求映射**：FR-06 | **依赖**：T01

**实现步骤**：

**toggle.tsx**：
1. 替换 `@base-ui/react/toggle` 为 `@radix-ui/react-toggle`
2. `data-pressed` → `data-[state=on]`（Radix Toggle 使用 `on`/`off` 状态）

**toggle-group.tsx**：
1. 替换 `@base-ui/react/toggle-group` 为 `@radix-ui/react-toggle-group`
2. `type` prop：`'single' | 'multiple'`（与 BaseUI 相同）
3. 导出：`ToggleGroupItem` 别名保留

**验收标准**：Toggle 按下/释放状态正确，ToggleGroup 单选/多选正常

### T27：迁移 Toolbar 组件
**优先级**：P1 | **需求映射**：FR-06 | **依赖**：T26（Toggle 完成后）

**实现步骤**：
1. 修改 `src/components/ui/toolbar.tsx`
2. 替换 `@base-ui/react/toolbar` 为 `@radix-ui/react-toolbar`
3. 映射子组件：`Toolbar.Root`、`Toolbar.Button`、`Toolbar.Separator`、`Toolbar.Link`
4. `Toolbar.ToggleGroup` → `Toolbar.ToggleGroup`（Radix Toolbar 内置 ToggleGroup 支持）

**验收标准**：Toolbar 键盘导航（箭头键）正常

---

## 第八阶段：特殊/复杂组件

### T28：迁移 Toast → Sonner
**优先级**：P0 | **需求映射**：FR-07 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/toast.tsx`
2. 移除所有 `@base-ui/react/toast` 代码
3. 新实现：
   ```tsx
   export { toast, Toaster } from 'sonner'
   ```
4. 提供兼容层 `toastManager`：
   ```tsx
   export const toastManager = {
     add: (opts: { title?: string; description?: string; type?: string; actionProps?: any }) => {
       const { title, description, type, actionProps } = opts
       const options = {
         description,
         action: actionProps ? { label: actionProps.children, onClick: actionProps.onClick } : undefined,
       }
       switch (type) {
         case 'success': return toast.success(title, options)
         case 'error': return toast.error(title, options)
         case 'warning': return toast.warning(title, options)
         case 'info': return toast.info(title, options)
         case 'loading': return toast.loading(title, options)
         default: return toast(title ?? '', options)
       }
     },
   }
   export const anchoredToastManager = toastManager // 简化版，不支持 anchor
   ```
5. 修改 `src/app/layout.tsx`：
   - 移除 `<ToastProvider>` 包裹
   - 添加 `<Toaster position="bottom-right" richColors />` 到 body

**验收标准**：
- `toastManager.add({ type: 'success', title: '...' })` 正常触发 toast
- Toast 在页面右下角显示，有 success/error/warning 颜色区分
- `layout.tsx` 正确集成 Sonner Toaster

### T29：迁移 Command 组件（基于 cmdk）
**优先级**：P1 | **需求映射**：FR-07 | **依赖**：T18（Dialog，用于 CommandDialog）

**实现步骤**：
1. 修改 `src/components/ui/command.tsx`
2. 移除 `@base-ui/react/dialog` 和 autocomplete 依赖
3. 改用 `cmdk`：
   ```tsx
   import { Command as CommandPrimitive } from 'cmdk'
   ```
4. 实现标准 Shadcn Command 组件结构：
   - `Command`（根）
   - `CommandInput`（搜索输入）
   - `CommandList`（列表容器）
   - `CommandEmpty`（空状态）
   - `CommandGroup`（分组）
   - `CommandItem`（选项）
   - `CommandSeparator`（分隔线）
   - `CommandDialog`（Dialog 内嵌 Command）
5. 保留现有公开 API 的兼容性

**验收标准**：Command 搜索过滤、键盘导航（上下键）、选择功能正常

### T30：迁移 Combobox 和 Autocomplete 组件
**优先级**：P1 | **需求映射**：FR-07 | **依赖**：T29（cmdk）、T16（Popover）

**实现步骤**：

**autocomplete.tsx**：
1. 移除 `@base-ui/react/autocomplete`
2. 基于 `cmdk` + Radix Popover 重写
3. 保留现有 API（`Autocomplete`、`AutocompleteInput`、`AutocompleteList`、`AutocompleteItem`、`AutocompleteEmpty`、`AutocompleteGroup` 等）

**combobox.tsx**：
1. 移除 `@base-ui/react/combobox`
2. 基于迁移后的 `autocomplete` 或直接使用 `cmdk` + Popover 重写
3. 保留 `multiple` 模式、chips 功能

**验收标准**：
- 单选/多选模式正常
- 搜索过滤实时生效
- chips（多选标签）显示和删除正常

### T31：迁移 Sidebar 组件
**优先级**：P0 | **需求映射**：FR-08 | **依赖**：T02（Button）、T20（Sheet）、T15（Tooltip）、T11（Input）

**实现步骤**：
1. 修改 `src/components/ui/sidebar.tsx`
2. 移除 `mergeProps`/`useRender` 依赖（`@base-ui/react/merge-props`、`@base-ui/react/use-render`）
3. 将使用 `useRender` 的组件（如 `SidebarMenuButton`）改为 `asChild` 模式：
   ```tsx
   import { Slot } from '@radix-ui/react-slot'

   function SidebarMenuButton({ asChild, ...props }) {
     const Comp = asChild ? Slot : 'button'
     return <Comp data-slot='sidebar-menu-button' {...props} />
   }
   ```
4. 确认内部依赖（Sheet、Tooltip、Input、Button）已迁移完成后此组件自动兼容
5. 保留完整的 `SidebarProvider`、`useSidebar`、Cookie 状态持久化逻辑

**验收标准**：
- 桌面端 Sidebar 折叠/展开正常，Cookie 状态持久化
- 移动端 Sheet 模式正常
- `b` 键快捷键触发正常
- `SidebarMenuButton` 的 `asChild` 模式正常（渲染子组件根元素）

### T32：迁移 CheckboxGroup 组件
**优先级**：P1 | **需求映射**：FR-07 | **依赖**：T06（Checkbox）

**实现步骤**：
1. 修改 `src/components/ui/checkbox-group.tsx`
2. 移除 `@base-ui/react/checkbox-group`
3. `CheckboxGroup` 改为自定义 React Context 实现，管理多个 Checkbox 的 checked 状态

**验收标准**：CheckboxGroup 批量选择/取消选择功能正常

### T33：迁移 NumberField 组件
**优先级**：P1 | **需求映射**：FR-07 | **依赖**：T11（Input）

**实现步骤**：
1. 修改 `src/components/ui/number-field.tsx`
2. 移除 `@base-ui/react/number-field`
3. 改为原生 `<input type='number'>` + 增减按钮组合
4. 使用 React state 管理数值，实现 `min`/`max`/`step` 约束
5. 保留 `NumberFieldGroup`、`NumberFieldInput`、`NumberFieldDecrement`、`NumberFieldIncrement` 等子组件
6. `ScrubArea` 功能可简化为不实现（该功能较小众）

**验收标准**：数值增减、min/max 约束、输入校验正常

### T34：迁移 Meter 组件
**优先级**：P1 | **需求映射**：FR-07 | **依赖**：T01

**实现步骤**：
1. 修改 `src/components/ui/meter.tsx`
2. 移除 `@base-ui/react/meter`
3. 改为原生 HTML `<meter>` 元素封装，或与 Progress 类似的纯 div 实现
4. 保留 `value`、`min`、`max`、`low`、`high`、`optimum` props

**验收标准**：Meter 值域显示正确

### T35：迁移 PreviewCard 组件
**优先级**：P2 | **需求映射**：FR-07 | **依赖**：T16（Popover）

**实现步骤**：
1. 修改 `src/components/ui/preview-card.tsx`
2. 移除 `@base-ui/react/preview-card`
3. 降级为 Radix Popover 实现（hover 触发的卡片预览）
4. 用 `onOpenChange` + `open` 配合 `hover` 事件实现 hover 触发

**验收标准**：hover 时预览卡片显示，移开时关闭

---

## 第九阶段：资源清理与验收

### T36：更新页面层消费代码
**优先级**：P1 | **需求映射**：FR-09 | **依赖**：T28（Toast）

**实现步骤**：
1. 搜索所有使用 `toastManager.add()` 的文件，逐一更新为 `toast.success()`/`toast.error()` 等 Sonner API
2. 检查 `src/app/(site)/hero.tsx` 中的 `base-ui.svg` 图片引用，替换为 Shadcn 相关资源或移除
3. 检查 `src/app/(site)/features.tsx` 中的 logo 引用
4. 检查认证页面（login/register/reset-password/verify）是否因 Input/Button API 变化需要更新

**验收标准**：所有页面编译无 `@base-ui` 相关错误

### T37：移除 @base-ui/react 依赖并最终验收
**优先级**：P0 | **需求映射**：FR-10 | **依赖**：T02～T35（所有组件迁移完成）

**实现步骤**：
1. 从 `package.json` 中删除 `@base-ui/react` 条目
2. 运行 `bun install`
3. 运行全局搜索确认无文件仍在 import `@base-ui`：
   ```
   grep -r "@base-ui" src/
   ```
4. 运行 `bun build`
5. 运行 `bun run typecheck`
6. 运行 `bun lint`
7. 手动浏览器测试所有主要功能流程（参见设计文档测试验证方案）

**验收标准**：
- `grep -r "@base-ui" src/` 返回空结果
- `bun build` 成功，无构建错误
- `bun run typecheck` 无新增类型错误
- `bun lint` 无新增 lint 错误
- 所有主要功能页面在浏览器中正常工作

---

## 任务依赖图

```
T01（依赖安装）
  ├── T02（Button）
  │   └── T18（Dialog）→ T20（Sheet）
  │       └── T31（Sidebar）
  ├── T03（Label）
  ├── T04（Badge/Card/Group/Breadcrumb/Pagination）
  ├── T05（Separator）
  ├── T06（Checkbox）→ T32（CheckboxGroup）
  ├── T07（RadioGroup）
  ├── T08（Switch）
  ├── T09（Slider）
  ├── T10（Progress）
  ├── T11（Input）→ T33（NumberField）
  ├── T12（Textarea）
  ├── T13（Select）
  ├── T14（Field/Fieldset/Form）
  ├── T15（Tooltip）→ T31（Sidebar）
  ├── T16（Popover）→ T30（Combobox/Autocomplete）、T35（PreviewCard）
  ├── T17（Menu/DropdownMenu）
  ├── T19（AlertDialog）
  ├── T21（Tabs）
  ├── T22（Accordion）
  ├── T23（Collapsible）
  ├── T24（ScrollArea）
  ├── T25（Avatar）
  ├── T26（Toggle/ToggleGroup）→ T27（Toolbar）
  ├── T28（Toast/Sonner）→ T36（页面清理）
  └── T29（Command/cmdk）→ T30（Combobox/Autocomplete）

T02~T35 全部完成 → T37（移除依赖 + 最终验收）
```

---

## 工作量估算

| 阶段 | 任务 | 预计工作量 |
|------|------|------------|
| 第一阶段 | T01 依赖安装 | 0.5h |
| 第二阶段 | T02-T05 工具类（5组件） | 2h |
| 第三阶段 | T06-T14 表单控件（9组件） | 4h |
| 第四阶段 | T15-T17 浮层类（3组件） | 2h |
| 第五阶段 | T18-T20 对话框类（3组件） | 2h |
| 第六阶段 | T21-T27 导航布局（7组件） | 3h |
| 第七阶段 | T28-T35 特殊复杂组件（8组件） | 6h |
| 第八阶段 | T36-T37 清理验收 | 1.5h |
| **合计** | **37个任务** | **~21h** |
