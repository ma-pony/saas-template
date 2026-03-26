# 实现计划

- [x] 1. 建立 i18n 基础设施与配置
- [x] 1.1 安装 next-intl 依赖并配置 i18n 常量
  - 安装 `next-intl` 包（`bun add next-intl`）
  - 创建 `src/lib/i18n/config.ts`，定义 `SUPPORTED_LOCALES`、`DEFAULT_LOCALE`、`LOCALE_TO_LANG_TAG`
  - 创建 `src/lib/i18n/index.ts` 统一导出
  - _Requirements: 1.3_

- [x] 1.2 创建中文翻译文件并建立 key 命名规范
  - 以 `模块.组件.元素` 三级结构重构或创建 `src/messages/en.json`（参照当前各页面文本）
  - 同结构创建 `src/messages/zh.json`，补全所有中文翻译
  - 同结构验证 `src/messages/es.json` 和 `src/messages/fr.json` key 一致性
  - `common.*` 前缀用于按钮、错误等跨模块通用文本
  - 动态插值使用 `{variableName}` 语法
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 1.3 配置 next-intl 与 Next.js 集成
  - 在 `next.config.ts` 中使用 `createNextIntlPlugin` 包装配置
  - 创建 `src/i18n/request.ts`（next-intl 服务端配置，指定消息文件路径）
  - _Requirements: 1.3, 1.5_

---

- [x] 2. 迁移路由结构至 [locale] 动态路由段
- [x] 2.1 创建 [locale] 路由根布局
  - 创建 `src/app/[locale]/layout.tsx`，注入 `NextIntlClientProvider` 和当前语言的消息
  - 将现有 `src/app/layout.tsx` 的字体、全局样式、`QueryProvider`、`ToastProvider` 迁移至此布局
  - 根据当前 `locale` 动态设置 `<html lang={locale}>` 属性
  - _Requirements: 1.1, 1.5_

- [x] 2.2 迁移认证路由组（(auth)）
  - 将 `src/app/(auth)/` 路由及组件迁移到 `src/app/[locale]/(auth)/`
  - 将所有硬编码 UI 文本替换为 `useTranslations`（客户端组件）或 `getTranslations`（服务端组件）调用
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 2.3 (P) 迁移主应用路由组（(main)）
  - 将 `src/app/(main)/` 路由及组件迁移到 `src/app/[locale]/(main)/`
  - 替换 Dashboard、Settings 等页面的所有硬编码文本
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 2.4 (P) 迁移营销站点路由组（(site)）
  - 将 `src/app/(site)/` 路由及组件迁移到 `src/app/[locale]/(site)/`
  - 替换 Hero、Features、Pricing、Footer 等所有硬编码文本
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 2.5 处理非 locale 路由（privacy、terms、licenses）
  - 将 `src/app/privacy/page.tsx`、`src/app/terms/page.tsx`、`src/app/licenses/page.tsx` 迁移至 `[locale]` 下
  - 确保隐私政策页至少有中英双语版本（需求 8.2）
  - _Requirements: 1.1, 8.2_

---

- [x] 3. 实现 Edge 中间件的 IP 地区检测
- [x] 3.1 创建地理位置映射服务
  - 创建 `src/lib/i18n/geo.ts`，实现 `countryToLocale()` 和 `getCountryFromRequest()` 函数
  - 覆盖 CN/TW/HK/MO → zh，ES/MX/AR 等 → es，FR/BE 等 → fr，其余默认 en
  - 确保函数永不抛出异常，无匹配时返回 `DEFAULT_LOCALE`
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 3.2 实现 Next.js 中间件
  - 创建 `middleware.ts`（项目根目录），在 Edge Runtime 中运行
  - 检测优先级：`NEXT_LOCALE` Cookie → 平台 Geo 标头 → `Accept-Language` → 默认 `en`
  - 中国大陆/港澳台检测时设 locale 为 `zh`
  - 对已有正确 locale 前缀的请求直接放行（避免循环重定向）
  - 设置 `NEXT_LOCALE` Cookie（`Max-Age: 31536000`，`SameSite: Lax`）
  - 配置 matcher 排除 `api`、`_next/static`、`_next/image`、`favicon.ico`、`monitoring`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 8.5_

---

- [x] 4. 实现货币本地化
- [x] 4.1 创建货币工具函数
  - 创建 `src/lib/i18n/currency.ts`，实现 `getCurrencyForLocale()` 和 `formatCurrency()`
  - `getCurrencyForLocale()` 根据 locale 和可选 countryCode 返回 `CurrencyCode`
  - `formatCurrency()` 使用 `Intl.NumberFormat` 格式化金额（输入为分/最小单位）
  - 定义 `EU_COUNTRIES` 集合（Set<string>），覆盖所有欧盟成员国
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4.2 在定价页面集成货币本地化显示
  - 在 `src/app/[locale]/(site)/pricing.tsx` 中读取当前 locale，调用 `getCurrencyForLocale()` 和 `formatCurrency()`
  - 当支付提供商不支持所选货币时，展示美元价格并添加"以 USD 结算"提示（需求 4.6）
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

---

- [x] 5. 扩展支付适配器支持地区适配
- [x] 5.1 扩展 CheckoutOptions 类型与支付方式配置
  - 在 `src/lib/payments/types.ts` 的 `CheckoutOptions` 接口新增可选 `country?: string` 和 `currency?: string` 字段
  - 在 `src/config/payments.ts` 新增 `REGIONAL_PAYMENT_METHODS` 配置，映射国家代码到支付方式数组（CN → ['alipay', 'wechat_pay']，EU 国家 → ['sepa_debit']，NL → ['ideal'] 等）
  - _Requirements: 5.3, 5.5_

- [x] 5.2 更新 Stripe 适配器实现地区支付方式
  - 在 `src/lib/payments/providers/stripe.ts` 的 `createCheckout()` 方法中，读取 `options.country`
  - 查询 `REGIONAL_PAYMENT_METHODS`，将匹配的支付方式追加到 Stripe Checkout Session 的 `payment_method_types`
  - 当地区不支持特定支付方式或 Stripe 不支持时，降级为信用卡/借记卡
  - _Requirements: 5.1, 5.2, 5.4_

- [x] 5.3 (P) 在结算入口传递地区信息
  - 在支付 API 路由（`src/app/api/payments/checkout/route.ts`）中从请求中提取 `country` 信息（读取中间件写入的标头或 Cookie）
  - 将 `country` 传递到 `createCheckout()` 调用
  - _Requirements: 5.1, 5.2, 5.3_

---

- [x] 6. 实现 hreflang 标签
- [x] 6.1 创建 hreflang 工具函数
  - 创建 `src/lib/i18n/hreflang.ts`，实现 `generateHreflangMetadata(pathname: string): Metadata['alternates']`
  - 遍历 `SUPPORTED_LOCALES`，生成 `{ languages: { 'zh-Hans': url, 'en': url, ..., 'x-default': url } }` 对象
  - URL 使用完整绝对路径（拼接 `NEXT_PUBLIC_APP_URL`）
  - `x-default` 指向英文（`en`）版本
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6.2 将 hreflang 集成到页面 generateMetadata
  - 更新 `src/lib/seo.ts` 的 `generateMetadata()` 接受可选 `locale` 和 `pathname` 参数
  - 当提供参数时，将 `generateHreflangMetadata()` 结果合并到 `alternates` 字段
  - 在各 `[locale]` 路由页面的 `generateMetadata` 中调用并传入当前路径
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

---

- [x] 7. CDN/Edge 缓存优化
- [x] 7.1 配置响应标头缓存规则
  - 在 `next.config.ts` 的 `headers()` 方法中为 `src/messages/*.json` 路径配置 `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`
  - 为国际化 SSR 页面添加 `Vary: Accept-Language` 标头（通过 Next.js `headers()` 配置）
  - _Requirements: 7.1, 7.5_

- [x] 7.2 配置 Vercel 边缘缓存规则
  - 在 `vercel.json` 中配置国际化路由的 `headers` 规则（若文件不存在则创建）
  - 确保 Edge Function 的地理位置检测逻辑在请求链路最前端执行
  - _Requirements: 7.2, 7.4_

---

- [x] 8. 实现 GDPR 合规 Cookie 同意
- [x] 8.1 创建 Cookie 同意状态管理
  - 创建 `src/lib/consent/store.ts`，使用 Zustand 定义 `ConsentStore`
  - 实现 `loadFromCookie()` 从 `consent_preferences` Cookie 读取同意状态
  - 实现 `setConsent()` 更新状态并写入 Cookie（不持久化到数据库）
  - 同意分类：`necessary`（始终 true）、`analytics`、`marketing`
  - _Requirements: 8.1, 8.6_

- [x] 8.2 创建 Cookie 同意横幅组件
  - 创建 `src/components/consent/cookie-consent-banner.tsx`（客户端组件）
  - 仅当用户 locale 对应 EU 地区（通过 `X-Vercel-IP-Country` 标头或 Cookie 中的 countryCode 判断）且尚未同意时显示
  - 提供"全部接受"、"仅必要"、"自定义设置"三个操作选项
  - 在用户同意前阻止加载分析/营销脚本
  - _Requirements: 8.1, 8.6_

- [x] 8.3 集成合规横幅到根布局
  - 在 `src/app/[locale]/layout.tsx` 中引入 `CookieConsentBanner`
  - 根据 `ConsentStore` 中的 `analytics` 状态条件渲染分析脚本（如 Sentry 用户跟踪）
  - 验证账户删除流程确认 Drizzle 级联删除覆盖所有个人数据（需求 8.3）
  - _Requirements: 8.1, 8.3, 8.6_

---

- [ ] 9. 集成验证与收尾
- [ ] 9.1 端到端流程验证
  - 验证中文用户完整路径：IP 检测 → `/zh/` 重定向 → 中文 UI → 中文定价（CNY）→ 支付宝选项
  - 验证 EU 用户路径：IP 检测 → GDPR 横幅显示 → 同意后横幅消失
  - 验证 hreflang：检查定价页 HTML `<head>` 包含所有 4 个 locale 的 alternate link
  - _Requirements: 1.1, 3.1, 3.2, 4.1, 5.1, 6.1, 8.1_

- [ ] 9.2 (P) 语言切换器 UI 组件
  - 在导航栏（`src/app/[locale]/(site)/navbar.tsx`）添加语言切换下拉菜单
  - 切换时更新 `NEXT_LOCALE` Cookie 并跳转到对应 locale 的相同路径
  - _Requirements: 1.1, 3.3_

- [ ] 9.3 (P) 更新环境变量配置
  - 在 `src/config/env.ts` 确认所有新增配置项（如有需要添加 `GEO_DETECTION_ENABLED` Feature Flag）
  - 更新 `.env.example` 文件添加相关注释
  - _Requirements: 3.5, 3.6_
