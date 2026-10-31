interface Env {
  FILES: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const listed = await env.FILES.list({ limit: 20 });
      return Response.json({
        objects: listed.objects.map((object) => ({
          key: object.key,
          size: object.size,
          etag: object.etag,
        })),
        truncated: listed.truncated,
      });
    }

    const key = url.pathname.slice(1);

    if (request.method === "PUT") {
      const object = await env.FILES.put(key, request.body ?? "", {
        httpMetadata: {
          contentType:
            request.headers.get("content-type") ?? "application/octet-stream",
        },
      });
      return Response.json({
        key: object?.key,
        size: object?.size,
        etag: object?.etag,
      });
    }

    if (request.method === "DELETE") {
      await env.FILES.delete(key);
      return new Response(null, { status: 204 });
    }

    const object = await env.FILES.get(key);
    if (object === null) {
      return Response.json({ key, found: false }, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    return new Response(object.body, { headers });
  },
} satisfies ExportedHandler<Env>;
