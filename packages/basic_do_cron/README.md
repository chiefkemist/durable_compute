# basic_do_cron

Cloudflare **Cron Triggers**: a `scheduled` handler driven by `triggers.crons`.
This example records each tick in a Durable Object.

## Local

`wrangler dev` fires the schedule locally; `--test-scheduled` adds an endpoint
for manual triggers.

```sh
bunx wrangler dev --test-scheduled
curl -s 'localhost:8787/__scheduled?cron=*/5+*+*+*+*'
curl -s localhost:8787/
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s https://basic-do-cron.<your-subdomain>.workers.dev/   # last: null until */5
```

Cron expressions are evaluated in UTC. Cloudflare does not replay schedules that
were missed while the Worker was unavailable, so make the handler idempotent and
derive catch-up work from `controller.scheduledTime`.
