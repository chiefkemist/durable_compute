import { DurableObject } from "cloudflare:workers";

interface Env {
  ROOM: DurableObjectNamespace<Room>;
}

/**
 * A chat room is one cell. `ctx.acceptWebSocket()` accepts a hibernatable
 * socket: the cell can leave memory while clients stay connected, and celld
 * calls webSocketMessage() when the next frame arrives.
 */
export class Room extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return Response.json({ room: this.ctx.id.name ?? null, clients: this.ctx.getWebSockets().length });
    }

    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1]);
    pair[1].send(`joined ${this.ctx.id.name ?? "room"}\n`);

    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    for (const peer of this.ctx.getWebSockets()) {
      if (peer === ws) continue;
      try {
        peer.send(message);
      } catch {
        peer.close(1011, "send failed");
      }
    }
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    console.log("socket closed", { code, reason, remaining: this.ctx.getWebSockets().length });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const room = new URL(request.url).searchParams.get("room") ?? "lobby";
    return env.ROOM.getByName(room).fetch(request);
  },
} satisfies ExportedHandler<Env>;
