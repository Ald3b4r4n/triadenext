import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

type AppDatabase = ReturnType<typeof drizzleNeon<typeof schema>>;

const connectionString = env.DATABASE_URL;
export const hasDatabaseConnection = connectionString.length > 0;

const localPool =
  hasDatabaseConnection && isLocalPostgresUrl(connectionString)
    ? new pg.Pool({ connectionString, allowExitOnIdle: true })
    : null;

export const db: AppDatabase | null = hasDatabaseConnection
  ? localPool
    ? (drizzleNodePostgres(localPool, { schema }) as unknown as AppDatabase)
    : drizzleNeon(neon(connectionString), { schema })
  : null;

function isLocalPostgresUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}
