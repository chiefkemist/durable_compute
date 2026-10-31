# basic_celld_in_memory

celld **in-memory state**: an instance field caches hot data between events,
while `blockConcurrencyWhile()` restores it after an activation.

## Local

```sh
bun run dev
for i in 1 2 3 4 5 6; do curl -s localhost:9876/; echo; done
# The sixth request is rejected (allowed: false).
curl -s -X POST localhost:9876/reset
```

## Fly.io

```sh
fly apps create basic-celld-in-memory
fly storage create
fly deploy
curl -s https://basic-celld-in-memory.fly.dev/
```

celld removes an idle cell from memory after `CELLD_IDLE_EVICT_S` seconds (300
in `fly.toml`) or earlier under pressure, and the constructor runs again on the
next event. Hibernatable WebSocket clients stay connected through that wake-up;
the field does not. Treat it as a cache and persist what you must keep.
