# ThinkGrove

简体中文见 [`README.zh-CN.md`](./README.zh-CN.md)。

ThinkGrove is an open-source **question-first knowledge ecosystem framework**: instead of delivering a fixed wiki, forum, or chatbot product, it gives downstream projects a reusable runtime for `Domain -> Subdomain -> Question -> Branch -> Answer`, with `Source` as a first-class evidence object and `Citation / Dispute / Vote / Reputation` as governance primitives.

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


ThinkGrove is a framework for building a "question-first knowledge ecosystem": humans and AI co-create and grow knowledge around stable primitives—domain trees, questions, answers, citations, disputes, and governance—with sources as first-class evidence objects, rather than shipping a fixed community product.

This repository is maintained in a **framework-first** way: it keeps core runtime, API contracts, database migrations, framework documentation, starter kits, and neutral default skins. Product homepages, onboarding, marketing pages, and brand narratives should live in separate repositories.

## Getting Started

```bash
npm install
npm run dev
```

## Example API Calls

```bash
# 1. Create a second-level domain branch.
curl -X POST http://localhost:3000/api/subdomains \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "code": "getting-started",
    "name": "Getting Started",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 2. Create a question inside that subdomain.
curl -X POST http://localhost:3000/api/questions \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "subdomainId": "sub_getting_started",
    "statement": "What is the smallest useful knowledge flow?",
    "context": "Start from one domain, one subdomain, one question, one source, and one reusable answer flow.",
    "questionType": "exploratory",
    "visibility": "draft",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 3. Attach a source to that question.
curl -X POST http://localhost:3000/api/sources \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "subdomainId": "sub_getting_started",
    "questionId": "<question id from step 2>",
    "title": "ThinkGrove Framework Contract",
    "url": "https://github.com/lumi1024/thinkgrove/blob/main/docs/%E6%A1%86%E6%9E%B5%E5%A5%91%E7%BA%A6.md",
    "sourceKind": "web",
    "collectedBy": "user-1"
  }'

# 4. Answer the question and explicitly cite sources.
curl -X POST http://localhost:3000/api/answer \
  -H 'content-type: application/json' \
  -d '{
    "branchId": "<branch id>",
    "bodyMd": "Start with one domain, one subdomain, one question, one source, and one reusable answer flow.",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator",
    "questionId": "<question id from step 2>",
    "sourceIds": ["<source id from step 3>"],
    "confidence": 0.8,
    "answerKind": "human"
  }'

# 5. Run AI resident workflows in the question/source context.
curl -X POST http://localhost:3000/api/ai/collaboration/run \
  -H 'content-type: application/json' \
  -d '{
    "role": "oracle",
    "context": {
      "action": "draft_answer",
      "domain": "mydomain",
      "topic": "smallest useful knowledge flow",
      "questionId": "q_1",
      "sourceIds": ["src_1"]
    },
    "actorId": "ai_oracle"
  }'

# 6. List the configured knowledge forest.
curl http://localhost:3000/api/forest

# 7. Inspect a single domain tree.
curl http://localhost:3000/api/forest/mydomain
```

For the full list of stable seams, see [`docs/框架契约.md`](./docs/框架契约.md) and [`docs/框架迁移指南.md`](./docs/框架迁移指南.md).

## Knowledge Tree Model

ThinkGrove's knowledge tree model is built around reusable primitives:

- `Domain` — top-level knowledge area
- `Subdomain` — second-level branch inside a domain
- `Question` — main node on a knowledge branch; the primary anchor for sources, answers, and collaboration
- `Source` — evidence object collected by agents or humans
- `Answer` — response attached to a branch and indexed by question
- `Citation` — reference link between answers, branches, questions, sources, or external targets
- `Dispute` — governance event targeting an answer or source
- `Vote` — lightweight signal for disputes and credibility
- `Reputation` — long-term trust and contribution score

The framework also provides `Article` as a domain-level knowledge artifact, but the primary navigation and tree shape are question-first.

## Question Definition

The framework is evolving toward structured question definitions. A question should express not only `title` and `body_md`, but also:

- domain and subdomain placement
- question type and difficulty
- required source kinds and minimum source count
- answer format, length, and confidence constraints
- quality dimensions such as precision, answerability, verifiability, non-redundancy, and scope fit
- curation lifecycle such as `draft`, `validating`, `open`, `frozen`, `merged`, and `archived`

This makes questions reusable across tree rendering, AI collaboration, source collection, and dispute governance.

## Starter Kits

Start from these framework-level starter kits instead of copying demo product flows:

- `starter-kits/minimal-domain-tree`
- `starter-kits/minimal-question-source-answer`
- `starter-kits/minimal-ai-collaboration`

See [`docs/starter-kits.md`](./docs/starter-kits.md).

## Implementation Anchors

These README examples map to existing framework routes and extension points:

- `/api/subdomains` — manage second-level domain branches
- `/api/questions` — create and list structured questions
- `/api/sources` — collect and review raw information sources
- `/api/branch` — create branches
- `/api/answer` — attach an answer to a question and cite sources
- `/api/forest` — list domains and top questions
- `/api/forest/[id]` — inspect one domain tree with questions and sources
- `/api/ai/collaboration/run` — run question-oriented AI resident workflows with source evidence
- `/api/external-agent/invoke` — call an external agent through the framework runtime
- `data/domains.yaml` — add or replace domain definitions
- `data/agents.yaml` — add or replace resident definitions
- `lib/ai/provider.ts` — plug in a different AI backend
- `app/globals.css` — override theme variables for a new skin

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 · React 19 · TypeScript strict mode |
| Styling | Tailwind CSS v4 · motion (Framer Motion) |
| Database | better-sqlite3 (WAL mode, migration-based) |
| AI Layer | Pluggable providers — MiniMax / OpenAI / Anthropic / Mock |
| Config | YAML (domains.yaml, agents.yaml) |
| Testing | Vitest |
| Deployment | Docker multi-stage build |

## AI Residents

ThinkGrove ships with demo AI residents to illustrate role-based collaboration. Framework consumers should feel free to replace them with their own identities, prompts, and routing logic.

| Name | Model | Role | Home Trees |
|------|-------|------|-----------|
| Atlas-Sage | Gemini 2.5 Pro | oracle (synthesis) | cross-domain |
| Critic-Kimi | Kimi K2 | critic (challenge) | any |
| Synth-GPT | GPT-4o | synthesizer (weaving) | LLM / Agent |
| Tutor-Claude | Claude Opus 4 | tutor (guidance) | Startup / Indie |

## External Agent Integration

ThinkGrove includes a framework-level integration surface for external agents.

### Supported Frameworks

| Framework | Transport | Notes |
|-----------|-----------|-------|
| Hermes | HTTP REST | Standard REST API integration for stateless agent services |
| OpenClaw | WebSocket | Real-time bidirectional communication for interactive agents |

### Integration Flow

1. **Register** — A downstream project or operator registers an external agent through the configured integration workflow.
2. **Resolve** — The framework resolves the agent's adapter, auth, and caching behavior through the external-agent runtime contract.
3. **Operate** — Approved agents participate with the same quota, rest-cycle, and identity concepts as built-in agents.

All integrations are subject to **manual review by the host project** — there is no auto-approval. Sensitive credentials are kept out of public-facing YAML configs.

See [`docs/superpowers/specs/2026-06-20-external-agents-design.md`](./docs/superpowers/specs/2026-06-20-external-agents-design.md) and [`docs/superpowers/specs/2026-06-20-external-agents-marketplace-design.md`](./docs/superpowers/specs/2026-06-20-external-agents-marketplace-design.md) for the current integration design notes.

## Who should use ThinkGrove

- Teams building Q&A knowledge communities, research workbenches, AI-native knowledge bases, or domain-specific reasoning tools.
- Developers who want a configurable backend for question governance, source collection, answer synthesis, and dispute arbitration.
- Product teams that want to own their UI, brand, and content strategy without rebuilding core knowledge-runtime logic.

## Call to action

- Use the starter kits to bootstrap a question-first knowledge runtime.
- Extend domains, agents, and themes through config instead of forking core logic.
- Keep framework improvements in this repo; keep product narratives outside.


## Repository Structure

```
.
├── app/                      # Next.js app routes and demo UI
│   ├── api/                  # Framework API routes
│   ├── page.tsx              # Demo homepage skin
│   ├── layout.tsx            # Root layout
│   └── ...
├── components/               # Reusable UI components and default skins
├── data/                     # Sample domain and agent configuration
│   ├── domains.yaml
│   └── agents.yaml
├── docs/                     # Framework documentation
│   ├── 框架契约.md
│   ├── 框架迁移指南.md
│   └── superpowers/
├── hooks/                    # Shared client behavior
├── lib/                      # Framework core runtime, DB, AI, domain logic
│   ├── ai/
│   ├── db/
│   ├── external-agents/
│   ├── config/
│   └── ...
├── public/                   # Static assets
├── scripts/                  # Initialization and seed scripts
└── tests/                    # Automated tests
```

## Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production bundle |
| `npm run start` | Run the production server |
| `npm run test` | Run the test suite |
| `npm run lint` | Run ESLint |
