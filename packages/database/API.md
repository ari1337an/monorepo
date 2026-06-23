# @workspace/database

Knex-based database client with strategy-pattern adapters. Prisma handles schema definition only — all queries go through Knex.

## Supported clients

`"postgres"` | `"mysql"` | `"sqlite"` | `"libsql"`

Inferred automatically from `DATABASE_URL`.

| Protocol                      | Client   | Driver                 |
| ----------------------------- | -------- | ---------------------- |
| `postgresql://` `postgres://` | postgres | pg                     |
| `mysql://`                    | mysql    | mysql2                 |
| `sqlite:` `file:`             | sqlite   | better-sqlite3         |
| `libsql://`                   | libsql   | @libsql/client (Turso) |
| `*.sqlite` `*.db` `:memory:`  | sqlite   | better-sqlite3         |

For Turso/LibSQL, pass the auth token in the URL: `libsql://host?authToken=TOKEN`

## Setup

```typescript
import { createDatabase } from "@workspace/database";

const db = createDatabase(process.env.DATABASE_URL!);
```

## Query builder

```typescript
const users = await db.table("User").select("*");
const user = await db.table("User").where({ id }).first();
await db.table("User").insert({ id, name, email });
await db.table("User").where({ id }).update({ name });
await db.table("User").where({ id }).delete();
```

## Raw SQL

```typescript
const result = await db.raw('SELECT * FROM "User" WHERE id = ?', [id]);
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

## Knex instance

```typescript
const knex = db.knex;
```

## CLI

```bash
pnpm db:push       # Push schema (auto-detects local SQLite vs remote)
pnpm db:migrate    # Create and apply Prisma migration
pnpm db:seed       # Seed the database
pnpm db:studio     # Open Prisma Studio
pnpm db:format     # Format schema files
pnpm db:test       # Run integration tests (requires Docker)
```

`db:push` is smart — if `DATABASE_URL` is a local SQLite path it runs `prisma db push`, otherwise it pushes directly via Knex.

## Schema

Schema files live in `schema/`, configured via `prisma.config.ts`:

```
packages/database/
├── schema/
│   ├── schema.prisma    # Prisma schema (sqlite provider)
│   └── migrations/      # Prisma migrations
├── src/
│   ├── index.ts         # createDatabase()
│   ├── seed.ts          # Seed script
│   └── push-schema.ts   # Smart db:push
└── prisma.config.ts     # Prisma v7 config
```

## Testing

```typescript
import { createDatabaseMock, mockReset } from "@workspace/database/testing";

const mockDb = createDatabaseMock();
beforeEach(() => mockReset(mockDb));
```

Integration tests cover all 4 providers via Docker (Postgres, MySQL) and in-memory (SQLite, LibSQL).

## Types

```typescript
type SupportedClient = "postgres" | "mysql" | "sqlite" | "libsql";

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
