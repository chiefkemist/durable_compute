import { clientEntry, on } from 'remix/component'
import type { Handle } from 'remix/component'

export const FavoriteButton = clientEntry(
  import.meta.url,
  function FavoriteButton(handle: Handle<{ albumTitle: string }>) {
    let favorite = false

    return () => (
      <button
        aria-pressed={favorite}
        mix={[
          on('click', () => {
            favorite = !favorite
            handle.update()
          }),
        ]}
        type="button"
      >
        {favorite
          ? `Remove ${handle.props.albumTitle} from favorites`
          : `Add ${handle.props.albumTitle} to favorites`}
      </button>
    )
  },
)
