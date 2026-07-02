import { normalizeSlug } from "@/lib/slug";
import { collectIssue, duplicateIssue, optionalText, parseBooleanField, parseIntegerField, requiredText } from "./common";
import type { NormalizationResult, NormalizedCategory, ParsedRecord } from "../types";

export function normalizeCategories(records: ParsedRecord[]): NormalizationResult<NormalizedCategory> {
  const normalized: NormalizedCategory[] = [];
  const issues: NormalizationResult<NormalizedCategory>["issues"] = [];
  const seen = new Set<string>();

  for (const record of records) {
    const name = requiredText(record, "name", "categories", "Nome da categoria");
    const slugRaw = requiredText(record, "slug", "categories", "Slug da categoria");
    const sortOrder = parseIntegerField(record, "sort_order", "categories", "Ordem da categoria", {
      defaultValue: normalized.length + 1,
      min: 0
    });
    collectIssue(issues, name.issue);
    collectIssue(issues, slugRaw.issue);
    collectIssue(issues, sortOrder.issue);

    const slug = normalizeSlug(slugRaw.value || name.value);
    if (slug && seen.has(slug)) {
      issues.push(duplicateIssue("categories", "slug", slug));
    }
    seen.add(slug);

    normalized.push({
      name: name.value,
      slug,
      parentSlug: optionalText(record, "parent_slug"),
      description: optionalText(record, "description"),
      isActive: parseBooleanField(record, "is_active", true),
      sortOrder: sortOrder.value
    });
  }

  return { records: normalized, issues };
}
