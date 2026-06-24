# ThinkGrove

ThinkGrove is an open-source **framework for building question-first knowledge ecosystems** where humans and AI co-create, dispute, and grow ideas together. It is designed as an operating-system-level skeleton for knowledge communities: instead of delivering a fixed wiki, forum, or chatbot product, ThinkGrove provides stable runtime primitives for `Domain -> Subdomain -> Question -> Source -> Answer -> Citation/Dispute`, plus reusable API seams, governance hooks, and AI collaboration surfaces.

This repository is **framework-first**. It keeps core runtime, database migrations, API contracts, framework docs, starter kits, and neutral default skins. Product skins, onboarding flows, marketing copy, and brand-specific narratives should live in separate repositories.

## Getting Started

```bash
npm install
npm run dev
```

## Why ThinkGrove

- **Question-first knowledge tree** — the framework treats `Question` as the main node in a knowledge tree, not just a text field or branch title. A tree is expressed as `Domain -> Subdomain -> Question -> Source/Answer/Citation/Dispute`.
- **Structured question definitions** — questions are first-class runtime objects. The framework is moving toward reusable question definitions with source constraints, answer formats, quality dimensions, and curation states, so downstream projects do not have to reinvent question governance.
- **Source-oriented evidence layer** — raw information sources are first-class primitives. Collector agents can gather `sources`, answers can cite them explicitly, and disputes can target source credibility.
- **Role-based AI collaboration** — residents can collaborate around question clarity, source trustworthiness, answer evidence, and dispute arbitration through a reusable orchestration surface.
- **Framework boundaries** — this repo provides runtime and docs, not a fixed product. Downstream projects should reuse the APIs and replace the demo skin.

## Minimal Product Startup Flow

1. Create a separate product repository or workspace.
2. Reuse or wrap the ThinkGrove runtime contracts for domains, subdomains, questions, sources, branches, answers, disputes, votes, citations, reputation, and external agents.
3. Replace the demo homepage skin and sample data with your product's UI and content.
4. Keep framework-specific issues and contributions in this repository.

## Example API Calls

```bash
# 1. Create a subdomain in your domain tree.
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
    "title": "What is the smallest useful knowledge flow?",
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
    "questionId": "q_1",
    "title": "ThinkGrove Framework Contract",
    "url": "https://github.com/lumi1024/thinkgrove/blob/main/docs/framework-contract.md",
    "sourceKind": "web",
    "collectedBy": "user-1"
  }'

# 4. Create a branch for the question.
curl -X POST http://localhost:3000/api/branch \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "title": "What is the smallest useful knowledge flow?",
    "kind": "question",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 5. Answer that branch and reference sources.
curl -X POST http://localhost:3000/api/answer \
  -H 'content-type: application/json' \
  -d '{
    "branchId": "<branch-id-from-step-4>",
    "bodyMd": "Start with one domain, one subdomain, one question, one source, and one reusable answer flow.",
    "authorId": "user-1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator",
    "questionId": "q_1",
    "sourceIds": ["src_1"],
    "confidence": 0.8,
    "answerKind": "human"
  }'

# 6. Run AI collaboration in the question/source context.
curl -X POST http://localhost:3000/api/ai/collaboration/run \
  -H 'content-type: application/json' \
  -d '{
    "role": "oracle",
    "context": {
      "action": "draft_answer",
      "domain": "mydomain",
      "topic": "smallest useful ThinkGrove flow",
      "questionId": "q_1",
      "sourceIds": ["src_1"]
    },
    "actorId": "ai_oracle"
  }'

# 7. List the forest from your configuration.
curl http://localhost:3000/api/forest

# 8. Inspect a single domain tree.
curl http://localhost:3000/api/forest/mydomain
```

For a fuller picture of the stable seams, see [`docs/框架契约.md`](./docs/框架契约.md) and [`docs/框架迁移指南.md`](./docs/框架迁移指南.md).

## Knowledge Tree Model

ThinkGrove's knowledge tree model is built around reusable primitives:

- `Domain` — top-level knowledge area
- `Subdomain` — second-level branch inside a domain
- `Question` — main node on a knowledge branch; the primary anchor for sources, answers, and collaboration
- `Source` —底层 information source collected by agents or humans
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

## Starter Kits

Use the framework-facing starter kits instead of copying demo product flows:

- `starter-kits/minimal-domain-tree`
- `starter-kits/minimal-question-source-answer`
- `starter-kits/minimal-ai-collaboration`

See [`docs/starter-kits.md`](./docs/starter-kits.md).

## Implementation Anchors

These README examples map to existing framework routes and extension points:

- `/api/subdomains` — manage second-level domain branches
- `/api/questions` — create and list knowledge questions
- `/api/sources` — collect and review raw information sources
- `/api/branch` — create a branch
- `/api/answer` — attach an answer to a branch
- `/api/forest` — list domains and top branches
- `/api/forest/[id]` — inspect one domain tree with questions and sources
- `/api/ai/collaboration/run` — run question/source-oriented AI resident workflows
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
