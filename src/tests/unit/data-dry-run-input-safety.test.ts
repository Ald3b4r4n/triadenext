import { describe, expect, it } from "vitest";
import { parseCsvLine } from "@/features/data-dry-run/input-contracts";
import { resolveSafeInputDir } from "@/features/data-dry-run/input-discovery";
import { scanRecordsForUnsafeValues } from "@/features/data-dry-run/safety";
import type { ParsedRecord } from "@/features/data-dry-run/types";

describe("data dry-run input safety", () => {
  it("accepts only input paths under data/dry-run/input", () => {
    const cwd = process.cwd();

    expect(resolveSafeInputDir({ cwd, inputDir: "data/dry-run/input/examples" })).toContain("data");
    expect(() => resolveSafeInputDir({ cwd, inputDir: "." })).toThrow(/data\/dry-run\/input/);
  });

  it("parses quoted CSV lines without adding dependencies", () => {
    expect(parseCsvLine('"SKU,001","Produto ""Teste""",12990')).toEqual([
      "SKU,001",
      'Produto "Teste"',
      "12990"
    ]);
  });

  it("detects unsafe values without exposing the raw secret-like value", () => {
    const records: ParsedRecord[] = [
      {
        file: "products.csv",
        lineNumber: 2,
        values: {
          sku: "SKU-SAFE",
          description: "DATABASE_URL=REDACTED_TEST_ONLY"
        }
      }
    ];

    const issues = scanRecordsForUnsafeValues(records, "products");

    expect(issues).toHaveLength(1);
    expect(issues[0].code).toBe("UNSAFE_INPUT");
    expect(issues[0].message).not.toContain("REDACTED_TEST_ONLY");
  });
});
