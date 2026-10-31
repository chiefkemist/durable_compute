import * as assert from 'remix/assert'
import { describe, it } from 'remix/test'

import { CartModel } from './cart-model.ts'

describe('CartModel', () => {
  it('adds items and counts quantities', () => {
    let cart = new CartModel()

    cart.add({ id: 'thriller', title: 'Thriller' })
    cart.add({ id: 'thriller', title: 'Thriller' })
    cart.add({ id: 'blue', title: 'Blue' })

    assert.equal(cart.itemCount, 3)
    assert.equal(cart.lines.length, 2)
    assert.equal(cart.lastAdded?.title, 'Blue')
  })

  it('updates and removes lines', () => {
    let cart = new CartModel([{ id: 'blue', title: 'Blue', quantity: 1 }])

    cart.setQuantity('blue', 3)
    assert.equal(cart.itemCount, 3)

    cart.setQuantity('blue', 0)
    assert.equal(cart.itemCount, 0)
    assert.equal(cart.lines.length, 0)
  })

  it('notifies listeners and clears', () => {
    let cart = new CartModel()
    let changes = 0

    cart.addEventListener('change', () => changes++)

    cart.add({ id: 'bad', title: 'Bad' })
    cart.clear()

    assert.equal(changes, 2)
    assert.equal(cart.itemCount, 0)
  })
})
