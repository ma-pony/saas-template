# 需求文档

## 简介

本功能为 ShipFree SaaS 模板集成隐私友好的分析服务。支持 Plausible 和 Umami 作为主要隐私友好选项，可选集成 Google Analytics，并提供基础事件追踪模板，帮助开发者快速了解用户行为，同时遵守隐私法规（GDPR/CCPA）。

与项目现有的支付适配器和邮件适配器模式一致，分析集成采用适配器（策略）模式实现，通过环境变量 `ANALYTICS_PROVIDER` 切换提供商，无需修改业务代码。

## 需求

### 需求 1：分析提供商适配器架构

**目标：** 作为开发者，我希望通过统一接口集成多个分析提供商，以便通过更改环境变量而非修改代码来切换或禁用分析服务。

#### 验收标准

1. 当设置 `ANALYTICS_PROVIDER=plausible` 时，系统应使用 Plausible 分析适配器
2. 当设置 `ANALYTICS_PROVIDER=umami` 时，系统应使用 Umami 分析适配器
3. 当设置 `ANALYTICS_PROVIDER=google` 时，系统应使用 Google Analytics 适配器
4. 当未设置 `ANALYTICS_PROVIDER` 或设置为 `none` 时，系统应使用空操作（no-op）适配器，不发送任何数据
5. 系统应在 `src/lib/analytics/` 目录下实现适配器模式，包含 `types.ts`（接口定义）、`service.ts`（工厂单例）
6. 所有环境变量必须在 `src/config/env.ts` 中注册并通过 Zod 验证

### 需求 2：Plausible Analytics 集成

**目标：** 作为注重隐私的开发者，我希望集成 Plausible Analytics，以便在不依赖 Cookie 的情况下追踪网站流量，满足 GDPR 合规要求。

#### 验收标准

1. 当 `ANALYTICS_PROVIDER=plausible` 时，系统应在 `<head>` 中自动注入 Plausible 脚本标签
2. 当配置了 `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` 时，系统应将该域名传递给 Plausible 脚本
3. 当配置了 `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL` 时，系统应支持自托管 Plausible 实例（默认使用 `https://plausible.io/js/script.js`）
4. 系统应支持通过 `plausible()` 函数发送自定义事件
5. Plausible 脚本应以 `defer` 方式加载，不阻塞页面渲染

### 需求 3：Umami Analytics 集成

**目标：** 作为注重隐私的开发者，我希望集成 Umami Analytics，以便使用开源自托管的分析解决方案追踪用户行为。

#### 验收标准

1. 当 `ANALYTICS_PROVIDER=umami` 时，系统应在 `<head>` 中自动注入 Umami 脚本标签
2. 当配置了 `NEXT_PUBLIC_UMAMI_WEBSITE_ID` 时，系统应将 `data-website-id` 属性设置到脚本标签
3. 当配置了 `NEXT_PUBLIC_UMAMI_SCRIPT_URL` 时，系统应从该 URL 加载 Umami 脚本（支持自托管实例）
4. 系统应支持通过 `umami.track()` 函数发送自定义事件
5. Umami 脚本应以 `defer` 方式加载，不阻塞页面渲染

### 需求 4：Google Analytics 集成（可选）

**目标：** 作为需要详细用户行为数据的开发者，我希望可选集成 Google Analytics 4，以便利用 Google 的分析生态系统。

#### 验收标准

1. 当 `ANALYTICS_PROVIDER=google` 时，系统应在 `<head>` 中注入 Google Analytics 4 脚本
2. 当配置了 `NEXT_PUBLIC_GA_MEASUREMENT_ID` 时，系统应使用该 ID 初始化 GA4
3. 系统应支持通过统一接口发送 GA4 自定义事件（`gtag('event', ...)` 调用）
4. 系统应在生产环境之外（开发/测试）支持禁用 GA4 数据收集
5. GA4 脚本应以 `async` 方式加载

### 需求 5：基础事件追踪模板

**目标：** 作为开发者，我希望获得预设的事件追踪模板，以便快速实现常见 SaaS 用户行为追踪，无需从零定义事件结构。

#### 验收标准

1. 系统应提供统一的 `trackEvent(name, properties?)` 函数，屏蔽各提供商的实现差异
2. 系统应预设以下标准 SaaS 事件模板：
   - `signup`：用户注册（含 `provider` 属性：email/google/github 等）
   - `login`：用户登录（含 `provider` 属性）
   - `subscription_started`：订阅开始（含 `plan` 和 `provider` 属性）
   - `subscription_cancelled`：订阅取消
   - `page_view`：页面浏览（Next.js 路由变化时自动触发）
3. 系统应导出 `useAnalytics()` React Hook，方便客户端组件调用 `trackEvent`
4. 系统应支持在 Server Components 中通过直接调用服务端分析函数追踪事件
5. 事件追踪函数在未配置提供商时应静默失败（不抛出异常）

### 需求 6：Next.js 路由集成与自动页面追踪

**目标：** 作为开发者，我希望分析系统能自动追踪 Next.js App Router 的路由变化，以便无需手动在每个页面组件中添加追踪代码。

#### 验收标准

1. 系统应提供 `AnalyticsProvider` 客户端组件，在根布局中挂载后自动追踪路由变化
2. 当 Next.js App Router 发生路由切换时，系统应自动向分析提供商发送页面浏览事件
3. `AnalyticsProvider` 应通过 `src/app/[locale]/layout.tsx` 根布局集成，覆盖所有路由组
4. 系统应与 `next-intl` 国际化路由兼容，正确处理 `/[locale]/` 前缀的路径
5. 在脚本加载失败时，系统应优雅降级，不影响页面正常渲染

### 需求 7：隐私合规与配置

**目标：** 作为产品负责人，我希望分析系统默认遵循隐私最佳实践，以便确保产品符合 GDPR、CCPA 等隐私法规要求。

#### 验收标准

1. Plausible 和 Umami 提供商的实现应默认不使用 Cookie 进行追踪
2. 系统应支持通过环境变量 `NEXT_PUBLIC_ANALYTICS_ANONYMIZE_IP=true` 在 Google Analytics 中启用 IP 匿名化
3. 系统应提供开发环境配置示例（`.env.example` 或文档注释），说明各提供商所需的环境变量
4. 在开发环境（`NODE_ENV=development`）下，分析事件应默认输出到控制台而非发送到服务器（与邮件 log 提供商行为一致）
5. 系统文档应注明 Plausible 和 Umami 为隐私优先选项，Google Analytics 为可选附加项
