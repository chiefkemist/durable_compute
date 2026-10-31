import { WorkflowEntrypoint } from "cloudflare:workers";
import type { WorkflowEvent, WorkflowStep } from "cloudflare:workers";

interface Env {
  REPORTS: Workflow<ReportParams>;
}

interface ReportParams {
  url: string;
}

interface Report {
  bytes: number;
  lines: number;
  fetchedAt: number;
}

/**
 * Cloudflare Workflows replay run() from the first line after a restart. A
 * finished step returns its stored result; code outside a step runs again.
 */
export class ReportBuilder extends WorkflowEntrypoint<Env, ReportParams> {
  async run(
    event: WorkflowEvent<ReportParams>,
    step: WorkflowStep,
  ): Promise<Report> {
    const report = await step.do("fetch source", async (): Promise<Report> => {
      const response = await fetch(event.payload.url);
      if (!response.ok) throw new Error(`${event.payload.url} answered ${response.status}`);
      const text = await response.text();
      return {
        bytes: text.length,
        lines: text.split("\n").length,
        fetchedAt: Date.now(),
      };
    });

    await step.sleep("cool down", 2);
    await step.do("record", async () => ({ instance: event.instanceId, report }));

    return report;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/create") {
      const instance = await env.REPORTS.create({
        params: { url: url.searchParams.get("url") ?? "https://example.com" },
      });
      return Response.json({ id: instance.id }, { status: 202 });
    }

    if (url.pathname === "/status") {
      const id = url.searchParams.get("id");
      if (!id) return Response.json({ error: "id is required" }, { status: 400 });
      const instance = await env.REPORTS.get(id);
      return Response.json(await instance.status());
    }

    return Response.json({
      usage: ["POST /create?url=https://example.com", "GET /status?id=<id>"],
    });
  },
} satisfies ExportedHandler<Env>;
