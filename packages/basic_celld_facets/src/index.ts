// The facet's code. In a real system it would come from a database or a user
// upload; a string keeps this example to one file. Per the celld facets docs,
// a facet can be a plain class with a `(state, env)` constructor.
const FACET_CODE = `
export class App {
  constructor(state) {
    this.state = state;
  }

  async fetch() {
    const n = ((await this.state.storage.get("n")) ?? 0) + 1;
    await this.state.storage.put("n", n);
    return Response.json({ facet: "app", n });
  }
}
`;

interface Env {
  LOADER: WorkerLoader;
  SUPERVISOR: DurableObjectNamespace;
}

/**
 * A facet is a child object with its own SQLite database, loaded from code the
 * supervisor supplies. It has no namespace and no ownership record of its own;
 * it moves with its root cell. Both classes are plain classes, as celld's docs
 * show; extending DurableObject is optional.
 */
export class Supervisor {
  private readonly state: DurableObjectState;
  private readonly env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/abort") {
      this.state.facets.abort("app", new Error("aborted by request"));
      return Response.json({ aborted: true });
    }

    if (url.pathname === "/delete") {
      this.state.facets.delete("app");
      return Response.json({ deleted: true });
    }

    const facet = this.state.facets.get("app", () => ({
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
