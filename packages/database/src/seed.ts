import { loadEnv } from "@workspace/env";
import { randomUUID } from "node:crypto";
import { createDatabase } from "./index";

loadEnv();

const DEFAULT_USERS = [
  {
    id: randomUUID(),
    name: "Md Sahadul Hasan Arian",
    email: "no-reply@gmail.com",
  },
];

const db = createDatabase(process.env.DATABASE_URL!);

(async () => {
  try {
    for (const user of DEFAULT_USERS) {
      const existing = await db.table("User").where({ email: user.email }).first();
      if (existing) {
        await db.table("User").where({ email: user.email }).update(user);
      } else {
        await db.table("User").insert(user);
      }
    }
    console.log("Seed completed successfully");
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await db.disconnect();
  }
})();
