import { readFileSync } from "node:fs";
import { join } from "node:path";

const requiredLocalScripts = ["lint", "typecheck", "test", "build", "test:e2e"];
const forbiddenOpsFragments = [
  "vercel",
  "db:migrate",
  "drizzle-kit migrate",
  "db:seed"
];

function readPackageJson() {
  return JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
}

function run() {
  const packageJson = readPackageJson();
  const scripts = packageJson.scripts ?? {};
  const missing = requiredLocalScripts.filter((name) => !scripts[name]);
  const unsafeOps = Object.entries(scripts)
    .filter(([name]) => name.startsWith("ops:"))
    .filter(([, command]) =>
      forbiddenOpsFragments.some((fragment) =>
        String(command).includes(fragment)
      )
    )
    .map(([name]) => name);

  console.log("Readiness de build local");
  console.log(
    "Este script não chama Vercel, banco, migration real ou provider externo."
  );

  for (const name of requiredLocalScripts) {
    console.log(`${name}: ${scripts[name] ? "presente" : "ausente"}`);
  }

  if (missing.length > 0) {
    console.error(
      `Scripts locais obrigatorios ausentes: ${missing.join(", ")}`
    );
    process.exitCode = 1;
  }

  if (unsafeOps.length > 0) {
    console.error(
      `Scripts ops com comandos proibidos: ${unsafeOps.join(", ")}`
    );
    process.exitCode = 1;
  }
}

run();
