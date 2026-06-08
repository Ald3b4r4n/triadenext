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
});
