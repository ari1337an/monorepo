import { loadEnv } from "@workspace/env";

loadEnv();

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  HOST: process.env.HOST || "0.0.0.0",
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL!,
  DATABASE_CLIENT: process.env.DATABASE_CLIENT || "postgres",
} as const;
