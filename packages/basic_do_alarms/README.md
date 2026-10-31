# basic_do_alarms

Cloudflare **Alarms API**: schedule one wake-up per Durable Object with
`setAlarm()`, inspect it with `getAlarm()`, cancel it with `deleteAlarm()`, and
handle it in `alarm()`.

## Local

```sh
bun run dev
curl -s -X POST 'localhost:8787/?in=2&note=stretch'
sleep 3
curl -s localhost:8787/          # firedAt is set
curl -s -X POST localhost:8787/cancel
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s -X POST 'https://basic-do-alarms.<your-subdomain>.workers.dev/?in=10&note=deploy'
```

The alarm survives hibernation and restarts. If `alarm()` throws, Cloudflare
retries with exponential backoff and reports `isRetry`/`retryCount`.
