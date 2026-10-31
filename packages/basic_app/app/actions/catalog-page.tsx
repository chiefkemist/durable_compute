import { css } from 'remix/component'
import type { Handle } from 'remix/component'

import { routes } from '../routes.ts'
import { AlbumList } from '../ui/album-list.tsx'
import { AlbumSearch } from '../ui/public/album-search.tsx'
import { CartPanel } from '../ui/public/cart.tsx'
import { Document } from './document.tsx'

type CatalogPageProps = {
  albums: Array<{ id: string; title: string; artist: string; year: number }>
}

export function CatalogPage(handle: Handle<CatalogPageProps>) {
  return () => (
    <Document title="The Record Store">
      <div mix={pageStyle}>
        <header mix={headerStyle}>
          <a href={routes.home.href()} mix={brandStyle}>
            The Record Store
          </a>
          <CartPanel />
        </header>
        <main mix={css({ display: 'grid', gap: '1rem' })}>
          <h1 mix={css({ margin: 0, fontSize: '2rem', letterSpacing: '-0.04em' })}>Albums</h1>
          <AlbumSearch searchHref={routes.albums.search.href()} />
          <AlbumList albums={handle.props.albums} />
        </main>
        <footer mix={css({ color: 'var(--muted, #6b6b6b)', fontSize: '0.85rem' })}>
          <a href={routes.albums.feed.href()}>Album feed</a>
        </footer>
      </div>
    </Document>
  )
}

const pageStyle = css({
  display: 'grid',
  gap: '2rem',
  maxWidth: '64rem',
  margin: '0 auto',
  padding: '2rem 1.5rem 4rem',
})

const headerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  borderBlockEnd: '1px solid var(--border, #d6d6d6)',
  paddingBlockEnd: '1rem',
})

const brandStyle = css({
  fontSize: '1.1rem',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  textDecoration: 'none',
})
