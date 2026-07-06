import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const drizzleDir = join(process.cwd(), "drizzle");
const destructivePattern =
  /\b(TRUNCATE|DELETE\s+FROM|ALTER\s+TABLE\s+[^;]+DROP|DROP\s+(TABLE|TYPE|INDEX|SCHEMA|DATABASE))\b/i;

function listMigrationFiles() {
  if (!existsSync(drizzleDir)) {
    return [];
  }

  return readdirSync(drizzleDir)
    .filter((file) => /^\d{4}_.+\.sql$/.test(file))
    .sort();
}

function analyzeMigration(file) {
  const sql = readFileSync(join(drizzleDir, file), "utf8");
  const statements = sql
    .split("--> statement-breakpoint")
    .map((statement) => statement.trim())
    .filter(Boolean);
  const destructive = destructivePattern.test(sql);

  return {
    file,
    statements: statements.length,
    destructive
  };
}

function run() {
  const files = listMigrationFiles();

  console.log("Readiness de migrations Drizzle");
  console.log("Este script não conecta banco e não executa migration real.");

  if (files.length === 0) {
    console.error("Nenhuma migration Drizzle versionada foi encontrada.");
    process.exitCode = 1;
    return;
  }

  let hasDestructive = false;

  for (const file of files) {
    const result = analyzeMigration(file);
    hasDestructive ||= result.destructive;
    const risk = result.destructive
      ? "revisar-operacao-destrutiva"
      : "sem-operacao-destrutiva";
    console.log(`${result.file}: ${result.statements} statements (${risk})`);
  }

  console.log(`Total de migrations: ${files.length}`);
  console.log("DATABASE_URL: não lida, não exigida e não impressa.");

  if (hasDestructive) {
    console.error(
      "Operação destrutiva detectada. Revisão humana obrigatória antes de qualquer alvo real."
    );
    process.exitCode = 1;
  }
}

run();
