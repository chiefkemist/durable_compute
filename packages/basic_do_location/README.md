# basic_do_location

Cloudflare **data location**: `locationHint` on `namespace.get()` influences
where a Durable Object is created. `newUniqueId({ jurisdiction })` and
`namespace.jurisdiction()` constrain an object's jurisdiction.

## Local

```sh
bun run dev
curl -s 'localhost:8787/?name=alpha&hint=weur'
curl -s 'localhost:8787/?name=beta&hint=apac'
```

## Cloudflare

```sh
bunx wrangler login
bun run deploy
curl -s 'https://basic-do-location.<your-subdomain>.workers.dev/?name=alpha&hint=weur'
```

A hint applies only at creation: an existing object stays where it is, and the
object can move later for maintenance or load balancing. Check live locations at
https://where.durableobjects.live. celld makes no placement or jurisdiction
promise and throws on `jurisdiction()`, so this feature has no celld twin.
