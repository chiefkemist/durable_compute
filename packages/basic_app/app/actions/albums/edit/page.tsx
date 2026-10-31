import type { Issue } from 'remix/data-schema'
import type { Handle } from 'remix/component'

import type { Album } from '../../../data/tables.ts'
import { routes } from '../../../routes.ts'
import { Document } from '../../document.tsx'
import { SaveButton } from './public/save-button.tsx'

interface AlbumEditPageProps {
  album: Album
  values?: { title: string; artist: string; year: string }
  issues?: readonly Issue[]
}

const fields = [
  { name: 'title', label: 'Title' },
  { name: 'artist', label: 'Artist' },
  { name: 'year', label: 'Year' },
] as const

export function AlbumEditPage(handle: Handle<AlbumEditPageProps>) {
  return () => {
    let { album, values, issues = [] } = handle.props

    return (
      <Document title={`Edit ${album.title} — Albums`}>
        <main>
          <h1>Edit {album.title}</h1>
          {issues.length > 0 && <p role="alert">Please correct the fields below.</p>}
          <form method="post" action={routes.albums.edit.action.href({ albumId: album.id })}>
            {fields.map(({ name, label }) => {
              let issue = issues.find((issue) => issue.path?.[0] === name)
              let inputId = `album-${name}`
              let errorId = `${inputId}-error`

              return (
                <div key={name}>
                  <label htmlFor={inputId}>{label}</label>
                  <input
                    id={inputId}
                    name={name}
                    defaultValue={values?.[name] ?? String(album[name])}
                    inputMode={name === 'year' ? 'numeric' : undefined}
                    required
                    aria-invalid={issue ? true : undefined}
                    aria-describedby={issue ? errorId : undefined}
                  />
                  {issue && <p id={errorId}>{issue.message}</p>}
                </div>
              )
            })}
            <SaveButton />
          </form>
        </main>
      </Document>
    )
  }
}
