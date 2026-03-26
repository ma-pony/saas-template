# 实施计划

## 任务列表

- [ ] 1. 注册分析相关环境变量
- [ ] 1.1 在 `src/config/env.ts` 的 `client` 对象中添加分析环境变量
  - 添加 `NEXT_PUBLIC_ANALYTICS_PROVIDER`（枚举：`plausible | umami | google | none`，默认 `none`）
  - 添加 `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`、`NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL`（均可选）
  - 添加 `NEXT_PUBLIC_UMAMI_WEBSITE_ID`、`NEXT_PUBLIC_UMAMI_SCRIPT_URL`（均可选）
  - 添加 `NEXT_PUBLIC_GA_MEASUREMENT_ID`、`NEXT_PUBLIC_ANALYTICS_ANONYMIZE_IP`（均可选）
  - 同步更新 `runtimeEnv` 对象，将所有新变量映射到 `process.env`
  - _需求: 需求 1, 需求 7_

- [ ] 2. 创建分析适配器接口与类型定义
- [ ] 2.1 新建 `src/lib/analytics/types.ts` (P)
  - 定义 `AnalyticsProvider` 类型（枚举字符串联合）
  - 定义 `AnalyticsEventProperties` 接口
  - 定义 `AnalyticsScriptConfig` 接口（含 `src` 和 `scriptProps`）
  - 定义 `AnalyticsAdapter` 接口（含 `provider`、`getScriptConfig()`、`getTrackEventScript()` 方法）
  - _需求: 需求 1_

- [ ] 3. 实现各分析提供商适配器
- [ ] 3.1 新建 `src/lib/analytics/providers/noop.ts` (P)
  - 实现 `NoopAdapter` 类，`getScriptConfig()` 返回 `null`，`getTrackEventScript()` 返回空字符串
  - _需求: 需求 1, 需求 7_
- [ ] 3.2 新建 `src/lib/analytics/providers/plausible.ts` (P)
  - 实现 `PlausibleAdapter` 类
  - `getScriptConfig()` 读取 `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` 和 `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_URL`
  - 脚本属性包含 `defer: 'true'` 和 `data-domain`
  - `getTrackEventScript()` 返回 `window.plausible` 队列初始化内联脚本
  - _需求: 需求 2_
- [ ] 3.3 新建 `src/lib/analytics/providers/umami.ts` (P)
  - 实现 `UmamiAdapter` 类
  - `getScriptConfig()` 读取 `NEXT_PUBLIC_UMAMI_WEBSITE_ID` 和 `NEXT_PUBLIC_UMAMI_SCRIPT_URL`
  - 脚本属性包含 `defer: 'true'` 和 `data-website-id`
  - `getTrackEventScript()` 返回空字符串（umami 脚本自动初始化 `window.umami`）
  - _需求: 需求 3_
- [ ] 3.4 新建 `src/lib/analytics/providers/google.ts` (P)
  - 实现 `GoogleAnalyticsAdapter` 类
  - `getScriptConfig()` 读取 `NEXT_PUBLIC_GA_MEASUREMENT_ID`，生成 GTM 脚本 URL
  - `getTrackEventScript()` 返回 `gtag()` 初始化内联脚本，支持 IP 匿名化配置
  - _需求: 需求 4_

- [ ] 4. 实现分析服务工厂单例
- [ ] 4.1 新建 `src/lib/analytics/service.ts`
  - 实现 `getAnalyticsAdapter()` 单例工厂函数
  - 读取 `env.NEXT_PUBLIC_ANALYTICS_PROVIDER`，switch 选择对应适配器实例
  - 未知值或 `none` 时降级为 `NoopAdapter`（`console.warn` 记录未知值，不抛出异常）
  - 实现 `getActiveAnalyticsProvider()` 和 `isAnalyticsConfigured()` 辅助函数
  - _需求: 需求 1, 需求 7_

- [ ] 5. 实现预设事件模板与客户端 Hook
- [ ] 5.1 新建 `src/lib/analytics/events.ts`
  - 定义 `AnalyticsEvents` 常量对象（`SIGNUP`、`LOGIN`、`SUBSCRIPTION_STARTED`、`SUBSCRIPTION_CANCELLED`、`PAGE_VIEW`）
  - 实现 `trackEvent(name, properties?)` 函数
  - 根据 `window.plausible` / `window.umami` / `window.gtag` 存在性路由到对应调用
  - 开发环境（`process.env.NODE_ENV === 'development'`）下用 `console.debug` 输出事件信息
  - 静默失败：全局对象不存在时不抛出异常
  - _需求: 需求 5, 需求 7_
- [ ] 5.2 新建 `src/lib/analytics/hooks.ts`
  - 实现 `useAnalytics()` Hook，返回 `trackEvent` 及预设快捷方法
  - 包含 `trackSignup(provider)`、`trackLogin(provider)`、`trackSubscriptionStarted(plan, provider)`、`trackSubscriptionCancelled()`
  - _需求: 需求 5_

- [ ] 6. 创建 UI 层组件
- [ ] 6.1 新建 `src/components/analytics/analytics-script.tsx`（服务端组件）
  - 无 `'use client'` 指令
  - 调用 `getAnalyticsAdapter().getScriptConfig()` 获取配置
  - 使用 Next.js `<Script>` 组件（`strategy="afterInteractive"` 或根据 defer/async 调整）渲染外部脚本
  - 若 `getTrackEventScript()` 非空，额外渲染内联 `<Script>` 标签（`dangerouslySetInnerHTML`）
  - 配置为 `null` 时返回 `null`
  - _需求: 需求 2, 需求 3, 需求 4_
- [ ] 6.2 新建 `src/components/analytics/analytics-provider.tsx`（客户端组件）
  - 添加 `'use client'` 指令
  - 使用 `usePathname()` 和 `useEffect` 监听路由变化
  - 路由变化时调用 `trackEvent(AnalyticsEvents.PAGE_VIEW, { path: pathname })`
  - 渲染 `children`，作为透明包装组件（返回 `<>{children}</>`）
  - _需求: 需求 6_

- [ ] 7. 集成到根布局
- [ ] 7.1 修改 `src/app/layout.tsx` 引入分析组件
  - 导入 `AnalyticsScript` 和 `AnalyticsProvider`
  - 在 `<body>` 内（`<QueryProvider>` 之前或之内）添加 `<AnalyticsScript />`
  - 用 `<AnalyticsProvider>` 包裹现有 `children` 内容
  - 确保不破坏现有 `QueryProvider`、`ToastProvider` 嵌套结构
  - _需求: 需求 6_

- [ ] 8. 创建索引导出文件
- [ ] 8.1 新建 `src/lib/analytics/index.ts` (P)
  - 统一导出 `getAnalyticsAdapter`、`getActiveAnalyticsProvider`、`isAnalyticsConfigured`
  - 导出 `AnalyticsEvents`、`trackEvent`、`useAnalytics`
  - 导出所有类型（`AnalyticsProvider`、`AnalyticsAdapter`、`AnalyticsEventProperties` 等）
  - _需求: 需求 1_

- [ ] 9. 验证与测试
- [ ] 9.1 编写适配器单元测试（可延期）
  - 测试 `service.ts` 各提供商正确返回对应适配器
  - 测试未知提供商降级为 `NoopAdapter`
  - 测试各适配器 `getScriptConfig()` 返回正确配置结构
  - _需求: 需求 1, 需求 2, 需求 3, 需求 4_
- [ ]* 9.2 验证开发环境日志输出（可延期）
  - 在开发服务器中配置 `NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible` 和 `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=test.com`
  - 触发事件后确认 `console.debug` 输出包含事件名和属性
  - 确认页面 `<head>` 包含正确的 Plausible 脚本标签
  - _需求: 需求 5, 需求 7_
