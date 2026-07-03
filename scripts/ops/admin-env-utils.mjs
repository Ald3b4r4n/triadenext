import fs from "node:fs";
import path from "node:path";

export function loadLocalEnv(envFile = process.env.ADMIN_ENV_FILE || ".env.local") {
  const absolutePath = path.resolve(process.cwd(), envFile);

  if (!fs.existsSync(absolutePath)) {
    return { exists: false, loadedNames: [] };
  }

  const loadedNames = [];
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
      loadedNames.push(name);
    }
  }

  return { exists: true, loadedNames };
}

export function parseList(value) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(/[,\n;]/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

export function resolveAppEnvironment(env = process.env) {
  if (env.VERCEL_ENV === "production" || env.NODE_ENV === "production") {
    return "production";
  }

  if (env.VERCEL_ENV === "preview" || env.ADMIN_BOOTSTRAP_TARGET === "staging") {
    return "staging";
  }

  if (env.NODE_ENV === "test") {
    return "test";
  }

  return "development";
}

export function assertNonProductionEnvironment(env = process.env) {
  const environment = resolveAppEnvironment(env);

  if (environment === "production") {
    throw new Error("Operacao admin bloqueada em producao.");
  }

  const databaseUrl = env.DATABASE_URL ?? "";
  const stagingDatabaseUrl = env.STAGING_DATABASE_URL ?? "";

  if (looksLikeProductionUrl(databaseUrl) || looksLikeProductionUrl(stagingDatabaseUrl)) {
    throw new Error("Operacao admin bloqueada: URL de banco parece producao.");
  }

  return environment;
}

export function looksLikeProductionUrl(value) {
  if (!value) {
    return false;
  }

  const normalized = value.toLowerCase();

  if (/(^|[-_.:/])prod(uction)?($|[-_.:/?&=])/.test(normalized)) {
    return true;
  }

  try {
    const url = new URL(value);
    const combined = `${url.hostname} ${url.pathname} ${url.search}`.toLowerCase();
    return /(^|[-_.:/])prod(uction)?($|[-_.:/?&=])/.test(combined);
  } catch {
    return false;
  }
}

export function hasValue(name, env = process.env) {
  return Boolean(env[name]?.trim());
}

export function safeStatus(name, env = process.env) {
  return `${name}: ${hasValue(name, env) ? "presente" : "ausente"}`;
}

export function isStrongEnoughPassword(value) {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

export function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function stripQuotes(value) {
  if (
    (value.startsWith("\"") && value.endsWith("\"")) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
