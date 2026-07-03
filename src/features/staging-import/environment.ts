import type { StagingEnvironment, StagingProvider, StagingTarget } from "./types";

const allowedTargets: StagingTarget[] = ["staging", "preview", "remote-dev"];
const allowedProviders: StagingProvider[] = ["neon", "other"];

export function resolveStagingTarget(value: string | undefined): StagingTarget | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return allowedTargets.includes(normalized as StagingTarget) ? (normalized as StagingTarget) : null;
}

export function resolveStagingProvider(value: string | undefined): StagingProvider {
  const normalized = value?.trim().toLowerCase();
  return allowedProviders.includes(normalized as StagingProvider) ? (normalized as StagingProvider) : "neon";
}

export function createStagingEnvironment(target: StagingTarget, provider: StagingProvider): StagingEnvironment {
  return {
    target,
    provider,
    label: provider === "neon" ? `Neon ${target}` : target,
    isProduction: false
  };
}

export function parseBooleanFlag(value: string | undefined) {
  if (!value) {
    return false;
  }

  return ["1", "true", "yes", "sim", "confirmed", "confirmado"].includes(value.trim().toLowerCase());
}

export function requiresRemoteWrite(mode: string) {
  return mode === "upsert" || mode === "reset-and-upsert";
}

export function isAllowedStagingTarget(value: string | undefined): value is StagingTarget {
  return resolveStagingTarget(value) !== null;
}
