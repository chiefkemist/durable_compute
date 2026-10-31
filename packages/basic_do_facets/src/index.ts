import { DurableObject } from "cloudflare:workers";

// The facet's code. In production this would come from a database or a user
// upload; a string keeps this example to one file.
const FACET_CODE = `
import { DurableObject } from "cloudflare:workers";

export class App extends DurableObject {
  async fetch() {
    const n = ((await this.ctx.storage.get("n")) ?? 0) + 1;
    await this.ctx.storage.put("n", n);
    return Response.json({ facet: "app", n });
  }
}
`;

interface Env {
  LOADER: WorkerLoader;
  SUPERVISOR: DurableObjectNamespace<Supervisor>;
}

/**
 * Durable Object Facets (open beta): a supervisor object starts a child object
 * from dynamically loaded code. The facet gets its own isolated SQLite
 * database and cannot read the supervisor's storage.
 */
export class Supervisor extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/abort") {
      this.ctx.facets.abort("app", new Error("aborted by request"));
      return Response.json({ aborted: true });
    }

    if (url.pathname === "/delete") {
      this.ctx.facets.delete("app");
      return Response.json({ deleted: true });
    }

    const facet = this.ctx.facets.get("app", () => ({
      class: this.env.LOADER.get("app-v1", () => ({
        compatibilityDate: "2026-10-01",
        mainModule: "app.js",
        modules: { "app.js": FACET_CODE },
        globalOutbound: null,
      })).getDurableObjectClass("App"),
    }));

    return facet.fetch(request);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.SUPERVISOR.getByName("only").fetch(request);
  },
} satisfies ExportedHandler<Env>;
