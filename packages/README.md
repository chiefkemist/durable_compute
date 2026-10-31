# Durable compute feature matrix

Two sets of small, independent projects that implement the same features on
different durable-compute platforms:

- **`basic_celld_*`** — [celld](https://celld.dev/docs) cells, deployed as a
  single-node fleet on [Fly.io](https://fly.io) with the Tigris object store.
- **`basic_do_*`** — Cloudflare [Durable Objects](https://developers.cloudflare.com/durable-objects/)
  and the platform services around them, deployed with
  [`wrangler.jsonc`](https://developers.cloudflare.com/workers/wrangler/configuration/).

Each project is self-contained: one feature, one deployable unit, one README.

| Feature | celld (Fly.io) | Cloudflare (Wrangler) | Shows |
| --- | --- | --- | --- |
| Stateless Worker | `basic_celld_workers` | `basic_do_workers` | `fetch`, `vars`, `waitUntil` |
| Durable actor + KV storage | `basic_celld_cells` | `basic_do_cells` | `idFromName`, `idFromString`, `newUniqueId`, storage |
| SQLite in the object | `basic_celld_sql` | `basic_do_sql` | `sql.exec`, `transactionSync` |
| Alarms | `basic_celld_alarms` | `basic_do_alarms` | `setAlarm`, `getAlarm`, `alarm()` |
| WebSockets | `basic_celld_websockets` | `basic_do_websockets` | hibernatable sockets, broadcast |
| RPC | `basic_celld_rpc` | `basic_do_rpc` | methods on a stub |
| KV service | `basic_celld_kv` | `basic_do_kv` | `get`, `put`, `list`, metadata |
| D1 | `basic_celld_d1` | `basic_do_d1` | prepared statements, `batch` |
| R2 | `basic_celld_r2` | `basic_do_r2` | object `put`/`get`/`list` |
| Queues | `basic_celld_queues` | `basic_do_queues` | producer, consumer, retry, DLQ |
| Workflows | `basic_celld_workflows` | `basic_do_workflows` | `step.do`, `step.sleep`, status |
| Cron triggers | `basic_celld_cron` | `basic_do_cron` | `scheduled` handler + durable tick |
| Static assets | `basic_celld_assets` | `basic_do_assets` | `_headers`, `_redirects`, 404 page |
| Object facets | `basic_celld_facets` | `basic_do_facets` | supervisor + dynamic child object |
| Dynamic Workers | `basic_celld_dynamic_workers` | `basic_do_dynamic_workers` | Worker Loader, runtime code |
| In-memory state | `basic_celld_in_memory` | `basic_do_in_memory` | instance fields + cold-start restore |
| Data location | — (celld has no placement guarantee) | `basic_do_location` | `locationHint`, jurisdiction |

## Celld on Fly.io

celld keeps durable state in an object-storage bucket you own, so a Fly Machine
can be replaced at any time. The packages use Fly's Tigris integration, which
provides conditional writes and read-after-write consistency as celld requires.

### Prerequisites

```sh
curl -fsSL https://celld.dev/install.sh | sh   # local `celld` for dev/deploy
brew install flyctl                            # or: curl -L https://fly.io/install.sh | sh
fly auth login
bun install
```

### Deploy one package

```sh
cd packages/basic_celld_kv
fly apps create basic-celld-kv      # the name in fly.toml must be globally unique
fly storage create                  # Tigris bucket; sets BUCKET_NAME + AWS_* secrets
fly deploy
curl -s https://basic-celld-kv.fly.dev/
```

`fly deploy` runs `scripts/deploy.sh` as the release command. The script maps
Fly's `BUCKET_NAME` / `AWS_ENDPOINT_URL_S3` to celld's `CELLD_BUCKET` /
`S3_ENDPOINT`, then uploads the deployment to the bucket. The Machine then runs
`scripts/entrypoint.sh`, which starts `celld` on `0.0.0.0:8080`. A new
deployment does not restart the node: celld adopts `deploy/current.json` in
place. `fly.toml` keeps the Machine running (`auto_stop_machines = false`) and
gives celld a 90s SIGTERM window to drain. No Fly volume is mounted:
`/tmp/celld` is only a working copy, and the acknowledged state lives in the
bucket, so a replaced Machine restores from Tigris.

### Local development

```sh
cd packages/basic_celld_kv
bun run dev                     # celld dev: local object store, http://127.0.0.1:9876
bun run check                   # tsc --noEmit
```

`celld dev` reads `.dev.vars` (or `.env`/`.env.local`) beside `wrangler.jsonc`
and stores state in `.celld/dev`, which is gitignored. Use `celld dev . --clean`
to start from empty state.

### Knobs worth knowing

| Variable | Default here | Effect |
| --- | --- | --- |
| `CELLD_ADDR` | `0.0.0.0:8080` | Public Worker listener (Fly `internal_port`). |
| `CELLD_INTERNAL_ADDR` | `127.0.0.1:8081` | Peer/operator API. Keep it off the public internet. |
| `CELLD_WATCH` | `/tmp/celld` | Local SQLite/replication workspace; not the durable copy. |
| `CELLD_IDLE_EVICT_S` | `300` | Seconds before an idle cell leaves memory. |
| `CELLD_DURABILITY` | `fleet` (unset) | One node waits for the bucket on each write; add peers for lower latency. |

A single Machine is a one-node fleet. celld stays correct, but every write waits
for the bucket. To add a node, bind the internal listener on the private network
and give each Machine its own reachable advertise address:

```sh
fly secrets set CELLD_INTERNAL_ADDR='[::]:8081'
fly scale count 2
fly machine list                    # note each machine's private IPv6
fly machine update <machine-id> --env CELLD_ADVERTISE='[fdaa:...:...]:8081'
```

Peer traffic is unencrypted and the internal listener has an unauthenticated
operator API, so use Fly's private network (or an encrypted overlay) and never
expose port 8081 publicly. A Machine needs a Docker/Podman daemon for celld's
experimental Containers service; these packages do not use it.

## Cloudflare with Wrangler

```sh
bun install
cd packages/basic_do_cells
bun run dev                     # wrangler dev, http://localhost:8787
bun run deploy                  # wrangler deploy
```

`wrangler deploy --dry-run` bundles and validates the config without uploading,
which is a quick check across the matrix:

```sh
for p in packages/basic_do_*; do
  (cd "$p" && { [ ! -f tsconfig.json ] || bun run check; } \
    && bunx wrangler deploy --dry-run --outdir "/tmp/do-out/$(basename "$p")")
done
```

### Resources that must exist first

Cloudflare services outside Durable Objects need a resource and an id in
`wrangler.jsonc` (marked `REPLACE_WITH_...`). `wrangler dev` uses local storage
and works before these steps.

| Package | Before first deploy |
| --- | --- |
| `basic_do_kv` | `bunx wrangler kv namespace create basic-do-kv` → paste `id` |
| `basic_do_d1` | `bunx wrangler d1 create basic-do-d1` → paste `database_id` |
| `basic_do_r2` | `bunx wrangler r2 bucket create basic-do-files` |
| `basic_do_queues` | `bunx wrangler queues create basic-do-jobs` and `basic-do-jobs-dead-letter` |

Durable Object classes, Workflows, Dynamic Workers, Cron Triggers, and assets
are declared entirely in `wrangler.jsonc` (plus `migrations` for DO classes).
Each README lists the exact commands.

## What is intentionally missing

- **celld Containers** — experimental in celld and needs a Docker/Podman daemon
  on every node; a Fly Machine would need a nested runtime. Not a good "basic"
  project.
- **celld Python Workers** — supported partially (Pyodide) and needs
  `uv run pywrangler sync`; the JavaScript matrix is the useful comparison.
- **Service bindings** — celld accepts `services` in `wrangler.jsonc`, but
  cross-script composition is an exercise in its own right.
- **Cloudflare gradual deployments, rate limiting, and other bindings** — they
  are platform features rather than Durable Objects concepts.

## Parity notes

- A celld **cell** is a Cloudflare **Durable Object**: one named, single-threaded
  actor with private SQLite. celld spreads ownership across your nodes and
  stores replication data in your bucket; Cloudflare hides placement and
  migration. Celld docs implement cells as plain classes with a
  `(state, env)` constructor, and the `basic_celld_*` projects follow that
  style; the `basic_do_*` projects use Cloudflare's `DurableObject` base class,
  which also carries RPC typing.
- **KV**: celld reads always reach the owning cell, so they are strongly
  consistent; Workers KV is eventually consistent and edge-cached
  (`cacheTtl`). celld ignores `cacheTtl`.
- **D1**: celld runs each database as a SQLite file inside a cell; Cloudflare D1
  is a separate global database with read replicas and Time Travel. celld has
  neither.
- **R2**: celld maps buckets onto the fleet bucket under `r2/<bucket>/` and has
  no public/presigned URLs or S3 endpoint; Cloudflare R2 has all three.
- **Queues / Workflows / Cron**: celld implements the Cloudflare APIs with one
  queue/workflow/schedule cell per resource. Cloudflare additionally offers pull
  consumers, the Queues HTTP API, dashboard/REST control for Workflows, and does
  not replay missed cron runs (celld runs one).
- **Facets and Dynamic Workers** are open beta on Cloudflare; treat both APIs as
  movable. celld implements the same surface but does not promise placement.
- **Assets**: celld uploads bodies by SHA-256 and caches on node disk, without
  compression or an edge cache. Cloudflare serves assets from its edge with
  compression and free unmetered asset requests.
