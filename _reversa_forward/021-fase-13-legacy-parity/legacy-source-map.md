# Legacy Source Map

> Feature: `021-fase-13-legacy-parity`
> Objetivo: separar fontes de evidencia permitidas para a comparacao Laravel x Next.

## Fontes Next

| Fonte | Uso na Fase 13 | Observacao |
|-------|----------------|------------|
| `src/app` | Rotas e superficies App Router | Storefront, customer, admin e APIs |
| `src/features` | Implementacao por dominio | Products, cart, coupons, shipping, checkout, orders, payments, notifications, uploads |
| `src/db/schema.ts` | Modelo alvo para migracao | Tabelas Drizzle de auth, catalogo, carrinho, frete, pedido, pagamento, notificacao e fiscal |
| `src/tests` | Evidencia de comportamento | Unit e E2E dos fluxos centrais |
| `docs/operations` | Readiness operacional | Neon, Vercel, Stripe, Blob, env, migrations e go-live |
| `scripts/ops` | Checks seguros | `ops:check-env`, `ops:check-migrations`, `ops:check-build`, `ops:check-smoke` |
| `_reversa_sdd` | Estado Reversa consolidado | Arquitetura, dominio, dados e deployment pos-Fase 12 |

## Fontes Laravel read-only

| Fonte | Uso na Fase 13 | Observacao |
|-------|----------------|------------|
| `routes/web.php` | Storefront, catalogo, carrinho, checkout e pagamento Stripe legado |
| `routes/admin.php` | Backoffice, catalogo admin, pedidos, cupons, relatorios, fiscal e Bling |
| `routes/customer.php` | Minha conta, perfil, enderecos, pedidos e documentos |
| `routes/webhooks.php` | Stripe, Melhor Envio e Bling NF-e |
| `app/Actions` | Regras de dominio e operacao | 45+ actions agrupadas por dominio na amostra lida |
| `app/Http/Controllers` | Superficies HTTP | Admin, Auth, Cart, Checkout, Customer, Payments, Storefront e Webhooks |
| `database/migrations` | Entidades e deltas legados | 24 migrations no recorte lido |
| `resources/views` | Telas e estados Blade | Admin, customer, storefront, e-mails e componentes |
| `public/products`, `Imagens` | Assets legados de produto | 37 arquivos encontrados no recorte contado |

## Fontes explicitamente excluidas

- `.env`, `.env.*`, dumps, backups, storage privado e logs com possibilidade de secrets.
- Banco real, filas, comandos artisan e providers externos.
- Qualquer credencial real de Stripe, Neon, Vercel Blob, e-mail, Bling, Melhor Envio ou Correios.
