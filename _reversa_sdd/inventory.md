# Inventario tecnico Reversa - Triade Essenza Next

Atualizado em: 2026-06-11
Agente: Scout
Escopo: mapeamento de superficie do projeto Next.js atual.

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
| `.ts` | 136 |
| `.tsx` | 55 |
| `.md` | 31 |
| `.sql` | 8 |
| `.mjs` | 2 |

Total observado nesse recorte: 242 arquivos.

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

## Banco de dados

- ORM/schema: `src/db/schema.ts`.
- Configuracao Drizzle: `drizzle.config.ts`.
- Migrations: `drizzle/0000_shallow_shinko_yamashiro.sql` ate `drizzle/0007_outstanding_midnight.sql`.
- Metadados Drizzle: `drizzle/meta/*.json`.
- Scripts DB: `scripts/db/seed.mjs`, `scripts/db/seed-admin-dev.ts`, `scripts/db/require-database-url.mjs`.

## Testes

- Unit/integration: `src/tests/unit/*.test.ts` e `src/tests/unit/*.test.tsx`.
- E2E: `src/tests/e2e/*.spec.ts`.
- Configuracoes: `vitest.config.ts`, `playwright.config.ts`.
- Frameworks: Vitest, Testing Library, Playwright.

## Artefatos Reversa/Forward existentes

- `_reversa_forward/001-fase-3-neon-drizzle` ate `_reversa_forward/008-fase-10-notificacoes-email`.
- Trilhas de migracao geral abertas: `_reversa_forward/009-*` ate `_reversa_forward/018-*`.
- `_reversa_sdd/migration` e `_reversa_sdd/design-system` existem como planejamento.

## Organizacao sugerida

Sugestao do Scout: `hybrid`.

Racional: o projeto combina rotas App Router em `src/app`, dominios em `src/features` e testes E2E orientados a comportamento.
