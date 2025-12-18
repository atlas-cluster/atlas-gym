# Postgres Adapter Choice for Bun

## Current Setup

This project uses the [`postgres`](https://github.com/porsager/postgres) package (version 3.4.7) as the PostgreSQL client.

## Why This Package?

The `postgres` package by porsager is **the recommended choice** for PostgreSQL with Bun runtime, and there is currently **no official Bun native Postgres adapter**.

### Benefits of `postgres` Package

1. **Zero Native Dependencies**: Pure JavaScript implementation, no native bindings to compile
2. **Bun Optimized**: Works perfectly with Bun's runtime without any compatibility issues
3. **High Performance**: Fast query execution and connection pooling
4. **Developer Experience**: 
   - Clean tagged template literal API: `` sql`SELECT * FROM users` ``
   - Built-in SQL injection protection
   - TypeScript support with excellent type inference
5. **Mature & Well-Maintained**: Battle-tested in production environments
6. **Modern Features**:
   - Connection pooling
   - Transaction support
   - Prepared statements
   - Streaming results

### Comparison with Alternatives

#### vs. `pg` (node-postgres)
- ❌ `pg` has native bindings that may need compilation
- ❌ More complex setup and configuration
- ❌ Older, more verbose API
- ✅ `postgres` is pure JS, easier to use with Bun

#### vs. "Bun Native Adapter"
- ❌ **Does not exist** - Bun does not have a built-in Postgres client
- ⚠️ Bun has `Bun.sql` but it's experimental and mainly for SQLite

## API Usage

The `postgres` package uses tagged template literals for queries:

```typescript
import { getPool } from '@/lib/db'

const sql = getPool()

// Simple query
const users = await sql`SELECT * FROM users`

// With parameters (SQL injection safe)
const user = await sql`SELECT * FROM users WHERE email = ${email}`

// Transactions
await sql.begin(async sql => {
  await sql`INSERT INTO users VALUES (${name}, ${email})`
  await sql`INSERT INTO profiles VALUES (${userId}, ${data})`
})
```

## Decision

**No change needed.** The current setup is already using the optimal Postgres adapter for Bun.

## References

- [postgres package documentation](https://github.com/porsager/postgres)
- [Bun database documentation](https://bun.sh/docs/api/sql)
