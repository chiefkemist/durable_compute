# basic_celld_d1

celld **D1**: a SQL database reached through a binding. celld gives each
database its own SQLite file inside a cell, so no setup step is required: the
first call creates it.

## Local

```sh
bun run dev
curl -s -X POST localhost:9876/ -H 'content-type: application/json' \
  -d '{"name":"Ada","message":"hello D1"}'
curl -s localhost:9876/
```

## Fly.io

```sh
fly apps create basic-celld-d1
fly storage create
fly deploy
curl -s -X POST https://basic-celld-d1.fly.dev/ \
  -H 'content-type: application/json' -d '{"name":"Ada","message":"hello"}'
```

`database_id` is an identity string, not a Cloudflare UUID: the same value in
two Workers reaches the same database. Statements run through one owning cell,
so group related writes with `batch()`, and remember that celld has no read
replica or Time Travel. Use `celld d1 execute` / `celld d1 migrations apply`
against the fleet bucket.
