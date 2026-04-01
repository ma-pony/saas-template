# 数据模型：语言切换功能

本功能不涉及数据库变更。语言偏好通过客户端 cookie 持久化。

## 实体

### Locale（已有）

**定义**：`src/lib/i18n/config.ts`

| 属性 | 类型 | 描述 |
|------|------|------|
| code | `SupportedLocale` | 语言代码：`'en' \| 'es' \| 'fr' \| 'zh'` |
| langTag | `string` | BCP 47 标签（用于 hreflang）|

### 语言偏好（Cookie）

| 属性 | 值 |
|------|-----|
| Cookie 名称 | `NEXT_LOCALE` |
| 有效期 | 1 年（31536000 秒） |
| 路径 | `/` |
| SameSite | `lax` |
| 存储位置 | 浏览器 cookie |
| 读取位置 | 中间件（服务端）、`getLocaleFromCookie()`（客户端） |

## 新增配置

### 语言显示名称映射

LanguageSwitcher 组件需要一个 locale → 原始语言名称的映射：

```
en → English
es → Español  
fr → Français
zh → 中文
```

建议在 `src/lib/i18n/config.ts` 中新增 `LOCALE_DISPLAY_NAMES` 常量。

## 状态流

```
用户点击 Globe → 显示下拉菜单 → 选择目标语言
  → 设置 NEXT_LOCALE cookie
  → router.push() 到新 locale 路径
  → 中间件识别 locale 前缀，不做重定向
  → 页面以新 locale 渲染
```
