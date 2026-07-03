# Dependencias Reversa - Triade Essenza Next

Atualizado em: 2026-07-03
Agente: Scout
Escopo: dependencias declaradas em `package.json`, workspace pnpm e configuracoes principais.

## Runtime e framework

| Dependencia | Versao declarada | Papel |
| --- | --- | --- |
| `next` | `latest` | Framework App Router |
| `react` | `latest` | UI |
| `react-dom` | `latest` | Renderizacao React |
| `typescript` | `latest` | Linguagem e typecheck |
| `server-only` | `^0.0.1` | Protecao de modulos server-only |

## Dados e persistencia

| Dependencia | Versao declarada | Papel |
| --- | --- | --- |
| `drizzle-orm` | `latest` | ORM/query layer |
| `drizzle-kit` | `latest` | Migrations e tooling |
| `@neondatabase/serverless` | `latest` | Driver Neon/Postgres |

## Auth e validacao

| Dependencia | Versao declarada | Papel |
| --- | --- | --- |
| `better-auth` | `^1.6.15` | Autenticacao |
| `@better-auth/drizzle-adapter` | `^1.6.15` | Adapter Drizzle para auth |
| `zod` | `latest` | Schemas e validacao |
| `react-hook-form` | `latest` | Formularios client-side |
| `@hookform/resolvers` | `latest` | Integracao RHF/Zod |

## Pagamentos, upload e UI

| Dependencia | Versao declarada | Papel |
| --- | --- | --- |
| `stripe` | `latest` | Stripe server SDK |
| `@stripe/react-stripe-js` | `^6.6.0` | Payment Element React |
| `@stripe/stripe-js` | `^9.8.0` | Stripe.js |
| `@vercel/blob` | `latest` | Storage de blobs |
| `lucide-react` | `latest` | Icones |
| `@radix-ui/react-slot` | `latest` | Composicao UI |
| `class-variance-authority` | `latest` | Variantes de componentes |
| `clsx` | `latest` | Classes condicionais |
| `tailwind-merge` | `latest` | Merge de classes Tailwind |

## Tooling e testes

| Dependencia | Versao declarada | Papel |
| --- | --- | --- |
| `eslint` | `^9.39.1` | Lint |
| `eslint-config-next` | `latest` | Regras Next |
| `vitest` | `latest` | Unit/integration tests |
| `@testing-library/react` | `latest` | Testes de componentes |
| `@testing-library/jest-dom` | `latest` | Matchers DOM |
| `jsdom` | `latest` | DOM em testes |
| `@playwright/test` | `latest` | E2E |
| `tsx` | `^4.22.4` | Execucao TS em scripts |
| `prettier` | `latest` | Formatacao |
| `tailwindcss` | `latest` | CSS utilitario |
| `@tailwindcss/postcss` | `latest` | PostCSS/Tailwind |
| `autoprefixer` | `latest` | CSS post-processing |

## Scripts declarados

- `dev`: `next dev`.
- `build`: `next build`.
- `start`: `next start`.
- `lint`: `eslint . --max-warnings=0`.
- `typecheck`: `tsc --noEmit`.
- `test`: `vitest run`.
- `test:e2e`: `playwright test`.
- `ops:check-env`: `node scripts/ops/check-env-readiness.mjs`.
- `ops:check-migrations`: `node scripts/ops/check-migrations-readiness.mjs`.
- `ops:check-build`: `node scripts/ops/check-build-readiness.mjs`.
- `ops:check-smoke`: `node scripts/ops/check-smoke-readiness.mjs`.
- `ops:check-data-dry-run`: `node scripts/ops/check-data-dry-run-readiness.mjs`.
- `ops:import-staging`: `node scripts/ops/import-staging.mjs`.
- `ops:check-staging-import-smoke`: `node scripts/ops/check-staging-import-smoke.mjs`.
- `db:generate`: `drizzle-kit generate`.
- `db:migrate`: `node scripts/db/require-database-url.mjs && drizzle-kit migrate`.
- `db:studio`: `drizzle-kit studio`.
- `db:seed`: `node scripts/db/seed.mjs`.
- `db:seed:admin-dev`: `tsx scripts/db/seed-admin-dev.ts`.

## Observacoes de risco

- Dependencias com `latest` exigem lockfile como fonte efetiva de versao.
- `db:migrate` tem guarda de `DATABASE_URL`, mas nao deve ser executado contra banco real sem aprovacao.
- Providers reais externos devem permanecer isolados por adapters e fakes em teste.
- `pnpm-workspace.yaml` registra build dependencies aprovadas (`esbuild`, `sharp`, `unrs-resolver`) para evitar bloqueio local do pnpm.
- Scripts `ops:*` sao checks locais de readiness; nao executam deploy, migration real, banco real, upload real, e-mail real ou pagamento real.
- Fase 13 nao adicionou dependencias npm; a comparacao Laravel x Next e o plano de dry-run sao documentais.
- Fase 14 nao adicionou dependencias npm; reutiliza `tsx` ja existente para executar a CLI TypeScript do dry-run.
- `ops:check-data-dry-run` le apenas arquivos locais permitidos e nao le `.env`, nao conecta banco, nao importa dados, nao faz upload real e nao executa deploy.
- Fase 15 nao adicionou dependencias npm; ampliou o dry-run aprovado com `pending-input`, inventario em memoria, contratos primarios `product_images.*`/`inventory.*`/`shipping.*` e relatorios sanitizados usando os mesmos scripts existentes.
- Fase 16 nao adicionou dependencias npm; reutiliza Drizzle/Neon/tsx ja presentes para preparar importacao staging controlada.
- `ops:import-staging` exige ambiente staging/dev remoto aprovado e bloqueia producao antes de abrir conexao; nao deve imprimir `STAGING_DATABASE_URL` nem qualquer segredo.
- `ops:check-staging-import-smoke` depende somente de URL staging aprovada; sem `STAGING_IMPORT_SMOKE_URL`, o skipped e esperado e nao representa falha de build.
- Laravel legado e dependencia operacional de leitura para paridade e rollback, mas nao e dependencia runtime do Next.
