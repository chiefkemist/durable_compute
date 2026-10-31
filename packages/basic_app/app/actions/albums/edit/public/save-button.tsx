import { clientEntry } from 'remix/component'
import type { Handle } from 'remix/component'

export const SaveButton = clientEntry(import.meta.url, function SaveButton(handle: Handle) {
  let pending = false

  // During server rendering `handle.signal` is a plain abort-stub, which not every
  // runtime accepts as an EventTarget listener option (Bun brands-checks AbortSignal).
  // Browser hydration receives a real AbortSignal, so cleanup still applies there.
  let listenerOptions =
    handle.signal instanceof AbortSignal ? { signal: handle.signal } : undefined

  handle.frame.addEventListener(
    'reloadStart',
    () => {
      pending = true
      handle.update()
    },
    listenerOptions,
  )

  handle.frame.addEventListener(
    'reloadComplete',
    () => {
      pending = false
      handle.update()
    },
    listenerOptions,
  )

  return () => (
    <button type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save album'}
    </button>
  )
})
