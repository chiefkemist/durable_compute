import { ne, query } from 'remix/data-table'
import { createController } from 'remix/router'

import { recentAlbums } from '../../data/catalog.ts'
import { albumTracks } from '../../data/relations.ts'
import { albums } from '../../data/tables.ts'
import { routes } from '../../routes.ts'
import { renderAlbumFeed } from './feed.ts'
import { AlbumRecommendations } from './recommendations.tsx'
import { AlbumPage } from './show-page.tsx'

export default createController(routes.albums, {
  actions: {
    async show(context) {
      let album = await context.db.find(albums, context.params.albumId, {
        with: { tracks: albumTracks.orderBy('position', 'asc') },
      })
      if (album === null) return new Response('Album not found', { status: 404 })

      return context.render(<AlbumPage album={album} />)
    },
    async recommendations(context) {
      let album = await context.db.find(albums, context.params.albumId)
      if (album === null) return new Response('Album not found', { status: 404 })

      let recommendations = await context.db.exec(
        query(albums).where(ne(albums.id, album.id)).orderBy('year', 'desc').limit(3),
      )

      return context.render(<AlbumRecommendations albums={recommendations} />)
    },
    async search(context) {
      let queryText = context.url.searchParams.get('query')?.trim().toLowerCase() ?? ''
      let all = await context.db.exec(recentAlbums)

      let matches =
        queryText === ''
          ? []
          : all.filter((album) =>
              `${album.title} ${album.artist}`.toLowerCase().includes(queryText),
            )

      return Response.json({ albums: matches })
    },
    async feed(context) {
      let all = await context.db.exec(recentAlbums)
      return renderAlbumFeed(all)
    },
  },
})
