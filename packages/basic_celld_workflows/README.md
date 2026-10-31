# basic_celld_workflows

celld **Workflows**: a durable function made of replayable steps and sleeps.
Each instance runs as a cell, so its progress is stored with the fleet.

## Local

```sh
bun run dev
ID=$(curl -s -X POST 'localhost:9876/create?url=https://example.com' | sed 's/.*"id":"//;s/".*//')
sleep 5
curl -s "localhost:9876/status?id=$ID"
# {"status":"complete","output":{"bytes":...,"lines":...}}
```

## Fly.io

```sh
fly apps create basic-celld-workflows
fly storage create
fly deploy
curl -s -X POST 'https://basic-celld-workflows.fly.dev/create?url=https://example.com'
```

A step result, an event payload, and the workflow parameters are capped at
1 MiB. celld retries a failed step with Cloudflare's defaults (5 retries,
exponential backoff) unless the step sets `retries`.
