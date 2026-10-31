interface Env {
  DB: D1Database;
}

interface Entry {
  id: number;
  name: string;
  message: string;
  at: number;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  at INTEGER NOT NULL
);
`;

let schema: Promise<unknown> | undefined;
const ensureSchema = (db: D1Database): Promise<unknown> =>
  (schema ??= db.prepare(SCHEMA).run());

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    await ensureSchema(env.DB);

    if (request.method === "POST") {
      const body = await request.json<{ name?: string; message?: string }>();
      const written = await env.DB.prepare(
        "INSERT INTO entries (name, message, at) VALUES (?, ?, ?)",
      )
        .bind(body.name ?? "anonymous", body.message ?? "", Date.now())
        .run();

      return Response.json(
        { id: written.meta.last_row_id, changes: written.meta.changes },
        { status: 201 },
      );
    }

    // batch() runs the statements in one transaction and one cell dispatch.
    const [countResult, recentResult] = await env.DB.batch([
      env.DB.prepare("SELECT count(*) AS n FROM entries"),
      env.DB.prepare(
        "SELECT id, name, message, at FROM entries ORDER BY id DESC LIMIT 10",
      ),
    ]);

    const count = (countResult?.results[0] as { n: number } | undefined)?.n ?? 0;
    const entries = (recentResult?.results ?? []) as Entry[];

    return Response.json({ count, entries });
  },
} satisfies ExportedHandler<Env>;
