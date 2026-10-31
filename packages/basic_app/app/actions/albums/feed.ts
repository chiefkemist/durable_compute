import { html } from 'remix/html-template'
import { createHtmlResponse } from 'remix/response/html'

import { routes } from '../../routes.ts'

export function renderAlbumFeed(albums: Array<{ id: string; title: string; artist: string }>) {
  let items = albums.map((album) => {
    let href = routes.albums.show.href({ albumId: album.id })
    return html`<li><a href="${href}">${album.title}</a> — ${album.artist}</li>`
  })

  return createHtmlResponse(html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Album feed</title>
      </head>
      <body>
        <h1>Album feed</h1>
        <ul>
          ${items}
        </ul>
      </body>
    </html>
  `)
}
