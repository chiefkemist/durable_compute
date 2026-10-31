# basic_celld_r2

celld **R2**: object storage through a bucket binding. celld stores the objects
in the fleet bucket under `r2/<bucket_name>/`, so there is nothing to create.

## Local

```sh
bun run dev
curl -s -X PUT localhost:9876/notes/hello.txt --data 'hello r2'
curl -s localhost:9876/notes/hello.txt
curl -s localhost:9876/
curl -s -X DELETE localhost:9876/notes/hello.txt
```

## Fly.io

```sh
fly apps create basic-celld-r2
fly storage create
fly deploy
curl -s -X PUT https://basic-celld-r2.fly.dev/notes/hello.txt --data 'hello Fly'
curl -s https://basic-celld-r2.fly.dev/notes/hello.txt
```

R2 has no public bucket URL, presigned URL, or S3 endpoint in celld, so a
Worker in front of the bytes is how you publish them. Serving large files needs
a fleet bucket (`fly storage create` provides one).
