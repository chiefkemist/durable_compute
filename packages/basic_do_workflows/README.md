# basic_do_workflows

Cloudflare **Workflows**: a durable function of replayable steps, sleeps, and
events. Workflows are a separate product from Durable Objects, though both
persist execution state.

## Local

```sh
bun run dev
ID=$(curl -s -X POST 'localhost:8787/create?url=https://example.com' | sed 's/.*"id":"//;s/".*//')
sleep 5
curl -s "localhost:8787/status?id=$ID"
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s -X POST 'https://basic-do-workflows.<your-subdomain>.workers.dev/create?url=https://example.com'
```

Workflows require a recent `compatibility_date` (2024-09-25 or later). A step
result, event payload, and the parameters are limited to 1 MiB. Cloudflare also
exposes Workflows in the dashboard, the REST API, and `wrangler workflows`,
which celld does not.
