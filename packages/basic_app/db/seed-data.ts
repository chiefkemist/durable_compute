import { albums, tracks } from '../app/data/tables.ts'
import { db } from '../app/db.ts'

const seedAlbums = [
  { id: 'thriller', title: 'Thriller', artist: 'Michael Jackson', year: 1982 },
  { id: 'bad', title: 'Bad', artist: 'Michael Jackson', year: 1987 },
  { id: 'blue', title: 'Blue', artist: 'Joni Mitchell', year: 1971 },
  { id: 'rumours', title: 'Rumours', artist: 'Fleetwood Mac', year: 1977 },
  { id: 'kind-of-blue', title: 'Kind of Blue', artist: 'Miles Davis', year: 1959 },
] as const

const seedTracks = [
  { id: 'thriller-1', album_id: 'thriller', title: 'Wanna Be Startin’ Somethin’', position: 1 },
  { id: 'thriller-2', album_id: 'thriller', title: 'Thriller', position: 2 },
  { id: 'thriller-3', album_id: 'thriller', title: 'Beat It', position: 3 },
  { id: 'thriller-4', album_id: 'thriller', title: 'Billie Jean', position: 4 },
  { id: 'blue-1', album_id: 'blue', title: 'All I Want', position: 1 },
  { id: 'blue-2', album_id: 'blue', title: 'Carey', position: 2 },
  { id: 'blue-3', album_id: 'blue', title: 'Blue', position: 3 },
] as const

export async function seedCatalog() {
  for (let album of seedAlbums) {
    let existing = await db.find(albums, album.id)
    if (existing === null) {
      await db.create(albums, album)
    }
  }

  for (let track of seedTracks) {
    let existing = await db.find(tracks, track.id)
    if (existing === null) {
      await db.create(tracks, track)
    }
  }
}
