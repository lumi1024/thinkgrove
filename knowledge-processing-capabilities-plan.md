# ThinkGrove — 知识收集与加工框架化计划

> 范围：本仓库当前 `framework` 分支；优先框架层，不迁入产品叙事。
> 状态：修订版计划，基于你补充的“知乎式树形态 + 信息源 Agent + 问题定义”方向重写。

## 目标

把“知识收集/加工”收敛为框架原生结构：
领域 -> 二级领域 -> 问题 -> 底层信息源 -> 回答/引用/争议 -> 治理。
而不是泛化的日报、整理台账或产品运营流。

## 前提

- 仓库当前定位是框架优先，不是单一产品。
- 不新增固定产品首页、固定运营流程、固定日报文案。
- 修订来自你刚补充的产品形态判断：
  树是一级领域，长出二级领域分支，
  枝桠是该领域相关问题，
  有一类 Agent 负责收集整理底层信息源，
  人和 Agent 在问题下输出观点和回答，
  底层信息源作为参考内容来源。

## 核心价值再压缩

- 对内一句话：`ThinkGrove` 的核心价值是**一套可复用的“知识生态 runtime”**，让下游项目不用从零搭 wiki、论坛或聊天机器人，而是直接基于 `Domain / Subdomain / Question / Source / Answer / Dispute / Vote / Citation / Reputation` 这些稳定原语，构建人机共创、可争议、可治理、可换领域和 AI 后端的知识社区。
- 对外一句话：`ThinkGrove` 是**给知识社区用的“操作系统级骨架”**，不是某个固定产品；它的竞争力在于把“收集、组织、争议、引用、治理、AI 协作”做成可配置、可替换、可二次定制的框架能力，而不是交付一套固定的日报、运营页或产品叙事。

## 修订后的 3 个核心能力

### 1. 知识加工 primitives 与事件契约
- 问题：当前缺少“加工过程”的结构化表达。
- 修订后重点不再是泛化 `knowledge-event`，而是 **Question / Source 一等化**。
- 下游项目要能基于框架表达：
  候选问题、问题澄清、底层信息源入库、回答引用、争议、采纳、归档。
- 产品层可基于这些结构自建日报/周报，
  但框架只提供结构、状态和时间戳，不定义固定运营话术。

### 2. AI resident 编排接口
- 问题：当前 resident 协作偏单次回答/单次 awaken，缺少系统协作协议。
- 修订后重点不是通用 orchestration，而是 **Question/Source 导向的协作协议**。
- 新增角色职责：
  - `collector`：收集/整理 `sources`
  - `oracle`：综合高质量回答
  - `synthesizer`：跨分支/跨来源编织
  - `critic`：质疑问题定义、回答证据、source authority
  - `tutor`：引导问题澄清、source 要求、回答约束
  - `arbitrator`：只做 dispute / source credibility 仲裁
- 触发条件按 `domain / subdomain / question / source / dispute` 状态变化设计。
- 产出必须挂可审计元数据：
  `prompt_hash`、关联 `source_ids`、关联 `citation`、关联 `dispute`。

### 3. 下游产品接入模板
- 问题：下游真正接入时，最痛的是“最小可用工作流”不清晰。
- 修订后 starter-kit 围绕 **Domain -> Subdomain -> Question -> Source -> Answer -> Citation/Dispute** 设计。
- 每个 kit 给出稳定 API 使用示例，不复制框架 UI。
- 明确边界：只教下游怎么接 runtime，不教产品首页、onboarding、品牌叙事。

## 数据模型修订

### Subdomain 一等化
- 当前 `domains` 只有一级，没有显式二级领域。
- 新增 `subdomains`：
  - `domain_id`
  - `code`
  - `name`
  - `description`
  - `status`
  - `position`
- Question 归属到 `subdomain_id`，不再直接挂在 `domain_id`。

### Question 一等化
- `branches` 继续保留，但新增 `questions` 作为主问题本体。
- `questions` 建议字段：
  - `id`
  - `domain_id`
  - `subdomain_id`
  - `title`
  - `body_md`
  - `quality_score`
  - `open`
  - `canonical`
  - `source_requirements`
  - `created_by`
  - `created_at`
  - `last_activity_at`
- `branches` 变成问题下的线程/分支：
  - `question_id`
  - `kind`：`answer`, `counter`, `cite`, `rebuttal`, `meta`, `source_note`
  - `parent_branch_id`
- 这是“知乎式”结构的最小稳定版。

### Source 一等化
- 新增 `sources`，用于承载信息收集 Agent 收回来的底层信息源。
- 建议字段：
  - `id`
  - `domain_id`
  - `subdomain_id`
  - `question_id`
  - `title`
  - `url`
  - `summary_md`
  - `source_kind`：`web`, `paper`, `report`, `internal`, `external_api`
  - `authority_score`
  - `freshness_score`
  - `collected_by`
  - `collection_agent_id`
  - `created_at`
  - `reviewed_at`
  - `archived_at`
- 这样底层信息源就变成框架原生结构，而不是外部链接备注。

### Answer 重新绑定
- 当前 `answers` 绑定 `branch_id` 保持不变。
- 主问题答案建议额外索引到 `question_id`，方便按问题聚合高质量回答。
- 回答增加字段：
  - `confidence`
  - `source_ids`
  - `answer_kind`：`human`, `ai`, `synthesized`

### Citation / Dispute / Vote 扩层
- `citations.to_type` 增加 `source`。
- `disputes.target_type` 增加 `source`。
- 这样底层信息源也可以被引用、被质疑、被仲裁。

## AI 协作协议修订

### 目标
让 resident 围绕“问题质量、信息源质量、回答证据质量”协作，
而不是围绕通用运营任务协作。

### 推荐协议
1. `collector`
   - 为问题收集/整理 `sources`
   - 产出：`source` + `summary_md`
   - 触发：问题创建后、子话题新增后、问题长期无回答后
2. `oracle`
   - 综合高质量回答
   - 产出：绑定 `question_id` 的 `answer`
   - 允许显式引用 `source_ids`
3. `synthesizer`
   - 跨分支/跨来源编织
   - 产出：`answer` 或 `article`
4. `critic`
   - 质疑问题定义、回答证据、source authority
   - 产出：`counter` / `rebuttal` / `dispute`
5. `tutor`
   - 引导问题澄清、source 要求、回答约束
   - 产出：`meta` 分支或问题字段更新
6. `arbitrator`
   - 只用于 dispute / source credibility 仲裁
   - 产出：`ruling_summary` 或 dispute status 更新

### 触发条件建议
- 问题创建后：tutor 检查是否清晰
- source 入库后：critic 检查是否可信
- 回答生成后：critic 校验是否引用 source
- dispute 成立后：arbitrator 给出 ruling
- 问题长期无高质量回答：collector + synthesizer 协作

## API 修订

不要只做 `/api/knowledge/events`。
建议改成：

- `/api/subdomains`
- `/api/questions`
- `/api/sources`
- `/api/answers`
- `/api/citations`
- `/api/disputes`
- `/api/governance/policy`
- `/api/ai/collaboration/run`

## Starter Kit 修订

三个 kit 改为：

1. `minimal-domain-tree`
   - 最小领域树 + 二级领域示例
2. `minimal-question-source-answer`
   - 最小问题、信息源、回答流
3. `minimal-ai-collaboration`
   - 最小 resident 协作配置与调用示例

每个 kit 都只给 runtime 用法，不给产品皮肤。

## 任务清单

1. 扩展 schema 与 migration：`lib/db/migrations/005_subdomains_questions_sources.sql`
2. 新增 repo：`lib/db/repos/subdomains.ts`
3. 新增 repo：`lib/db/repos/questions.ts`
4. 新增 repo：`lib/db/repos/sources.ts`
5. 扩展 `answers` 查询与索引：`lib/db/repos/answers.ts`
6. 扩展 `citations` 与 `disputes` 支持 `source`：`lib/db/repos/citations.ts`、`lib/db/repos/disputes.ts`
7. 新增 API：`app/api/subdomains/route.ts`
8. 新增 API：`app/api/questions/route.ts`
9. 新增 API：`app/api/sources/route.ts`
10. 新增 resident 编排接口：`lib/ai/collaboration.ts`
11. 新增 resident 编排 API：`app/api/ai/collaboration/run`
12. 新增 starter-kit 目录与文档：`starter-kits/`、`docs/starter-kits.md`
13. 更新契约文档：`docs/框架契约.md`、`docs/框架迁移指南.md`
14. 补充测试：`__tests__/knowledge-model.test.ts`、`__tests__/ai/collaboration.test.ts`
15. 运行验证：`npm run lint && npm run test && npm run build`

## 验收标准

- 框架层可明确表达：
  领域 -> 二级领域 -> 问题 -> 底层信息源 -> 回答 -> 引用/争议 -> 治理
- Question 和 Source 都有质量问题、来源上下文、时间戳和可审计元数据。
- AI resident 围绕问题质量、信息源质量、回答证据质量协作。
- 下游项目可依据 starter-kit 在 30 分钟内搭出最小知识工作流。
- 没有新增固定产品首页、固定运营流程、固定日报文案。

## 明确不做什么

- 不做日报/周报模板
- 不做产品 onboarding
- 不做固定社区运营文案
- 不做单一产品的信息源品牌包装
- 不做脱离 Question/Source 结构的泛化事件台账

## 关键风险

1. 如果现在不做 Subdomain/Question/Source 一等化，
   后面所有整理能力都会变成“挂在 branch 标题上的副作用功能”。
2. 如果继续用泛化 `knowledge-event` 而不是问题/信息源模型，
   会丢失知乎式问答结构，framework 价值会下降。
3. 如果 AI collaboration 不绑定 question/source metadata，
   后面 resident 角色会重新变回 demo persona。

## 阶段二：问题定义方式与知识树形态框架化

> 范围：本仓库当前 `knowledge-processing-capabilities` 分支；继续坚持 framework-first，不加入产品首页、onboarding、固定运营话术。
> 状态：待确认后进入实现。当前阶段只更新计划与方案，不改动实现代码。

### 背景与问题诊断

当前已经完成了第一阶段的 primitives 落地：`subdomains`、`questions`、`sources`、`answers`、`citations`、`disputes`、`ai/collaboration` 已经进框架。下一步不是继续堆接口，而是把“知识树形态”和“问题定义方式”从演示页里的视觉隐喻，收敛成稳定框架契约。

当前存在三个核心问题：

1. 知识树展示仍是 `branch.title` 叶子，`question` 没有被真正作为枝桠节点。
2. 问题定义只有文本字段，缺少结构化 schema、质量分项、来源约束、状态机。
3. tree/graph 页面是 demo 叙事，缺少 question-first 的 API 契约和渲染协议。

如果不先解决这三个问题，后续的 AI collaboration、curation、dispute 都会继续挂在“枝桠标题”这种不稳定表达上。

### 第二阶段核心价值

对内一句话：
ThinkGrove 的下一个核心框架化目标，是把“知识树”收敛为 `Domain -> Subdomain -> Question -> Source/Answer` 的标准形态，同时把“问题定义”做成可复用、可校验、可治理的一等 runtime 原语。

对外一句话：
ThinkGrove 不只是知识社区骨架，而是“问题定义 + 知识树形态 + 信息源治理”三层可配置框架，让下游项目能直接复用标准问答树，而不必各自 reinvent 问题管理和知识组织。

### 设计原则

1. question-first：树节点、线程、回答、信息源、引用、争议都要能回溯到 question。
2. schema-first：问题定义要有结构化 schema，而不只是 title + body_md。
3. runtime-only：框架只定义结构和 API，不定义产品级树形皮肤。
4. extensible curation：下游可扩展问题状态机、校验规则、评分维度，但核心流程由框架保证。
5. stable seam：知识树形态、问题定义、tree/graph API 都要成为稳定的 downstream 接缝。

### 知识树形态方案

#### 1. 当前形态

- 根：`domain`
- 二级分支：`subdomain` 已有模型，但 tree/graph 页面基本没作为稳定节点使用
- 枝桠：`branch.title`，其中一部分是 question，一部分是 answer/counter/cite/rebuttal/meta/source_note
- 信息源：`sources` 已有一等模型，但树页面没有作为标准节点暴露
- 关系：`citations`、`disputes`、`votes` 已有，但树形展示没有形成标准边

#### 2. 目标形态

`Domain -> Subdomain -> Question -> Source/Answer/Citation/Dispute`

其中：

- `Domain`：领域根节点，保持 color、status、position、description
- `Subdomain`：二级领域节点，保持 code、name、status、position
- `Question`：枝桠主节点，不是 branch title
- `Branch`：问题下的线程/回答/质疑/引用/元讨论
- `Answer`：branch 下的可采纳回答，同时索引到 question
- `Source`：问题下的底层信息源
- `Citation`：answer/branch/question/source 之间的引用边
- `Dispute`：answer/source 的治理边
- `Vote`：争议与可信度信号
- `Article`：领域级聚合产物，不作为树形枝桠，而作为知识产物

#### 3. 树形展示契约

框架只定义最小展示契约，不定义具体皮肤：

- 一级展示：domain
- 二级展示：subdomain
- 三级展示：question
- 四级展示：source、answer、citation、dispute
- 节点元数据：至少包含 id、kind、title、status、quality_score、created_at、last_activity_at
- 边元数据：至少包含 relation、created_at、from_id、to_id
- 默认排序：subdomain 按 position/code；question 按 last_activity_at/quality_score；source 按 created_at；answer 按 confidence/created_at

#### 4. Graph 展示契约

graph 页应从“问题概念云”收敛为“问题知识网络”：

- 根节点：一个 question
- 一层关联：subdomain、source、canonical answer
- 二层关联：citation、dispute、counter、rebuttal
- 边类型：cite、dispute、rewrite、adopted
- 可选扩展：downstream product 可继续加 agent、user、article 边，但框架默认只暴露 question-first 核心边

### 问题定义方式方案

#### 1. 当前问题

当前 `questions` 只支持：

- title
- body_md
- source_requirements
- open / canonical / quality_score

缺少：

- 问题类型
- 结构化前置条件
- 来源约束组合
- 回答格式约束
- 质量分项
- 状态机
- 审计与治理字段

这导致问题定义仍然依赖人和产品的“口头约定”，无法被框架复用。

#### 2. 目标定义方式

把问题定义拆成五层：

1. 基础层
2. 约束层
3. 质量层
4. 状态层
5. 审计层

#### 3. 基础层

- `statement`
- `context`
- `domain_id`
- `subdomain_id`
- `question_type`：`exploratory`、`comparison`、`causal`、`procedural`、`factual`、`normative`
- `difficulty`：`beginner`、`intermediate`、`advanced`
- `language`
- `visibility`：`draft`、`internal`、`public`

基础层用于表达“这是什么问题、属于哪个领域、面向谁、难度如何”。

#### 4. 约束层

- `required_source_kinds`：例如 `["web", "paper"]`
- `required_source_count`
- `required_source_authority_min`
- `required_answer_format`：例如 `markdown`、`bullets`、`claim+evidence+uncertainty`
- `forbidden_phrases`
- `min_confidence`
- `max_answer_length`

约束层用于规范“回答这个问题需要哪些信息源、不能怎么写”。

#### 5. 质量层

- `quality_score`
- `precision`
- `answerability`
- `verifiability`
- `non_redundancy`
- `scope_fit`

质量层用于让问题可比较、可排序、可治理。

#### 6. 状态层

建议状态机：

- `draft`
- `validating`
- `open`
- `frozen`
- `merged`
- `archived`

转换规则建议：

- `draft -> validating`：问题创建后自动或由 tutor/critic 触发
- `validating -> open`：满足最小来源约束和质量门禁
- `open -> frozen`：达到最高质量回答、或 curator 冻结
- `frozen -> merged`：主结论被采纳到 article/canonical answer
- `open/frozen/merged -> archived`：过期、重复、无效

框架负责定义状态机，产品可以扩展，但不能删除核心状态。

#### 7. 审计层

- `created_by`
- `created_at`
- `last_activity_at`
- `curated_by`
- `curation_rule_id`
- `schema_version`
- `labels`

审计层用于保证问题定义可追溯、可复盘、可迁移。

### Question Definition Schema

```ts
interface QuestionDefinition {
  schema_version: string;
  statement: string;
  context?: string;
  domain_id: string;
  subdomain_id?: string;
  question_type: QuestionType;
  difficulty?: Difficulty;
  language?: string;
  visibility: Visibility;

  required_source_kinds?: SourceKind[];
  required_source_count?: number;
  required_source_authority_min?: number;
  required_answer_format?: string;
  forbidden_phrases?: string[];
  min_confidence?: number;
  max_answer_length?: number;

  quality_score?: number;
  precision?: number;
  answerability?: number;
  verifiability?: number;
  non_redundancy?: number;
  scope_fit?: number;

  status: QuestionStatus;
  labels?: string[];
  curated_by?: string;
  curation_rule_id?: string;
  created_by: string;
  created_at: string;
  last_activity_at: string;
}
```

配套枚举：

```ts
type QuestionType =
  | 'exploratory'
  | 'comparison'
  | 'causal'
  | 'procedural'
  | 'factual'
  | 'normative';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

type Visibility = 'draft' | 'internal' | 'public';

type QuestionStatus =
  | 'draft'
  | 'validating'
  | 'open'
  | 'frozen'
  | 'merged'
  | 'archived';

type SourceKind =
  | 'web'
  | 'paper'
  | 'report'
  | 'internal'
  | 'external_api';
```

### 下一阶段 3 个核心能力

#### 1. QuestionFactory

职责：

- 定义问题 schema
- 校验问题定义是否满足框架最小要求
- 计算问题质量分项
- 支持下游扩展模板

为什么重要：
如果问题定义不做成工厂，后面所有 tree、collaboration、curation 都会退化成“文本约定”。

交付物：

- `lib/questions/schema.ts`
- `lib/questions/validator.ts`
- `lib/questions/factory.ts`
- `lib/questions/quality.ts`

#### 2. QuestionTreeRuntime

职责：

- 定义知识树的标准返回形状
- 把 `domain -> subdomain -> question -> source/answer/citation/dispute` 作为标准查询契约
- 支持 tree 页和 graph 页复用同一 shape
- 不绑定具体 UI，只绑定数据结构

为什么重要：
现在 tree/graph 还是 demo 数据驱动，不是 runtime 驱动；这会限制 downstream product 的树形表达。

交付物：

- `lib/db/repos/questions.ts` 扩展
- `app/api/forest/route.ts` 改为 question-first
- `app/api/forest/[id]/route.ts` 返回 subdomains + questions + sources + answers
- `app/graph/page.tsx` 改为 question-first graph 契约

#### 3. CurationRuntime

职责：

- 管理 question 状态机
- 在状态变化时触发 resident collaboration
- 校验来源约束、回答置信度、争议仲裁
- 生成可审计 curation log

为什么重要：
没有 curation runtime，问题质量、来源质量、回答质量就无法系统化，只能靠产品层各自实现。

交付物：

- `lib/questions/curation.ts`
- `lib/ai/collaboration.ts` 扩展 question/source trigger
- `app/api/questions/route.ts` 增加 validate/transition
- `docs/框架契约.md` 增加 question definition / tree shape / curation 章节

### API 修订建议

#### `/api/forest`

从“热门枝桠列表”改为：

```ts
interface ForestResponse {
  domains: Array<{
    id: string;
    name: string;
    color: string;
    description: string;
    subdomainCount: number;
    openQuestionCount: number;
    topQuestions: Array<{
      id: string;
      title: string;
      status: string;
      quality_score: number;
      last_activity_at: string;
    }>;
  }>;
}
```

#### `/api/forest/[id]`

从“branch + article”改为：

```ts
interface TreeResponse {
  domain: Domain;
  subdomains: Subdomain[];
  questions: QuestionSummary[];
  sources: SourceSummary[];
  answers: AnswerSummary[];
  citations: CitationSummary[];
  disputes: DisputeSummary[];
}
```

#### `/api/questions`

扩展为：

- `GET /api/questions?domainId=&subdomainId=&status=&type=`
- `POST /api/questions` 增加 schema 校验
- `POST /api/questions/validate` 校验问题定义
- `POST /api/questions/:id/transition` 状态流转

#### `/api/graph`

从“概念云”收敛为：

- `GET /api/graph?questionId=&depth=`
- 返回 question 为中心的知识网络

### Starter Kit 修订

#### 1. minimal-domain-tree

保持现有 kit，但强调：

- `subdomain` 是标准二级领域节点
- `position` 和 `code` 用于树形排序
- 不要在产品层再发明二级分类结构

#### 2. minimal-question-definition

新增 kit，说明：

- 如何用框架定义一个问题
- 如何设置 source_requirements
- 如何定义 question_type
- 如何做最小 validation

#### 3. minimal-question-tree

新增 kit，说明：

- 如何请求 `/api/forest/[id]`
- 如何渲染 domain -> subdomain -> question -> source/answer
- 如何按状态、质量、活跃度排序

#### 4. minimal-question-graph

新增 kit，说明：

- 如何请求 `/api/graph?questionId=...`
- 如何渲染 question 为中心的知识网络
- 如何处理 citation / dispute / source 边

### 任务清单

1. 新增 question definition schema：`lib/questions/schema.ts`
2. 新增 validator：`lib/questions/validator.ts`
3. 新增 factory：`lib/questions/factory.ts`
4. 新增 quality scoring：`lib/questions/quality.ts`
5. 扩展 question repo：`lib/db/repos/questions.ts`
6. 新增 migration：`lib/db/migrations/006_question_definition.sql`
7. 扩展 `/api/forest`：question-first 列表
8. 扩展 `/api/forest/[id]`：返回 subdomains + questions + sources + answers
9. 新增 `/api/graph`：question-first graph API
10. 收敛 `KnowledgeTree` 展示契约，但不绑定产品皮肤
11. 收敛 `app/graph/page.tsx` 为 question graph
12. 扩展 collaboration trigger：`lib/ai/collaboration.ts`
13. 新增 curation runtime：`lib/questions/curation.ts`
14. 更新契约文档：`docs/框架契约.md`
15. 更新迁移指南：`docs/框架迁移指南.md`
16. 新增 starter kits：`docs/starter-kits.md`、`starter-kits/minimal-question-definition`、`starter-kits/minimal-question-tree`、`starter-kits/minimal-question-graph`
17. 更新 README：`README.md`、`README.zh-CN.md`
18. 补充测试：`__tests__/questions/schema.test.ts`、`__tests__/questions/validator.test.ts`、`__tests__/questions/curation.test.ts`、`__tests__/routes.test.ts`
19. 验证：`npm run test && npm run build`

### 验收标准

- 框架层可明确表达知识树形态：`Domain -> Subdomain -> Question -> Source/Answer -> Citation/Dispute`
- Question 有结构化定义、来源约束、质量分项、状态机、审计字段。
- Tree API 和 Graph API 都变成 question-first。
- AI resident 可围绕 question 状态、source 质量、answer 证据触发协作。
- 下游项目可依据 starter-kit 在 30 分钟内搭出 question-first 知识树。
- 没有新增固定产品首页、固定运营流程、固定日报文案。

### 明确不做什么

- 不做固定树形产品皮肤
- 不做单一产品的 onboarding
- 不做固定运营话术
- 不做脱离 question/source 结构的泛化知识图谱
- 不做日报/周报模板
- 不把 graph 做成脱离 question 的概念云

### 关键风险与缓解

1. 如果问题定义继续只有 title/body_md，后面 tree 和 collaboration 会继续飘。
   - 缓解：先做 schema，再做 API，再做 UI。
2. 如果 tree/graph 继续用 demo 数据，会限制 downstream product。
   - 缓解：统一 forest/graph API shape，作为 stable seam。
3. 如果 curation 没有状态机，问题质量会退化成人治。
   - 缓解：框架内置最小状态机，产品可扩展，不能删除。

### 建议的第一批实现顺序

1. `lib/questions/schema.ts` + migration
2. `lib/questions/validator.ts` + factory
3. `lib/db/repos/questions.ts` 扩展
4. `/api/questions` 增加 validate/transition
5. `/api/forest/[id]` 改为 question-first
6. `/api/graph` 改为 question-first
7. `docs/框架契约.md` + starter-kits
8. README 与测试

### 当前分支

- 当前分支：`knowledge-processing-capabilities`
- 先继续在这个分支实现，不新建产品分支。
