# basic_celld_assets

celld **static assets**: a Worker-less deployment of a directory, with
`_headers`, `_redirects`, HTML handling and `404.html` support.

## Local

```sh
bun run dev
curl -s localhost:9876/ | head
curl -sI localhost:9876/home            # 301 -> /
curl -sI localhost:9876/missing         # 404 with 404.html
curl -sI localhost:9876/style.css       # long Cache-Control + X-Served-By
```

## Fly.io

```sh
fly apps create basic-celld-assets
fly storage create
fly deploy
curl -s https://basic-celld-assets.fly.dev/
```

An asset-only project may not declare `run_worker_first` or an assets binding.
celld stores each body once by SHA-256 and caches files on each node's disk; it
does not compress responses, so put a compressing proxy in front if needed.
