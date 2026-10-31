interface Env {
  REMINDER: DurableObjectNamespace;
}

/** One alarm per cell; celld only answers setAlarm() once it is durable. */
export class Reminder {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/cancel") {
      await this.state.storage.deleteAlarm();
      return Response.json({ alarm: await this.state.storage.getAlarm() });
    }

    if (request.method === "POST") {
      const seconds = Math.max(1, Number(url.searchParams.get("in") ?? 5));
      await this.state.storage.put(
        "note",
        url.searchParams.get("note") ?? "wake up",
      );
      await this.state.storage.delete("firedAt");
      await this.state.storage.setAlarm(Date.now() + seconds * 1000);

      return Response.json({
        scheduledFor: await this.state.storage.getAlarm(),
        inSeconds: seconds,
      });
    }

    const note = await this.state.storage.get<string>("note");
    const firedAt = await this.state.storage.get<number>("firedAt");
    return Response.json({
      note: note ?? null,
      firedAt: firedAt ?? null,
      alarm: await this.state.storage.getAlarm(),
    });
  }

  async alarm(info?: AlarmInvocationInfo): Promise<void> {
    const note = (await this.state.storage.get<string>("note")) ?? "unknown";
    await this.state.storage.put({ note, firedAt: Date.now() });
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
