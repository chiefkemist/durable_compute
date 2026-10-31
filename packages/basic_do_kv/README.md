# basic_do_kv

Cloudflare **Workers KV**: a globally distributed, eventually consistent
key-value namespace binding.

## Create the namespace

```sh
bunx wrangler kv namespace create basic-do-kv
# Copy the returned id into wrangler.jsonc (replacing REPLACE_WITH_KV_NAMESPACE_ID).
```

`wrangler dev` uses local storage and works before you create anything.

## Run and deploy

```sh
bun run dev
curl -s -X PUT localhost:8787/greeting --data 'hello kv'
curl -s localhost:8787/greeting
bun run deploy
curl -s -X PUT https://basic-do-kv.<your-subdomain>.workers.dev/greeting --data 'hello'
```

KV is optimized for reads: writes become visible in other locations
eventually, and `cacheTtl` trades freshness for cache hits. There is no atomic
read-modify-write, so use a Durable Object for counters, locks, or any
read-then-write logic.
