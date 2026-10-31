import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { prepareDatabase } from '../../../../test/database.ts'
import { router } from '../../../router.ts'
import { routes } from '../../../routes.ts'

const origin = 'https://albums.test'

await prepareDatabase()

describe('album editing', () => {
  it('redirects to the album after an update', async () => {
    let albumId = 'thriller'
    let formData = new FormData()
    formData.set('title', 'Thriller')
    formData.set('artist', 'Michael Jackson')
    formData.set('year', '1982')

    let response = await router.fetch(
      new Request(new URL(routes.albums.edit.action.href({ albumId }), origin), {
        method: 'POST',
        body: formData,
      }),
    )

    assert.equal(response.status, 303)
    assert.equal(response.headers.get('Location'), routes.albums.show.href({ albumId }))
  })
})
