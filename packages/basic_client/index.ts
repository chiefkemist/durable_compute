
console.log("Hello via Bun!");

const DEFAULT_URL = "https://jsonplaceholder.typicode.com/todos/1"

// Fetch JSON from this internet
const url = Bun.argv[2] ?? DEFAULT_URL
const response = await fetch(url)

if (!response.ok) {
  throw new Error(
    `Fetching ${url} failed with ${response.status} ${response.statusText}`,
  )
}

const data = await response.json()

// Pretty print fetched JSON from the internet
console.log(`Result: ${JSON.stringify(data, null, 2)}`)

