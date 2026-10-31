import { DurableObject } from "cloudflare:workers";

interface Env {
  REGION: DurableObjectNamespace<Region>;
}

const HINTS: readonly DurableObjectLocationHint[] = [
  "wnam",
  "enam",
  "sam",
  "weur",
  "eeur",
  "apac",
  "oc",
  "afr",
  "me",
];

/** A location hint influences where a new object is created, once. */
export class Region extends DurableObject<Env> {
  async fetch(request: Request): Promise<Response> {
    const requested = new URL(request.url).searchParams.get("hint");
    return Response.json({
      name: this.ctx.id.name ?? null,
      id: this.ctx.id.toString(),
      jurisdiction: this.ctx.id.jurisdiction ?? null,
      requestedHint: requested,
    });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hint = url.searchParams.get("hint") ?? "weur";
    if (!HINTS.includes(hint as DurableObjectLocationHint)) {
      return Response.json({ error: `unknown hint: ${hint}`, hints: HINTS }, { status: 400 });
    }

    const name = url.searchParams.get("name") ?? "demo";
    // The hint is used only when this id has no object yet. To place a brand
    // new object, use a name (or id) the namespace has not seen before.
    return env.REGION.get(env.REGION.idFromName(name), {
      locationHint: hint as DurableObjectLocationHint,
    }).fetch(request);
  },
} satisfies ExportedHandler<Env>;
