import { column as c, table } from 'remix/data-table'
import type { TableRow } from 'remix/data-table'

export const albums = table({
  name: 'albums',
  columns: {
    id: c.text(),
    title: c.text(),
    artist: c.text(),
    year: c.integer(),
  },
})

export const tracks = table({
  name: 'tracks',
  columns: {
    id: c.text(),
    album_id: c.text(),
    title: c.text(),
    position: c.integer(),
  },
})

// Derive row types from the columns
export type Album = TableRow<typeof albums>
export type Track = TableRow<typeof tracks>
export type AlbumWithTracks = Album & { tracks: Track[] }
