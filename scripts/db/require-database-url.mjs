if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL ausente. Operacao bloqueada para evitar migration contra alvo indefinido."
  );
  process.exit(1);
}
