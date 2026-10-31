# basic_do_workers

A plain Cloudflare **Worker**: the stateless baseline that every other package
in this matrix is built on. It reads a `vars` binding, reports the Cloudflare
colo, and uses `ctx.waitUntil()` for background work.

## Local

```sh
bun run dev          # http://localhost:8787
curl -s localhost:8787/
curl -s localhost:8787/wait
```

## Cloudflare

```sh
bunx wrangler login  # once
bun run deploy
curl -s https://basic-do-workers.<your-subdomain>.workers.dev/
```

No resources need creating. See `../README.md` for the full matrix.
