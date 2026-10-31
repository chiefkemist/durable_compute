import { form, get, route } from 'remix/routes'

export const routes = route({
  assets: get('/assets/*path'),
  home: '/',
  cart: '/cart',
  albums: {
    show: get('/albums/:albumId'),
    recommendations: get('/albums/:albumId/recommendations'),
    search: get('/albums/search'),
    feed: get('/albums/feed'),
    edit: form('/albums/:albumId/edit'),
  },
})
