# basic_do_cells

Cloudflare **Durable Objects**: a named, single-threaded actor with
strongly consistent storage, addressed with `idFromName`, `idFromString`, or
`newUniqueId`. celld calls the same thing a cell.

## Local

```sh
bun run dev                                   # http://localhost:8787
curl -s 'localhost:8787/?name=alice'          # n: 1
curl -s 'localhost:8787/?name=alice'          # n: 2
curl -s 'localhost:8787/?name=bob'            # n: 1
curl -s 'localhost:8787/?unique=1'            # keep the returned id
curl -s 'localhost:8787/?id=<id>'             # address it again
curl -s -X POST 'localhost:8787/reset?name=alice'
```

A request may interleave only while the current turn awaits. `ctx.storage` here
uses the async KV API, which works on both storage backends; SQLite-backed
objects also expose the synchronous `ctx.storage.kv`.

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s 'https://basic-do-cells.<your-subdomain>.workers.dev/?name=alice'
```

No resource creation is needed: the `migrations` entry creates the SQLite-backed
class on deploy.
