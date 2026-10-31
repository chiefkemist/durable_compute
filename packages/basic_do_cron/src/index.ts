import { DurableObject } from "cloudflare:workers";

interface Env {
  TICKS: DurableObjectNamespace<Ticker>;
}

interface Tick {
  cron: string;
  scheduledTime: number;
  recordedAt: number;
}

/** Cron occurrences are recorded in a Durable Object so they survive isolates. */
export class Ticker extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST") {
      const previous = (await this.ctx.storage.get<Tick>("last")) ?? null;
      const tick: Tick = {
        cron: url.searchParams.get("cron") ?? "manual",
        scheduledTime: Number(url.searchParams.get("scheduledTime") ?? Date.now()),
        recordedAt: Date.now(),
      };
      await this.ctx.storage.put("last", tick);
      return Response.json({ previous, tick });
    }

    return Response.json({
      last: (await this.ctx.storage.get<Tick>("last")) ?? null,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.TICKS.getByName("clock").fetch(request);
  },

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(
      env.TICKS.getByName("clock")
        .fetch(
          `https://ticker.internal/tick?cron=${encodeURIComponent(controller.cron)}&scheduledTime=${controller.scheduledTime}`,
          { method: "POST" },
        )
        .then(() => undefined),
    );
  },
} satisfies ExportedHandler<Env>;
