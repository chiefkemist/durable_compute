# basic_do_websockets

Cloudflare **WebSocket Hibernation**: `ctx.acceptWebSocket()` keeps clients
connected while the object hibernates. Tags filter sockets, and the
auto-response pair answers `ping`/`pong` without waking the object.

## Local

```sh
bun run dev
curl -s localhost:8787/                 # non-upgrade: client counts
websocat 'ws://127.0.0.1:8787/?room=lobby'   # two terminals, type to broadcast
# In a socket, send "ping" and receive "pong" without a wake-up.
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
websocat 'wss://basic-do-websockets.<your-subdomain>.workers.dev/?room=lobby'
```

Hibernation only applies to sockets accepted with `acceptWebSocket()`, not to
`server.accept()`. Incoming frames are delivered in order per socket, and the
`webSocketClose` handler above closes cleanly.
