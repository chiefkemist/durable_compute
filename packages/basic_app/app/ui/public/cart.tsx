import { clientEntry, css, on } from 'remix/component'
import type { Handle } from 'remix/component'

import { routes } from '../../routes.ts'
import { getCart, hydrateCart } from './cart-model.ts'

export const CartButton = clientEntry(
  import.meta.url,
  function CartButton(handle: Handle<{ product: { id: string; title: string } }>) {
    return () => (
      <button
        type="button"
        mix={[
          css({
            border: '1px solid var(--accent, #d83a5a)',
            borderRadius: '999px',
            background: 'transparent',
            color: 'var(--accent, #d83a5a)',
            cursor: 'pointer',
            font: 'inherit',
            fontWeight: 600,
            padding: '0.45rem 0.9rem',
            transition: 'background-color 140ms ease, color 140ms ease, transform 120ms ease',
            '&:hover, &:focus-visible': {
              background: 'var(--accent, #d83a5a)',
              color: 'white',
            },
            '&:active': { transform: 'scale(0.97)' },
            '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          }),
          on('click', () => {
            getCart().add(handle.props.product)
          }),
        ]}
      >
        Add to cart
      </button>
    )
  },
)

export const CartPanel = clientEntry(
  import.meta.url,
  function CartPanel(handle: Handle) {
    let cart = getCart()
    let notice: string | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    // Load any cart saved from a previous visit after the initial render so the
    // hydrated markup matches the server-rendered empty state.
    if (typeof window !== 'undefined') setTimeout(hydrateCart, 0)

    let listenerOptions =
      handle.signal instanceof AbortSignal ? { signal: handle.signal } : undefined

    cart.addEventListener(
      'change',
      () => {
        if (cart.lastAdded !== undefined) {
          notice = `Added ${cart.lastAdded.title}`
          if (timer !== undefined) clearTimeout(timer)
          timer = setTimeout(() => {
            notice = undefined
            handle.update()
          }, 2500)
        }

        handle.update()
      },
      listenerOptions,
    )

    if (handle.signal instanceof AbortSignal) {
      handle.signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
    }

    return () => (
      <div
        mix={css({
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        })}
      >
        {notice ? (
          <p
            key={cart.version}
            role="status"
            mix={[
              css({
                margin: 0,
                fontSize: '0.85rem',
                color: 'var(--accent, #d83a5a)',
                animation: 'cart-notice 240ms ease-out',
                '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
              }),
            ]}
          >
            {notice}
          </p>
        ) : null}
        <a
          href={routes.cart.href()}
          mix={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            border: '1px solid var(--border, #d6d6d6)',
            borderRadius: '999px',
            color: 'inherit',
            padding: '0.45rem 0.9rem',
            textDecoration: 'none',
            '&:hover, &:focus-visible': { borderColor: 'var(--accent, #d83a5a)' },
          })}
        >
          Cart
          <span
            key={cart.itemCount}
            mix={css({
              display: 'inline-grid',
              minWidth: '1.5rem',
              placeItems: 'center',
              borderRadius: '999px',
              background: 'var(--accent, #d83a5a)',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0 0.35rem',
              animation: 'cart-pop 240ms ease-out',
              '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
            })}
          >
            {cart.itemCount}
          </span>
        </a>
      </div>
    )
  },
)

export const CartContents = clientEntry(
  import.meta.url,
  function CartContents(handle: Handle) {
    let cart = getCart()
    let ready = false

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        hydrateCart()
        ready = true
        handle.update()
      }, 0)
    }

    let listenerOptions =
      handle.signal instanceof AbortSignal ? { signal: handle.signal } : undefined

    cart.addEventListener('change', () => handle.update(), listenerOptions)

    return () => {
      // The cart lives in the browser, so the server renders an empty boundary and
      // the first client update inserts the real contents.
      if (!ready) return null

      return (
      <div>
        <ul mix={css({ display: 'grid', gap: '0.75rem', listStyle: 'none', padding: 0 })}>
          {cart.lines.length === 0 ? (
            <li key="empty">
              Your cart is empty. <a href={routes.home.href()}>Browse albums</a>
            </li>
          ) : (
            cart.lines.map((line) => (
              <li
                key={line.id}
                mix={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  border: '1px solid var(--border, #d6d6d6)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                })}
              >
                <a href={routes.albums.show.href({ albumId: line.id })} mix={css({ flex: 1 })}>
                  {line.title}
                </a>
                <button
                  type="button"
                  aria-label={`Remove one ${line.title}`}
                  mix={[
                    stepStyle,
                    on('click', () => cart.setQuantity(line.id, line.quantity - 1)),
                  ]}
                >
                  −
                </button>
                <span mix={css({ minWidth: '1.5rem', textAlign: 'center' })}>{line.quantity}</span>
                <button
                  type="button"
                  mix={[
                    stepStyle,
                    on('click', () => cart.setQuantity(line.id, line.quantity + 1)),
                  ]}
                >
                  +
                </button>
                <button
                  type="button"
                  mix={[
                    css({
                      border: 0,
                      background: 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      font: 'inherit',
                      textDecoration: 'underline',
                    }),
                    on('click', () => cart.remove(line.id)),
                  ]}
                >
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
        {cart.lines.length > 0 ? (
          <>
            <p>{cart.itemCount} items in your cart</p>
            <button
              type="button"
              mix={[
                css({
                  border: '1px solid var(--border, #d6d6d6)',
                  borderRadius: '999px',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  font: 'inherit',
                  padding: '0.45rem 0.9rem',
                }),
                on('click', () => cart.clear()),
              ]}
            >
              Clear cart
            </button>
          </>
        ) : null}
      </div>
      )
    }
  },
)

const stepStyle = css({
  display: 'inline-grid',
  placeItems: 'center',
  width: '1.75rem',
  height: '1.75rem',
  border: '1px solid var(--border, #d6d6d6)',
  borderRadius: '999px',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  lineHeight: 1,
})
