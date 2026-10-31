import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { prepareDatabase } from '../../test/database.ts'
import { router } from '../router.ts'
import { routes } from '../routes.ts'

const origin = 'https://albums.test'

await prepareDatabase()

describe('root controller', () => {
  it('GET / returns the album catalog', async () => {
    let response = await router.fetch(new URL(routes.home.href(), origin))

    assert.equal(response.status, 200)
    assert.match(response.headers.get('Content-Type') ?? '', /text\/html/)

    let html = await response.text()
    assert.match(html, /<html[\s>]/)
    assert.match(html, /The Record Store/)
    assert.match(html, /Thriller/)
    assert.match(html, /Search albums/)
  })

  it('GET /cart renders the cart page', async () => {
    let response = await router.fetch(new URL(routes.cart.href(), origin))

    assert.equal(response.status, 200)
    assert.match(await response.text(), /Your cart/)
  })
})
