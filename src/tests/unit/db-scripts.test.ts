import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("database scripts", () => {
  it("declares safe database scripts", () => {
    const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };

    expect(packageJson.scripts["db:generate"]).toBe("drizzle-kit generate");
    expect(packageJson.scripts["db:migrate"]).toContain("require-database-url.mjs");
    expect(packageJson.scripts["db:studio"]).toBe("drizzle-kit studio");
    expect(packageJson.scripts["db:seed"]).toBe("node scripts/db/seed.mjs");
    expect(packageJson.scripts["db:seed:admin-dev"]).toBe("tsx scripts/db/seed-admin-dev.ts");
  });

  it("fails seed safely without DATABASE_URL", () => {
    expect(() =>
      execFileSync("node", ["scripts/db/seed.mjs"], {
        cwd: root,
        env: { ...process.env, DATABASE_URL: "" },
        stdio: "pipe"
      })
    ).toThrow(/DATABASE_URL ausente/);
  });

  it("fails admin dev seed safely without required envs", () => {
    expect(() =>
      execFileSync(
        process.execPath,
        ["node_modules/tsx/dist/cli.mjs", "scripts/db/seed-admin-dev.ts"],
        {
          cwd: root,
          env: {
            ...process.env,
            NODE_ENV: "development",
            DATABASE_URL: "",
            DEV_ADMIN_EMAIL: "",
            DEV_ADMIN_PASSWORD: ""
          },
          stdio: "pipe"
        }
      )
    ).toThrow(/variaveis ausentes/);
  });
});
