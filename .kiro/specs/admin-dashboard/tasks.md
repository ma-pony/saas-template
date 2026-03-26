# 实施计划

## 任务列表

- [ ] 1. 数据库 Schema 变更：为 user 表添加 role 字段
  - 在 `src/database/schema.ts` 的 `user` 表中新增 `role: text('role').notNull().default('user')` 字段
  - 执行 `bun run generate-migration` 生成迁移文件
  - 执行 `bun run migrate:local` 应用迁移到本地数据库
  - _需求：1_

- [ ] 2. 创建管理后台路由组基础结构 (P)
- [ ] 2.1 创建 `(admin)` 路由组目录和 Layout 文件
  - 新建 `src/app/(admin)/layout.tsx`
  - 实现服务端权限验证：通过 `auth.api.getSession()` 校验登录状态，未登录重定向至 `/login`
  - 查询数据库验证 `user.role === 'admin'`，非管理员重定向至 `/dashboard`
  - 渲染包含 `AdminSidebar`（桌面端）和 `AdminMobileNav`（移动端）的布局框架
  - _需求：1, 4_

- [ ] 3. 实现管理后台导航组件 (P)
- [ ] 3.1 创建桌面端侧边栏组件
  - 新建 `src/app/(admin)/components/admin-sidebar.tsx`
  - 使用 `'use client'` 指令（需要 `usePathname` 判断当前激活路由）
  - 导航项：概览（`/admin`，LayoutDashboard 图标）、用户管理（`/admin/users`，Users 图标）
  - 当前路由对应的导航项应高亮显示（使用 Shadcn Button variant="secondary"）
  - 显示管理员名称/邮箱和退出登录按钮
  - _需求：4, 5_

- [ ] 3.2 创建移动端抽屉导航组件 (P)
  - 新建 `src/app/(admin)/components/admin-mobile-nav.tsx`（需要 `'use client'`）
  - 使用 Shadcn `Sheet` 组件（`src/components/ui/sheet.tsx`）实现抽屉效果
  - 顶部显示汉堡菜单图标（Menu icon from lucide-react），点击打开 Sheet
  - Sheet 内容与桌面侧边栏导航项保持一致
  - _需求：4, 5_

- [ ] 4. 实现数据概览服务端查询和页面
- [ ] 4.1 创建 getAdminStats 数据查询函数
  - 新建 `src/app/(admin)/actions/stats.ts`
  - 使用 `Promise.all` 并行执行 4 个 Drizzle 查询：
    - 总用户数：`SELECT count(*) FROM user`
    - 本月新增用户数：`SELECT count(*) FROM user WHERE created_at >= first_day_of_current_month`
    - 活跃订阅数：`SELECT count(*) FROM subscription WHERE status = 'active'`
    - 总收入：`SELECT sum(amount) FROM payment WHERE status = 'succeeded'`
  - 返回 `AdminStats` 类型数据，收入格式化为带货币符号的字符串
  - _需求：2_

- [ ] 4.2 创建 StatsCards 统计卡片组件 (P)
  - 新建 `src/app/(admin)/components/stats-cards.tsx`（服务端组件）
  - 使用 Shadcn `Card`（`src/components/ui/card.tsx`）渲染 4 个 KPI 卡片
  - 每个卡片包含：lucide-react 图标、指标标题、数值、描述文字
  - 四个卡片：总用户数（Users 图标）、本月新增（UserPlus 图标）、活跃订阅（CreditCard 图标）、总收入（DollarSign 图标）
  - 在加载状态下展示 Shadcn `Skeleton` 占位组件（`src/components/ui/skeleton.tsx`）
  - _需求：2, 5_

- [ ] 4.3 创建概览仪表板页面 (P)
  - 新建 `src/app/(admin)/page.tsx`（服务端组件）
  - 调用 `getAdminStats()` 获取统计数据
  - 渲染页面标题"数据概览"和 `StatsCards` 组件
  - _需求：2_

- [ ] 5. 实现用户列表服务端查询和页面
- [ ] 5.1 创建 getUsers 数据查询函数
  - 新建 `src/app/(admin)/actions/users.ts`
  - 实现 `getUsers({ page, pageSize, query })` 函数
  - 当 `query` 存在时，使用 Drizzle `ilike` 条件过滤 `name` 或 `email` 字段（`OR` 逻辑）
  - 使用 `limit` 和 `offset` 实现分页（pageSize 默认 20）
  - 同时查询 `count(*)` 获取总记录数，计算 `pageCount`
  - 返回 `GetUsersResult` 类型数据
  - _需求：3_

- [ ] 5.2 创建 UsersTable 用户表格组件 (P)
  - 新建 `src/app/(admin)/components/users-table.tsx`
  - 使用 Shadcn `Table`（`src/components/ui/table.tsx`）渲染用户数据
  - 表格列：头像（Shadcn Avatar）、姓名、邮箱、邮箱验证状态（Shadcn Badge）、注册时间
  - 使用 Shadcn `Pagination`（`src/components/ui/pagination.tsx`）渲染分页控件，页码通过 URL `page` 参数传递
  - 搜索框使用 Shadcn `Input`（`src/components/ui/input.tsx`），通过 URL `q` 参数传递搜索词（需要 `'use client'` 的 `SearchInput` 子组件）
  - 无数据时展示 `src/components/ui/empty.tsx` 空状态组件
  - _需求：3, 5_

- [ ] 5.3 创建用户列表页面 (P)
  - 新建 `src/app/(admin)/users/page.tsx`（服务端组件）
  - 接收 `searchParams` 中的 `page` 和 `q` 参数
  - 调用 `getUsers({ page, pageSize: 20, query })` 获取用户数据
  - 渲染页面标题"用户管理"、`UsersTable` 组件
  - _需求：3_

- [ ] 6. 国际化支持（可选）
  - 在 `src/messages/zh.json`（规划中）和其他语言文件中添加 admin 相关翻译 key
  - 包含：导航项标题、页面标题、表格列标题、空状态文字、错误提示文字
  - _需求：2, 3, 4_

- [ ] 7. 错误边界处理
  - 新建 `src/app/(admin)/error.tsx` 客户端错误边界组件
  - 展示友好的错误提示和"刷新重试"按钮
  - 新建 `src/app/(admin)/users/error.tsx` 用户列表页错误边界
  - _需求：2, 3_
