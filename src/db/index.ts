import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import "dotenv/config";

// Use placeholder when POSTGRES_URL is missing (e.g. Vercel build without env) so
// the module loads; data layer try/catch returns [] when queries fail.
const connectionString =
  process.env.POSTGRES_URL ?? "postgres://localhost?connect_timeout=1";
const sql = neon(connectionString);

export const db = drizzle(sql, { schema });

export * from "./schema";
