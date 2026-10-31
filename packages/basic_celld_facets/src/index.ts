import { DurableObject } from "cloudflare:workers";

// The facet's code. In a real system it would come from a database or a user
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
 * A facet is a child object with its own SQLite database, loaded from code the
 * supervisor supplies. It has no namespace and no ownership record of its own;
 * it moves with its root cell.
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
