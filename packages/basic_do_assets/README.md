# basic_do_assets

Cloudflare **Static Assets**: deploy a directory with no Worker code, including
`_headers`, `_redirects`, HTML handling, and a custom 404 page.

## Local

```sh
bun run dev
curl -s localhost:8787/ | head
curl -sI localhost:8787/home            # 301 -> /
curl -sI localhost:8787/missing         # 404 with 404.html
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s https://basic-do-assets.<your-subdomain>.workers.dev/
```

Static assets are free and unmetered for requests that do not invoke a Worker.
Add a `main` and `assets.binding` when a Worker needs to call
`env.ASSETS.fetch(request)` or `run_worker_first` to handle some routes.
