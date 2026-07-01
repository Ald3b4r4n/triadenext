import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function runBuildCheck() {
  return execFileSync(process.execPath, ["scripts/ops/check-build-readiness.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

describe("build readiness script", () => {
  it("confirms local validation scripts without adding deploy or migration commands", () => {
    const output = runBuildCheck();
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), "package.json"), "utf8")
    ) as { scripts: Record<string, string> };

    expect(output).toContain("Readiness de build local");
    expect(output).toContain("lint: presente");
    expect(output).toContain("typecheck: presente");
    expect(output).toContain("test:e2e: presente");
    expect(packageJson.scripts["ops:check-build"]).toBe(
      "node scripts/ops/check-build-readiness.mjs"
    );
    expect(packageJson.scripts["ops:check-build"]).not.toContain("vercel");
    expect(packageJson.scripts["ops:check-build"]).not.toContain("db:migrate");
  });
});
