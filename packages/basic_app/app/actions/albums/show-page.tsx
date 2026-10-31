import { css, Frame } from 'remix/component'
import type { Handle } from 'remix/component'

import type { AlbumWithTracks } from '../../data/tables.ts'
import { routes } from '../../routes.ts'
import { AlbumByline } from '../../ui/album-byline.tsx'
import { AlbumHeading } from '../../ui/album-heading.tsx'
import { Document } from '../document.tsx'
import { FavoriteButton } from './public/favorite-button.tsx'

export function AlbumPage(handle: Handle<{ album: AlbumWithTracks }>) {
  return () => {
    let { album } = handle.props

    return (
      <Document title={`${album.title} — Albums`}>
        <div mix={pageStyle}>
          <nav mix={css({ fontSize: '0.9rem' })}>
            <a href={routes.home.href()}>← All albums</a>
          </nav>
          <main mix={css({ display: 'grid', gap: '1.5rem' })}>
            <section mix={css({ display: 'grid', gap: '0.5rem' })}>
              <AlbumHeading artist={album.artist} title={album.title} />
              <p mix={css({ color: 'var(--muted, #6b6b6b)', margin: 0 })}>
                <AlbumByline artist={album.artist} year={album.year} />
              </p>
              <div mix={css({ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' })}>
                <a
                  href={routes.albums.edit.index.href({ albumId: album.id })}
                  mix={editLinkStyle}
                >
                  Edit album
                </a>
                <FavoriteButton albumTitle={album.title} />
              </div>
            </section>

            <section mix={css({ display: 'grid', gap: '0.5rem' })}>
              <h2 mix={css({ margin: 0, fontSize: '1.15rem' })}>Tracks</h2>
              {album.tracks.length === 0 ? (
                <p mix={css({ margin: 0 })}>No tracks listed.</p>
              ) : (
                <ol mix={css({ display: 'grid', gap: '0.25rem', margin: 0, paddingInlineStart: '1.5rem' })}>
                  {album.tracks.map((track) => (
                    <li key={track.id}>{track.title}</li>
                  ))}
                </ol>
              )}
            </section>

            <section mix={css({ display: 'grid', gap: '0.75rem' })}>
              <h2 mix={css({ margin: 0, fontSize: '1.15rem' })}>More from the store</h2>
              <Frame
                name="album-recommendations"
                src={routes.albums.recommendations.href({ albumId: album.id })}
                fallback={<p>Loading recommendations…</p>}
              />
              <form
                method="get"
                action={routes.albums.recommendations.href({ albumId: album.id })}
                data-rmx-target="album-recommendations"
              >
                <button type="submit" mix={buttonStyle}>
                  Refresh recommendations
                </button>
              </form>
            </section>
          </main>
        </div>
      </Document>
    )
  }
}

const pageStyle = css({
  display: 'grid',
  gap: '1.5rem',
  maxWidth: '48rem',
  margin: '0 auto',
  padding: '2rem 1.5rem 4rem',
})

const editLinkStyle = css({
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid var(--border, #d6d6d6)',
  borderRadius: '999px',
  padding: '0.45rem 0.9rem',
  textDecoration: 'none',
  '&:hover, &:focus-visible': { borderColor: 'var(--accent, #d83a5a)' },
})

const buttonStyle = css({
  border: '1px solid var(--border, #d6d6d6)',
  borderRadius: '999px',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  font: 'inherit',
  padding: '0.45rem 0.9rem',
})
