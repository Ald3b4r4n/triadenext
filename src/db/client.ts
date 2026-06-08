import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

const connectionString = env.DATABASE_URL;

export const db =
  connectionString.length > 0
    ? drizzle(neon(connectionString), { schema })
    : null;
