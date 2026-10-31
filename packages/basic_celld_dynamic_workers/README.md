# basic_celld_dynamic_workers

celld **Dynamic Workers**: compile Worker code supplied at runtime into its own
isolate on the node, reached through a Worker Loader binding.

## Local

```sh
bun run dev
curl -s localhost:9876/any/path          # {"loaded":"named",...}
curl -s localhost:9876/anonymous         # {"loaded":"anonymous"}
```

## Fly.io

```sh
fly apps create basic-celld-dynamic-workers
fly storage create
fly deploy
curl -s https://basic-celld-dynamic-workers.fly.dev/any/path
```

`get(id, getCode)` memoizes the compiled Worker by id inside one loader
isolate; `load(code)` compiles on every call. Loaded code gets no bindings and
no vars from the deployment, and `globalOutbound: null` disables its network
access. celld caps a node at 256 live Dynamic Workers.
