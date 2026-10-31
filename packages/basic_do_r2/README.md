# basic_do_r2

Cloudflare **R2**: S3-compatible object storage reached through a bucket
binding. R2 is independent of Durable Objects and shared by every Worker.

## Create the bucket

```sh
bunx wrangler r2 bucket create basic-do-files
```

`wrangler dev` uses a local bucket, so local testing works before creation.

## Run and deploy

```sh
bun run dev
curl -s -X PUT localhost:8787/notes/hello.txt --data 'hello r2'
curl -s localhost:8787/notes/hello.txt
bun run deploy
curl -s -X PUT https://basic-do-r2.<your-subdomain>.workers.dev/notes/hello.txt --data 'hello'
```

Unlike celld's R2 binding, Cloudflare R2 also offers public buckets, presigned
URLs, S3 API access, and event notifications.
