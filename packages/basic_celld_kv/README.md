# basic_celld_kv

celld **KV**: a namespace binding with `get`, `getWithMetadata`, `put`,
`delete`, and `list`.

## Local

```sh
bun run dev
curl -s -X PUT localhost:9876/greeting --data 'hello kv'
curl -s localhost:9876/greeting
curl -s localhost:9876/                 # keys
curl -s -X DELETE localhost:9876/greeting
```

## Fly.io

```sh
fly apps create basic-celld-kv
fly storage create
fly deploy
curl -s -X PUT https://basic-celld-kv.fly.dev/greeting --data 'hello from Fly'
curl -s https://basic-celld-kv.fly.dev/greeting
```

Unlike Cloudflare KV, a celld read reaches the namespace's owning cell, so it
never returns a stale value. A namespace has one writer; use more namespaces
or a cell for write-hot values. `id` is any string, and two Workers that name
the same `id` share one namespace.
