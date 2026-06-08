# Dependencies — triade-essenza-next

> Data: 2026-06-08
> Escopo: re-extracao pos-Fase 4
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Dependencias de runtime

| Pacote | Papel | Uso confirmado |
|---|---|---|
| `next` | App Router, rotas, server actions e build | `src/app/**` |
| `react`, `react-dom` | UI | componentes e paginas |
| `better-auth` | Auth provider, e-mail/senha, sessao e route handler | `src/features/auth/server/auth.ts`, `src/app/api/auth/[...all]/route.ts` |
| `@better-auth/drizzle-adapter` | Adapter Better Auth para Drizzle/Postgres | `src/features/auth/server/auth.ts` |
| `server-only` | Restringir modulos sensiveis ao servidor | `src/features/auth/server/*` |
| `drizzle-orm` | ORM | `src/db/client.ts`, `src/db/schema.ts`, repository, seed admin dev |
| `@neondatabase/serverless` | Client Neon HTTP | `src/db/client.ts`, `scripts/db/seed*.mjs/ts` |
| `zod` | Validacao | env, produtos, upload e auth |
| `@vercel/blob` | Upload Blob | `src/features/uploads/product-image-upload.ts` |
| `react-hook-form`, `@hookform/resolvers` | Formularios | dependencia instalada; auth atual usa `useActionState` e server actions |
| `lucide-react` | Icones UI | dependencia instalada |
| `stripe` | Pagamentos futuros | webhook placeholder; checkout real fora da Fase 4 |

## Dependencias de desenvolvimento

| Pacote | Papel |
|---|---|
| `typescript` | Typecheck |
| `eslint`, `eslint-config-next` | Lint |
| `vitest`, `jsdom`, `@testing-library/*` | Testes unitarios |
| `@playwright/test` | E2E |
| `drizzle-kit` | Generate/migrate/studio |
| `tsx` | Executar seed admin dev TypeScript |
| `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `autoprefixer` | CSS |

## Scripts relevantes

| Script | Comando | Observacao |
|---|---|---|
| `lint` | `eslint . --max-warnings=0` | Validacao final Fase 4 passou. |
| `typecheck` | `tsc --noEmit` | Validacao final Fase 4 passou. |
| `test` | `vitest run` | Validacao final Fase 4 passou. |
| `build` | `next build` | Validacao final Fase 4 passou. |
| `test:e2e` | `playwright test` | Validacao final Fase 4 passou. |
| `db:generate` | `drizzle-kit generate` | Gera migration local; nao aplica banco. |
| `db:migrate` | `node scripts/db/require-database-url.mjs && drizzle-kit migrate` | Bloqueia sem alvo; exige validacao humana antes de uso real. |
| `db:studio` | `drizzle-kit studio` | Inspecao. |
| `db:seed` | `node scripts/db/seed.mjs` | Seed ficticio; falha sem `DATABASE_URL`. |
| `db:seed:admin-dev` | `tsx scripts/db/seed-admin-dev.ts` | Seed admin dev controlado; nao roda automaticamente. |

## Integracoes externas

| Integracao | Estado | Guardrail |
|---|---|---|
| Better Auth | Ativo para e-mail/senha, sessao e cookies | Sem Google OAuth/magic link nesta fase. |
| Neon Postgres | Preparado, nao conectado nesta re-extracao | Nao rodar migrations sem validacao humana. |
| Vercel Blob | Preparado, bloqueado sem token | Upload exige `BLOB_READ_WRITE_TOKEN` e policy admin-like. |
| Stripe | Placeholder/dependencia | Checkout/pagamento fora do escopo atual. |
| Vercel Hosting | Planejado | Deploy fora do escopo atual. |

## Dependencias fora do escopo atual

- Google OAuth provider.
- Magic link/e-mail transacional de login.
- Provedor de permissoes granulares por recurso.
