import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("staging import smoke script", () => {
  it("confirms an approved target without printing its URL", () => {
    const privateUrl = "https://preview-private.example.test/internal-smoke";
    const result = spawnSync(
      process.execPath,
      [
        join(process.cwd(), "scripts", "ops", "check-staging-import-smoke.mjs"),
        `--url=${privateUrl}`
      ],
      {
        cwd: process.cwd(),
        encoding: "utf8",
        env: { ...process.env, STAGING_IMPORT_SMOKE_URL: "" },
        shell: false
      }
    );

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      "Alvo staging aprovado; URL mantida em sigilo."
    );
    expect(result.stdout).not.toContain(privateUrl);
    expect(result.stdout).not.toContain("preview-private.example.test");
    expect(result.stderr).toBe("");
  });
});
