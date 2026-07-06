const productionRequired = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "BLOB_READ_WRITE_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "EMAIL_PROVIDER",
  "EMAIL_FROM",
  "EMAIL_ADMIN_RECIPIENTS",
  "ORDER_NOTIFICATION_RECIPIENTS"
];

const previewRequired = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
];

const localRecommended = ["NEXT_PUBLIC_SITE_NAME"];

const optional = [
  "DEV_ADMIN_EMAIL",
  "DEV_ADMIN_PASSWORD",
  "ADMIN_MASTER_EMAILS",
  "STAGING_DATABASE_URL",
  "STAGING_IMPORT_APPROVED",
  "BLOB_READ_WRITE_TOKEN",
  "EMAIL_PROVIDER",
  "EMAIL_FROM",
  "EMAIL_ADMIN_RECIPIENTS",
  "ORDER_NOTIFICATION_RECIPIENTS",
  "RESEND_API_KEY",
  "EMAIL_API_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SENTRY_DSN",
  "STAGING_SMOKE_URL"
];

const allKnown = Array.from(
  new Set([
    ...productionRequired,
    ...previewRequired,
    ...localRecommended,
    ...optional
  ])
);

function resolveEnvironment(args) {
  const explicit = args
    .find((arg) => arg.startsWith("--environment="))
    ?.split("=")[1];
  const alias = args.includes("--production")
    ? "production"
    : args.includes("--preview") || args.includes("--staging")
      ? "preview"
      : args.includes("--local")
        ? "local"
        : null;
  const value =
    explicit ?? alias ?? process.env.READINESS_ENVIRONMENT ?? "local";
  const normalized = value.toLowerCase();

  if (!["local", "preview", "staging", "production"].includes(normalized)) {
    throw new Error(
      "Ambiente inválido. Use local, preview, staging ou production."
    );
  }

  return normalized === "staging" ? "preview" : normalized;
}

function requiredFor(environment) {
  if (environment === "production") {
    return productionRequired;
  }

  if (environment === "preview") {
    return previewRequired;
  }

  return [];
}

function recommendedFor(environment) {
  return environment === "local" ? localRecommended : [];
}

function classify(name, environment) {
  if (requiredFor(environment).includes(name)) {
    return "obrigatoria";
  }

  if (recommendedFor(environment).includes(name)) {
    return "recomendada";
  }

  return "opcional";
}

function buildRows(environment, env) {
  return allKnown.map((name) => {
    const present = Boolean(env[name]?.trim());
    const requirement = classify(name, environment);

    return {
      name,
      present,
      requirement,
      status: present ? "presente" : "ausente"
    };
  });
}

function run(args = process.argv.slice(2), env = process.env) {
  const environment = resolveEnvironment(args);
  const rows = buildRows(environment, env);
  const missingRequired = rows
    .filter((row) => row.requirement === "obrigatoria" && !row.present)
    .map((row) => row.name);

  console.log(`Ambiente avaliado: ${environment}`);
  console.log("Valores reais nunca sao impressos por este script.");

  for (const row of rows) {
    console.log(`${row.name}: ${row.status} (${row.requirement})`);
  }

  if (missingRequired.length > 0) {
    console.error(
      `Variaveis obrigatorias ausentes (${environment}): ${missingRequired.join(", ")}`
    );
    process.exitCode = 1;
  }
}

try {
  run();
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Falha desconhecida no check de env."
  );
  process.exitCode = 1;
}
