import { DurableObject } from "cloudflare:workers";

interface Env {
  ROOM: DurableObjectNamespace<Room>;
}

/**
 * WebSocket Hibernation: `acceptWebSocket()` lets Cloudflare evict the object
 * while clients stay connected. Only a matching frame wakes it.
 */
export class Room extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Answered by the runtime without waking a hibernated object.
    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong"),
    );
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return Response.json({
        room: this.ctx.id.name ?? null,
        clients: this.ctx.getWebSockets().length,
        tagged: this.ctx.getWebSockets("chat").length,
      });
    }

    const pair = new WebSocketPair();
    this.ctx.acceptWebSocket(pair[1], ["chat"]);
    pair[1].send(`joined ${this.ctx.id.name ?? "room"}\n`);

    return new Response(null, { status: 101, webSocket: pair[0] });
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void {
    for (const peer of this.ctx.getWebSockets("chat")) {
      if (peer === ws) continue;
      try {
        peer.send(message);
      } catch {
        peer.close(1011, "send failed");
      }
    }
  }

  webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ): void {
    console.log("socket closed", { code, reason, wasClean, tags: this.ctx.getTags(ws) });
    ws.close(code, "Durable Object is closing WebSocket");
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const room = new URL(request.url).searchParams.get("room") ?? "lobby";
    return env.ROOM.getByName(room).fetch(request);
  },
} satisfies ExportedHandler<Env>;
