# Inventario Reversa — triade-essenza-next

Atualizado em: 2026-06-08T12:35:00-03:00

## Escopo desta re-extracao

Esta re-extracao registra o estado do projeto Next.js apos a Fase 3
`001-fase-3-neon-drizzle`, concluida, validada, commitada e enviada ao GitHub.

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
- Commit da Fase 3: `3774c49b930b8edc0af004517749d287d2259a1a`
- Mensagem: `feat: prepare neon drizzle persistence for products`
- Commits recentes:
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
- Scripts de banco:
  - `pnpm db:generate`;
  - `pnpm db:migrate`;
  - `pnpm db:studio`;
  - `pnpm db:seed`.
- Seed ficticio em `scripts/db/seed.mjs`, bloqueado sem `DATABASE_URL`.
- Repository Drizzle/fallback implementado para:
  - listar produtos admin;
  - buscar por id;
  - buscar por slug;
  - listar categorias;
  - listar imagens;
  - criar produto com categorias;
  - editar produto com substituicao de categorias;
  - persistir metadata de imagem.
- Admin exibe aviso de modo sem banco e de painel sem auth real.
- Storefront continua via service/repository.
- Preview/producao bloqueiam mutacao real sem Fase 4 de auth/policies.

## Validacoes registradas da Fase 3

- `pnpm lint`: passou.
- `pnpm typecheck`: passou.
- `pnpm test`: passou.
- `pnpm build`: passou.
- `pnpm test:e2e`: passou.

## Artefatos Reversa da Fase 3

- `_reversa_forward/001-fase-3-neon-drizzle/actions.md`
- `_reversa_forward/001-fase-3-neon-drizzle/progress.jsonl`
- `_reversa_forward/001-fase-3-neon-drizzle/legacy-impact.md`
- `_reversa_forward/001-fase-3-neon-drizzle/regression-watch.md`

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

Fase 4: autenticacao e policies reais de admin/customer.

Comando recomendado para abrir o ciclo: `/reversa-requirements`.
