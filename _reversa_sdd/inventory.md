# Inventario Reversa — triade-essenza-next

Atualizado em: 2026-06-08T10:59:45-03:00

## Escopo desta atualizacao

Esta atualizacao registra o estado do novo projeto Next.js antes da Fase 3. Nao executa Scout,
Archaeologist, migrations, deploy, conexao real com banco, upload real, push ou commit.

## Diretorio

- Projeto atual: `D:\Projetos\triade-essenza-next`
- Projeto Laravel legado: `D:\Projetos\triadeessenzaparfum.com.br`
- Confirmacao: este inventario pertence ao projeto Next.js, nao ao legado Laravel.

## Git

- Branch: `main`
- Estado observado: `main...origin/main`
- Ultimo commit observado: `f10386c feat: implement admin product management foundation`
- Commit base da fundacao/Fase 1: `1fed8bf742411a0308d605e6bedf489445667680`
- Commit da Fase 2: `f10386c8e0526236b43da2fb17847e4532cb895f`
- Observacao: o prompt informava `ahead 1`, mas o Git local confirmou que `main` esta sincronizada com `origin/main`.

## Fundacao

- Next.js com App Router, TypeScript, Tailwind, ESLint, Vitest e Playwright.
- Drizzle/Neon preparado em schema e client sem exigir `DATABASE_URL` para build/test local.
- Health check e placeholders iniciais de storefront/admin/customer.
- `.env.example` versionado sem segredos reais.

## Fase 1 — Catalogo, Produto e Imagens

- Dominio de produtos em `src/features/products`.
- Regras publicas implementadas:
  - `published`;
  - `publishedAt <= now`;
  - `stockQuantity > 0`.
- `draft`, produto futuro, produto sem estoque e `inactive` nao ficam publicos.
- `inactive` segue tratado como inativo/arquivado provisorio, pendente validacao humana.
- Storefront:
  - `/produtos`;
  - `/produto/[slug]`.
- Imagens:
  - capa por `isCover`;
  - fallback tecnico por `sortOrder`;
  - metadata preparada para `product_images`;
  - binario nao deve ser salvo no banco.
- Fixtures/dev fallback em `src/features/products/dev/fixtures.ts`.

## Fase 2 — Admin de Produtos

- Admin:
  - `/admin/produtos`;
  - `/admin/produtos/novo`;
  - `/admin/produtos/[id]/editar`;
  - `/admin/categorias` como suporte inicial de selecao.
- Componentes:
  - `product-form`;
  - `product-admin-table`;
  - `product-image-manager`;
  - `product-status-select`;
  - `price-input`.
- Server/domain:
  - `productFormSchema`;
  - server actions de criar/editar;
  - repository preparado para Drizzle/Neon;
  - fallback `dev_fallback` sem `DATABASE_URL`.
- Upload controlado:
  - aceita `image/jpeg`, `image/png`, `image/webp`;
  - limite atual: 5 MB;
  - sem `BLOB_READ_WRITE_TOKEN`, retorna bloqueio controlado;
  - sem upload real durante testes sem token.

## Artefatos locais usados como fonte

- `docs/features/catalog-products-images.md`
- `docs/features/admin-products.md`
- `docs/architecture/database.md`
- `docs/architecture/uploads.md`
- `docs/migration/handoff-summary.md`

## Artefatos legado usados como referencia

O caminho solicitado `D:\Projetos\triadeessenzaparfum.com.br_reversa_sdd` nao existe nesta maquina.
Os artefatos foram lidos como referencia em:

- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\handoff.md`
- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\database-plan.md`
- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\uploads-plan.md`
- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\implementation-roadmap.md`

## Proxima fase planejada

Fase 3: conexao real com Neon/Drizzle, migrations locais, seed controlado e persistencia real de
produtos/categorias/imagens.

## Guardrails da Fase 3

- Nao rodar migrations contra banco real sem validacao humana.
- Nao usar credenciais reais no chat ou em arquivos versionados.
- Nao fazer upload real sem `BLOB_READ_WRITE_TOKEN`.
- Nao ativar checkout, pagamento, frete ou cupom nesta fase de catalogo/persistencia.
- Manter fallback local seguro quando `DATABASE_URL` estiver ausente.

## Lacunas pendentes

- Autenticacao/policy real para admin.
- Decisao final sobre semantica de `inactive`.
- Estrategia de migracao das imagens reais existentes.
- Definicao final de Blob publico versus privado/signed URLs.
- Seeds controlados e migrations revisadas antes de qualquer aplicacao em banco.
