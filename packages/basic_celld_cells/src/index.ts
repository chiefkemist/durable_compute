import { DurableObject } from "cloudflare:workers";

interface Env {
  COUNTER: DurableObjectNamespace<Counter>;
}

/**
 * A cell is celld's Durable Object: one named, single-threaded actor with its
 * own SQLite database. celld gives each name a stable id across the fleet.
 */
export class Counter extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/reset") {
      await this.ctx.storage.deleteAll();
      return Response.json({ reset: true, name: this.ctx.id.name ?? null });
    }

    const n = ((await this.ctx.storage.get<number>("n")) ?? 0) + 1;
    await this.ctx.storage.put("n", n);

    return Response.json({
      name: this.ctx.id.name ?? null,
      id: this.ctx.id.toString(),
      n,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const name = url.searchParams.get("name") ?? "default";
    const idParam = url.searchParams.get("id");

    // Three ways to address the same cell:
    //   ?name=alice          derived id from a name (idFromName)
    //   ?id=<64 hex chars>   a previously returned id (idFromString)
    //   ?unique=1            a fresh random id (newUniqueId)
    const id = idParam
      ? env.COUNTER.idFromString(idParam)
      : url.searchParams.get("unique") === "1"
        ? env.COUNTER.newUniqueId()
        : env.COUNTER.idFromName(name);

    return env.COUNTER.get(id).fetch(request);
  },
} satisfies ExportedHandler<Env>;
