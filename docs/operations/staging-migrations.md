# Migrations em Staging

O wrapper `pnpm ops:migrate-staging` inicia em modo check e não abre conexão.

## Gates cumulativos para execução futura

- Target `staging`, `preview` ou `remote-dev`.
- Flag explícita de execução e confirmação staging.
- Referência geral e referência específica de aprovação humana.
- Migrations `0000` a `0007` revisadas.
- Snapshot/restore confirmado.
- `STAGING_DATABASE_URL` presente fora do Git.
- Nenhum sinal de produção.

O comando nunca participa de build, install ou deploy. Sem todos os gates, termina
antes de carregar driver ou connection string.

## Rollback

Restaurar o branch/snapshot Neon aprovado e registrar o resultado sem URL. Rollback
de deployment não substitui rollback de banco.
