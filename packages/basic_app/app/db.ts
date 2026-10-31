import { fileURLToPath } from 'node:url'
import { loadMigrations } from 'remix/data-table/migrations/node'
import { createSqliteDatabase } from 'remix/data-table/sqlite'

export const db = createSqliteDatabase({
  filename: fileURLToPath(new URL('../albums.sqlite', import.meta.url)),
  foreignKeys: true,
})

export async function migrateDatabase() {
  let migrations = await loadMigrations(
    fileURLToPath(new URL('../db/migrations/', import.meta.url)),
  )
  await db.migrate(migrations)
}
