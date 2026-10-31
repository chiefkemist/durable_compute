import type { Handle } from 'remix/component'

import { AlbumList } from '../../ui/album-list.tsx'

type AlbumRecommendationsProps = {
  albums: Array<{ id: string; title: string; artist: string; year: number }>
}

export function AlbumRecommendations(handle: Handle<AlbumRecommendationsProps>) {
  return () => {
    if (handle.props.albums.length === 0) {
      return <p>No other albums in the store yet.</p>
    }

    return <AlbumList albums={handle.props.albums} />
  }
}
