const requiredForProduction = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "BLOB_READ_WRITE_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
];

const optional = [
  "DEV_ADMIN_EMAIL",
  "DEV_ADMIN_PASSWORD",
  "EMAIL_PROVIDER",
  "EMAIL_FROM",
  "ORDER_NOTIFICATION_RECIPIENTS",
  "RESEND_API_KEY",
  "EMAIL_API_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "SENTRY_DSN"
];

const mode = process.argv.includes("--production") ? "production" : "local";
const rows = [
  ...requiredForProduction.map((name) => ({
    name,
    required: mode === "production"
  })),
  ...optional.map((name) => ({
    name,
    required: false
  }))
];

const missingRequired = [];

for (const row of rows) {
  const present = Boolean(process.env[row.name]?.trim());
  if (row.required && !present) {
    missingRequired.push(row.name);
  }

  const requirement = row.required ? "obrigatoria" : "opcional";
  const status = present ? "presente" : "ausente";
  console.log(`${row.name}: ${status} (${requirement})`);
}

if (missingRequired.length > 0) {
  console.error(`Variaveis obrigatorias ausentes: ${missingRequired.join(", ")}`);
  process.exitCode = 1;
}
