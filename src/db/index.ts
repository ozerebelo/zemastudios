import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
}

// Next dev reloads modules on every edit; without this the pool leaks
// connections until Postgres starts refusing them.
const globalForDb = globalThis as unknown as {
  __zemaSql?: ReturnType<typeof postgres>;
};

const sql = globalForDb.__zemaSql ?? postgres(connectionString, { max: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.__zemaSql = sql;

export const db = drizzle(sql, { schema });
export { schema };
