# Starter Kits

Starter kits show downstream projects how to compose ThinkGrove runtime primitives without copying the demo app or product narrative.

## Available kits
- `starter-kits/minimal-domain-tree` — define a domain and subdomain
- `starter-kits/minimal-question-source-answer` — create structured questions, collect sources, and write source-backed answers
- `starter-kits/minimal-ai-collaboration` — run question/source-oriented AI resident workflows

## Usage rule
Each kit should remain framework-facing:
- do show API contracts
- do show config mapping
- do not show product homepage skin
- do not show onboarding scripts
- do not show brand-specific copy

When demonstrating question-first trees, prefer `statement` + `context` + `questionType` + `visibility` over legacy `title`/`bodyMd`/branch-only flows. Show sources as evidence attached to questions, not as tree nodes equal to questions.
