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
      colo: request.cf?.colo ?? null,
      country: request.cf?.country ?? null,
    });
  },
} satisfies ExportedHandler<Env>;
