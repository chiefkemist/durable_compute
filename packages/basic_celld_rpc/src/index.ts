interface Env {
  CART: DurableObjectNamespace;
}

type Items = Record<string, number>;

export interface CartSnapshot {
  items: Items;
  total: number;
}

/**
 * celld exposes public methods on a plain cell class over RPC when the
 * `js_rpc` compatibility flag is set. The stub is typed by hand because
 * workers-types brands RPC through the optional DurableObject base class.
 */
export class Cart {
  private readonly state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async add(item: string, quantity = 1): Promise<CartSnapshot> {
    const items = (await this.state.storage.get<Items>("items")) ?? {};
    items[item] = (items[item] ?? 0) + quantity;
    await this.state.storage.put("items", items);
    return { items, total: Object.values(items).reduce((sum, n) => sum + n, 0) };
  }

  async clear(): Promise<void> {
    await this.state.storage.delete("items");
  }

  async fetch(request: Request): Promise<Response> {
    const item = new URL(request.url).searchParams.get("add");
    return Response.json(await this.add(item ?? "coffee"));
  }
}

interface CartStub {
  add(item: string, quantity?: number): Promise<CartSnapshot>;
  clear(): Promise<void>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const cart = env.CART.getByName("demo") as unknown as CartStub;

    if (url.pathname === "/clear") {
      await cart.clear();
      return Response.json({ cleared: true });
    }

    return Response.json(await cart.add(url.searchParams.get("add") ?? "coffee"));
  },
} satisfies ExportedHandler<Env>;
