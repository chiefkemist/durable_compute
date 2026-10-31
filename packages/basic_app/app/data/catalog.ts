import { query } from 'remix/data-table'

import { albums } from './tables.ts'

export const recentAlbums = query(albums)
  .select({ id: albums.id, title: albums.title, artist: albums.artist, year: albums.year })
  .orderBy('year', 'desc')
  .limit(20)
