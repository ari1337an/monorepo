# @workspace/database

Knex-based database client with strategy-pattern adapters. Prisma handles migrations only.

## Supported clients

`"postgres"` | `"mysql"` | `"sqlite"`

## Setup

```typescript
import { createDatabase } from "@workspace/database";

const db = createDatabase({
  client: "postgres",
  connection: process.env.DATABASE_URL!,
});
```

## Query builder

```typescript
const users = await db.table("User").select("*");
const user  = await db.table("User").where({ id }).first();
await db.table("User").insert({ id, name, email });
await db.table("User").where({ id }).update({ name });
await db.table("User").where({ id }).delete();
```

## Raw SQL

```typescript
const result = await db.raw("SELECT * FROM \"User\" WHERE id = ?", [id]);
```

## Transactions

```typescript
await db.transaction(async (trx) => {
  await trx("User").insert({ id, name, email });
  await trx("Account").insert({ userId: id, provider: "local" });
});
```

## Disconnect

```typescript
await db.disconnect();
```

## Access underlying Knex instance

```typescript
const knex = db.knex;
```

## Testing (`@workspace/database/testing`)

```typescript
import { createDatabaseMock, mockReset } from "@workspace/database/testing";

const mockDb = createDatabaseMock();

beforeEach(() => mockReset(mockDb));
```

## Migrations (Prisma CLI)

```bash
pnpm db:migrate    # Create and apply migration
pnpm db:push       # Push schema without migration file
pnpm db:studio     # Open Prisma Studio
pnpm db:seed       # Seed the database
pnpm db:format     # Format schema.prisma
```

## Types

```typescript
type SupportedClient = "postgres" | "mysql" | "sqlite";

interface DatabaseConfig {
  client: SupportedClient;
  connection: string | ConnectionConfig;
}

interface ConnectionConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
```
