const appEnvironment = resolveAppEnvironment();

if (appEnvironment !== "development") {
  fail("Seed admin dev bloqueado fora de development/local-dev.");
}

const required = ["DATABASE_URL", "DEV_ADMIN_EMAIL", "DEV_ADMIN_PASSWORD"] as const;
const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  fail(`Seed admin dev bloqueado: variaveis ausentes (${missing.join(", ")}).`);
}

const email = process.env.DEV_ADMIN_EMAIL;
const password = process.env.DEV_ADMIN_PASSWORD;

if (!email || !password) {
  fail("Seed admin dev bloqueado: variaveis obrigatorias ausentes.");
}

if (!isStrongEnough(password)) {
  fail("Seed admin dev bloqueado: DEV_ADMIN_PASSWORD nao atende a politica minima.");
}

const adminEmail = email;
const adminPassword = password;

main().catch(() => {
  fail("Seed admin dev falhou com erro controlado.");
});

async function main() {
  const [{ default: pg }, { drizzle }, { eq }, { createAuth }, { users }] = await Promise.all([
    import("pg"),
    import("drizzle-orm/node-postgres"),
    import("drizzle-orm"),
    import("../../src/features/auth/server/create-auth"),
    import("../../src/db/schema")
  ]);

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL as string,
    allowExitOnIdle: true
  });
  const db = drizzle(pool);
  const auth = createAuth({ useNextCookies: false });

  try {
    const [existingUser] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (!existingUser) {
      await auth.api.signUpEmail({
        body: {
          name: "Admin Dev",
          email: adminEmail,
          password: adminPassword
        }
      });
    }

    const [adminUser] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (!adminUser) {
      fail("Seed admin dev nao confirmou usuario criado.");
    }

    await db
      .update(users)
      .set({
        role: "admin",
        updatedAt: new Date()
      })
      .where(eq(users.id, adminUser.id));
  } finally {
    await pool.end();
  }

  console.log("Seed admin dev concluido com usuario administrativo local.");
}

function resolveAppEnvironment() {
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "production";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "preview";
  }

  if (process.env.NODE_ENV === "test") {
    return "test";
  }

  return "development";
}

function isStrongEnough(value: string) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

export {};
