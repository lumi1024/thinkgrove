# minimal-ai-collaboration

This starter kit shows the smallest way to let an AI resident collaborate on questions and sources through the ThinkGrove runtime.

## What this kit covers
- Run a collector role to summarize sources for a question
- Run an oracle role to draft an answer
- Run a critic role to challenge the answer

## Minimal example

```bash
# 1. Collect sources for a question.
curl -X POST http://localhost:3000/api/ai/collaboration/run \
  -H 'content-type: application/json' \
  -d '{
    "role": "collector",
    "context": {
      "action": "collect_sources",
      "domain": "mydomain",
      "topic": "smallest useful ThinkGrove flow",
      "questionId": "q_1",
      "systemPrompt": "收集与最小 ThinkGrove 流程相关的公开资料，输出可核查的信息源摘要。"
    },
    "actorId": "ai_collector"
  }'

# 2. Generate a draft answer.
curl -X POST http://localhost:3000/api/ai/collaboration/run \
  -H 'content-type: application/json' \
  -d '{
    "role": "oracle",
    "context": {
      "action": "draft_answer",
      "domain": "mydomain",
      "topic": "smallest useful ThinkGrove flow",
      "questionId": "q_1",
      "sourceIds": ["src_1"],
      "systemPrompt": "基于给定信息源，输出简洁、可落地的回答。"
    },
    "actorId": "ai_oracle"
  }'

# 3. Challenge the answer.
curl -X POST http://localhost:3000/api/ai/collaboration/run \
  -H 'content-type: application/json' \
  -d '{
    "role": "critic",
    "context": {
      "action": "challenge_answer",
      "domain": "mydomain",
      "topic": "smallest useful ThinkGrove flow",
      "questionId": "q_1",
      "systemPrompt": "检查回答的证据缺口、边界条件和可能误导之处。"
    },
    "actorId": "ai_critic"
  }'
```

## Runtime note
This kit does not define a fixed product workflow.
Products should map these roles to their own governance and UI.
