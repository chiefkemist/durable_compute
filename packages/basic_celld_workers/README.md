# basic_celld_workers

celld **Workers**: a stateless `fetch` handler with a `vars` binding and
`ctx.waitUntil()` for work that outlives the response.

## Local

```sh
bun run dev                 # http://127.0.0.1:9876
curl -s localhost:9876/
curl -s localhost:9876/wait
```

## Fly.io

```sh
fly apps create basic-celld-workers   # or edit app in fly.toml
fly storage create                    # Tigris bucket -> BUCKET_NAME + AWS_* secrets
fly deploy
curl -s https://basic-celld-workers.fly.dev/
```

`[deploy].release_command` runs `scripts/deploy.sh`, which uploads the deployment
to the bucket; machines then run the node. See `../README.md`.
