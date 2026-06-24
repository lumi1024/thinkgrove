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
