# Neon

Neon Postgres sera o banco alvo.

`drizzle.config.ts` esta preparado para `DATABASE_URL`, mas migrations nao devem ser rodadas contra banco real sem validacao humana.

## Fase 3

O primeiro alvo Neon validado para esta fase e desenvolvimento/local-dev. Preview e producao nao
devem receber mutacoes reais sem a Fase 4 de auth/policies.

Fluxo seguro:

1. Gerar migration local com `pnpm db:generate`.
2. Revisar SQL gerado em `drizzle/`.
3. Configurar `DATABASE_URL` apenas em ambiente de desenvolvimento aprovado.
4. Rodar `pnpm db:migrate` somente apos validacao humana explicita do alvo.
5. Rodar `pnpm db:seed` apenas em banco de desenvolvimento.

`pnpm db:migrate` chama `scripts/db/require-database-url.mjs` antes do Drizzle para bloquear alvo
indefinido. O script nao imprime o valor da URL.
