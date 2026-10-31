import { css } from 'remix/component'
import type { Handle } from 'remix/component'

import { routes } from '../routes.ts'
import { AlbumByline } from './album-byline.tsx'
import { CartButton } from './public/cart.tsx'

type AlbumCardProps = {
  album: {
    id: string
    title: string
    artist: string
    year: number
  }
}

export function AlbumCard(handle: Handle<AlbumCardProps>) {
  return () => {
    let { album } = handle.props

    return (
      <article
        mix={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          border: '1px solid var(--border, #d6d6d6)',
          borderRadius: '16px',
          background: 'white',
          padding: '1rem',
          transition: 'transform 160ms ease, box-shadow 160ms ease',
          '&:hover, &:focus-within': {
            boxShadow: '0 12px 32px rgba(15, 17, 21, 0.14)',
            transform: 'translateY(-2px)',
          },
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        })}
      >
        <a
          href={routes.albums.show.href({ albumId: album.id })}
          data-rmx-prefetch="intent"
          mix={css({
            textDecoration: 'none',
            '&:focus-visible': { outline: '2px solid var(--accent, #d83a5a)', outlineOffset: '4px' },
          })}
        >
          <h2 mix={css({ margin: '0 0 0.35rem', fontSize: '1.1rem', letterSpacing: '-0.02em' })}>
            {album.title}
          </h2>
          <p mix={css({ margin: 0, color: 'var(--muted, #6b6b6b)', fontSize: '0.9rem' })}>
            <AlbumByline artist={album.artist} year={album.year} />
          </p>
        </a>
        <div mix={css({ marginTop: 'auto' })}>
          <CartButton product={{ id: album.id, title: album.title }} />
        </div>
      </article>
    )
  }
}
