interface Env {
  VALUES: KVNamespace;
}

interface ValueMetadata {
  updatedAt: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const page = await env.VALUES.list({ limit: 20 });
      return Response.json({
        keys: page.keys.map((key) => key.name),
        cursor: page.list_complete ? null : page.cursor,
      });
    }

    const key = url.pathname.slice(1);

    if (request.method === "PUT") {
      await env.VALUES.put(key, request.body ?? "", {
        metadata: { updatedAt: Date.now() } satisfies ValueMetadata,
      });
      return new Response(null, { status: 204 });
    }

    if (request.method === "DELETE") {
      await env.VALUES.delete(key);
      return new Response(null, { status: 204 });
    }

    // Workers KV is eventually consistent; cacheTtl bounds the edge cache.
    const stored = await env.VALUES.getWithMetadata<ValueMetadata>(key, {
      type: "text",
      cacheTtl: 60,
    });
    if (stored.value === null) {
      return Response.json({ key, found: false }, { status: 404 });
    }

    return Response.json({
      key,
      found: true,
      value: stored.value,
      metadata: stored.metadata,
      cached: stored.cacheStatus,
    });
  },
} satisfies ExportedHandler<Env>;
