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
