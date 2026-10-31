interface Job {
  kind: "ok" | "fail";
  at: number;
}

interface Env {
  JOBS: Queue<Job>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/send") {
      const job: Job = {
        kind: url.searchParams.get("fail") === "1" ? "fail" : "ok",
        at: Date.now(),
      };
      await env.JOBS.send(job);
      return Response.json({ queued: job });
    }

    if (url.pathname === "/batch") {
      const now = Date.now();
      await env.JOBS.sendBatch([
        { body: { kind: "ok", at: now } },
        { body: { kind: "ok", at: now } },
      ]);
      return Response.json({ queued: 2 });
    }

    return Response.json({ usage: ["POST /send?fail=0|1", "POST /batch"] });
  },

  async queue(batch: MessageBatch<Job>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      if (batch.queue.endsWith("-dead-letter")) {
        console.log("dead letter", message.id, message.body);
        message.ack();
        continue;
      }

      if (message.body.kind === "fail") {
        console.log("retrying", message.id, "attempt", message.attempts);
        message.retry({ delaySeconds: 1 });
        continue;
      }

      console.log("processed", message.id, message.body);
      message.ack();
    }
  },
} satisfies ExportedHandler<Env, Job>;
