# basic_do_sql

Cloudflare **SQLite storage API**: synchronous SQL inside a Durable Object,
plus `transactionSync()` for atomic batches and `sql.databaseSize`.

## Local

```sh
bun run dev
curl -s -X POST localhost:8787/ -H 'content-type: application/json' \
  -d '{"memo":"coffee","cents":450}'
curl -s localhost:8787/
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s -X POST https://basic-do-sql.<your-subdomain>.workers.dev/ \
  -H 'content-type: application/json' -d '{"memo":"tea","cents":300}'
```

The class must be created through `new_sqlite_classes` in `migrations` (already
configured) to get a SQLite backend. `sql.exec()` is cell-local and strongly
consistent; there is no cross-object query.
