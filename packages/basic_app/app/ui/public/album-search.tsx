import { clientEntry, css, on } from 'remix/component'
import type { Handle } from 'remix/component'

import { routes } from '../../routes.ts'

interface SearchResult {
  id: string
  title: string
  artist: string
  year: number
}

export const AlbumSearch = clientEntry(
  import.meta.url,
  function AlbumSearch(handle: Handle<{ searchHref: string }>) {
    let query = ''
    let results: SearchResult[] = []
    let loading = false
    let error: string | undefined

    return () => (
      <search
        mix={css({
          display: 'grid',
          gap: '0.5rem',
          marginBlockEnd: '1.5rem',
        })}
      >
        <label htmlFor="album-search">Search albums</label>
        <input
          id="album-search"
          type="search"
          value={query}
          placeholder="Title or artist"
          mix={[
            css({
              border: '1px solid var(--border, #d6d6d6)',
              borderRadius: '10px',
              background: 'transparent',
              color: 'inherit',
              font: 'inherit',
              maxWidth: '24rem',
              padding: '0.6rem 0.75rem',
            }),
            on('input', async (event, signal) => {
              query = event.currentTarget.value
              error = undefined

              if (query.trim().length === 0) {
                results = []
                loading = false
                handle.update()
                return
              }

              loading = true
              handle.update()

              try {
                let url = new URL(handle.props.searchHref, window.location.href)
                url.searchParams.set('query', query)

                let response = await fetch(url, { signal })
                if (!response.ok) {
                  throw new Error(`Search failed with status ${response.status}`)
                }

                let data = (await response.json()) as { albums: SearchResult[] }
                if (signal.aborted) return

                results = data.albums
                loading = false
                handle.update()
              } catch (caught) {
                if (signal.aborted) return

                error = caught instanceof Error ? caught.message : 'Search failed'
                loading = false
                handle.update()
              }
            }),
          ]}
        />
        {loading ? <p mix={css({ margin: 0 })}>Searching…</p> : null}
        {error ? (
          <p role="alert" mix={css({ margin: 0, color: 'var(--accent, #d83a5a)' })}>
            {error}
          </p>
        ) : null}
        {results.length > 0 ? (
          <ul mix={css({ display: 'grid', gap: '0.35rem', listStyle: 'none', padding: 0 })}>
            {results.map((album) => (
              <li key={album.id}>
                <a href={routes.albums.show.href({ albumId: album.id })} data-rmx-prefetch="intent">
                  {album.title}
                </a>{' '}
                <span mix={css({ color: 'var(--muted, #6b6b6b)' })}>
                  {album.artist} · {album.year}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        {!loading && error === undefined && query.trim().length > 0 && results.length === 0 ? (
          <p mix={css({ margin: 0 })}>No albums match “{query}”.</p>
        ) : null}
      </search>
    )
  },
)
