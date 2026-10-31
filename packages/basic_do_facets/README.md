# basic_do_facets

Cloudflare **Durable Object Facets** (open beta): a supervisor Durable Object
loads a class from a Dynamic Worker and runs it as a child with its own isolated
SQLite database.

## Local

```sh
bun run dev
curl -s localhost:8787/               # {"facet":"app","n":1}
curl -s localhost:8787/               # {"facet":"app","n":2}
curl -s -X POST localhost:8787/abort  # storage kept; next request restarts
curl -s -X POST localhost:8787/delete # storage removed; next request starts at 1
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s https://basic-do-facets.<your-subdomain>.workers.dev/
```

The supervisor's database and each facet's database are separate SQLite files.
A facet runs with its root object, so an eviction or move takes both together.
This feature is in open beta, so the API can change.
