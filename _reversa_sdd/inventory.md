# Inventario tecnico Reversa - Triade Essenza Next

Atualizado em: 2026-07-03
Agente: Scout
Escopo: re-extracao pos-Fase 16, com foco no estado Next.js atual, dry-run aprovado/pending-input, importacao staging controlada, readiness operacional e paridade Laravel x Next.

## Contexto

- Projeto atual: `D:\Projetos\triade-essenza-next`.
- Nao e o Laravel legado `D:\Projetos\triadeessenzaparfum.com.br`.
- Framework principal: Next.js App Router.
- Linguagem principal: TypeScript.
- Gerenciador de pacotes: pnpm, com `package.json` e `pnpm-lock.yaml`.
- CI/CD: nao detectado em `.github/workflows`.
- Docker: `Dockerfile` e `docker-compose.yml` nao detectados.

## Contagem superficial de arquivos

Escopo contado: `src`, `drizzle`, `scripts`, `docs` e exemplos sinteticos versionados de `data/dry-run/input/examples`.

| Extensao | Arquivos |
| --- | ---: |
| `.css` | 1 |
| `.ts` | 195 |
| `.tsx` | 55 |
| `.md` | 36 |
| `.sql` | 8 |
| `.mjs` | 9 |
| `.csv` | 11 |
| `.json` | 9 |

Total observado nesse recorte: 324 arquivos, excluindo `.gitkeep`.

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
| `scripts/ops/check-data-dry-run-readiness.mjs` | Dry-run seguro de dados por arquivos locais |
| `scripts/ops/import-staging.mjs` | Importacao controlada staging/dev remoto |
| `scripts/ops/check-staging-import-smoke.mjs` | Smoke pos-importacao staging/dev remoto |

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
- `data-dry-run`: contratos CSV/JSON, normalizacao em memoria, reconciliacao de inventario e relatorio seguro para dados Must.
- `staging-import`: preflight staging/dev remoto, bloqueio de producao, dry-run gate, upsert seguro, reset protegido, relatorios e smoke pos-importacao.
- `db`: schema Drizzle e cliente.
- `lib`: utilitarios transversais.
- `operations`: documentacao e scripts seguros para staging/producao/dry-run/import staging sem deploy, migration real, banco real de producao, import producao ou upload real automatico.

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
- Smoke staging import: `src/tests/e2e/staging-import-smoke.spec.ts`.
- Configuracoes: `vitest.config.ts`, `playwright.config.ts`.
- Frameworks: Vitest, Testing Library, Playwright.

## Artefatos Reversa/Forward existentes

- `_reversa_forward/001-fase-3-neon-drizzle` ate `_reversa_forward/024-fase-16-staging-import`.
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

## Estado pos-Fase 14

- Commit funcional de referencia: `cc19f27 feat: add controlled data dry-run readiness`.
- Fase 14 criou a estrutura segura `data/dry-run/input/`, com `.gitkeep` e exemplos sinteticos CSV versionados.
- Fase 14 adicionou `src/features/data-dry-run`, com descoberta segura de entrada, parser CSV/JSON, scanner de seguranca, normalizadores de categorias/produtos/imagens/cupons/frete e reconciliacao.
- O script `pnpm ops:check-data-dry-run` roda por padrao sobre `data/dry-run/input/examples`, escreve relatorios em `data/dry-run/output/` e retorna `go/no-go` sem persistir dados.
- Divergencias classificadas: `UNSAFE_INPUT`, `INPUT_MISSING`, `INVALID_HEADER`, `INVALID_VALUE`, `DUPLICATE_KEY`, `UNKNOWN_REFERENCE`, `IMAGE_MISSING` e `SHIPPING_COVERAGE_MISSING`.
- Validacoes reportadas: `pnpm lint`, `pnpm typecheck`, `pnpm test` (43 arquivos / 121 testes), `pnpm build`, `pnpm test:e2e` (36 testes) e `pnpm ops:check-data-dry-run`.
- Dry-run com exemplos sinteticos passou com `go`, 0 bloqueadores e 0 avisos; dry-run com fonte real aprovada ainda nao foi executado.
- Nenhuma importacao real, upload real, migration real, conexao com banco real, deploy, segredo exposto ou alteracao no Laravel legado foi executada.

## Estado pos-Fase 15

- Commit funcional de referencia: `9c2b77d feat: implement approved data dry run`.
- A Fase 15 preparou a execucao aprovada `data/dry-run/input/primeira-execucao/` sem versionar dados reais.
- Quando os arquivos reais/exportados nao existem, o dry-run retorna `pending-input`, gera relatorio de pendencia e nao falha como `no-go`.
- Contratos primarios da execucao aprovada: `product_images.csv/json`, `inventory.csv/json` e `shipping.csv/json`, preservando aliases da Fase 14 (`product-images.*` e `shipping-rules.*`).
- A reconciliacao de inventario ocorre em memoria; nao cria migration, tabela, seed, importacao real ou conexao com banco.
- Divergencias passam a carregar origem `dados`, `next`, `mapeamento` ou `humana`, alem de flag para item corrigivel no Next.
- Relatorios continuam em `data/dry-run/output/`, ignorados pelo Git, com resumo sanitizado separado de saidas brutas.
- Validacoes reportadas: `pnpm lint`, `pnpm typecheck`, `pnpm test` (45 arquivos / 128 testes), `pnpm build`, `pnpm test:e2e` (36 testes) e `pnpm ops:check-data-dry-run`.
- Smoke com exemplos sinteticos retornou `go`; smoke da `primeira-execucao` sem arquivos retornou `pending-input` com 5 pendencias humanas.
- Nenhuma importacao real, upload real, migration real, conexao com banco real, deploy, segredo exposto, alteracao funcional adicional ou alteracao no Laravel legado foi executada nesta re-extracao.

## Estado pos-Fase 16

- Commit funcional de referencia: `b7f871b feat: implement approved staging import`.
- A Fase 16 adicionou `src/features/staging-import/` para preparar importacao controlada em staging/dev remoto, mantendo producao bloqueada.
- O preflight exige ambiente staging/dev remoto, `STAGING_DATABASE_URL` presente sem imprimir valor, aprovacao humana, backup/snapshot quando aplicavel e dry-run anterior em `go` ou sem bloqueio critico.
- Ausencia dos arquivos aprovados em `data/dry-run/input/primeira-execucao/` permanece estado seguro `pending-input`, sem conectar banco e sem tentar importar.
- A escrita padrao planejada e upsert seguro em staging; reset/limpeza so e permitido com backup confirmado, flag explicita, aprovacao humana e ambiente nao produtivo.
- Scripts operacionais adicionados: `pnpm ops:import-staging` e `pnpm ops:check-staging-import-smoke`.
- Relatorios de importacao/staging, divergencias, rollback e checklist humano ficam voltados a ambiente controlado, sem versionar dados reais sensiveis.
- Validacoes reportadas: `pnpm lint`, `pnpm typecheck`, `pnpm test` (48 arquivos / 138 testes), `pnpm build` e `pnpm test:e2e` (36 passed / 1 skipped esperado sem `STAGING_IMPORT_SMOKE_URL`).
- Nenhum codigo funcional novo foi alterado nesta re-extracao; nenhuma producao, deploy, migration real, banco real, segredo exposto ou alteracao no Laravel legado foi executada.

## Organizacao sugerida

Sugestao do Scout: `hybrid`.

Racional: o projeto combina rotas App Router em `src/app`, dominios em `src/features` e testes E2E orientados a comportamento.
