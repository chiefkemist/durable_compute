import { DurableObject } from "cloudflare:workers";

interface Env {
  LEDGER: DurableObjectNamespace<Ledger>;
}

interface Entry extends Record<string, SqlStorageValue> {
  id: number;
  memo: string;
  cents: number;
  at: number;
}

/** A SQLite-backed Durable Object queries its private database synchronously. */
export class Ledger extends DurableObject<Env> {
  private readonly sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        memo TEXT NOT NULL,
        cents INTEGER NOT NULL,
        at INTEGER NOT NULL
      )
    `);
  }

  async fetch(request: Request): Promise<Response> {
    if (request.method === "POST") {
      const body = await request.json<{ memo?: string; cents?: number }>();

      // transactionSync() groups writes atomically; a throw rolls them back.
      const row = this.ctx.storage.transactionSync(() =>
        this.sql
          .exec<Entry>(
            "INSERT INTO entries (memo, cents, at) VALUES (?, ?, ?) RETURNING id, memo, cents, at",
            body.memo ?? "entry",
            Math.trunc(body.cents ?? 0),
            Date.now(),
          )
          .one(),
      );

      return Response.json(row, { status: 201 });
    }

    const entries = this.sql
      .exec<Entry>("SELECT id, memo, cents, at FROM entries ORDER BY id")
      .toArray();
    const total = this.sql
      .exec<{ cents: number }>(
        "SELECT coalesce(sum(cents), 0) AS cents FROM entries",
      )
      .one();

    return Response.json({
      totalCents: total.cents,
      entries,
      databaseSize: this.sql.databaseSize,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return env.LEDGER.getByName("books").fetch(request);
  },
} satisfies ExportedHandler<Env>;
