# basic_celld_queues

celld **Queues**: a producer binding, a batching consumer, explicit
`ack`/`retry`, retry limits, and a dead-letter queue.

## Local

```sh
bun run dev --logs
curl -s 'localhost:9876/send?fail=0'
curl -s 'localhost:9876/send?fail=1'   # retried, then moved to the DLQ
curl -s -X POST localhost:9876/batch
# Watch "processed", "retrying" and "dead letter" in the log.
```

## Fly.io

```sh
fly apps create basic-celld-queues
fly storage create
fly deploy
curl -s 'https://basic-celld-queues.fly.dev/send?fail=1'
fly logs                               # consumer output
```

Delivery is at least once and unordered; `message.id` is stable across
redelivery, so use it as an idempotency key. A handler that returns
acknowledges every unsettled message; a throw retries them.
