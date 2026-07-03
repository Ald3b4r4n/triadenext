import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { inArray } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import {
  assertNonProductionEnvironment,
  fail,
  hasValue,
  loadLocalEnv,
  parseList,
  safeStatus
} from "./admin-env-utils.mjs";

const userRole = pgEnum("user_role", ["customer", "admin", "manager"]);
const usersTable = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull(),
  role: userRole("role").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull()
});

async function run() {
  const localEnv = loadLocalEnv();
  const environment = assertNonProductionEnvironment();
  const masterEmails = parseList(process.env.ADMIN_MASTER_EMAILS);

  console.log("Check admin local iniciado.");
  console.log("Valores reais nunca sao impressos por este script.");
  console.log(`Ambiente avaliado: ${environment}`);
  console.log(`.env.local: ${localEnv.exists ? "presente" : "ausente"}`);

  for (const name of [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "BETTER_AUTH_URL",
    "NEXT_PUBLIC_APP_URL",
    "ADMIN_MASTER_EMAILS",
    "DEV_ADMIN_PASSWORD"
  ]) {
    console.log(safeStatus(name));
  }

  if (masterEmails.length === 0) {
    fail("ADMIN_MASTER_EMAILS ausente. Configure a allowlist master local.");
    return;
  }

  console.log(`ADMIN_MASTER_EMAILS: ${masterEmails.length} email(s) configurado(s).`);

  if (!hasValue("DATABASE_URL")) {
    console.log("Status: pending-config. Configure DATABASE_URL local antes de validar usuarios.");
    return;
  }

  const db = drizzle(neon(process.env.DATABASE_URL));
  const rows = await db
    .select({
      email: usersTable.email,
      role: usersTable.role
    })
    .from(usersTable)
    .where(inArray(usersTable.email, masterEmails));

  const admins = rows.filter((row) => row.role === "admin").length;
  const managers = rows.filter((row) => row.role === "manager").length;
  const customers = rows.filter((row) => row.role === "customer").length;

  console.log(`Usuarios master encontrados: ${rows.length}/${masterEmails.length}.`);
  console.log(`Usuarios master como admin: ${admins}/${masterEmails.length}.`);
  console.log(`Usuarios master como manager: ${managers}.`);
  console.log(`Usuarios master como cliente: ${customers}.`);

  if (admins < masterEmails.length) {
    console.log("Status: pending-admin-bootstrap. Rode pnpm ops:bootstrap-admin quando aprovado.");
    return;
  }

  console.log("Status: ready. Allowlist master local possui admin promovido.");
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : "";
  if (message.startsWith("Operacao admin bloqueada")) {
    fail(message);
    return;
  }

  fail("Check admin local falhou de forma controlada.");
});
