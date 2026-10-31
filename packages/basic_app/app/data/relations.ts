import { belongsTo, hasMany } from 'remix/data-table'

import { albums, tracks } from './tables.ts'

export const albumTracks = hasMany(albums, tracks, { foreignKey: 'album_id' })
export const trackAlbum = belongsTo(tracks, albums, { foreignKey: 'album_id' })
