# Dependencies — triade-essenza-next

> Data: 2026-06-08  
> Escopo: re-extracao pos-Fase 3  
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Dependencias de runtime

| Pacote | Papel | Uso confirmado |
|---|---|---|
| `next` | App Router, rotas e build | `src/app/**` |
| `react`, `react-dom` | UI | componentes e paginas |
| `drizzle-orm` | ORM | `src/db/client.ts`, `src/db/schema.ts`, repository |
| `@neondatabase/serverless` | Client Neon HTTP | `src/db/client.ts`, `scripts/db/seed.mjs` |
| `zod` | Validacao | env, produtos, upload |
| `@vercel/blob` | Upload Blob | `src/features/uploads/product-image-upload.ts` |
| `react-hook-form`, `@hookform/resolvers` | Formularios | dependencia instalada; formulario atual usa server actions |
| `lucide-react` | Icones UI | dependencia instalada |
| `stripe` | Pagamentos futuros | webhook placeholder; checkout real fora da Fase 3 |

## Dependencias de desenvolvimento

| Pacote | Papel |
|---|---|
| `typescript` | Typecheck |
| `eslint`, `eslint-config-next` | Lint |
| `vitest`, `jsdom`, `@testing-library/*` | Testes unitarios |
| `@playwright/test` | E2E |
| `drizzle-kit` | Generate/migrate/studio |
| `tailwindcss`, `@tailwindcss/postcss`, `postcss`, `autoprefixer` | CSS |

## Scripts relevantes

| Script | Comando | Observacao |
|---|---|---|
| `lint` | `eslint . --max-warnings=0` | Validacao final Fase 3 passou. |
| `typecheck` | `tsc --noEmit` | Validacao final Fase 3 passou. |
| `test` | `vitest run` | Validacao final Fase 3 passou. |
| `build` | `next build` | Validacao final Fase 3 passou. |
| `test:e2e` | `playwright test` | Validacao final Fase 3 passou. |
| `db:generate` | `drizzle-kit generate` | Gera migration local; nao aplica banco. |
| `db:migrate` | `node scripts/db/require-database-url.mjs && drizzle-kit migrate` | Bloqueia sem alvo; exige validacao humana antes de uso real. |
| `db:studio` | `drizzle-kit studio` | Inspecao. |
| `db:seed` | `node scripts/db/seed.mjs` | Seed ficticio; falha sem `DATABASE_URL`. |

## Integracoes externas

| Integracao | Estado | Guardrail |
|---|---|---|
| Neon Postgres | Preparado, nao conectado nesta re-extracao | Nao rodar migrations sem validacao humana. |
| Vercel Blob | Preparado, bloqueado sem token | Nao fazer upload real sem `BLOB_READ_WRITE_TOKEN`. |
| Stripe | Placeholder/dependencia | Checkout/pagamento fora do escopo atual. |
| Vercel Hosting | Planejado | Deploy fora do escopo atual. |
