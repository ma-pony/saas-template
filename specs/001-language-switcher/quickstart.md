# 快速开始：语言切换功能

## 前置条件

- Bun 运行时已安装
- 项目可正常 `bun dev` 启动
- `src/messages/*.json` 翻译文件存在（en、es、fr、zh）

## 开发步骤

### 1. 创建 LanguageSwitcher 组件

在 `src/components/language-switcher.tsx` 创建客户端组件：
- 使用 `Globe` 图标（lucide-react）
- 使用 `DropdownMenu`（`src/components/ui/menu.tsx`）
- 获取当前 locale（通过 `usePathname` 或 prop）
- 切换时：设置 cookie + `router.push()` 到新路径

### 2. 集成到三个区域

- **营销 Navbar**：修改 `src/app/(site)/navbar.tsx`，在 GitHub 图标旁添加
- **Auth 页面**：修改 `src/app/[locale]/(auth)/layout.tsx`，右上角绝对定位
- **Main 应用**：修改 `src/app/[locale]/(main)/layout.tsx`，添加顶部导航栏或右上角

### 3. 迁移 Blog 到 locale 路由

- 将 `src/app/(site)/blog/` 移至 `src/app/[locale]/blog/`
- 删除 blog layout 中的 `NextIntlClientProvider`（由上层 `[locale]/layout.tsx` 提供）
- 更新中间件 matcher：移除 `blog` 排除项
- 更新 `generateStaticParams` 为每个 locale 生成参数

### 4. 更新 i18n 配置

- 在 `src/lib/i18n/config.ts` 添加 `LOCALE_DISPLAY_NAMES` 映射

### 5. 验证

```bash
bun dev
# 访问 http://localhost:3000/en/dashboard — 点击语言切换器
# 访问 http://localhost:3000/en/login — 验证 auth 区域
# 访问 http://localhost:3000/en — 验证营销页面
# 访问 http://localhost:3000/en/blog — 验证迁移后的 blog
```

## 验证清单

- [ ] 所有 4 种语言可正常切换
- [ ] URL 路径保持不变（仅 locale 前缀替换）
- [ ] Cookie `NEXT_LOCALE` 正确写入
- [ ] 刷新后语言偏好保持
- [ ] Blog 页面在 `[locale]/blog/` 下正常渲染
- [ ] hreflang 元标签正确输出
- [ ] 移动端菜单中语言切换可用
