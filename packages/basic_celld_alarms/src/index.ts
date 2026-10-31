import { DurableObject } from "cloudflare:workers";

interface Env {
  REMINDER: DurableObjectNamespace<Reminder>;
}

/** One alarm per cell; celld only answers setAlarm() once it is durable. */
export class Reminder extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/cancel") {
      await this.ctx.storage.deleteAlarm();
      return Response.json({ alarm: await this.ctx.storage.getAlarm() });
    }

    if (request.method === "POST") {
      const seconds = Math.max(1, Number(url.searchParams.get("in") ?? 5));
      await this.ctx.storage.put(
        "note",
        url.searchParams.get("note") ?? "wake up",
      );
      await this.ctx.storage.delete("firedAt");
      await this.ctx.storage.setAlarm(Date.now() + seconds * 1000);

      return Response.json({
        scheduledFor: await this.ctx.storage.getAlarm(),
        inSeconds: seconds,
      });
    }

    const note = await this.ctx.storage.get<string>("note");
    const firedAt = await this.ctx.storage.get<number>("firedAt");
    return Response.json({
      note: note ?? null,
      firedAt: firedAt ?? null,
      alarm: await this.ctx.storage.getAlarm(),
    });
  }

  async alarm(info?: AlarmInvocationInfo): Promise<void> {
    const note = (await this.ctx.storage.get<string>("note")) ?? "unknown";
    await this.ctx.storage.put({ note, firedAt: Date.now() });
    console.log("alarm fired", {
      note,
      isRetry: info?.isRetry ?? false,
      retryCount: info?.retryCount ?? 0,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.REMINDER.getByName("only").fetch(request);
  },
} satisfies ExportedHandler<Env>;
