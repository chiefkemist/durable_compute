# basic_do_dynamic_workers

Cloudflare **Dynamic Workers** (open beta): compile Worker code supplied at
runtime into its own isolate, reached through a Worker Loader binding.

## Local

```sh
bun run dev
curl -s localhost:8787/any/path          # {"loaded":"named",...}
curl -s localhost:8787/anonymous         # {"loaded":"anonymous"}
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s https://basic-do-dynamic-workers.<your-subdomain>.workers.dev/any/path
```

`get(id, getCode)` caches the compiled Worker by id inside one loader isolate;
`load(code)` compiles on every call. Loaded code has its own heap and gets only
the `env` and `globalOutbound` in its `WorkerCode`; this example blocks network
access with `globalOutbound: null`.
