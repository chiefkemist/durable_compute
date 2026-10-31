import { createController } from 'remix/router'

import { assets } from '../assets.ts'
import { recentAlbums } from '../data/catalog.ts'
import { routes } from '../routes.ts'
import { CartPage } from './cart-page.tsx'
import { CatalogPage } from './catalog-page.tsx'

export default createController(routes, {
  actions: {
    async assets(context) {
      return (await assets.fetch(context.request)) ?? new Response('Not Found', { status: 404 })
    },
    async home(context) {
      let albums = await context.db.exec(recentAlbums)
      return context.render(<CatalogPage albums={albums} />)
    },
    cart(context) {
      return context.render(<CartPage />)
    },
  },
})
