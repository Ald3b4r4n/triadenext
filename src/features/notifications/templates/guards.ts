const prohibitedTerms = [
  "card_number",
  "client_secret",
  "webhook_secret",
  "database_url",
  "stripe payload",
  "smtp_password",
  "authorization: bearer"
];

export function assertSafeRenderedEmail(content: string) {
  const normalized = content.toLowerCase();
  const prohibited = prohibitedTerms.find((term) => normalized.includes(term));
  if (prohibited) {
    throw new Error("Template contem campo proibido.");
  }
}
