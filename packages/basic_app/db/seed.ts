import { db, migrateDatabase } from '../app/db.ts'
import { seedCatalog } from './seed-data.ts'

await migrateDatabase()
await seedCatalog()
console.log('Seeded catalog')

await db.close()
