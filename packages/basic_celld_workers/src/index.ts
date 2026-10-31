interface Env {
  GREETING: string;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    // celld retires isolates at any time, so request work that outlives the
    // response belongs in ctx.waitUntil() rather than in module scope.
    if (url.pathname === "/wait") {
      ctx.waitUntil(
        (async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          console.log("waitUntil work finished", url.pathname);
        })(),
      );
      return Response.json({ queued: true });
    }

    return Response.json({
      greeting: env.GREETING,
      method: request.method,
      url: request.url,
    });
  },
} satisfies ExportedHandler<Env>;
