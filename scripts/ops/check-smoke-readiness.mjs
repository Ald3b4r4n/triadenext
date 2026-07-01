function parseUrl(args) {
  const inline = args.find((arg) => arg.startsWith("--url="))?.split("=")[1];
  const index = args.indexOf("--url");
  const explicit = index >= 0 ? args[index + 1] : null;
  const value = inline ?? explicit ?? process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

  try {
    return new URL(value);
  } catch {
    throw new Error("URL de smoke invalida.");
  }
}

function assertSafeUrl(url) {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("URL de smoke deve usar http ou https.");
  }

  if (url.username || url.password) {
    throw new Error("URL de smoke nao pode conter usuario ou senha.");
  }

  if (url.search || url.hash) {
    throw new Error("URL de smoke nao pode conter querystring ou hash.");
  }
}

function run(args = process.argv.slice(2)) {
  const url = parseUrl(args);
  assertSafeUrl(url);

  console.log("Readiness de smoke production-ready");
  console.log(`Alvo: ${url.origin}${url.pathname === "/" ? "" : url.pathname}`);
  console.log("Este script nao executa pagamento real, e-mail real, migration, banco ou deploy.");
  console.log("Use pnpm test:e2e para executar a suite local quando o ambiente estiver aprovado.");
}

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Falha desconhecida no check de smoke.");
  process.exitCode = 1;
}
