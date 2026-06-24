# ThinkGrove — One Pager

## One-liner
ThinkGrove is an open-source **question-first knowledge ecosystem framework**: instead of delivering a fixed wiki, forum, or chatbot product, it gives downstream projects a reusable runtime for `Domain -> Subdomain -> Question -> Branch -> Answer`, with `Source` as a first-class evidence object and `Citation / Dispute / Vote / Reputation` as governance primitives.

## Core value
- **Question-first tree shape** — `Question` is the main node on a knowledge branch; `Branch` and `Answer` are threads and responses under it; `Source` is attached evidence, not a parallel branch node.
- **Structured question definition** — questions carry domain placement, source constraints, answer format, quality dimensions, and curation lifecycle, so governance is reusable instead of ad-hoc.
- **Source-oriented evidence layer** — collector agents gather `sources`; answers cite them; disputes target source credibility; curation stays auditable.
- **Role-based AI collaboration** — `collector`, `oracle`, `synthesizer`, `critic`, `tutor`, and `arbitrator` collaborate around question clarity, evidence quality, answer rigor, and dispute arbitration.
- **Framework-first boundary** — this repo keeps runtime, migrations, API contracts, framework docs, starter kits, and neutral skins; products should bring their own UI, onboarding, and narrative.

## Standard knowledge shape
```
Domain
└── Subdomain
    └── Question
        ├── Branch / Answer
        ├── Source  (evidence object)
        ├── Citation
        └── Dispute / Vote / Reputation
```

## What downstream projects can do
- Define their own domain trees and subdomain taxonomy without forking core runtime.
- Create questions with structured constraints: required source kinds, minimum source count, answer format, length, and confidence thresholds.
- Collect sources through agents or humans, then attach them to questions or answers as verifiable evidence.
- Run resident workflows for drafting answers, challenging evidence, clarifying questions, and arbitrating disputes.
- Replace the demo skin and product narrative while reusing the same stable runtime.

## Stable seams
- Runtime primitives: `Domain`, `Subdomain`, `Question`, `Branch`, `Answer`, `Source`, `Citation`, `Dispute`, `Vote`, `Reputation`, `Article`
- API surfaces: `/api/subdomains`, `/api/questions`, `/api/sources`, `/api/branch`, `/api/answer`, `/api/forest`, `/api/forest/[id]`, `/api/ai/collaboration/run`
- Extension points: domain config, agent config, AI provider, external-agent adapter, theme/skin layer
- Docs and starter kits: `docs/框架契约.md`, `docs/starter-kits.md`, `starter-kits/`

## Who should use ThinkGrove
- Teams building Q&A knowledge communities, research workbenches, AI-native knowledge bases, or domain-specific reasoning tools.
- Developers who want a configurable backend for question governance, source collection, answer synthesis, and dispute arbitration.
- Product teams that want to own their UI, brand, and content strategy without rebuilding core knowledge-runtime logic.

## Tech stack
- Frontend: Next.js 15, React 19, TypeScript strict mode
- Styling: Tailwind CSS v4, motion
- Database: better-sqlite3 with WAL mode and migrations
- AI: pluggable provider runtime with external-agent adapters
- Config: YAML-based domain and agent registry
- Testing: Vitest

## Repository boundary
- **Keep in this repo**: core runtime, DB schema, API contracts, framework docs, starter kits, neutral default skins.
- **Move to product repo**: homepage skin, onboarding, marketing copy, brand narrative, fixed operation scripts, daily reports, product-specific wording.

## Call to action
- Use the starter kits to bootstrap a question-first knowledge runtime.
- Extend domains, agents, and themes through config instead of forking core logic.
- Keep framework improvements in this repo; keep product narratives outside.

---

# ThinkGrove — 一页对外宣传文案

## 一句话定位
ThinkGrove 是一个开源的 **问题导向知识生态框架**：它不交付一套固定的 Wiki、论坛或聊天机器人产品，而是为下游项目提供可复用的 runtime，标准知识形态是 `Domain -> Subdomain -> Question -> Branch -> Answer`，其中 `Source` 是一等证据对象，`Citation / Dispute / Vote / Reputation` 是治理原语。

## 核心价值
- **问题导向的知识树形态** — `Question` 是知识枝桠的主节点；`Branch` 和 `Answer` 是其下的线程与回答；`Source` 是附着证据，不是与问题并列的树节点。
- **结构化问题定义** — 问题不只是标题和正文，还应表达领域归属、来源约束、回答格式、质量分项和 curation lifecycle，让治理可复用。
- **信息源作为一等证据对象** — 收集型 Agent 可将 `Source` 入库；回答可显式引用来源；争议可直接落到来源可信度；整个流程可审计。
- **AI resident 协作** — `collector`、`oracle`、`synthesizer`、`critic`、`tutor`、`arbitrator` 围绕问题澄清、证据质量、回答严谨性和争议仲裁协作。
- **框架与产品边界清晰** — 本仓库保留 runtime、migration、API contract、框架文档、starter-kit 和中性皮肤；产品层负责 UI、onboarding、品牌和运营叙事。

## 标准知识形态
```
Domain
└── Subdomain
    └── Question
        ├── Branch / Answer
        ├── Source  (证据对象)
        ├── Citation
        └── Dispute / Vote / Reputation
```

## 下游项目可以做什么
- 在不必 fork 核心 runtime 的前提下，定义自己的领域树和二级领域分类。
- 创建带结构化约束的问题：所需信息源类型、最小数量、回答格式、长度、置信度阈值。
- 通过 Agent 或人类收集 `Source`，并将其作为可核验证据附着到问题或回答上。
- 运行 resident 工作流：起草回答、挑战证据、澄清问题、仲裁争议。
- 复用同一套 stable runtime，同时替换 demo skin 和产品叙事。

## 稳定接缝
- 结构原语：`Domain`、`Subdomain`、`Question`、`Branch`、`Answer`
- 证据与治理对象：`Source`、`Citation`、`Dispute`、`Vote`、`Reputation`、`Article`
- API 表面：`/api/subdomains`、`/api/questions`、`/api/sources`、`/api/branch`、`/api/answer`、`/api/forest`、`/api/forest/[id]`、`/api/ai/collaboration/run`
- 扩展点：domain config、agent config、AI provider、external-agent adapter、theme/skin layer
- 文档与 starter-kit：`docs/框架契约.md`、`docs/starter-kits.md`、`starter-kits/`

## 适用对象
- 正在构建问答知识社区、研究工具、AI-native knowledge base 或领域推理产品的团队。
- 希望获得可配置后端能力的产品团队：问题治理、信息源收集、回答综合、争议仲裁。
- 希望拥有自己 UI、品牌和内容策略，但不想重复造知识 runtime 的开发者和产品团队。

## 技术栈
- 前端：Next.js 15、React 19、TypeScript strict mode
- 样式：Tailwind CSS v4、motion
- 数据库：better-sqlite3、WAL mode、migration
- AI：pluggable provider runtime + external-agent adapter
- 配置：YAML-based domain and agent registry
- 测试：Vitest

## 仓库边界
- **保留在本仓库**：core runtime、DB schema、API contracts、框架文档、starter kits、neutral default skins。
- **迁出到产品仓库**：homepage skin、onboarding、marketing copy、brand narrative、fixed operation scripts、daily reports、product-specific wording。

## 行动建议
- 使用 starter-kits 快速启动一个 question-first knowledge runtime。
- 通过配置扩展 domains、agents、themes，而不是 fork 核心逻辑。
- 把框架改进留在本仓库；把产品叙事放在外部。
