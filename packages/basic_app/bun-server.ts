import { assets } from './app/assets.ts'
import { db, migrateDatabase } from './app/db.ts'
import { router } from './app/router.ts'

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 44100

await migrateDatabase()

const server = Bun.serve({
  port,
  fetch: (request) => router.fetch(request),
  error(error) {
    console.error(error)
    return new Response('Internal Server Error', { status: 500 })
  },
})

console.log(`Server listening on http://localhost:${server.port}`)

const shutDownTimeoutMs = 10_000
let shuttingDown = false

async function shutdown(signal: string) {
  if (shuttingDown) {
    console.warn(`Received ${signal} again, exiting immediately`)
    void server.stop(true)
    process.exit(1)
  }

  shuttingDown = true
  console.log(`Received ${signal}, shutting down`)

  const timeout = setTimeout(() => {
    console.warn('Shutdown deadline reached, forcing exit')
    void server.stop(true)
    process.exit(1)
  }, shutDownTimeoutMs)

  try {
    // Stop accepting connections and wait for in-flight responses to finish.
    await server.stop()
    await assets.close()
    await db.close()
    clearTimeout(timeout)
    process.exit(0)
  } catch (error) {
    console.error('Shutdown failed', error)
    process.exit(1)
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))
