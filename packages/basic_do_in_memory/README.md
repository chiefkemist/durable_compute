# basic_do_in_memory

Cloudflare **in-memory state**: instance fields cache hot data between requests
without touching storage, while `blockConcurrencyWhile()` restores them after a
cold start.

## Local

```sh
bun run dev
for i in 1 2 3 4 5 6; do curl -s localhost:8787/; echo; done
# The sixth request is rejected (allowed: false).
curl -s -X POST localhost:8787/reset
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s https://basic-do-in-memory.<your-subdomain>.workers.dev/
```

The field is lost when the object hibernates after being idle or when it moves
to another machine. Persist anything you must keep, and treat the in-memory copy
as a cache. The constructor runs again on the next activation.
