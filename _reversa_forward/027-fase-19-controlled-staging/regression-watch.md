# Regression Watch: Fase 19 — Controlled Staging Execution

> Feature: `027-fase-19-controlled-staging`
> Criado em: `2026-07-13`

## Watch items

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
| --- | --- | --- | --- | --- |
| W001 | `scripts/ops/check-staging-import-smoke.mjs`, saída do alvo | A confirmação de alvo aprovado nunca imprime URL, host, caminho ou credencial. | redação | Saída contém origem, domínio, caminho ou valor de `STAGING_IMPORT_SMOKE_URL`. |
| W002 | `_reversa_sdd/domain.md`, Readiness de Providers e Ambiente Staging | Checks offline sem configuração retornam `pending-config`/`pending-input` sem rede. | presença | Check tenta acessar provider, URL ou banco no modo padrão. |
| W003 | `_reversa_sdd/domain.md`, Readiness de Providers e Ambiente Staging | Produção e Stripe live são bloqueados antes de driver, request ou efeito externo. | presença | Target produtivo ou chave live alcança adapter externo. |
| W004 | `operational-go-no-go.md`, Evidência de segurança | Relatórios versionáveis não contêm valores de env, URL completa, connection string, chave, token, cookie ou senha. | redação | Varredura encontra valor sensível ou saída bruta. |
| W005 | `scripts/ops/migrate-staging.mjs` e `scripts/ops/bootstrap-admin-staging.ts` | Migration e bootstrap permanecem em check por padrão e exigem gates explícitos para execução. | presença | Comando sem flags carrega banco, auth ou executa migration. |
| W006 | `data/dry-run/input/primeira-execucao/` e matriz operacional | Ausência dos arquivos aprovados continua `pending-input`; fixtures sintéticas não provam importação real. | presença | Dry-run sintético é tratado como aprovação de input real ou `go` de staging. |

## Histórico de re-extrações

Nenhuma re-extração registrada nesta feature.

## Arquivadas

Nenhuma.

## Observações

- A infraestrutura externa não estava configurada durante a execução; esse fato é estado operacional, não regressão do Next.
- O precheck de importação retornou `blocked` com exit code 1 esperado e sem conexão.
