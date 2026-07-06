import { createCheck, pendingConfigIssue } from "./result";
import type {
  StagingSmokeCheck,
  StagingSmokeIssue,
  StagingSmokePreflight
} from "./types";

export interface RemotePageResult {
  ok: boolean;
  status: number;
  text: string;
}

export type StagingSmokeFetcher = (url: URL) => Promise<RemotePageResult>;

export interface StagingSmokeExecutionOptions {
  fetcher?: StagingSmokeFetcher;
}

export async function runStorefrontSmoke(
  preflight: StagingSmokePreflight,
  options: StagingSmokeExecutionOptions = {}
): Promise<{ checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] }> {
  const context = createRemoteSmokeContext(preflight, options.fetcher);
  if (!context.ready) {
    return {
      issues: context.issues,
      checks: [
        createCheck({
          id: "storefront-home",
          label: "Storefront home",
          category: "storefront",
          status: "pending-config",
          summary: context.summary,
          issues: context.issues
        })
      ]
    };
  }

  const result = await context.fetcher(new URL("/", context.baseUrl));
  const issues = inspectHtml(result, {
    required: ["Triade Essenza Parfum"],
    forbidden: [
      "Reconstrucao em andamento",
      "Placeholder funcional",
      "Storefront"
    ]
  });

  return {
    issues,
    checks: [
      createCheck({
        id: "storefront-home",
        label: "Storefront home",
        category: "storefront",
        status: issues.length > 0 ? "failed" : "passed",
        summary:
          issues.length > 0
            ? "Home staging falhou nos checks de conteúdo."
            : "Home staging respondeu sem placeholders proibidos.",
        issues
      })
    ]
  };
}

export function createRemoteSmokeContext(
  preflight: StagingSmokePreflight,
  fetcher: StagingSmokeFetcher | undefined
) {
  if (preflight.status === "blocked") {
    const issues = preflight.issues.filter((issue) => issue.blocksGoLive);
    return {
      ready: false as const,
      issues,
      summary:
        "Smoke remoto bloqueado por guardrail antes de qualquer requisicao."
    };
  }

  if (!preflight.target) {
    const issues = [
      pendingConfigIssue({
        code: "REMOTE_SMOKE_URL_PENDING",
        category: "environment",
        message: "Smoke remoto exige STAGING_SMOKE_URL aprovada."
      })
    ];
    return {
      ready: false as const,
      issues,
      summary: "URL staging ausente; smoke remoto pendente."
    };
  }

  if (!preflight.config.allowNetwork || !preflight.config.humanApprovalRef) {
    const issues = [
      pendingConfigIssue({
        code: "REMOTE_SMOKE_APPROVAL_PENDING",
        category: "environment",
        message: "Smoke remoto exige --allow-network e aprovação humana."
      })
    ];
    return {
      ready: false as const,
      issues,
      summary: "Smoke remoto pendente de flag explícita e aprovação humana."
    };
  }

  return {
    ready: true as const,
    baseUrl: preflight.target.url,
    fetcher: fetcher ?? fetchRemoteText
  };
}

export async function fetchRemoteText(url: URL): Promise<RemotePageResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal
    });
    return {
      ok: response.ok,
      status: response.status,
      text: await response.text()
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function inspectHtml(
  result: RemotePageResult,
  options: {
    required?: string[];
    forbidden?: string[];
    category?: StagingSmokeIssue["category"];
  } = {}
): StagingSmokeIssue[] {
  const issues: StagingSmokeIssue[] = [];
  const category = options.category ?? "storefront";

  if (!result.ok) {
    issues.push({
      code: "REMOTE_PAGE_FAILED",
      severity: "HIGH",
      origin: "next",
      category,
      message: `Página staging respondeu com HTTP ${result.status}.`,
      blocksGoLive: true
    });
  }

  for (const required of options.required ?? []) {
    if (!result.text.includes(required)) {
      issues.push({
        code: "EXPECTED_TEXT_MISSING",
        severity: "MEDIUM",
        origin: "next",
        category,
        message: "Texto esperado não foi encontrado na página staging.",
        blocksGoLive: true
      });
    }
  }

  for (const forbidden of options.forbidden ?? []) {
    if (result.text.includes(forbidden)) {
      issues.push({
        code: "FORBIDDEN_TEXT_FOUND",
        severity: "HIGH",
        origin: "next",
        category,
        message:
          "Texto placeholder/técnico proibido foi encontrado na página staging.",
        blocksGoLive: true
      });
    }
  }

  return issues;
}
