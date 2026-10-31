# basic_do_d1

Cloudflare **D1**: a serverless SQL database reached through a binding. Unlike
a Durable Object's private SQLite, D1 is a separate product that many Workers
can share.

## Create the database

```sh
bunx wrangler d1 create basic-do-d1
# Copy the returned database_id into wrangler.jsonc (replacing the placeholder).
```

`wrangler dev` uses a local D1 database. The Worker creates the table on first
use, so both local and deployed runs need no separate migration step. For a real
application, manage schema changes with `wrangler d1 migrations` instead of DDL
in the request path.

## Run and deploy

```sh
bun run dev
curl -s -X POST localhost:8787/ -H 'content-type: application/json' \
  -d '{"name":"Ada","message":"hello D1"}'
curl -s localhost:8787/
bun run deploy
```

D1 read replication is opt-in through the Sessions API, which returns bookmarks
for consistent reads; `batch()` keeps a group of statements in one transaction.
celld has no read replica: every D1 query reaches the cell that owns the database.
