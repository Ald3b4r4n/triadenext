# Architecture — triade-essenza-next

> Projeto analisado: `D:\Projetos\triade-essenza-next`
> Data: `2026-06-08`
> Escopo: re-extracao pos-Fase 5
> Confirmacao: este documento descreve o projeto Next.js atual, nao o Laravel legado.
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Visao geral

O projeto `triade-essenza-next` e uma reconstrucao em Next.js App Router da Tríade Essenza Parfum.
A arquitetura separa superficies de storefront, admin, customer/auth e APIs em `src/app`, dominio de
catalogo em `src/features/products`, upload em `src/features/uploads`, auth em `src/features/auth`,
carrinho em `src/features/cart`, banco em `src/db` e runtime/env em `src/lib`. 🟢

Fases registradas:

- Fundacao Next.js concluida. 🟢
- Fase 1 de catalogo/produtos/imagens concluida. 🟢
- Fase 2 de admin de produtos concluida. 🟢
- Fase 3 de persistencia Neon/Drizzle preparada concluida no commit `3774c49`. 🟢
- Fase 4 de Better Auth, sessao server-side e policies concluida no commit `fcdb929`. 🟢
- Fase 5 de carrinho e sessao de compra concluida no commit `7215cf1`. 🟢

## 2. Stack

| Camada | Tecnologia | Estado | Confianca |
|---|---|---|---|
| App web | Next.js App Router + React | Presente em `src/app`. | 🟢 |
| Linguagem | TypeScript | Presente em codigo e config. | 🟢 |
| Estilo | Tailwind CSS | Presente em config/global CSS. | 🟢 |
| Auth | Better Auth + `nextCookies` | Integrado em `src/features/auth/server/auth.ts`. | 🟢 |
| Sessao | Better Auth server-side via headers | Normalizada em `session.ts`. | 🟢 |
| Validacao | Zod | Usado em env, produtos, upload e auth. | 🟢 |
| Banco alvo | Neon Postgres | Preparado via Drizzle/Neon. | 🟢 |
| ORM | Drizzle ORM + Drizzle Kit | Schema, client, migrations e scripts existem. | 🟢 |
| Upload | Vercel Blob | Integrado com bloqueio sem token e policy admin-like. | 🟢 |
| Carrinho | Server actions + Drizzle/fallback | Implementado em `src/features/cart`. | 🟢 |
| Testes | Vitest + Playwright | Suites unit/e2e passam sem banco real. | 🟢 |

## 3. Runtime e guardrails

Arquivo central: `src/lib/runtime-mode.ts`. 🟢

Responsabilidades:

- expor flags seguras de banco, Blob e auth sem expor valores;
- detectar `development`, `test`, `preview` e `production`;
- declarar `isAuthReady` quando banco e secret de auth estao configurados;
- manter fallback sem banco para build/test;
- centralizar mensagens de fallback, bloqueio, auth indisponivel, carrinho indisponivel e acesso negado.

`src/lib/env.ts` valida variaveis opcionais e expõe indicadores booleanos seguros em
`sensitiveRuntimeEnv`; a re-extracao nao leu nem expôs `.env`. 🟢

## 4. Auth e sessao

### Provider

`src/features/auth/server/auth.ts` configura Better Auth server-only. 🟢

- Usa `drizzleAdapter(db, { provider: "pg" })` quando `db` existe.
- Mapeia modelos para `users`, `sessions`, `accounts` e `verifications`.
- Habilita `emailAndPassword`.
- Define campo adicional `role` com valores `customer`, `admin`, `manager` e default `customer`.
- Usa `nextCookies()`.
- Google OAuth e magic link nao estao ativados nesta fase. 🟢

### Endpoint

`src/app/api/auth/[...all]/route.ts` delega `GET` e `POST` para o handler Better Auth. 🟢

### Sessao normalizada

`src/features/auth/server/session.ts` le sessao por `auth.api.getSession({ headers })`, com timeout de
5 segundos e falha segura. 🟢

Contrato:

- `authenticated`: `userId`, `email`, `role`;
- `unauthenticated`: `missing`, `expired`, `invalid`, `timeout` ou `unavailable`.

`validateReturnTo` aceita somente caminhos internos e bloqueia retorno para `/api/auth` ou URL externa. 🟢

## 5. Policies

Arquivo central: `src/features/auth/server/policies.ts`. 🟢

Policies confirmadas:

- `requireAuthenticated`: exige qualquer sessao autenticada.
- `requireAdminLike`: exige banco, auth pronto e role `admin` ou `manager`.
- `requireCustomer`: exige sessao autenticada para area customer.
- `requireOwner`: exige que `session.userId` corresponda ao dono do recurso.

Decisions retornam `allowed`, `unauthenticated`, `forbidden` ou `blocked`, com mensagens seguras por
`policyMessage`. 🟢

## 6. Rotas protegidas

### Admin

`src/app/admin/layout.tsx` chama `requireAdminLike`. 🟢

- Usuario anonimo recebe redirect para `/login?returnTo=/admin`.
- Auth/banco indisponivel ou role insuficiente renderiza bloqueio seguro.
- `admin` e `manager` sao equivalentes no MVP.

### Customer

`src/app/(customer)/layout.tsx` chama `requireCustomer`. 🟢

- `/minha-conta`, `/enderecos` e `/pedidos` ficam sob layout protegido.
- Usuario sem sessao e redirecionado para `/login?returnTo=/minha-conta`.
- Pedidos reais continuam fora do escopo atual.

### Login/cadastro

`/login` e `/cadastro` redirecionam usuario ja autenticado e usam `AuthForm` com server actions. 🟢

## 7. Server actions protegidas

`src/features/products/server/product-actions.ts` chama `requireAdminLike` antes de validar e persistir
criacao/edicao de produto. 🟢

`src/features/uploads/product-image-upload.ts` chama `requireAdminLike` antes de validar arquivo, chamar
Blob ou persistir metadata. 🟢

## 8. Banco e Drizzle

`src/db/schema.ts` modela ecommerce completo e agora inclui suporte de auth:

- enum `user_role`: `customer`, `admin`, `manager`;
- `users` com `emailVerified`, `image`, `passwordHash`, `role`, `mustChangePassword` e `lastLoginAt`;
- `sessions` com token unico, expiracao, IP, user-agent e FK cascade para `users`;
- `accounts` para credenciais/provider e preparo futuro de OAuth;
- `verifications` para fluxos de verificacao/tokens do provider.

Migrations locais:

- `drizzle/0000_shallow_shinko_yamashiro.sql`: schema inicial.
- `drizzle/0001_curvy_blink.sql`: delta local de Better Auth (`accounts`, `sessions`,
  `verifications`, `email_verified`, `image`).
- `drizzle/0002_tiny_enchantress.sql`: delta local de carrinho (`session_id`, `expires_at`,
  `converted_at`, `unit_price_snapshot_cents`, indices e unique por produto no carrinho).

Nenhuma migration foi aplicada contra banco real nesta re-extracao. 🟢

## 9. Carrinho e sessao de compra

Modulo central: `src/features/cart`. 🟢

Arquitetura interna:

- `domain.ts`: subtotal em centavos, validacao de quantidade e produto compravel.
- `schemas.ts`: validacao de inputs de server actions.
- `server/cart-session.ts`: resolucao de ator por sessao Better Auth ou cookie opaco
  `guestCartToken`.
- `server/cart-repository.ts`: repository Drizzle quando `db` existe e fallback dev/test quando
  `db = null`.
- `server/cart-service.ts`: regras de negocio, estoque, ownership, fallback e merge.
- `server/cart-actions.ts`: actions de obter, adicionar, atualizar, remover e limpar carrinho.
- `components/*`: UI de adicionar ao carrinho e renderizacao de itens/subtotal.

Regras arquiteturais confirmadas:

- Cookie anonimo armazena apenas identificador opaco, sem itens/precos/dados sensiveis.
- Carrinho autenticado e resolvido por `session.userId`.
- Actions nao aceitam `cartId`, `userId`, role ou owner como fonte confiavel.
- Sem banco em dev/test, fallback e explicito e nao promete persistencia real.
- Em preview/producao sem banco, carrinho real fica indisponivel de forma segura.
- Login chama merge quando existe `guestCartToken`.
- Checkout/pagamento/frete/cupom/pedido/reserva/baixa de estoque nao foram implementados.

## 10. Seed admin dev

`scripts/db/seed-admin-dev.ts` cria/promove usuario admin apenas em development. 🟢

Guardrails:

- bloqueia fora de development/local-dev;
- exige `DATABASE_URL`, `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD`;
- valida senha minima;
- nao contem senha hardcoded;
- nao roda automaticamente;
- nao foi executado nesta re-extracao.

## 11. Catalogo, repository e upload

As regras de catalogo e persistencia da Fase 3 permanecem preservadas. 🟢

- Sem `DATABASE_URL`, repository usa fixtures e `dev_fallback`.
- Com `DATABASE_URL`, Drizzle/Neon substitui fixtures.
- Produto publico segue exigindo `published`, `publishedAt <= now` e `stockQuantity > 0`.
- Upload real continua bloqueado sem `BLOB_READ_WRITE_TOKEN`.
- Metadata de upload agora tambem exige policy admin-like.
- Pagina publica de produto expõe formulario de adicionar ao carrinho apenas para produto publico.

## 12. Fora de escopo atual

- Google OAuth.
- Magic link.
- Granularidade fina de permissoes alem de `customer`, `admin`, `manager` e ownership.
- Checkout, pagamento, frete, cupom, pedidos reais, reserva/baixa de estoque e documentos fiscais reais.
- Deploy, push ou migrations reais.

## 13. Proxima fase

Abrir a proxima feature com `/reversa-requirements`, usando catalogo, persistencia, auth/policies e
carrinho como base ja confirmada. 🟢
