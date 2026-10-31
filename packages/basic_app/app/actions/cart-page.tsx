import { css } from 'remix/component'
import type { Handle } from 'remix/component'

import { routes } from '../routes.ts'
import { CartContents, CartPanel } from '../ui/public/cart.tsx'
import { Document } from './document.tsx'

export function CartPage() {
  return () => (
    <Document title="Cart — The Record Store">
      <div
        mix={css({
          display: 'grid',
          gap: '2rem',
          maxWidth: '48rem',
          margin: '0 auto',
          padding: '2rem 1.5rem 4rem',
        })}
      >
        <header
          mix={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            borderBlockEnd: '1px solid var(--border, #d6d6d6)',
            paddingBlockEnd: '1rem',
          })}
        >
          <a
            href={routes.home.href()}
            mix={css({ fontSize: '1.1rem', fontWeight: 700, textDecoration: 'none' })}
          >
            The Record Store
          </a>
          <CartPanel />
        </header>
        <main mix={css({ display: 'grid', gap: '1rem' })}>
          <h1 mix={css({ margin: 0, fontSize: '2rem', letterSpacing: '-0.04em' })}>Your cart</h1>
          <CartContents />
        </main>
      </div>
    </Document>
  )
}
