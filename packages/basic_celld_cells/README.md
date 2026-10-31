# basic_celld_cells

celld **cells** (Durable Objects): a named, single-threaded actor with private
key-value storage, addressed with `idFromName`, `idFromString` or `newUniqueId`.

## Local

```sh
bun run dev
curl -s 'localhost:9876/?name=alice'   # n: 1
curl -s 'localhost:9876/?name=alice'   # n: 2
curl -s 'localhost:9876/?name=bob'     # n: 1
curl -s 'localhost:9876/?unique=1'     # a fresh cell; keep the returned id
curl -s 'localhost:9876/?id=<id>'      # address it again
curl -s -X POST 'localhost:9876/reset?name=alice'
```

A second request may interleave while the first awaits; under a fleet, exactly
one node owns a cell at a time, and ownership moves when nodes stop or idle
cells rebalance. The constructor runs again after every eviction.

## Fly.io

```sh
fly apps create basic-celld-cells
fly storage create
fly deploy
curl -s 'https://basic-celld-cells.fly.dev/?name=alice'
```

See `../README.md` for fleet and storage details.
