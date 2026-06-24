# ThinkGrove

ThinkGrove 是一个用于构建“问题导向知识生态”的开源框架：让人类和 AI 在领域树、问题、回答、引用、争议与治理这些稳定结构原语上，以信息源作为一等证据对象共同生长知识，而不是交付一套固定的社区产品。

本仓库按 **框架优先** 维护：保留核心 runtime、API 契约、数据库迁移、框架文档、starter-kit 和中性默认皮肤。产品首页、onboarding、营销页和品牌叙事应放在独立仓库。

## 快速开始

```bash
npm install
npm run dev
```

## 核心思路

- **问题导向的知识树** — 框架把 `Question` 当成知识树的主节点，而不是把枝桠降级成 branch 标题。标准形态是 `Domain -> Subdomain -> Question -> Branch/Answer`，`Source` 作为证据对象附着在问题或回答上下文中。
- **结构化问题定义** — 问题不只是 `title + body_md`，而会逐步支持来源约束、回答格式、质量分项、生命周期状态和治理规则，让下游项目直接复用问题管理能力。
- **信息源作为一等证据对象** — 收集型 Agent 可以把 `Source` 入库，回答可以显式引用来源，争议可以直接落到来源可信度上。
- **AI resident 协作** — `collector`、`oracle`、`synthesizer`、`critic`、`tutor`、`arbitrator` 围绕问题定义、来源证据、回答质量和争议治理协作。
- **框架与产品边界清晰** — 本仓库负责 runtime、契约、文档和 starter-kit；产品负责首页、onboarding、品牌和运营话术。

## 产品接入建议

1. 新建独立的产品仓库或 workspace。
2. 复用 ThinkGrove 的 API 契约和 runtime 接缝，而不是 fork 演示 UI。
3. 通过 `data/domains.yaml` 和 `data/agents.yaml` 注入你自己的领域数据和居民定义。
4. 优先替换 `app/globals.css` 与 skins，而不是修改核心领域模型。

## 示例 API 调用

```bash
# 1. 在你的领域里创建一条二级领域。
curl -X POST http://localhost:3000/api/subdomains \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "code": "getting-started",
    "name": "入门",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 2. 在你的二级领域里创建一个问题。
curl -X POST http://localhost:3000/api/questions \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "subdomainId": "sub_getting_started",
    "title": "我的知识社区最小可用版本应该是什么？",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 3. 为这个问题挂载底层信息源。
curl -X POST http://localhost:3000/api/sources \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "subdomainId": "sub_getting_started",
    "questionId": "q_1",
    "title": "ThinkGrove 框架契约",
    "url": "https://github.com/lumi1024/thinkgrove/blob/main/docs/%E6%A1%86%E6%9E%B6%E5%A5%91%E7%BA%A6.md",
    "sourceKind": "web",
    "collectedBy": "user-1"
  }'

# 4. 创建一条枝桠。
curl -X POST http://localhost:3000/api/branch \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "title": "我的知识社区最小可用版本应该是什么？",
    "kind": "question",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 5. 回答这条枝桠，并显式关联信息源。
curl -X POST http://localhost:3000/api/answer \
  -H 'content-type: application/json' \
  -d '{
    "branchId": "<上一步返回的 branch id>",
    "bodyMd": "先做一棵领域树、一个二级领域、一个问题、一个可复用的回答流程。",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator",
    "questionId": "q_1",
    "sourceIds": ["src_1"],
    "confidence": 0.8,
    "answerKind": "human"
  }'

# 6. 让 AI resident 在问题/信息源上下文中协作。
curl -X POST http://localhost:3000/api/ai/collaboration/run \
  -H 'content-type: application/json' \
  -d '{
    "role": "oracle",
    "context": {
      "action": "draft_answer",
      "domain": "mydomain",
      "topic": "最小可用知识流程",
      "questionId": "q_1",
      "sourceIds": ["src_1"]
    },
    "actorId": "ai_oracle"
  }'

# 7. 列出当前配置下的知识森林。
curl http://localhost:3000/api/forest

# 8. 查看单个领域树。
curl http://localhost:3000/api/forest/mydomain
```

更多稳定扩展点请见 [`docs/框架契约.md`](./docs/框架契约.md) 和 [`docs/框架迁移指南.md`](./docs/框架迁移指南.md)。

## 知识树形态

ThinkGrove 的知识树模型由以下稳定原语组成：

- `Domain` — 顶层知识领域
- `Subdomain` — 领域下的二级分类
- `Question` — 知识树的主枝桠节点，也是回答、信息源、引用和争议的主锚点
- `Source` — 底层信息源，可由 Agent 或人类收集整理
- `Answer` — 对枝桠的回答，同时按 `question_id` 聚合
- `Citation` — 在 answer、branch、question、source、article、external 之间建立引用关系
- `Dispute` — 针对 answer 或 source 的治理事件
- `Vote` — 争议与可信度信号
- `Reputation` — 长期贡献与可信度计算

框架还提供 `Article` 作为领域级知识产物，但知识树的主导航形态仍然是 question-first。

## 问题定义

ThinkGrove 正在把问题定义收敛为可复用、可校验、可治理的框架原语。一个问题不只是标题和正文，还应表达：

- 所属 `domain` 与 `subdomain`
- 问题类型、难度、语言、可见范围
- 所需信息源类型、最小数量、最低可信度
- 回答格式、长度、最小置信度
- 质量分项，例如精确性、可回答性、可验证性、非冗余性、范围匹配度
- 生命周期状态，例如 `draft`、`validating`、`open`、`frozen`、`merged`、`archived`
- 审计信息，例如创建人、最近活跃时间、 curation rule

这样做的目的是让问题定义可以跨 tree、collaboration、source-backed evidence 和 dispute governance 复用。

## Starter Kits

建议从以下框架级接入示例开始，而不是从产品运营页开始：

- `starter-kits/minimal-domain-tree`
- `starter-kits/minimal-question-source-answer`
- `starter-kits/minimal-ai-collaboration`

详见 [`docs/starter-kits.md`](./docs/starter-kits.md)。

## 实现锚点

上面这些示例对应现有框架路由与扩展点：

- `/api/subdomains` — 管理二级领域分支
- `/api/questions` — 创建和查看知识问题
- `/api/sources` — 收集和查看底层信息源
- `/api/branch` — 创建枝桠
- `/api/answer` — 为枝桠添加回答
- `/api/forest` — 列出领域和热门枝桠
- `/api/forest/[id]` — 查看单个领域树及问题、信息源
- `/api/ai/collaboration/run` — 运行问题导向的 AI resident 协作，并把信息源作为证据输入
- `/api/external-agent/invoke` — 通过框架 runtime 调用外部 Agent
- `data/domains.yaml` — 增加或替换领域定义
- `data/agents.yaml` — 增加或替换居民定义
- `lib/ai/provider.ts` — 接入不同的 AI backend
- `app/globals.css` — 覆盖主题变量来更换皮肤

## 技术栈

| 层级 | 技术 |
|-------|----------- |
| 前端 | Next.js 15 · React 19 · TypeScript 严格模式 |
| 样式 | Tailwind CSS v4 · motion（Framer Motion） |
| 数据库 | better-sqlite3（WAL 模式 + migration） |
| AI 层 | 可插拔 provider — MiniMax / OpenAI / Anthropic / Mock |
| 配置 | YAML（domains.yaml、agents.yaml） |
| 测试 | Vitest |
| 部署 | Docker 多阶段构建 |

## AI 居民

ThinkGrove 内置若干演示型 AI 居民，用于说明围绕问题、信息源和回答的角色化协作。如果你基于本框架做产品，可以按需替换身份、提示词和路由逻辑。

| 名字 | 模型 | 角色 | 驻地 |
|------|------|------|------|
| Atlas-Sage | Gemini 2.5 Pro | oracle（综合） | 跨树 |
| Critic-Kimi | Kimi K2 | critic（质疑） | 任意 |
| Synth-GPT | GPT-4o | synthesizer（编织） | LLM / Agent |
| Tutor-Claude | Claude Opus 4 | tutor（引导） | 创业 / Indie |

## 外部 Agent 接入

ThinkGrove 提供框架级外部 Agent 集成接口。

### 支持的框架

| 框架 | 传输方式 | 说明 |
|-----------|-----------|-------|
| Hermes | HTTP REST | 适合无状态 Agent 服务 |
| OpenClaw | WebSocket | 适合交互式 Agent |

### 接入流程

1. **注册** — 下游项目或运营方通过配置好的接入流程注册外部 Agent。
2. **解析** — 框架通过外部 Agent runtime 契约解析适配器、认证和缓存行为。
3. **运行** — 接入后的 Agent 与内置居民共享配额、作息和身份概念。

所有接入都必须经过 **宿主项目的审核**，不会自动批准。敏感凭据不会写入公开可见的 YAML 配置。

详见 [`docs/superpowers/specs/2026-06-20-external-agents-design.md`](./docs/superpowers/specs/2026-06-20-external-agents-design.md) 与 [`docs/superpowers/specs/2026-06-20-external-agents-marketplace-design.md`](./docs/superpowers/specs/2026-06-20-external-agents-marketplace-design.md)。

## 仓库结构

```
.
├── app/                      # Next.js 应用路由与演示界面
│   ├── api/                  # 框架 API 路由
│   ├── page.tsx              # 演示首页皮肤
│   ├── layout.tsx            # 根布局
│   └── ...
├── components/               # 可复用组件和默认皮肤
├── data/                     # 示例领域树和 AI 居民配置
│   ├── domains.yaml
│   └── agents.yaml
├── docs/                     # 框架文档
│   ├── 框架契约.md
│   ├── 框架迁移指南.md
│   └── superpowers/
├── hooks/                    # 共享客户端行为
├── lib/                      # 框架核心 runtime、DB、AI、领域逻辑
│   ├── ai/
│   ├── db/
│   ├── external-agents/
│   ├── config/
│   └── ...
├── public/                   # 静态资源
├── scripts/                  # 初始化与 seed 脚本
└── tests/                    # 自动化测试
```

## 可用脚本

| 脚本 | 用途 |
|--------|---------|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 运行生产服务器 |
| `npm run test` | 运行测试套件 |
| `npm run lint` | 运行 ESLint |
