import type { Handle } from 'remix/component'

export function AlbumByline(handle: Handle<{ artist: string; year: number }>) {
  return () => (
    <>
      <span>{handle.props.artist}</span>
      <span aria-hidden="true"> · </span>
      <span>{handle.props.year}</span>
    </>
  )
}
