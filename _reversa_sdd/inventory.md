# Inventario tecnico Reversa - Triade Essenza Next

Atualizado em: 2026-07-01
Agente: Scout
Escopo: re-extracao pos-Fase 13, com foco no estado Next.js atual, readiness operacional e paridade Laravel x Next.

## Contexto

- Projeto atual: `D:\Projetos\triade-essenza-next`.
- Nao e o Laravel legado `D:\Projetos\triadeessenzaparfum.com.br`.
- Framework principal: Next.js App Router.
- Linguagem principal: TypeScript.
- Gerenciador de pacotes: pnpm, com `package.json` e `pnpm-lock.yaml`.
- CI/CD: nao detectado em `.github/workflows`.
- Docker: `Dockerfile` e `docker-compose.yml` nao detectados.

## Contagem superficial de arquivos

Escopo contado: `src`, `drizzle`, `scripts`, `docs`.

| Extensao | Arquivos |
| --- | ---: |
| `.ts` | 143 |
| `.tsx` | 55 |
| `.md` | 33 |
| `.sql` | 8 |
| `.mjs` | 6 |

Total observado nesse recorte: 255 arquivos.

## Entry points

| Caminho | Tipo |
| --- | --- |
| `src/app/layout.tsx` | App shell |
| `src/app/(storefront)/page.tsx` | Home publica |
| `src/app/(storefront)/produtos/page.tsx` | Catalogo publico |
| `src/app/(storefront)/produto/[slug]/page.tsx` | Produto publico |
| `src/app/(storefront)/carrinho/page.tsx` | Carrinho |
| `src/app/(storefront)/checkout/page.tsx` | Checkout |
| `src/app/(auth)/login/page.tsx` | Login |
| `src/app/(auth)/cadastro/page.tsx` | Cadastro |
| `src/app/(customer)/layout.tsx` | Area do cliente |
| `src/app/admin/layout.tsx` | Admin |
| `src/app/api/auth/[...all]/route.ts` | Auth API |
| `src/app/api/health/route.ts` | Healthcheck |
| `src/app/api/upload/route.ts` | Upload |
| `src/app/api/webhooks/stripe/route.ts` | Webhook Stripe |
| `scripts/ops/check-env-readiness.mjs` | Readiness seguro de variaveis |
| `scripts/ops/check-migrations-readiness.mjs` | Readiness estatico de migrations |
| `scripts/ops/check-build-readiness.mjs` | Readiness seguro de build |
| `scripts/ops/check-smoke-readiness.mjs` | Readiness seguro de smoke |

## Modulos identificados

- `auth`: sessao, actions e policies.
- `products`: catalogo, persistencia, fixtures e componentes.
- `cart`: sessao de carrinho, itens e acoes.
- `coupons`: regras de desconto e admin.
- `shipping`: frete manual, regras e adapters futuros.
- `checkout`: conversao de carrinho em pedido pendente.
- `orders`: dominio, leitura e snapshots.
- `payments`: Stripe PaymentIntent, webhook e settlement.
- `notifications`: notificacoes pos-pagamento e providers.
- `uploads`: upload de imagens de produto.
- `db`: schema Drizzle e cliente.
- `lib`: utilitarios transversais.
- `operations`: documentacao e scripts seguros para staging/producao sem deploy ou migration real automatica.

## Banco de dados

- ORM/schema: `src/db/schema.ts`.
- Configuracao Drizzle: `drizzle.config.ts`.
- Migrations: `drizzle/0000_shallow_shinko_yamashiro.sql` ate `drizzle/0007_outstanding_midnight.sql`.
- Metadados Drizzle: `drizzle/meta/*.json`.
- Scripts DB: `scripts/db/seed.mjs`, `scripts/db/seed-admin-dev.ts`, `scripts/db/require-database-url.mjs`.
- Readiness de migrations: `scripts/ops/check-migrations-readiness.mjs` faz leitura estatica de `drizzle/` e nao conecta banco.

## Testes

- Unit/integration: `src/tests/unit/*.test.ts` e `src/tests/unit/*.test.tsx`.
- E2E: `src/tests/e2e/*.spec.ts`.
- Smoke production-ready: `src/tests/e2e/production-readiness-smoke.spec.ts` e `src/tests/e2e/production-readiness-payment.spec.ts`.
- Configuracoes: `vitest.config.ts`, `playwright.config.ts`.
- Frameworks: Vitest, Testing Library, Playwright.

## Artefatos Reversa/Forward existentes

- `_reversa_forward/001-fase-3-neon-drizzle` ate `_reversa_forward/020-fase-12-production-readiness`.
- Trilhas de migracao geral abertas: `_reversa_forward/009-*` ate `_reversa_forward/018-*`.
- `_reversa_sdd/migration` e `_reversa_sdd/design-system` existem como planejamento.

## Estado pos-Fase 12

- Fase 11 endureceu UX/storefront e smoke visual.
- Fase 12 consolidou readiness de producao controlada: Neon, Vercel, Stripe test mode, Blob/upload, variaveis, scripts ops e checklists.
- Nenhum deploy real, migration real, conexao com banco real ou uso de credencial real foi executado nesta re-extracao.

## Estado pos-Fase 13

- Fase 13 criou matriz de paridade Laravel x Next em `_reversa_forward/021-fase-13-legacy-parity/legacy-parity-matrix.md`.
- O Next substitui o fluxo comercial central quando alimentado por dados corretos: home, catalogo, produto, carrinho, cupom, frete manual, checkout autenticado, pedido, Stripe PaymentIntent/webhook e notificacoes pos-pagamento.
- Bloqueadores de go-live real registrados: catalogo real, imagens, precos, estoque, cupons ativos e frete minimo precisam de dry-run/reconciliacao aprovados; dry-run controlado ainda precisa ser executado em etapa futura com fonte de dados aprovada.
- Decisoes humanas pendentes: redirects/URLs legadas, pagina de privacidade, frete externo/rastreamento, clientes e pedidos historicos, fiscal/Bling/NF-e.
- Artefatos novos principais: gap register, inventario legado, plano de dry-run, reconciliacao, checklist go-live, rollback, legacy-impact e regression-watch.
- Nenhuma alteracao funcional, deploy real, migration real, conexao com banco real, importacao real, secrets ou alteracao no Laravel legado foi executada nesta re-extracao.

## Organizacao sugerida

Sugestao do Scout: `hybrid`.

Racional: o projeto combina rotas App Router em `src/app`, dominios em `src/features` e testes E2E orientados a comportamento.
