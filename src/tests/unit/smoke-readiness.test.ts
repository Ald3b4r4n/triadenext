import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function runSmokeCheck(args: string[] = []) {
  return execFileSync(process.execPath, ["scripts/ops/check-smoke-readiness.mjs", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

describe("smoke readiness script", () => {
  it("uses a safe local URL by default and does not execute real operations", () => {
    const output = runSmokeCheck();

    expect(output).toContain("Readiness de smoke production-ready");
    expect(output).toContain("http://127.0.0.1:3000");
    expect(output).toContain("nao executa pagamento real");
  });

  it("accepts a clean approved URL without printing secrets", () => {
    const output = runSmokeCheck(["--url", "https://preview.example.test"]);

    expect(output).toContain("https://preview.example.test");
    expect(output).not.toContain("token=");
  });

  it("rejects URLs with querystrings because they may carry secrets", () => {
    expect(() => runSmokeCheck(["--url=https://preview.example.test?token=secret"])).toThrow(
      /querystring/
    );
  });
});
