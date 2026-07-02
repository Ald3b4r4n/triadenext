import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";
import { createIssue, scanRecordsForUnsafeValues } from "./safety";
import type { DryRunEntity, DryRunIssue, ParsedRecord } from "./types";

export interface InputFileSpec {
  entity: DryRunEntity;
  label: string;
  required: boolean;
  candidates: string[];
  fields: string[];
}

export const inputFileSpecs: InputFileSpec[] = [
  {
    entity: "categories",
    label: "Categorias",
    required: true,
    candidates: ["categories.csv", "categories.json", "categories.example.csv", "categories.example.json"],
    fields: ["name", "slug", "parent_slug", "description", "is_active", "sort_order"]
  },
  {
    entity: "products",
    label: "Produtos",
    required: true,
    candidates: ["products.csv", "products.json", "products.example.csv", "products.example.json"],
    fields: [
      "sku",
      "slug",
      "name",
      "category_slug",
      "price_cents",
      "price",
      "stock_quantity",
      "status",
      "published_at",
      "description",
      "brand"
    ]
  },
  {
    entity: "productImages",
    label: "Imagens",
    required: true,
    candidates: [
      "product-images.csv",
      "product-images.json",
      "product-images.example.csv",
      "product-images.example.json"
    ],
    fields: ["product_sku", "reference", "alt_text", "sort_order", "is_cover", "fallback_approved"]
  },
  {
    entity: "coupons",
    label: "Cupons",
    required: false,
    candidates: ["coupons.csv", "coupons.json", "coupons.example.csv", "coupons.example.json"],
    fields: [
      "code",
      "type",
      "value",
      "starts_at",
      "ends_at",
      "max_uses",
      "used_count",
      "minimum_subtotal_cents",
      "is_active"
    ]
  },
  {
    entity: "shippingRules",
    label: "Frete",
    required: true,
    candidates: [
      "shipping-rules.csv",
      "shipping-rules.json",
      "shipping-rules.example.csv",
      "shipping-rules.example.json"
    ],
    fields: [
      "rule_code",
      "name",
      "uf",
      "postal_code_start",
      "postal_code_end",
      "price_cents",
      "estimated_days",
      "is_active",
      "priority"
    ]
  }
];

export function parseInputFile(spec: InputFileSpec, filePath: string) {
  const content = readFileSync(filePath, "utf8");
  const extension = extname(filePath).toLowerCase();
  const file = basename(filePath);
  const result =
    extension === ".json"
      ? parseJsonRecords(content, file)
      : extension === ".csv"
        ? parseCsvRecords(content, file)
        : {
            records: [],
            issues: [
              createIssue({
                code: "INVALID_EXTENSION",
                entity: spec.entity,
                severity: "HIGH",
                goLiveImpact: "bloqueador",
                message: `Extensao nao suportada para ${spec.label}.`,
                recommendedAction: "corrigir-origem"
              })
            ]
          };

  const headerIssues = validateFields(spec, result.records);
  const unsafeIssues = scanRecordsForUnsafeValues(result.records, spec.entity);

  return {
    records: result.records,
    issues: [...result.issues, ...headerIssues, ...unsafeIssues]
  };
}

function parseJsonRecords(content: string, file: string): { records: ParsedRecord[]; issues: DryRunIssue[] } {
  try {
    const parsed = JSON.parse(content) as unknown;

    if (!Array.isArray(parsed)) {
      return {
        records: [],
        issues: [
          createIssue({
            code: "INVALID_JSON",
            severity: "HIGH",
            goLiveImpact: "bloqueador",
            message: "Arquivo JSON precisa ser um array de objetos.",
            recommendedAction: "corrigir-origem"
          })
        ]
      };
    }

    const records = parsed.map<ParsedRecord>((value, index) => ({
      file,
      lineNumber: index + 1,
      values: isObjectRecord(value) ? value : { value }
    }));

    return { records, issues: [] };
  } catch {
    return {
      records: [],
      issues: [
        createIssue({
          code: "INVALID_JSON",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Arquivo JSON nao pode ser interpretado.",
          recommendedAction: "corrigir-origem"
        })
      ]
    };
  }
}

function parseCsvRecords(content: string, file: string): { records: ParsedRecord[]; issues: DryRunIssue[] } {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      records: [],
      issues: [
        createIssue({
          code: "EMPTY_FILE",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Arquivo CSV vazio.",
          recommendedAction: "corrigir-origem"
        })
      ]
    };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const records: ParsedRecord[] = [];
  const issues: DryRunIssue[] = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = parseCsvLine(lines[index]);

    if (values.length !== headers.length) {
      issues.push(
        createIssue({
          code: "INVALID_ROW",
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: "Linha CSV tem quantidade de colunas diferente do cabecalho.",
          row: index + 1,
          recommendedAction: "corrigir-origem"
        })
      );
      continue;
    }

    records.push({
      file,
      lineNumber: index + 1,
      values: Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex]?.trim() ?? ""]))
    });
  }

  return { records, issues };
}

export function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function validateFields(spec: InputFileSpec, records: ParsedRecord[]) {
  const issues: DryRunIssue[] = [];
  const allowed = new Set(spec.fields);

  for (const record of records) {
    for (const field of Object.keys(record.values)) {
      if (allowed.has(field)) {
        continue;
      }

      issues.push(
        createIssue({
          code: "INVALID_HEADER",
          entity: spec.entity,
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: `Campo nao previsto no contrato de ${spec.label}.`,
          field,
          row: record.lineNumber,
          recommendedAction: "corrigir-origem"
        })
      );
    }
  }

  return issues;
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
