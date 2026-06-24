# minimal-domain-tree

This starter kit shows the smallest way to define a domain tree with subdomains using the ThinkGrove runtime.

## What this kit covers
- Load or create a domain
- Create a subdomain under that domain
- Inspect the domain tree via stable APIs

## Minimal example

```bash
# 1. Create a domain branch via the existing runtime.
curl -X POST http://localhost:3000/api/forest/fork \
  -H 'content-type: application/json' \
  -d '{
    "sourceId": "ai",
    "newId": "mydomain",
    "newName": "My Domain",
    "newDescription": "A custom knowledge domain."
  }'

# 2. Create a subdomain under the new tree.
curl -X POST http://localhost:3000/api/subdomains \
  -H 'content-type: application/json' \
  -d '{
    "domainId": "mydomain",
    "code": "getting-started",
    "name": "Getting Started",
    "authorId": "usr_1",
    "authorKind": "human",
    "authorDisplayName": "Builder",
    "authorRole": "curator"
  }'

# 3. List subdomains for the domain.
curl "http://localhost:3000/api/subdomains?domainId=mydomain"
```

## Config mapping
- `data/domains.yaml` -> domain registry
- `/api/forest/fork` -> runtime tree fork seam
- `/api/subdomains` -> new subdomain primitive

## Product-layer boundary
Do not put product homepage skin, onboarding flow, or brand narrative in this kit.
This kit only teaches runtime usage.
