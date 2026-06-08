# Architecture — triade-essenza-next

> Projeto analisado: `D:\Projetos\triade-essenza-next`
> Data: `2026-06-08`
> Escopo: re-extracao pos-Fase 4
> Confirmacao: este documento descreve o projeto Next.js atual, nao o Laravel legado.
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Visao geral

O projeto `triade-essenza-next` e uma reconstrucao em Next.js App Router da Tríade Essenza Parfum.
A arquitetura separa superficies de storefront, admin, customer/auth e APIs em `src/app`, dominio de
catalogo em `src/features/products`, upload em `src/features/uploads`, auth em `src/features/auth`,
banco em `src/db` e runtime/env em `src/lib`. 🟢

Fases registradas:

- Fundacao Next.js concluida. 🟢
- Fase 1 de catalogo/produtos/imagens concluida. 🟢
- Fase 2 de admin de produtos concluida. 🟢
- Fase 3 de persistencia Neon/Drizzle preparada concluida no commit `3774c49`. 🟢
- Fase 4 de Better Auth, sessao server-side e policies concluida no commit `fcdb929`. 🟢

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
| Testes | Vitest + Playwright | Suites unit/e2e passam sem banco real. | 🟢 |

## 3. Runtime e guardrails

Arquivo central: `src/lib/runtime-mode.ts`. 🟢

Responsabilidades:

- expor flags seguras de banco, Blob e auth sem expor valores;
- detectar `development`, `test`, `preview` e `production`;
- declarar `isAuthReady` quando banco e secret de auth estao configurados;
- manter fallback sem banco para build/test;
- centralizar mensagens de fallback, bloqueio, auth indisponivel e acesso negado.

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

Nenhuma migration foi aplicada contra banco real nesta re-extracao. 🟢

## 9. Seed admin dev

`scripts/db/seed-admin-dev.ts` cria/promove usuario admin apenas em development. 🟢

Guardrails:

- bloqueia fora de development/local-dev;
- exige `DATABASE_URL`, `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD`;
- valida senha minima;
- nao contem senha hardcoded;
- nao roda automaticamente;
- nao foi executado nesta re-extracao.

## 10. Catalogo, repository e upload

As regras de catalogo e persistencia da Fase 3 permanecem preservadas. 🟢

- Sem `DATABASE_URL`, repository usa fixtures e `dev_fallback`.
- Com `DATABASE_URL`, Drizzle/Neon substitui fixtures.
- Produto publico segue exigindo `published`, `publishedAt <= now` e `stockQuantity > 0`.
- Upload real continua bloqueado sem `BLOB_READ_WRITE_TOKEN`.
- Metadata de upload agora tambem exige policy admin-like.

## 11. Fora de escopo atual

- Google OAuth.
- Magic link.
- Granularidade fina de permissoes alem de `customer`, `admin`, `manager` e ownership.
- Checkout, pagamento, frete, cupom, pedidos reais e documentos fiscais reais.
- Deploy, push ou migrations reais.

## 12. Proxima fase

Abrir a proxima feature com `/reversa-requirements`, usando auth/policies como base ja confirmada. 🟢
