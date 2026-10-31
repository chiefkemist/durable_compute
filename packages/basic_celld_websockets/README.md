# basic_celld_websockets

celld **WebSockets**: a hibernatable WebSocket room implemented by a cell.
Accepted sockets survive hibernation, and each frame is delivered to
`webSocketMessage()` without keeping the cell resident.

## Local

```sh
bun run dev
# A non-upgrade request reports the connected client count:
curl -s localhost:9876/
# Two terminals (websocat: https://github.com/vi/websocat):
websocat 'ws://127.0.0.1:9876/?room=lobby'
websocat 'ws://127.0.0.1:9876/?room=lobby'
# Type in either terminal; both receive the line.
```

## Fly.io

```sh
fly apps create basic-celld-websockets
fly storage create
fly deploy
websocat 'wss://basic-celld-websockets.fly.dev/?room=lobby'
```

A hibernated cell wakes like a cold start when a frame arrives, but its sockets
stay connected. When the cell moves to another node (drain, rebalance, deploy)
the socket closes with code 1012 and clients must reconnect.
