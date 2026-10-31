interface Env {
  LOADER: WorkerLoader;
}

const NAMED_SOURCE = `
export default {
  fetch(request) {
    return Response.json({
      loaded: "named",
      path: new URL(request.url).pathname,
    });
  }
};
`;

const ANONYMOUS_SOURCE = `
export default {
  fetch() {
    return Response.json({ loaded: "anonymous" });
  }
};
`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/anonymous") {
      const worker = env.LOADER.load({
        compatibilityDate: "2026-10-01",
        mainModule: "worker.js",
        modules: { "worker.js": ANONYMOUS_SOURCE },
        globalOutbound: null,
      });
      return worker.getEntrypoint().fetch(request);
    }

    const worker = env.LOADER.get("named-v1", () => ({
      compatibilityDate: "2026-10-01",
      mainModule: "worker.js",
      modules: { "worker.js": NAMED_SOURCE },
      globalOutbound: null,
    }));

    return worker.getEntrypoint().fetch(request);
  },
} satisfies ExportedHandler<Env>;
