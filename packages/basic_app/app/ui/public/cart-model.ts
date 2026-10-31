import { TypedEventTarget } from 'remix/component'

export interface CartLine {
  id: string
  title: string
  quantity: number
}

const STORAGE_KEY = 'basic-app:cart'

export class CartModel extends TypedEventTarget<{ change: Event }> {
  #lines: CartLine[]
  #lastAdded: CartLine | undefined
  #version = 0

  constructor(lines: readonly CartLine[] = []) {
    super()
    this.#lines = [...lines]
  }

  get lines(): readonly CartLine[] {
    return this.#lines
  }

  get itemCount(): number {
    return this.#lines.reduce((total, line) => total + line.quantity, 0)
  }

  get lastAdded(): CartLine | undefined {
    return this.#lastAdded
  }

  get version(): number {
    return this.#version
  }

  restore(lines: readonly CartLine[]): void {
    this.#lines = [...lines]
    this.#commit()
  }

  add(product: { id: string; title: string }): void {
    let existing = this.#lines.find((line) => line.id === product.id)

    this.#lines = existing
      ? this.#lines.map((line) =>
          line.id === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      : [...this.#lines, { id: product.id, title: product.title, quantity: 1 }]

    this.#lastAdded = { id: product.id, title: product.title, quantity: 1 }
    this.#commit()
  }

  setQuantity(id: string, quantity: number): void {
    this.#lines =
      quantity <= 0
        ? this.#lines.filter((line) => line.id !== id)
        : this.#lines.map((line) => (line.id === id ? { ...line, quantity } : line))

    this.#commit()
  }

  remove(id: string): void {
    this.#lines = this.#lines.filter((line) => line.id !== id)
    this.#commit()
  }

  clear(): void {
    this.#lines = []
    this.#commit()
  }

  #commit(): void {
    this.#version++
    persist(this.#lines)
    this.dispatchEvent(new Event('change'))
  }
}

let cart: CartModel | undefined
let hydrated = false

export function getCart(): CartModel {
  cart ??= new CartModel()
  return cart
}

export function hydrateCart(): void {
  if (hydrated) return
  hydrated = true

  let stored = load()
  if (stored.length === 0) return

  getCart().restore(stored)
}

function persist(lines: readonly CartLine[]): void {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // Storage can be unavailable or full; the in-memory cart still works.
  }
}

function load(): CartLine[] {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return []

  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return []

    let parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(isCartLine)
  } catch {
    return []
  }
}

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== 'object' || value === null) return false

  let line = value as Record<string, unknown>
  return (
    typeof line.id === 'string' &&
    typeof line.title === 'string' &&
    typeof line.quantity === 'number' &&
    Number.isFinite(line.quantity)
  )
}
