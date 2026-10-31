import type { Handle } from 'remix/component'

type AlbumHeadingProps = {
  artist: string
  title: string
}

export function AlbumHeading(handle: Handle<AlbumHeadingProps>) {
  return () => (
    <header>
      <p>{handle.props.artist}</p>
      <h1>{handle.props.title}</h1>
    </header>
  )
}
