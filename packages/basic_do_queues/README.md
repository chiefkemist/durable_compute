# basic_do_queues

Cloudflare **Queues**: a producer binding, a batching consumer, explicit
`ack`/`retry`, retry limits, and a dead-letter queue.

## Create the queues

```sh
bunx wrangler queues create basic-do-jobs
bunx wrangler queues create basic-do-jobs-dead-letter
```

## Run and deploy

```sh
bun run dev
curl -s 'localhost:8787/send?fail=0'
curl -s 'localhost:8787/send?fail=1'   # retried, then sent to the DLQ
bun run deploy
bunx wrangler tail                    # follow consumer logs
```

Delivery is at least once; `message.id` stays the same across redelivery, so use
it as an idempotency key. Cloudflare additionally offers pull consumers, the
Queues HTTP API, and R2 event notifications.
