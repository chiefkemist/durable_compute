import { DurableObject } from "cloudflare:workers";

interface Env {
  LIMITER: DurableObjectNamespace<RateLimiter>;
}

/**
 * In-memory state lives in a field on the object instance. It survives many
 * consecutive requests, but not hibernation, eviction, or a move. Restore it
 * from durable storage in the constructor.
 */
export class RateLimiter extends DurableObject<Env> {
  private hits = 0;
  private readonly limit = 5;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // No request is delivered until this completes.
    ctx.blockConcurrencyWhile(async () => {
      this.hits = (await ctx.storage.get<number>("hits")) ?? 0;
    });
  }

  async fetch(request: Request): Promise<Response> {
    if (new URL(request.url).pathname === "/reset") {
      this.hits = 0;
      await this.ctx.storage.delete("hits");
      return Response.json({ hits: this.hits });
    }

    this.hits += 1;
    const allowed = this.hits <= this.limit;
    // A real limiter would batch this write; the demo flushes each request so
    // a cold start restores the same count.
    await this.ctx.storage.put("hits", this.hits);

    return Response.json({ allowed, hits: this.hits, limit: this.limit });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.LIMITER.getByName("demo").fetch(request);
  },
} satisfies ExportedHandler<Env>;
