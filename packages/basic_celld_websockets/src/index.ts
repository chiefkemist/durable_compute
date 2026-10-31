interface Env {
  ROOM: DurableObjectNamespace;
}

/**
 * A chat room is one cell. `state.acceptWebSocket()` accepts a hibernatable
 * socket: the cell can leave memory while clients stay connected, and celld
 * calls webSocketMessage() when the next frame arrives.
 */
export class Room {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return Response.json({
        room: this.state.id.name ?? null,
        clients: this.state.getWebSockets().length,
      });
    }

    const pair = new WebSocketPair();
    this.state.acceptWebSocket(pair[1]);
    pair[1].send(`joined ${this.state.id.name ?? "room"}\n`);

    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    for (const peer of this.state.getWebSockets()) {
      if (peer === ws) continue;
      try {
        peer.send(message);
      } catch {
        peer.close(1011, "send failed");
      }
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    console.log("socket closed", {
      code,
      reason,
      remaining: this.state.getWebSockets().length,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const room = new URL(request.url).searchParams.get("room") ?? "lobby";
    return env.ROOM.getByName(room).fetch(request);
  },
} satisfies ExportedHandler<Env>;
