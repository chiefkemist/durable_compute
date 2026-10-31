import { DurableObject } from "cloudflare:workers";

interface Env {
  CART: DurableObjectNamespace<Cart>;
}

type Items = Record<string, number>;

export interface CartSnapshot {
  items: Items;
  total: number;
}

/**
 * Public methods on a Durable Object class are callable over RPC. The stub is
 * typed like a local object, but each call crosses to the object's isolate.
 */
export class Cart extends DurableObject<Env> {
  async add(item: string, quantity = 1): Promise<CartSnapshot> {
    const items = (await this.ctx.storage.get<Items>("items")) ?? {};
    items[item] = (items[item] ?? 0) + quantity;
    await this.ctx.storage.put("items", items);
    return { items, total: Object.values(items).reduce((sum, n) => sum + n, 0) };
  }

  async clear(): Promise<void> {
    await this.ctx.storage.delete("items");
  }

  async fetch(request: Request): Promise<Response> {
    const item = new URL(request.url).searchParams.get("add");
    return Response.json(await this.add(item ?? "coffee"));
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cart = env.CART.getByName("demo");

    if (url.pathname === "/clear") {
      await cart.clear();
      return Response.json({ cleared: true });
    }

    return Response.json(await cart.add(url.searchParams.get("add") ?? "coffee"));
  },
} satisfies ExportedHandler<Env>;
