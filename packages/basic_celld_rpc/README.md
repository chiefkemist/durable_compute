# basic_celld_rpc

celld **RPC**: call methods on a cell stub instead of encoding an HTTP request.
Public class methods are typed on the stub; arguments and return values are
structured-cloned.

## Local

```sh
bun run dev
curl -s localhost:9876/                  # coffee: 1
curl -s 'localhost:9876/?add=tea'        # coffee: 1, tea: 1
curl -s 'localhost:9876/?add=coffee'     # coffee: 2
curl -s -X POST localhost:9876/clear
```

## Fly.io

```sh
fly apps create basic-celld-rpc
fly storage create
fly deploy
curl -s 'https://basic-celld-rpc.fly.dev/?add=coffee'
```

A stub cannot cross an isolate boundary, and an `AbortSignal` does not cross a
node boundary. When a call is retried after an ambiguous failure, keep one
stable operation ID in the payload.
