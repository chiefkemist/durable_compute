import { DurableObject } from "cloudflare:workers";

interface Env {
  LIMITER: DurableObjectNamespace<RateLimiter>;
}

/**
 * In-memory state lives in a field on the cell instance. It survives many
 * consecutive events, but not hibernation or an ownership move: celld runs the
 * constructor again on the next activation, so restore the field from storage.
 */
export class RateLimiter extends DurableObject {
  private hits = 0;
  private readonly limit = 5;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // No event is delivered until this completes.
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
    // the count survives an eviction.
    await this.ctx.storage.put("hits", this.hits);

    return Response.json({ allowed, hits: this.hits, limit: this.limit });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.LIMITER.getByName("demo").fetch(request);
  },
} satisfies ExportedHandler<Env>;
