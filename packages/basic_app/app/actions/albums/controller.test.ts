import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { prepareDatabase } from '../../../test/database.ts'
import { router } from '../../router.ts'
import { routes } from '../../routes.ts'

const origin = 'https://albums.test'

await prepareDatabase()

describe('album show', () => {
  it('renders the requested album with its tracks', async () => {
    let request = new Request(new URL(routes.albums.show.href({ albumId: 'thriller' }), origin))
    let response = await router.fetch(request)

    assert.equal(response.status, 200)
    assert.equal(response.headers.get('Content-Type'), 'text/html; charset=UTF-8')

    let html = await response.text()
    assert.match(html, /Thriller/)
    assert.match(html, /Billie Jean/)
    assert.match(html, /More from the store/)
  })

  it('returns 404 for a missing album', async () => {
    let request = new Request(new URL(routes.albums.show.href({ albumId: 'missing' }), origin))
    let response = await router.fetch(request)

    assert.equal(response.status, 404)
  })

  it('renders recommendations for another album', async () => {
    let request = new Request(
      new URL(routes.albums.recommendations.href({ albumId: 'thriller' }), origin),
    )
    let response = await router.fetch(request)

    assert.equal(response.status, 200)

    let html = await response.text()
    assert.match(html, /Blue/)
    assert.doesNotMatch(html, /<html[\s>]/)
  })

  it('searches albums as JSON', async () => {
    let url = new URL(routes.albums.search.href(), origin)
    url.searchParams.set('query', 'michael')

    let response = await router.fetch(new Request(url))
    assert.equal(response.status, 200)

    let data = (await response.json()) as { albums: Array<{ id: string }> }
    assert.deepEqual(
      data.albums.map((album) => album.id),
      ['bad', 'thriller'],
    )
  })

  it('serves an HTML album feed', async () => {
    let request = new Request(new URL(routes.albums.feed.href(), origin))
    let response = await router.fetch(request)

    assert.equal(response.status, 200)
    assert.match(response.headers.get('Content-Type') ?? '', /text\/html/)

    let html = await response.text()
    assert.match(html, /<li>/)
    assert.match(html, /Thriller/)
  })
})
