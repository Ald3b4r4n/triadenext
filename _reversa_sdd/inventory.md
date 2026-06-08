# Inventario Reversa — triade-essenza-next

Atualizado em: 2026-06-08T17:41:00-03:00

## Escopo desta re-extracao

Esta re-extracao registra o estado do projeto Next.js apos a Fase 4
`002-fase-4-auth-policies`, concluida, validada, commitada e enviada ao GitHub.

Nao foram executados migrations, conexoes com banco real, upload real, deploy, push ou alteracoes em
codigo funcional nesta etapa. O Laravel legado permaneceu fora do diretorio de trabalho.

## Diretorio

- Projeto atual: `D:\Projetos\triade-essenza-next`
- Projeto Laravel legado: `D:\Projetos\triadeessenzaparfum.com.br`
- Confirmacao: este inventario pertence ao projeto Next.js, nao ao legado Laravel.

## Git

- Branch: `main`
- Estado observado antes da re-extracao: `main...origin/main`
- Worktree observado antes da re-extracao: limpo
- Commit da Fase 4: `fcdb929843dccbcc0cd2a3049bc5d012f0e2150b`
- Mensagem: `feat: add auth and policy foundation`
- Commits recentes:
  - `fcdb929 feat: add auth and policy foundation`
  - `ea1241f docs: update reversa state after phase 3`
  - `3774c49 feat: prepare neon drizzle persistence for products`
  - `f10386c feat: implement admin product management foundation`
  - `1fed8bf chore: bootstrap triade next foundation and catalog phase 1`

## Fases implementadas

### Fundacao

- Next.js App Router, React, TypeScript, Tailwind, ESLint, Vitest e Playwright.
- Drizzle/Neon configurados sem exigir `DATABASE_URL` para build/test local.
- Health check, superficies iniciais de storefront/admin/customer e `.env.example` sem segredos.

### Fase 1 — Catalogo, produtos e imagens

- Dominio de produtos em `src/features/products`.
- Storefront em `/produtos` e `/produto/[slug]`.
- Regras publicas preservadas:
  - `status = published`;
  - `publishedAt <= now`;
  - `stockQuantity > 0`.
- `draft`, futuro, sem estoque e `inactive` nao ficam publicos.
- Imagens usam `isCover`, `sortOrder` e metadata; binario nao entra no banco.

### Fase 2 — Admin de produtos

- Admin em `/admin/produtos`, `/admin/produtos/novo` e `/admin/produtos/[id]/editar`.
- Formulario validado com Zod, server actions e repository.
- Upload controlado aceita JPEG, PNG e WebP ate 5 MB.
- Sem `BLOB_READ_WRITE_TOKEN`, upload retorna bloqueio controlado.

### Fase 3 — Neon/Drizzle, migrations locais e seed

- Runtime seguro em `src/lib/runtime-mode.ts`.
- `src/db/client.ts` exporta `db = null` sem `DATABASE_URL`.
- `src/db/schema.ts` expressa uniques/indices de catalogo, N:N e capa unica parcial.
- Migration local gerada: `drizzle/0000_shallow_shinko_yamashiro.sql`.
- Migration nao aplicada contra banco real.
- Repository Drizzle/fallback implementado para catalogo, admin de produtos e metadata de imagens.

### Fase 4 — Auth real, sessao e policies

- Better Auth integrado em `src/features/auth/server/auth.ts` com adapter Drizzle quando `db` existe.
- Route handler do provider em `src/app/api/auth/[...all]/route.ts`.
- Login, cadastro e logout por e-mail/senha via server actions em `src/features/auth/server/actions.ts`.
- Cadastro publico customer-only; role enviada pelo cliente nao e usada para criar admin/manager.
- Sessao server-side normalizada em `src/features/auth/server/session.ts` com `userId`, `email` e `role`.
- Roles reais: `customer`, `admin`, `manager`.
- `admin` e `manager` sao equivalentes no MVP para acesso administrativo.
- Policies reais em `src/features/auth/server/policies.ts`:
  - `requireAuthenticated`;
  - `requireAdminLike`;
  - `requireCustomer`;
  - `requireOwner`.
- `/admin/**` protegido por `src/app/admin/layout.tsx`.
- Area customer protegida por `src/app/(customer)/layout.tsx`.
- Server actions administrativas de produto e upload exigem `requireAdminLike`.
- Seed admin dev controlado em `scripts/db/seed-admin-dev.ts`.
- Migration local de auth gerada: `drizzle/0001_curvy_blink.sql`.
- Migration de auth nao aplicada contra banco real.
- Google OAuth, magic link e granularidade fina de permissoes ficaram fora do escopo atual.

## Validacoes registradas da Fase 4

- `pnpm lint`: passou.
- `pnpm typecheck`: passou.
- `pnpm test`: passou.
- `pnpm build`: passou.
- `pnpm test:e2e`: passou.

## Artefatos Reversa da Fase 4

- `_reversa_forward/002-fase-4-auth-policies/requirements.md`
- `_reversa_forward/002-fase-4-auth-policies/roadmap.md`
- `_reversa_forward/002-fase-4-auth-policies/actions.md`
- `_reversa_forward/002-fase-4-auth-policies/progress.jsonl`
- `_reversa_forward/002-fase-4-auth-policies/legacy-impact.md`
- `_reversa_forward/002-fase-4-auth-policies/regression-watch.md`

## Guardrails atuais

- Nao ler, copiar ou expor `.env`.
- Nao expor `DATABASE_URL`.
- Nao rodar migrations sem validacao humana.
- Nao conectar banco real nesta re-extracao.
- Nao fazer upload real sem `BLOB_READ_WRITE_TOKEN`.
- Nao fazer deploy.
- Nao fazer push nesta etapa.
- Nao implementar checkout, pagamento, frete, cupom ou pedidos nesta fase.
- Nao modificar o Laravel legado.

## Proxima fase recomendada

Fase 5 recomendada: abrir a proxima feature com requisitos novos, mantendo auth/policies como base
ja implementada. Sugestao natural: conta customer/enderecos ou carrinho/checkout, conforme decisao
de produto.

Comando recomendado para abrir o ciclo: `/reversa-requirements`.
