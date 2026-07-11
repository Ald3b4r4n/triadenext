# ADR 013 — Gates de readiness para providers de staging

## Status

Aceita em 2026-07-11.

## Contexto

A Fase 18 precisava preparar Vercel Preview, Neon staging/dev, Stripe test mode, bootstrap do administrador master e smoke remoto sem tornar infraestrutura externa uma dependência das validações locais. URL, banco, webhook e credenciais podem permanecer ausentes até uma configuração humana posterior.

## Decisão

- O módulo `src/features/staging-environment/` avalia readiness offline e registra somente presença ou ausência de configuração.
- Ausência de infraestrutura retorna `pending-config`; ausência de entrada aprovada retorna `pending-input`. Ambos resultam em `no-go`, sem efeito remoto.
- Produção, domínio definitivo e Stripe live são bloqueados antes do carregamento de drivers externos.
- `pnpm ops:migrate-staging` e `pnpm ops:bootstrap-admin-staging` operam em modo check por padrão.
- Execução remota exige alvo não produtivo, flag explícita, aprovação humana e todos os gates específicos. Migration também exige revisão e snapshot; bootstrap exige allowlist do master.
- Relatórios e logs são sanitizados e nunca incluem URL, connection string, chave, token, cookie ou segredo de webhook.
- O relatório final só pode recomendar `go` quando todos os critérios obrigatórios estiverem verdes e houver aprovação humana final.

## Consequências

- Lint, typecheck, testes, build e E2E permanecem independentes de providers reais.
- A ausência de Vercel, Neon ou Stripe test é uma pendência operacional explícita, não um falso sucesso nem uma falha de CI.
- Nenhuma migration, conexão remota, bootstrap ou smoke externo ocorre automaticamente.
- A configuração e a execução reais de staging continuam dependentes de aprovação humana fora do Git.

## Guardrails

- Produção e Stripe live permanecem proibidos.
- Nenhum valor sensível pode aparecer em stdout, stderr, relatórios ou documentação.
- Migration em produção, deploy automático e alteração do Laravel legado permanecem fora de escopo.
