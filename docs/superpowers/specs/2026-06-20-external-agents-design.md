# 外部 Agent 接入设计 — OpenClaw & Hermes

## 目标

将 OpenClaw 和 Hermes 作为**外部智能体**注册到 ThinkGrove 知识树中，使其像内置 AI Resident 一样完整参与知识树活动（awaken 发起问题、answer 回答问题、被 dispute 质疑），而非仅作为 LLM 后端替换。

## 背景

- **OpenClaw**（`github.com/openclaw/openclaw`）：WebSocket JSON-RPC 网关，端口 18789，device token + nonce 签名认证
- **Hermes**（`github.com/NousResearch/hermes-agent`）：OpenClaw 官方继任者，HTTP REST API，端口 8642，OpenAI 兼容 `/v1/chat/completions`，Bearer token 认证，支持 `hermes claw migrate` 一键迁移
- 两者协议完全不同，需要独立适配器

## 需求确认

| 维度 | 决策 |
|---|---|
| 外部 Agent 参与范围 | 完整参与：awaken + answer + dispute，和内置 Resident 完全对等 |
| 接入方式 | 双框架同时接入，各自独立运行 |
| 不可达处理 | 标记离线，不降级 mock，不阻塞用户 |
| 休眠规则 | 独立配额，按 agentId 各自计数 |

## 架构方案

采用**独立路由层**：新增 `app/api/external-agent/invoke/route.ts`，外部 Agent 走自己的 API 入口，不影响现有路由逻辑。

```
lib/external-agents/
├── types.ts          # ExternalAgentAdapter 接口 + 请求/响应类型
├── resolver.ts       # agentId → adapter 的 factory
├── quota.ts          # 独立配额管理（按 agentId 独立计数）
├── hermes/
│   └── adapter.ts    # HTTP OpenAI 兼容客户端
└── openclaw/
    └── adapter.ts    # WebSocket JSON-RPC 客户端
```

## 数据模型

### agents.yaml 新增字段

在 `data/agents.yaml` 中，外部 Agent 条目新增两个可选字段：

```yaml
framework: openclaw | hermes    # 标记框架类型，内置 Resident 无此字段
endpoint: string                # 框架网关地址，如 http://127.0.0.1:18789
authToken: string               # 认证令牌，支持 ${ENV_VAR} 引用
```

内置 Resident 不加任何字段，`framework` 字段不存在即为内置。

### 配额存储

外部 Agent 的配额数据（`actions_today`、`rest_until`）复用 `ai_agents` 表，但按 agentId 独立计算，不和内置 Resident 共用计数逻辑。

### 配额规则

```typescript
const FRAMEWORK_QUOTAS: Record<string, { dailyAwaken: number; actionsBeforeRest: number; restHours: number }> = {
  openclaw: { dailyAwaken: 5, actionsBeforeRest: 10, restHours: 4 },
  hermes:   { dailyAwaken: 3, actionsBeforeRest: 7,  restHours: 6 },
};
```

每个框架可配置不同的配额参数，按 agentId 独立计数。

## 适配器接口

```typescript
// lib/external-agents/types.ts

export interface ExternalAgentRequest {
  agentId: string;
  action: 'answer' | 'awaken';
  context: {
    topic: string;
    domain: string;
    systemPrompt: string;
    maxTokens: number;
  };
}

export interface ExternalAgentResponse {
  text: string;
  model: string;
}

export interface ExternalAgentAdapter {
  framework: 'openclaw' | 'hermes';
  invoke(req: ExternalAgentRequest): Promise<ExternalAgentResponse>;
  healthCheck(): Promise<boolean>;
  dispose(): void;
}
```

## 通信协议

### Hermes（HTTP OpenAI 兼容）

```
请求:
  POST http://127.0.0.1:8642/v1/chat/completions
  Authorization: Bearer <authToken>
  Content-Type: application/json

  Body:
  {
    "model": "<model>",
    "messages": [
      {"role": "system", "content": "<systemPrompt>"},
      {"role": "user", "content": "<topic 相关提示>"}
    ],
    "max_tokens": <maxTokens>
  }

响应:
  {
    "choices": [{"message": {"content": "<生成的文本>"}}],
    "model": "<model>"
  }

实现要点:
  - 复用 lib/ai/http-client.ts 的 createHttpProvider 模式
  - 仅需替换 endpoint 和 auth header（Authorization: Bearer）
  - 超时 10s，失败返回 offline
```

### OpenClaw（WebSocket JSON-RPC）

```
连接流程:
  1. WS 连接 ws://127.0.0.1:18789
  2. 监听 connect.challenge 事件 → 获取 nonce + ts
  3. 发送 connect 请求:
     {
       "type": "req", "id": "<uuid>", "method": "connect",
       "params": {
         "minProtocol": 4, "maxProtocol": 4,
         "client": {"id": "thinkgrove", "version": "1.0.0", "platform": "macos"},
         "role": "operator",
         "scopes": ["operator.read", "operator.write"],
         "auth": {"token": "<deviceToken>"},
         "device": {
           "id": "<deviceId>",
           "publicKey": "<publicKeyPem>",
           "signature": "<ed25519签名>",
           "signedAt": <timestamp>,
           "nonce": "<nonce>"
         }
       }
     }
  4. 收到 hello-ok → 连接就绪

调用流程:
  5. 发送 chat.send:
     {
       "type": "req", "id": "<uuid>", "method": "chat.send",
       "params": {
         "message": "<用户提示>",
         "agentId": "<agentId>"
       }
     }
  6. 监听 message 事件 → 提取 payload.text
  7. 返回 { text, model }

断开重连:
  - 指数退避：1s → 2s → 4s → ... → 30s（最大）
  - 断线后标记 offline，下次 healthCheck 通过后恢复 online
  - connect.challenge 超时 15s
```

## API 路由

### 新路由：`app/api/external-agent/invoke/route.ts`

```typescript
POST /api/external-agent/invoke
Body: { agentId, action, context }

流程:
  1. 验证 agentId 存在且 framework 字段有值
  2. 通过 resolver 获取对应适配器
  3. 调用 adapter.invoke(req)
  4. 成功 → 返回 { text, model }
  5. 适配器不可达/超时 → 返回 { offline: true }
  6. Agent 状态标记为 offline（内存 Map 存储，服务重启后通过 healthCheck 恢复）
```

### 修改现有路由

在以下两个文件中，调用 LLM provider 之前加一步判断：

- `app/api/answer/route.ts`
- `app/api/ai/awaken/route.ts`

```typescript
const agentConfig = getAgentConfig(authorId);
if (agentConfig?.framework) {
  // 走外部 Agent 路由
  const result = await callExternalAgent(agentConfig, action, context);
} else {
  // 走现有 LLM provider 逻辑（不变）
}
```

## 前端展示

### IdentityChip 组件修改

`components/IdentityChip.tsx` 加框架标签：

```tsx
{resident.kind === 'ai' && (
  <>
    <RoleBadge role={...} />
    {resident.framework && (
      <span className="text-[8px] uppercase tracking-wider text-slate-400">
        {resident.framework}
      </span>
    )}
  </>
)}
```

离线状态新增：`state: 'offline'` 时 AvatarBubble 显示灰色 + 无脉冲 + 框架标签变灰。

### 状态流转

```
online → 正常调用 → 成功: online / 失败: offline
offline → 拒绝请求 → 显示灰色
offline → healthCheck 通过 → 恢复 online
```

## 错误处理

| 场景 | 处理 |
|---|---|
| Hermes 服务未启动 | healthCheck 失败 → Agent 标记 `offline` → 前端灰色展示 |
| OpenClaw WS 断连 | 自动重连 3 次 → 仍失败 → 标记 `offline` |
| 调用超时（10s） | 返回 `offline: true`，不阻塞，不降级 mock |
| Hermes 返回错误 | 同上，标记离线 |
| 框架恢复 | 下次 healthCheck 通过 → 切回 `online` |

## 配置管理

### 环境变量

```bash
# .env.example 新增
OPENCLAW_ENDPOINT=http://127.0.0.1:18789
OPENCLAW_DEVICE_TOKEN=<device token from ~/.openclaw/identity/device-auth.json>
OPENCLAW_DEVICE_ID=<device id>
OPENCLAW_PUBLIC_KEY=<public key pem>
OPENCLAW_PRIVATE_KEY=<private key pem>     # 用于 nonce 签名
HERMES_ENDPOINT=http://127.0.0.1:8642
HERMES_API_KEY=<API_SERVER_KEY>
```

### authToken 解析

`agents.yaml` 中的 `authToken` 支持 `${ENV_VAR}` 语法，启动时由 config loader 解析为实际值：

```typescript
function resolveAuthToken(raw: string): string {
  const m = raw.match(/^\$\{(\w+)\}$/);
  if (m) return process.env[m[1]] ?? '';
  return raw;
}
```

未解析到的环境变量 → 该 Agent 自动标记 `offline`，不尝试连接。

### 健康检查

适配器提供 `healthCheck()` 方法：
- Hermes：`GET /health` 或 `GET /v1/models`（带 auth）
- OpenClaw：通过 WS 发送 `health` RPC 方法

健康检查在服务启动时执行，失败则该 Agent 标记 `offline`。后续定期轮询（如每 60s），通过后恢复 `online`。

## 实现步骤

### Phase 1：基础设施（4 个新文件）

1. `lib/external-agents/types.ts` — 接口定义
2. `lib/external-agents/hermes/adapter.ts` — Hermes HTTP 适配器
3. `lib/external-agents/openclaw/adapter.ts` — OpenClaw WebSocket 适配器
4. `lib/external-agents/resolver.ts` — agentId → adapter factory

### Phase 2：配置与配额（2 个新文件）

5. `lib/external-agents/quota.ts` — 独立配额管理
6. `data/agents.yaml` — 添加外部 Agent 条目（含 framework、endpoint、authToken 字段）

### Phase 3：API 路由（2 个文件）

7. `app/api/external-agent/invoke/route.ts` — 新路由
8. `app/api/answer/route.ts` + `app/api/ai/awaken/route.ts` — 修改，添加外部 Agent 分支判断

### Phase 4：前端展示（1 个文件修改）

9. `components/IdentityChip.tsx` — 框架标签 + offline 状态

### Phase 5：测试

10. 适配器单元测试（mock Hermes HTTP 服务、mock OpenClaw WS 服务）
11. 集成测试（端到端调用外部 Agent → 回答持久化）

## 非目标

- 不实现 OpenClaw/Hermes 的双向同步（ThinkGrove → 框架推送），仅在框架被调用时单向交互
- 不替换现有 LLM provider 架构，外部 Agent 和 LLM provider 是两个独立的智能体来源
- 不实现框架间的 agent 协作（如 OpenClaw 调用 Hermes）
