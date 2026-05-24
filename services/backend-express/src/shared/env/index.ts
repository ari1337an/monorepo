export const env = {
  PORT: Number(process.env.PORT) || 3001,
  HOST: process.env.HOST || "0.0.0.0",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
