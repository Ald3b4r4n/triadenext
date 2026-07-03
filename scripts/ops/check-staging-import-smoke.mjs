function parseUrl(args) {
  const inline = args.find((arg) => arg.startsWith("--url="))?.split("=")[1];
  const index = args.indexOf("--url");
  const explicit = index >= 0 ? args[index + 1] : null;
  const value = inline ?? explicit ?? process.env.STAGING_IMPORT_SMOKE_URL;

  if (!value) {
    return null;
  }

  return new URL(value);
}

function assertSafeUrl(url) {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("URL de smoke staging deve usar http ou https.");
  }

  if (url.username || url.password) {
    throw new Error("URL de smoke staging nao pode conter credenciais.");
  }

  const host = url.hostname.toLowerCase();
  if (host === "triadeessenzaparfum.com.br" || host === "www.triadeessenzaparfum.com.br") {
    throw new Error("Smoke staging bloqueado: dominio de producao detectado.");
  }
}

function run(args = process.argv.slice(2)) {
  const url = parseUrl(args);

  console.log("Readiness de smoke pos-importacao staging");
  console.log("Este script nao executa pagamento real, e-mail real, migration, banco, deploy ou go-live.");

  if (!url) {
    console.log("Status: pending-input");
    console.log("Defina STAGING_IMPORT_SMOKE_URL ou use --url para ambiente nao produtivo aprovado.");
    return;
  }

  assertSafeUrl(url);
  console.log(`Alvo aprovado: ${url.origin}${url.pathname === "/" ? "" : url.pathname}`);
  console.log("Use pnpm test:e2e com STAGING_IMPORT_SMOKE_URL para executar a suite quando o ambiente estiver aprovado.");
}

try {
  run();
} catch (error) {
  console.error(error instanceof Error ? error.message : "Falha desconhecida no smoke staging.");
  process.exitCode = 1;
}
