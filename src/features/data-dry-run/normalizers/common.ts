import { parsePriceToCents } from "@/features/products/domain";
import { createIssue } from "../safety";
import type { DryRunEntity, DryRunIssue, ParsedRecord } from "../types";

export function readText(record: ParsedRecord, field: string) {
  const value = record.values[field];
  return value === null || value === undefined ? "" : String(value).trim();
}

export function optionalText(record: ParsedRecord, field: string) {
  const value = readText(record, field);
  return value.length > 0 ? value : null;
}

export function requiredText(
  record: ParsedRecord,
  field: string,
  entity: DryRunEntity,
  label: string
) {
  const value = readText(record, field);
  if (value.length > 0) {
    return { value, issue: null };
  }

  return {
    value,
    issue: createIssue({
      code: "INVALID_VALUE",
      entity,
      severity: "HIGH",
      goLiveImpact: "bloqueador",
      message: `${label} obrigatorio ausente.`,
      field,
      row: record.lineNumber,
      recommendedAction: "corrigir-origem"
    })
  };
}

export function parseBooleanField(
  record: ParsedRecord,
  field: string,
  defaultValue: boolean
) {
  const value = readText(record, field).toLowerCase();

  if (!value) {
    return defaultValue;
  }

  if (["true", "1", "yes", "sim", "s"].includes(value)) {
    return true;
  }

  if (["false", "0", "no", "nao", "não", "n"].includes(value)) {
    return false;
  }

  return defaultValue;
}

export function parseIntegerField(
  record: ParsedRecord,
  field: string,
  entity: DryRunEntity,
  label: string,
  options: { required?: boolean; defaultValue?: number; min?: number } = {}
) {
  const raw = readText(record, field);

  if (!raw) {
    if (options.required) {
      return {
        value: options.defaultValue ?? 0,
        issue: createIssue({
          code: "INVALID_VALUE",
          entity,
          severity: "HIGH",
          goLiveImpact: "bloqueador",
          message: `${label} obrigatorio ausente.`,
          field,
          row: record.lineNumber,
          recommendedAction: "corrigir-origem"
        })
      };
    }

    return { value: options.defaultValue ?? 0, issue: null };
  }

  const value = Number(raw);
  if (
    !Number.isInteger(value) ||
    (options.min !== undefined && value < options.min)
  ) {
    return {
      value: options.defaultValue ?? 0,
      issue: createIssue({
        code: "INVALID_VALUE",
        entity,
        severity: "HIGH",
        goLiveImpact: "bloqueador",
        message: `${label} precisa ser inteiro valido.`,
        field,
        row: record.lineNumber,
        recommendedAction: "corrigir-origem"
      })
    };
  }

  return { value, issue: null };
}

export function parseCentsField(
  record: ParsedRecord,
  entity: DryRunEntity,
  centsField: string,
  decimalField?: string
) {
  const centsRaw = readText(record, centsField);

  if (centsRaw) {
    return parseIntegerField(record, centsField, entity, "Valor em centavos", {
      required: true,
      min: 0
    });
  }

  if (!decimalField) {
    return {
      value: 0,
      issue: createIssue({
        code: "INVALID_VALUE",
        entity,
        severity: "HIGH",
        goLiveImpact: "bloqueador",
        message: "Valor em centavos obrigatorio ausente.",
        field: centsField,
        row: record.lineNumber,
        recommendedAction: "corrigir-origem"
      })
    };
  }

  const decimalRaw = readText(record, decimalField);
  const cents = parsePriceToCents(decimalRaw);

  if (cents === null || cents < 0) {
    return {
      value: 0,
      issue: createIssue({
        code: "INVALID_VALUE",
        entity,
        severity: "HIGH",
        goLiveImpact: "bloqueador",
        message: "Valor monetário não pode ser convertido para centavos.",
        field: decimalField,
        row: record.lineNumber,
        recommendedAction: "corrigir-origem"
      })
    };
  }

  return { value: cents, issue: null };
}

export function parseIsoDate(
  record: ParsedRecord,
  field: string,
  entity: DryRunEntity
) {
  const value = optionalText(record, field);
  if (!value) {
    return { value: null, issue: null };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return {
      value: null,
      issue: createIssue({
        code: "INVALID_VALUE",
        entity,
        severity: "HIGH",
        goLiveImpact: "bloqueador",
        message: "Data precisa estar em formato ISO 8601.",
        field,
        row: record.lineNumber,
        recommendedAction: "corrigir-origem"
      })
    };
  }

  return { value: date.toISOString(), issue: null };
}

export function collectIssue(issues: DryRunIssue[], issue: DryRunIssue | null) {
  if (issue) {
    issues.push(issue);
  }
}

export function duplicateIssue(
  entity: DryRunEntity,
  key: string,
  entityKey: string
) {
  return createIssue({
    code: "DUPLICATE_KEY",
    entity,
    entityKey,
    severity: "HIGH",
    goLiveImpact: "bloqueador",
    message: `Chave duplicada em ${key}.`,
    field: key,
    recommendedAction: "corrigir-origem"
  });
}
