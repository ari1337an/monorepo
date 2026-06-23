# @workspace/env

Loads the root `.env` file by auto-detecting the monorepo root directory.

## Usage

```typescript
import { loadEnv } from "@workspace/env";

loadEnv();

// process.env.DATABASE_URL, process.env.DATABASE_CLIENT, etc. are now available
```

Call `loadEnv()` once at your service entry point, before accessing any env vars. It's idempotent -- multiple calls are safe.

## Get monorepo root path

```typescript
import { getMonorepoRoot } from "@workspace/env";

const root = getMonorepoRoot(); // absolute path to the monorepo root
```

## How it works

Walks up from `process.cwd()` looking for `pnpm-workspace.yaml`, then loads `.env` from that directory via `dotenv`.
