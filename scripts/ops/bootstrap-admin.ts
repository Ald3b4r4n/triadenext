import fs from "node:fs";
import path from "node:path";

loadLocalEnv();

const environment = assertNonProductionEnvironment();
const masterEmails = parseList(process.env.ADMIN_MASTER_EMAILS);
const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const password = process.env.DEV_ADMIN_PASSWORD?.trim() ?? "";

if (masterEmails.length === 0) {
  fail("Bootstrap admin bloqueado: ADMIN_MASTER_EMAILS ausente.");
}

if (!databaseUrl) {
  fail("Bootstrap admin bloqueado: DATABASE_URL local ausente.");
}

if (password && !isStrongEnoughPassword(password)) {
  fail("Bootstrap admin bloqueado: DEV_ADMIN_PASSWORD nao atende a politica minima.");
}

main().catch(() => {
  fail("Bootstrap admin falhou de forma controlada.");
});

async function main() {
  const [{ default: pg }, { drizzle }, { eq }, { createAuth }, { users }] = await Promise.all([
    import("pg"),
    import("drizzle-orm/node-postgres"),
    import("drizzle-orm"),
    import("../../src/features/auth/server/create-auth"),
    import("../../src/db/schema")
  ]);

  const pool = new pg.Pool({ connectionString: databaseUrl, allowExitOnIdle: true });
  const db = drizzle(pool);
  const auth = createAuth({ useNextCookies: false });
  const summary = {
    created: 0,
    promoted: 0,
    unchanged: 0,
    skippedMissingPassword: 0
  };

  try {
    for (const email of masterEmails) {
      const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      let user = existingUser;

      if (!user) {
        if (!password) {
          summary.skippedMissingPassword += 1;
          continue;
        }

        await auth.api.signUpEmail({
          body: {
            name: "Admin Master",
            email,
            password
          }
        });

        const [createdUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        user = createdUser;
        summary.created += 1;
      }

      if (!user) {
        summary.skippedMissingPassword += 1;
        continue;
      }

      if (user.role === "admin") {
        summary.unchanged += 1;
        continue;
      }

      await db
        .update(users)
        .set({
          role: "admin",
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      summary.promoted += 1;
    }
  } finally {
    await pool.end();
  }

  console.log("Bootstrap admin concluido.");
  console.log("Valores reais nunca sao impressos por este script.");
  console.log(`Ambiente avaliado: ${environment}.`);
  console.log(`E-mails master processados: ${masterEmails.length}.`);
  console.log(`Criados: ${summary.created}.`);
  console.log(`Promovidos para admin: ${summary.promoted}.`);
  console.log(`Ja estavam admin: ${summary.unchanged}.`);
  console.log(`Pendentes por senha local ausente: ${summary.skippedMissingPassword}.`);

  if (summary.skippedMissingPassword > 0) {
    fail("Bootstrap admin pendente: defina DEV_ADMIN_PASSWORD localmente ou cadastre o usuario e rode novamente.");
  }
}

function loadLocalEnv(envFile = process.env.ADMIN_ENV_FILE || ".env.local") {
  const absolutePath = path.resolve(process.cwd(), envFile);

  if (!fs.existsSync(absolutePath)) {
    return;
  }

  const content = fs.readFileSync(absolutePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const name = trimmed.slice(0, separatorIndex).trim();
    const value = stripQuotes(trimmed.slice(separatorIndex + 1).trim());

    if (!process.env[name]) {
      process.env[name] = value;
    }
  }
}

function parseList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(/[,\n;]/)
        .map((item) => item.trim().toLowerCase())
        .filter(isValidEmail)
    )
  );
}

function assertNonProductionEnvironment() {
  const resolved =
    process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production"
      ? "production"
      : process.env.VERCEL_ENV === "preview" || process.env.ADMIN_BOOTSTRAP_TARGET === "staging"
        ? "staging"
        : process.env.NODE_ENV === "test"
          ? "test"
          : "development";

  if (resolved === "production") {
    fail("Bootstrap admin bloqueado em producao.");
  }

  if (
    looksLikeProductionUrl(process.env.DATABASE_URL) ||
    looksLikeProductionUrl(process.env.STAGING_DATABASE_URL)
  ) {
    fail("Bootstrap admin bloqueado: URL de banco parece producao.");
  }

  return resolved;
}

function looksLikeProductionUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  return /(^|[-_.:/])prod(uction)?($|[-_.:/?&=])/i.test(value);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isStrongEnoughPassword(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

function stripQuotes(value: string) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

export {};
