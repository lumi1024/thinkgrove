# minimal-question-source-answer

This starter kit shows the smallest way to define questions, collect sources, and submit answers using the ThinkGrove runtime.

## What this kit covers
- Create a question in a domain/subdomain
- Attach sources to the question
- Create an answer branch with explicit source references

## Minimal example

```bash
# 1. Create a question.
curl -X POST http://localhost:3000/api/questions \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "subdomainId": "sub_getting_started",
    "title": "What is the smallest useful ThinkGrove flow?",
    "authorId": "usr_1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 2. Attach a source to the question.
curl -X POST http://localhost:3000/api/sources \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "subdomainId": "sub_getting_started",
    "questionId": "q_1",
    "title": "ThinkGrove Framework Contract",
    "url": "https://github.com/lumi1024/thinkgrove/blob/main/docs/%E6%A1%86%E6%9E%B6%E5%A5%91%E7%BA%A6.md",
    "sourceKind": "web",
    "collectedBy": "usr_collector"
  }'

# 3. Create a branch for the question.
curl -X POST http://localhost:3000/api/branch \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "title": "What is the smallest useful ThinkGrove flow?",
    "kind": "question",
    "authorId": "usr_1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 4. Attach an answer that references sources.
curl -X POST http://localhost:3000/api/answer \
  -H 'content-type: application/json' \
  -d '{
    "branchId": "br_1",
    "bodyMd": "The smallest useful flow is: domain -> subdomain -> question -> source -> answer -> citation.",
    "authorId": "usr_1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'
```

## Runtime note
Downstream products should store source references in `sourceIds` or `citations` depending on their governance needs.
