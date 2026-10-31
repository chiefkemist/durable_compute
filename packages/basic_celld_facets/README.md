# basic_celld_facets

celld **Durable Object Facets**: a supervisor cell starts a child object from
dynamically loaded code. The facet gets its own SQLite database, and the
supervisor's database stays unreadable to it.

## Local

```sh
bun run dev
curl -s localhost:9876/          # {"facet":"app","n":1}
curl -s localhost:9876/          # {"facet":"app","n":2}
curl -s -X POST localhost:9876/abort   # storage kept; next request restarts
curl -s -X POST localhost:9876/delete  # storage removed; next request starts at 1
```

## Fly.io

```sh
fly apps create basic-celld-facets
fly storage create
fly deploy
curl -s https://basic-celld-facets.fly.dev/
```

A facet can start facets of its own (depth 4 including the root), but it cannot
set an alarm and its sockets do not hibernate. Use a separate cell addressed by
name when children must run on different nodes.
