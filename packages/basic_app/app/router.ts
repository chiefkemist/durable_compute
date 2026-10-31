import { createRouter, type RouterContext } from 'remix/router'
import { formData } from 'remix/middleware/form-data'
import { render } from 'remix/middleware/render'
import { staticFiles } from 'remix/middleware/static'

import controller from './actions/controller.tsx'
import albumsController from './actions/albums/controller.tsx'
import albumsEditController from './actions/albums/edit/controller.tsx'
import { assets } from './assets.ts'
import { loadDatabase } from './middleware/database.ts'
import { routes } from './routes.ts'

export const router = createRouter({
  middleware: [
    staticFiles('./public', { index: false }),
    loadDatabase(),
    formData(),
    render({ assets }),
  ],
})

export type AppContext = RouterContext<typeof router>

declare module 'remix' {
  interface RouterTypes {
    context: AppContext
  }
}

router.map(routes, controller)
router.map(routes.albums, albumsController)
router.map(routes.albums.edit, albumsEditController)
