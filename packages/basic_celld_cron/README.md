# basic_celld_cron

celld **Cron Triggers**: a `scheduled` handler driven by `triggers.crons`.
celld keeps the schedule in a reserved cell, so a fleet runs each occurrence
once. This example records each tick in a Durable Object.

## Local

celld dev runs the schedule on the local node.

```sh
bun run dev
curl -s -X POST 'localhost:9876/tick?cron=manual&scheduledTime=0'  # simulate a tick
curl -s localhost:9876/
```

## Fly.io

```sh
fly apps create basic-celld-cron
fly storage create
fly deploy
curl -s https://basic-celld-cron.fly.dev/    # last: null until */5 fires
```

The expression dialect is five-field UTC. After downtime celld runs one missed
occurrence and skips the rest; a handler that throws retries with backoff until
the next occurrence. Move long work into a queue or a workflow.
