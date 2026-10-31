# basic_celld_alarms

celld **alarms**: one scheduled wake-up per cell. `setAlarm()` is not answered
successfully until a durable wake entry covers it.

## Local

```sh
bun run dev
curl -s -X POST 'localhost:9876/?in=2&note=stretch'
sleep 3
curl -s localhost:9876/          # firedAt is set
curl -s -X POST localhost:9876/cancel
```

## Fly.io

```sh
fly apps create basic-celld-alarms
fly storage create
fly deploy
curl -s -X POST 'https://basic-celld-alarms.fly.dev/?in=10&note=deploy'
```

A hibernated cell fires its alarm on the node that owns it. If the handler
fails, retries follow celld's alarm rules; check `info.isRetry`.
