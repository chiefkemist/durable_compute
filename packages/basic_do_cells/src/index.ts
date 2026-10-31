import { DurableObject } from "cloudflare:workers";

interface Env {
  COUNTER: DurableObjectNamespace<Counter>;
}

/**
 * One Durable Object: a globally addressable, single-threaded actor with
 * private, strongly consistent storage. Cloudflare creates it on first access
 * and migrates it between machines without application involvement.
 */
export class Counter extends DurableObject<Env> {
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

    // Three ways to address the same object:
    //   ?name=alice          idFromName() - stable derived id
    //   ?id=<64 hex chars>   idFromString() - an id returned earlier
    //   ?unique=1            newUniqueId() - random, must be stored to reuse
    const id = idParam
      ? env.COUNTER.idFromString(idParam)
      : url.searchParams.get("unique") === "1"
        ? env.COUNTER.newUniqueId()
        : env.COUNTER.idFromName(name);

    return env.COUNTER.get(id).fetch(request);
  },
} satisfies ExportedHandler<Env>;
