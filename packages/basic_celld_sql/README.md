# basic_celld_sql

celld **SQL storage**: synchronous SQLite inside a cell
(`ctx.storage.sql.exec()`), plus `transactionSync()` for atomic batches.

## Local

```sh
bun run dev
curl -s -X POST localhost:9876/ -H 'content-type: application/json' \
  -d '{"memo":"coffee","cents":450}'
curl -s localhost:9876/
```

## Fly.io

```sh
fly apps create basic-celld-sql
fly storage create
fly deploy
curl -s -X POST https://basic-celld-sql.fly.dev/ \
  -H 'content-type: application/json' -d '{"memo":"tea","cents":300}'
```

celld replicates each cell's SQLite writes to the fleet bucket (or to peer
nodes first, depending on `CELLD_DURABILITY`). A write cursor that has not
finished cannot cross the response boundary; finish `.one()`/`.toArray()` or
close the cursor before returning.
