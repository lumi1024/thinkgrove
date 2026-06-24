# ThinkGrove

ThinkGrove is an open-source **framework for building domain-aware knowledge ecosystems** where humans and AI co-create, dispute, and grow ideas together. Think of it as an operating-system-level skeleton for knowledge communities: it provides stable runtime primitives, API seams, and governance hooks so downstream projects can build their own wikis, Q&A experiences, research workbenches, or AI-native knowledge networks without forking a fixed product.

- **Framework-first boundary** — this repository keeps core runtime, API contracts, database migrations, framework docs, starter kits, and neutral default skins. Product homepage skins, onboarding flows, marketing copy, and brand-specific narratives should live in separate repositories.
- **Question/Source-oriented model** — the stable domain model now treats `Domain -> Subdomain -> Question -> Source -> Answer -> Citation/Dispute` as first-class citizens instead of generic activity streams.
- **AI collaboration runtime** — residents can collaborate around question quality, source credibility, and answer evidence through a reusable orchestration surface.

If you are using ThinkGrove to build a product, start with the starter kits and replace the demo skin rather than copying the whole source tree.

## Getting Started

```bash
npm install
npm run dev
```

## Minimal Product Startup Flow

1. Create a separate product repository or workspace.
2. Reuse or wrap the ThinkGrove runtime contracts for domains, branches, answers, disputes, votes, citations, reputation, and external agents.
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
- `/api/branch` — create a new branch
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
