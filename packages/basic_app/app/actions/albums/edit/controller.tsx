import * as s from 'remix/data-schema'
import { redirect } from 'remix/response/redirect'
import { createController } from 'remix/router'

import { albums } from '../../../data/tables.ts'
import { routes } from '../../../routes.ts'
import { AlbumEditPage } from './page.tsx'
import { albumForm } from './schema.ts'

export default createController(routes.albums.edit, {
  actions: {
    async index(context) {
      let album = await context.db.find(albums, context.params.albumId)
      if (album === null) return new Response('Album not found', { status: 404 })

      return context.render(<AlbumEditPage album={album} />)
    },
    async action(context) {
      let parsed = s.parseSafe(albumForm, context.formData)
      if (!parsed.success) {
        let album = await context.db.find(albums, context.params.albumId)
        if (album === null) return new Response('Album not found', { status: 404 })

        let values = {
          title: readText(context.formData, 'title'),
          artist: readText(context.formData, 'artist'),
          year: readText(context.formData, 'year'),
        }

        return context.render(
          <AlbumEditPage album={album} values={values} issues={parsed.issues} />,
          { status: 400 },
        )
      }

      try {
        await context.db.update(albums, context.params.albumId, parsed.value)
      } catch (error) {
        console.error('Failed to save album:', error)
        return new Response('Unable to save album', { status: 500 })
      }

      return redirect(routes.albums.show.href({ albumId: context.params.albumId }), 303)
    },
  },
})

function readText(formData: FormData, name: string): string {
  let value = formData.get(name)
  return typeof value === 'string' ? value : ''
}
