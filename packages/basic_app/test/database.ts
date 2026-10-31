import { migrateDatabase } from '../app/db.ts'
import { seedCatalog } from '../db/seed-data.ts'

let ready: Promise<void> | undefined

export function prepareDatabase() {
  ready ??= seed()
  return ready
}

async function seed() {
  await migrateDatabase()
  await seedCatalog()
}
