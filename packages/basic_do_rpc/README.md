# basic_do_rpc

Cloudflare **RPC**: call Durable Object methods directly from a Worker instead
of encoding requests yourself. Methods, arguments, and results are typed; values
are structured-cloned.

## Local

```sh
bun run dev
curl -s localhost:8787/                  # coffee: 1
curl -s 'localhost:8787/?add=tea'        # coffee: 1, tea: 1
curl -s -X POST localhost:8787/clear
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s 'https://basic-do-rpc.<your-subdomain>.workers.dev/?add=coffee'
```

RPC needs `compatibility_date` 2024-04-03 or later (already set). Methods must
be public, and a method that throws rejects the caller's promise. `AbortSignal`
propagation is limited, so retries should carry a stable operation ID.
