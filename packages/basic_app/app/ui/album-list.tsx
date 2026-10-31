import { css } from 'remix/component'
import type { Handle } from 'remix/component'

import { AlbumCard } from './album-card.tsx'

type AlbumListProps = {
  albums: Array<{ id: string; title: string; artist: string; year: number }>
}

export function AlbumList(handle: Handle<AlbumListProps>) {
  return () => (
    <ul
      mix={css({
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      })}
    >
      {handle.props.albums.map((album) => (
        <li key={album.id}>
          <AlbumCard album={album} />
        </li>
      ))}
    </ul>
  )
}
