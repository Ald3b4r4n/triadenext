import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const TARGETS = ["src", "scripts", "AGENTS.md"];
const EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx", ".md"]);

const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  "node_modules",
  "public",
  ".codex",
  ".agents",
  ".claude",
  ".github",
  ".kiro"
]);

const TECHNICAL_ALLOWLIST = [
  "nao_informado",
  "em_preparacao",
  "requer_acao",
  "naoexiste",
  "sem-operacao-destrutiva",
  "revisar-operacao-destrutiva",
  "corrigir-mapeamento",
  "/admin/usuarios"
];

const RULES = [
  { pattern: /\bnao\b/iu, suggestion: "não" },
  { pattern: /\bNao\b/u, suggestion: "Não" },
  { pattern: /\bFaca\b/u, suggestion: "Faça" },
  { pattern: /\bSessao\b/u, suggestion: "Sessão" },
  { pattern: /\bsessao\b/u, suggestion: "sessão" },
  { pattern: /\boperacao\b/u, suggestion: "operação" },
  { pattern: /\bOperacao\b/u, suggestion: "Operação" },
  { pattern: /\bMutacoes\b/u, suggestion: "Mutações" },
  { pattern: /\bindisponivel\b/u, suggestion: "indisponível" },
  { pattern: /\bIndisponivel\b/u, suggestion: "Indisponível" },
  { pattern: /\binvalido\b/u, suggestion: "inválido" },
  { pattern: /\bInvalido\b/u, suggestion: "Inválido" },
  { pattern: /\busuario\b/u, suggestion: "usuário" },
  { pattern: /\bUsuario\b/u, suggestion: "Usuário" },
  { pattern: /\busuarios\b/u, suggestion: "usuários" },
  { pattern: /\bUsuarios\b/u, suggestion: "Usuários" },
  { pattern: /\bpreco\b/u, suggestion: "preço" },
  { pattern: /\bPreco\b/u, suggestion: "Preço" },
  { pattern: /\bcatalogo\b/u, suggestion: "catálogo" },
  { pattern: /\bCatalogo\b/u, suggestion: "Catálogo" },
  { pattern: /\bvalidacao\b/u, suggestion: "validação" },
  { pattern: /\bValidacao\b/u, suggestion: "Validação" },
  { pattern: /\bconfirmacao\b/u, suggestion: "confirmação" },
  { pattern: /\bConfirmacao\b/u, suggestion: "Confirmação" },
  { pattern: /\baprovacao\b/u, suggestion: "aprovação" },
  { pattern: /\bAprovacao\b/u, suggestion: "Aprovação" },
  { pattern: /\bconfiguracao\b/u, suggestion: "configuração" },
  { pattern: /\bConfiguracao\b/u, suggestion: "Configuração" },
  { pattern: /\bconexao\b/u, suggestion: "conexão" },
  { pattern: /\bConexao\b/u, suggestion: "Conexão" },
  { pattern: /\bproducao\b/u, suggestion: "produção" },
  { pattern: /\bProducao\b/u, suggestion: "Produção" },
  { pattern: /\brelatorio\b/u, suggestion: "relatório" },
  { pattern: /\bRelatorio\b/u, suggestion: "Relatório" },
  { pattern: /\brelatorios\b/u, suggestion: "relatórios" },
  { pattern: /\bRelatorios\b/u, suggestion: "Relatórios" },
  { pattern: /\bsensivel\b/u, suggestion: "sensível" },
  { pattern: /\bSensiveis\b/u, suggestion: "Sensíveis" },
  { pattern: /\bconteudo\b/u, suggestion: "conteúdo" },
  { pattern: /\bConteudo\b/u, suggestion: "Conteúdo" },
  { pattern: /\bpagina\b/u, suggestion: "página" },
  { pattern: /\bPagina\b/u, suggestion: "Página" },
  { pattern: /\bbasico\b/u, suggestion: "básico" },
  { pattern: /\bbasicos\b/u, suggestion: "básicos" },
  { pattern: /\bopcao\b/u, suggestion: "opção" },
  { pattern: /\bOpcao\b/u, suggestion: "Opção" },
  { pattern: /\bpublica\b/u, suggestion: "pública" },
  { pattern: /\bPublica\b/u, suggestion: "Pública" },
  { pattern: /\bminima\b/u, suggestion: "mínima" },
  { pattern: /\bMinima\b/u, suggestion: "Mínima" },
  { pattern: /\bgenero\b/u, suggestion: "gênero" },
  { pattern: /\bGenero\b/u, suggestion: "Gênero" },
  { pattern: /\bdescricao\b/u, suggestion: "descrição" },
  { pattern: /\bDescricao\b/u, suggestion: "Descrição" },
  { pattern: /\btitulo\b/u, suggestion: "título" },
  { pattern: /\bTitulo\b/u, suggestion: "Título" },
  { pattern: /\bInspiracao\b/u, suggestion: "Inspiração" },
  { pattern: /\bConcentracao\b/u, suggestion: "Concentração" },
  { pattern: /\bate\b/u, suggestion: "até" },
  { pattern: /\balem\b/u, suggestion: "além" },
  { pattern: /\bexplicita\b/u, suggestion: "explícita" },
  { pattern: /\bpossivel\b/u, suggestion: "possível" }
];

const findings = [];

for (const target of TARGETS) {
  scan(join(ROOT, target));
}

if (findings.length > 0) {
  console.error("Copy PT-BR precisa de revisão gramatical/acento:");
  for (const finding of findings) {
    console.error(
      `- ${finding.file}:${finding.line} -> trocar por "${finding.suggestion}"`
    );
    console.error(`  ${finding.text}`);
  }
  process.exitCode = 1;
} else {
  console.log("Copy PT-BR sem ocorrências óbvias de acentuação pendente.");
}

function scan(path) {
  const entries = safeReadDir(path);

  if (entries === null) {
    scanFile(path);
    return;
  }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) {
      continue;
    }
    scan(join(path, entry.name));
  }
}

function safeReadDir(path) {
  try {
    return readdirSync(path, { withFileTypes: true });
  } catch {
    return null;
  }
}

function scanFile(path) {
  const extension = path.includes(".") ? path.slice(path.lastIndexOf(".")) : "";
  if (!EXTENSIONS.has(extension)) {
    return;
  }

  const content = readFileSync(path, "utf8");
  const file = relative(ROOT, path).replaceAll("\\", "/");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (line.includes("ptbr-copy-ignore")) {
      return;
    }

    for (const text of extractHumanText(line)) {
      if (isTechnicalText(text)) {
        continue;
      }

      for (const rule of RULES) {
        if (hasHumanWordMatch(text, rule.pattern)) {
          findings.push({
            file,
            line: index + 1,
            suggestion: rule.suggestion,
            text: text.trim()
          });
        }
      }
    }
  });
}

function hasHumanWordMatch(text, pattern) {
  const match = text.match(pattern);
  if (!match || match.index === undefined) {
    return false;
  }

  const start = match.index;
  const end = start + match[0].length;
  return !isLetter(text[start - 1]) && !isLetter(text[end]);
}

function isLetter(value) {
  return typeof value === "string" && /^[A-Za-zÀ-ÿ]$/u.test(value);
}

function extractHumanText(line) {
  const values = [];
  const literalRegex = /(["'`])((?:\\.|(?!\1).)*)\1/g;
  let match;

  while ((match = literalRegex.exec(line)) !== null) {
    values.push(match[2]);
  }

  if (line.includes(">") && line.includes("<")) {
    const withoutTags = line
      .replace(/<[^>]+>/g, " ")
      .replace(/\{[^}]*\}/g, " ");
    if (/[A-Za-zÀ-ÿ]/u.test(withoutTags)) {
      values.push(withoutTags);
    }
  }

  return values;
}

function isTechnicalText(text) {
  const trimmed = text.trim();
  if (trimmed.length < 4) {
    return true;
  }
  if (TECHNICAL_ALLOWLIST.some((value) => trimmed.includes(value))) {
    return true;
  }
  if (/^\/[A-Za-z0-9_/\-[\]]+$/.test(trimmed)) {
    return true;
  }
  if (/^[A-Z0-9_:-]+$/.test(trimmed)) {
    return true;
  }
  if (/^[a-z0-9_-]+$/.test(trimmed)) {
    return true;
  }
  return false;
}
