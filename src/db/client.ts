import { Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNodePostgres } from "drizzle-orm/node-postgres";
import pg from "pg";
import { activeDatabaseUrl } from "@/lib/env";
import * as schema from "./schema";

type AppDatabase = ReturnType<typeof drizzleNeon<typeof schema>>;

const connectionString = activeDatabaseUrl;
export const hasDatabaseConnection = connectionString.length > 0;

const localPool =
  hasDatabaseConnection && isLocalPostgresUrl(connectionString)
    ? new pg.Pool({ connectionString, allowExitOnIdle: true })
    : null;

const neonPool =
  hasDatabaseConnection && !localPool
    ? new NeonPool({ connectionString })
    : null;

export const db: AppDatabase | null = hasDatabaseConnection
  ? localPool
    ? (drizzleNodePostgres(localPool, { schema }) as unknown as AppDatabase)
    : drizzleNeon(neonPool!, { schema })
  : null;

function isLocalPostgresUrl(value: string) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}
