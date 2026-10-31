console.log("Hello via Bun!");

// Hello world server

const DEFAULT_PORT = 3000;
const STARTED_AT = Date.now();

function resolvePort(): number {
  const raw = Bun.env.PORT;
  if (!raw) return DEFAULT_PORT;

  const port = Number(raw);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(
      `Invalid PORT "${raw}": expected an integer between 0 and 65535`,
    );
  }

  return port;
}

const port = resolvePort();

const json = (body: unknown, status = 200): Response =>
  Response.json(body, { status });

// Process controller: aborted as soon as shutdown starts so handlers can stop
// doing work for a server that is no longer accepting traffic.
const controller = new AbortController();
const shuttingDown = () => controller.signal.aborted;

// Endpoints

// Share drain response: clients get a retryable 503 instead of a success they
// can no longer rely on once process is going away.
const draining = (): Response =>
  json({ error: "Server is shutting down" }, 503);
const hello = (): Response =>
  shuttingDown() ? draining() : new Response("Hello, world!");
const health = (): Response => {
  const stopping = shuttingDown();
  return json(
    {
      status: stopping ? "draining" : "ok",
      uptimeMs: Date.now() - STARTED_AT,
    },
    stopping ? 503 : 200,
  );
};
const echo = async (req: Request): Promise<Response> => {
  if (shuttingDown()) return draining();
  try {
    const body = await req.json();
    return json({ received: body });
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
};
const notFound = (): Response => json({ error: "Not found" }, 404);
const error500 = (error: unknown): Response => {
  console.error("Unhandled request error", error);
  return json({ error: "Internal server error" }, 500);
};

const server = Bun.serve({
  port,
  routes: {
    "/": hello,
    "/health": health,
    "/api/echo": { POST: echo },
  },
  fetch: notFound,
  error: error500,
});

const shutdown = async (signal: string) => {
  // The controller doubles as the idempotency guard: the first signal aborts
  // it, later signals see it aborted and return immediately.
  if (shuttingDown()) return;
  console.log(`Received ${signal}, shutting down`);
  controller.abort();
  try {
    await server.stop();
  } finally {
    // Exit even if stop() fails, so a broken drain cannot leave a zombie
    // process behind.
    process.exit(0);
  }
};

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

console.log(`Server listening on ${server.url}`);
