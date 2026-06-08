import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

const connectionString = env.DATABASE_URL;
export const hasDatabaseConnection = connectionString.length > 0;

export const db = hasDatabaseConnection ? drizzle(neon(connectionString), { schema }) : null;
