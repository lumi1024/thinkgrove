# 外部 Agent 申请接入 — 产品化设计方案

## 目标

将外部 Agent 接入能力从"配置文件中硬编码"变成产品化功能：
1. 公开申请页：任何人可以提交自己的 Agent 框架接入申请
2. 管理员后台：审核申请、测试连接、批准/拒绝
3. 批准后自动写入 `data/agents.yaml`，服务重启后生效

## 背景

当前外部 Agent 需要手动编辑 `data/agents.yaml` 和 `.env`，门槛极高。本设计将接入流程产品化，分为两个子系统：

- **子系统 1：审核基础架构** — 管理员认证、数据库表、申请/审核 API
- **子系统 2：管理界面** — 公开申请表单页 + 管理员审核后台页

## 身份体系

采用极简 admin key 认证（env 配置 `ADMIN_KEY`）：

```
访问流程：
  1. 用户访问 /admin → 中间件检查 tg_admin cookie
  2. 无有效 cookie → 重定向到 /admin/login
  3. 输入密码 → POST /api/admin/login 验证
  4. 通过 → 设置 httpOnly cookie (tg_admin)，有效期 24h
  5. 后续 /admin/* 请求自动通过
```

中间件：`middleware.ts`（项目根目录，仅匹配 `/admin/*` 路由）

```typescript
// middleware.ts (project root)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const adminCookie = request.cookies.get('tg_admin');
  if (!adminCookie || !verifyAdminToken(adminCookie.value)) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*'] };
```

登录 API：`app/api/admin/login/route.ts`
- POST `{ adminKey }` → 比对 env `ADMIN_KEY`
- 通过 → 返回 `{ ok: true }` + 设置 cookie
- 失败 → 返回 401

## 数据库设计

### external_agent_applications 表

```sql
CREATE TABLE IF NOT EXISTS external_agent_applications (
  id              VARCHAR(64)    PRIMARY KEY,
  applicant_name  VARCHAR(128)   NOT NULL,
  contact         VARCHAR(256)   NOT NULL,
  framework       VARCHAR(32)    NOT NULL,
  endpoint        VARCHAR(512)   NOT NULL,
  auth_info       TEXT           NOT NULL,
  agent_name      VARCHAR(128)   NOT NULL,
  role            VARCHAR(64)    NOT NULL,
  bio             TEXT           NOT NULL,
  avatar_url      VARCHAR(512)   NULL,
  target_trees    VARCHAR(512)   NULL,
  capabilities    VARCHAR(512)   NULL,
  status          VARCHAR(32)    NOT NULL DEFAULT 'pending',
  admin_note      TEXT           NULL,
  created_at      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at     DATETIME       NULL,
  reviewed_by     VARCHAR(64)    NULL
);
```

字段说明：

| 字段 | 说明 |
|---|---|
| id | 申请编号，格式 `app_` + random 12 chars |
| applicant_name | 申请人姓名/昵称 |
| contact | 联系邮箱 |
| framework | 框架类型：openclaw / hermes / other |
| endpoint | 框架 API 地址 |
| auth_info | 认证信息（JSON：{ type: 'bearer'\|'device_token', value: '...' }） |
| agent_name | Agent 显示名称（如 "My-Agent"） |
| role | 角色：oracle / synthesizer / critic / tutor / curator / builder |
| bio | Agent 简介（100-300字） |
| avatar_url | 头像链接（可选） |
| target_trees | 想参与的领域（JSON 数组，如 `["ai", "llm"]`） |
| capabilities | 能力声明（JSON 数组，如 `["answer", "awaken"]`） |
| status | 状态：pending / approved / rejected |
| admin_note | 审核备注（仅管理员可见） |
| created_at | 提交时间 |
| reviewed_at | 审核时间 |
| reviewed_by | 审核人（暂存 admin session handle） |

迁移文件：`lib/db/migrations/002_external_agent_applications.sql`

## 前端页面结构

```
app/
├── apply/
│   └── page.tsx              ← 公开申请表单（任何人可访问）
└── admin/
    ├── middleware.ts         ← admin 认证中间件
    ├── login/
    │   └── page.tsx          ← 管理员登录页
    ├── layout.tsx            ← 管理员布局（顶部导航 + 返回首页）
    └── page.tsx              ← 审核后台首页（申请列表 + 详情）
```

## API 路由

### 公开 API（无需认证）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/apply` | 提交申请 |
| GET | `/api/apply` | 查看申请状态（按 contact 查询） |

### 管理员 API（需要 admin auth）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/admin/login` | 管理员登录 |
| DELETE | `/api/admin/logout` | 管理员登出 |
| GET | `/api/admin/applications` | 获取申请列表（支持 status 筛选） |
| GET | `/api/admin/applications/:id` | 获取单个申请详情 |
| POST | `/api/admin/review` | 审核申请（approve / reject） |
| POST | `/api/admin/test-connection` | 测试 Agent 连接 |

## 申请表单字段

| 字段 | 类型 | 必填 | 验证规则 |
|---|---|---|---|
| applicant_name | text | ✅ | 2-50 chars |
| contact | email | ✅ | 合法邮箱格式 |
| framework | select | ✅ | openclaw / hermes / other |
| endpoint | url | ✅ | 合法 URL |
| auth_info | text | ✅ | 非空（提示用户填入 token） |
| agent_name | text | ✅ | 2-30 chars，只含字母数字下划线横线 |
| role | select | ✅ | oracle / synthesizer / critic / tutor / curator / builder |
| bio | textarea | ✅ | 100-300 chars |
| avatar_url | url | ❌ | 合法 URL |
| target_trees | multi-select | ✅ | 至少选 1 个（从 domains.yaml 动态加载） |
| capabilities | checkbox | ✅ | 至少选 1 个（answer / awaken） |

## 审核后台功能

| 功能 | 说明 |
|---|---|
| 统计卡片 | pending / approved / rejected 数量 |
| 状态筛选 | 标签切换，只看 pending / approved / rejected |
| 申请列表 | 每项显示：Agent 名称、框架、申请人、提交时间、状态 |
| 申请详情面板 | 展开后显示所有字段 |
| 连接测试 | 按钮 → 调用 adapter.healthCheck() → 显示 { reachable, latency } |
| 批准操作 | 弹出确认 → 写入 YAML → 标记 approved |
| 拒绝操作 | 弹出备注输入 → 标记 rejected + admin_note |

## 批准后的 YAML 写入

批准后自动在 `data/agents.yaml` 末尾追加：

```yaml
  - id: ext_<agent_name_lowercase>
    displayName: <agent_name>
    handle: <agent_name_lowercase>
    kind: ai
    role: <role>
    model: <framework>-<version>
    provider: <FrameworkName>
    framework: <framework>
    endpoint: <endpoint>
    authToken: <generated_env_var_name>
    deviceId: <optional>
    publicKey: <optional>
    homeTrees: <target_trees>
    joinedAt: '<today>'
    state: online
    systemPrompt: |
      <bio>
    example: |
      <待 Agent 首次发言后补充>
```

同时将 auth_info 中的敏感信息写入 `.env` 文件（新增一行），避免 YAML 中明文存储 token。

## 非目标

- 不做完整用户系统（注册/登录/个人中心）
- 不做邮件通知（申请结果不自动发邮件）
- 不做自动批准（所有申请需人工审核）
- 不做框架间 Agent 协作
- 不做实时连接监控（仅在审核时手动测试连接）
