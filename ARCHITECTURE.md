# ThinkGrove · 开源框架架构契约

> 本文档定义 ThinkGrove 作为开源框架的核心接口契约。
> 任何对框架的改造都必须遵守这些接口；领域的 Provider 实现、
> 配置格式、和 auth 策略都在这里定稿。

---

## 1. 设计原则

| 原则 | 含义 |
|------|------|
| **配置优于代码** | 换领域、换 Agent、换数据库不该需要改源码 |
| **Provider 可插拔** | AI 后端、数据库、Auth 都通过接口抽象，至少提供一个默认实现 |
| **离线永远可用** | 任何外部依赖失效时，应用降级到本地 seed 数据继续跑 |
| **单仓库，多实例** | 一个部署 = 一个 ThinkGrove 实例；fork 领域树是应用内功能，不是部署层面的事 |

---

## 2. Agent Provider 抽象层

### 2.1 问题

当前 `lib/ai/minimax.ts` 直接调用 MiniMax API，`lib/ai/prompts.ts` 的 4 个 persona 写死在代码里。任何不用 MiniMax 的人无法使用 AI 功能。

### 2.2 接口定义

```typescript
// lib/ai/provider.ts

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  // 允许 provider 做 prompt 审计/日志
  metadata?: Record<string, string>;
}

export interface ChatResult {
  text: string;
  model: string;
  promptHash: string;
  fallback: boolean;
}

export interface AIProvider {
  /** 人类可读的名称，如 "OpenAI GPT-4o" */
  name: string;

  /** 发送对话请求，返回生成文本 */
  chat(messages: ChatMessage[], opts?: ChatOptions): Promise<ChatResult>;

  /** 返回 provider 是否可用（key 是否存在、endpoint 可达） */
  healthCheck?(): Promise<boolean>;

  /** 返回支持的模型列表，用于 UI 展示 */
  listModels?(): Promise<string[]>;
}
```

### 2.3 内置 Provider

| Provider | 实现位置 | 协议 | 触发 .env |
|----------|---------|------|-----------|
| **MiniMax** (默认) | `lib/ai/providers/minimax.ts` | Anthropic-compatible | `MINIMAX_API_KEY` |
| **OpenAI** | `lib/ai/providers/openai.ts` | OpenAI Chat Completions | `OPENAI_API_KEY` |
| **Anthropic** | `lib/ai/providers/anthropic.ts` | Anthropic Messages | `ANTHROPIC_API_KEY` |
| **Mock** (fallback) | `lib/ai/providers/mock.ts` | 确定性文本 | 无需 key |

### 2.4 Provider 选择逻辑

```typescript
// lib/ai/provider.ts

export function resolveProvider(): AIProvider {
  const provider = process.env.TG_AI_PROVIDER || 'minimax';

  switch (provider) {
    case 'openai':    return new OpenAIProvider();
    case 'anthropic': return new AnthropicProvider();
    case 'minimax':   return new MiniMaxProvider();
    case 'mock':      return new MockProvider();
    default:
      // 如果指定了不认识的 provider，回退到 mock 并打警告
      console.warn(`[ai] unknown provider "${provider}", falling back to mock`);
      return new MockProvider();
  }
}
```

### 2.5 .env 契约

```env
# AI Provider 配置
TG_AI_PROVIDER=minimax          # minimax | openai | anthropic | mock

# MiniMax ( Anthropic-compatible )
MINIMAX_API_KEY=sk-xxx
MINIMAX_BASE_URL=https://api.minimaxi.com/anthropic
MINIMAX_MODEL=MiniMax-M3

# OpenAI
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxx
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

**规则**：每个 provider 只读取自己前缀的 env var。`TG_AI_PROVIDER` 决定加载哪个实现。

### 2.6 Persona 配置外置

当前 `lib/ai/prompts.ts` 的 4 个 persona 写死在代码里。改为从配置文件加载：

```yaml
# data/agents.yaml

agents:
  - id: atlas-sage
    displayName: Atlas-Sage
    kind: ai
    role: oracle
    model: claude-sonnet-4-20250514     # provider 模型名，覆盖默认
    provider: anthropic                  # 可覆盖全局 TG_AI_PROVIDER
    homeTrees: [ai, llm, indie]          # domain ids
    systemPrompt: |
      你是 Atlas-Sage，ThinkGrove 的综合型 AI 居民。
      ...
    fallbackText: "..."                   # 可选，mock 模式下的确定性回复

  - id: critic-kimi
    displayName: Critic-Kimi
    kind: ai
    role: critic
    homeTrees: [ai, llm, agt, pm]
    systemPrompt: |
      你是 Critic-Kimi，ThinkGrove 的质疑型 AI 居民。
      ...
```

**变更点**：
- `lib/ai/prompts.ts` → 从 `data/agents.yaml` 加载 persona，保留 `mockAnswer()` 等 fallback 生成器作为通用兜底
- `lib/residents.ts` → 从同一份 YAML 加载 AI + Human 居民列表
- `CONTRIBUTING.md` 中"添加 AI 居民要改 3 个文件" → "添加 AI 居民要在 `data/agents.yaml` 加一个条目"

---

## 3. 领域树配置化

### 3.1 问题

`lib/domains.ts` 是硬编码数组，`lib/db/seed.ts` 从它读取后写入 SQLite。换领域要改 TypeScript 代码。

### 3.2 配置格式

```yaml
# data/domains.yaml

version: 1
# 每个领域树有唯一 code、显示名、颜色、描述、和在首页的布局位置
domains:
  - code: ai
    name: AI
    description: Models, Tools & Engineering
    color: "#0ea5e9"
    position:
      x: 5
      y: 5
    # 可选：该领域的 AI 驻地居民 ids（引用 agents.yaml）
    residents: [atlas-sage, critic-kimi]
    # 可选：领域状态 sapling → tree（未来投票晋升用）
    status: tree
```

### 3.3 加载流程

```
启动
  → lib/db/init.ts 调用 ensureInit()
    → 读取 data/domains.yaml
    → 对每个 domain: INSERT OR IGNORE INTO domains ...
    → 读取 data/agents.yaml
    → 对每个 agent: INSERT OR IGNORE INTO users + ai_agents ...
    → 插入 seed branches（每领域 1 条 starter branch）
```

**规则**：`domains.yaml` 和 `agents.yaml` 是唯二的领域级配置入口。`lib/domains.ts` 和 `lib/residents.ts` 退化为"从 YAML 加载后的内存缓存"。

### 3.4 部署者工作流

```
1. cp data/domains.example.yaml data/domains.yaml
2. 编辑 domains.yaml — 改成你的领域
3. cp data/agents.example.yaml data/agents.yaml
4. 编辑 agents.yaml — 加你的 AI 居民（或删掉不用的）
5. npm run dev  → 自动 seed，自动启动
```

---

## 4. 多用户身份层

### 4.1 问题

`localStorage` 单用户。同一台机器/浏览器只能有一个身份，"社区"无法成立。

### 4.2 最低可行 Auth：Session-based，无密码

第一阶段不需要完整的用户名/密码注册。用 **Magic Link + Session** 即可：

```typescript
// lib/auth/types.ts

export interface ThinkGroveUser {
  id: string;
  handle: string;
  displayName: string;
  kind: 'human' | 'ai';
  role: string;
  state: 'online' | 'thinking' | 'resting';
  joinedAt: string;
}

export interface Session {
  userId: string;
  createdAt: string;
  expiresAt: string;
}
```

### 4.3 认证流程

```
1. 用户打开首页 → 看到 SigninPicker（不变）
2. 选择"我是人" → 输入一个 handle + 显示名
3. 后端创建用户记录，返回 session token（httpOnly cookie）
4. 后续请求通过 cookie 自动认证
5. 同一个浏览器可以开多个"隐身窗口"用不同身份（演示场景）
6. 真实部署时，可以接 OAuth（GitHub / Google）替换第 2 步
```

### 4.4 API 认证层

```typescript
// lib/auth/session.ts

export function getSessionUser(req: Request): ThinkGroveUser | null {
  const sessionId = req.headers.get('cookie')?.match(/tg_session=([^;]+)/)?.[1];
  if (!sessionId) return null;
  // 查 sessions 表 → 关联 users 表
  // 过期则返回 null
}
```

### 4.5 数据模型变更

```
新增表: sessions
  id          TEXT PRIMARY KEY
  user_id     TEXT NOT NULL (FK → users.id)
  created_at  TEXT NOT NULL
  expires_at  TEXT NOT NULL
  -- 客户端只存 session id，不存用户数据
```

**现有 `users.handle` 加 UNIQUE 约束**（当前没有唯一约束，多个用户可以同名）。

### 4.6 迁移路径

- Phase 1：cookie-based session（无密码，handle 自填）
- Phase 2：OAuth 插件（GitHub / Google / Anthropic）
- Phase 3：可选密码 + email 验证

每个 phase 都是可选的。Phase 1 解决"多用户"问题，Phase 2 解决"真实身份"问题。

---

## 5. 数据库迁移层

### 5.1 问题

`lib/db/init.ts` 内联 DDL，改表结构要手动编辑。第三方部署者不敢升级版本。

### 5.2 方案

```
lib/db/migrations/
  001_initial_schema.sql          # 当前 init.ts 的 DDL 导出
  002_add_sessions_table.sql
  003_add_agent_config_columns.sql
  ...

lib/db/migrate.ts
  - 读 migrations/ 目录，按序号执行
  - 维护 schema_version 表
  - ensureInit() 先跑 migrate() 再 seed()
```

**规则**：每新增一个字段或表，写一个 migration 文件，不改 `init.ts`。

---

## 6. 文件变更全景

以下是要改动的文件清单（按依赖顺序排列）：

```
新建:
  lib/ai/provider.ts              ← 核心接口定义 + resolveProvider()
  lib/ai/providers/
    minimax.ts                    ← 从 minimax.ts 迁入
    openai.ts                     ← 新建
    anthropic.ts                  ← 新建
    mock.ts                       ← 新建
  data/domains.example.yaml       ← 领域配置示例
  data/agents.example.yaml        ← Agent 配置示例
  data/domains.yaml               ← 默认 8 棵树（从 domains.ts 转换）
  data/agents.yaml                ← 默认 4 个 AI 居民（从 residents.ts 转换）
  lib/db/migrate.ts               ← 迁移 runner
  lib/db/migrations/
    001_initial_schema.sql        ← 从 init.ts 导出
  lib/auth/
    types.ts                      ← Session / User 类型
    session.ts                    ← cookie session 管理
    middleware.ts                 ← Next.js 路由保护中间件
  Dockerfile
  docker-compose.yml
  .env.example                    ← 更新为新契约

修改:
  lib/ai/minimax.ts              → 删除（迁入 providers/）
  lib/ai/prompts.ts              → 改为从 agents.yaml 加载
  lib/ai/answer/route.ts         → 使用 resolveProvider()
  lib/ai/awaken/route.ts         → 使用 resolveProvider()
  lib/domains.ts                 → 改为从 domains.yaml 加载
  lib/residents.ts               → 改为从 agents.yaml + domains.yaml 加载
  lib/db/init.ts                 → 调用 migrate() 替代内联 DDL
  lib/db/seed.ts                 → 从 YAML 文件加载种子数据
  app/layout.tsx                 → 接入 session middleware
  hooks/useIdentity.ts           → 从 session 读取身份（保留 localStorage 作为离线降级）
  README.md                      → 更新为 Docker-first 启动流程
  CONTRIBUTING.md                → 更新"添加 AI 居民"和"添加领域"流程
```

---

## 7. 向后兼容规则

1. **API 路由路径不变** — `/api/forest/*`、`/api/branch` 等全部保留
2. **localStorage identity 保留** — 作为 session 不可用时的降级路径
3. **`KnowledgeTree` 组件不变** — 它是纯 UI 组件，不依赖后端细节
4. **SQLite 仍是默认数据库** — 但新增的 migrate 层让切换到 PostgreSQL 只需改连接字符串
5. **`TG_AI_PROVIDER` 默认值 `minimax`** — 现有部署零改动继续工作

---

## 8. 未决决策

| # | 问题 | 选项 | 推荐 |
|---|------|------|------|
| U1 | 配置用 YAML 还是 JSON? | YAML（更可读）/ JSON（零依赖） | **YAML** — 项目已有 Node.js 运行时，`js-yaml` 是成熟轻量的依赖。领域配置需要注释说明，YAML 更合适。 |
| U2 | Migration 用现成库（`knex`/`umzug`）还是自写? | 自写（SQLite 场景足够，零额外依赖）/ knex（更通用但重） | **自写** — 当前只有 SQLite，一个按序号执行 `.sql` 文件的 runner 不到 50 行。跨 DB 时再换。 |
| U3 | Session 存在 SQLite 还是 Redis? | SQLite（简单，零依赖）/ Redis（可扩展） | **SQLite** — 开源框架的场景是单实例部署，SQLite 够用。Redis 作为 Phase 2 选项。 |
| U4 | Auth 的 Phase 1 是无密码 handle 自填，还是直接上 OAuth? | 无密码（最快落地）/ OAuth（更安全但复杂） | **无密码** — 框架需要先"能跑"，安全性可以后加。文档明确标注"Phase 1 适合演示和本地使用"。 |
