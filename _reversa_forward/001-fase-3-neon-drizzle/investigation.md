# Investigation: Fase 3 - Neon/Drizzle

> Data: `2026-06-08`  
> Feature: `001-fase-3-neon-drizzle`

## 1. Fontes consultadas

| Fonte | Uso no plano |
|-------|--------------|
| `requirements.md` | Fonte principal de escopo, guardrails, criterios de aceite e decisoes humanas. |
| `doubts.md` | Confirmacao das cinco decisoes resolvidas. |
| `audit/requirements-audit.md` | Confirmacao de qualidade aprovada e ausencia de duvidas. |
| `_reversa_sdd/inventory.md` | Estado atual do projeto Next.js e guardrails da Fase 3. |
| `docs/architecture/database.md` | Estado do schema e repository preparado. |
| `docs/architecture/uploads.md` | Regras de Blob, metadata e bloqueio sem token. |
| `docs/operations/neon.md` | Neon como banco alvo e proibicao de migrate sem validacao. |
| `docs/operations/env.md` | Variaveis opcionais e ausencia de secrets. |
| `docs/features/admin-products.md` | Contrato admin, fallback e pendencias. |
| `docs/features/catalog-products-images.md` | Regras publicas e fixtures. |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\database-plan.md` | Modelo legado->Neon para catalogo. |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\uploads-plan.md` | Fluxo de imagens e metadata. |

## 2. Observacoes do codigo atual

- `drizzle.config.ts` usa `DATABASE_URL` ou placeholder local, o que e aceitavel para generate, mas precisa documentacao/guardrail para migrate.
- `src/db/client.ts` ja retorna `db = null` sem `DATABASE_URL`.
- `src/db/schema.ts` ja contem tabelas amplas, mas precisa revisao de indices/unique para catalogo antes de migration local.
- `product-repository.ts` escolhe repository fixture quando `db === null`.
- `createDrizzleProductRepository` ainda usa fixtures para listagens e buscas mesmo quando `db` existe.
- Criacao/edicao Drizzle grava `products` e `product_categories`, mas ainda nao trata imagens e deve ser transacional.
- `product-service.ts` ja centraliza listagem publica/admin e deve continuar sendo a porta das paginas.
- `product-actions.ts` retorna `success` para qualquer resultado do repository; precisa distinguir persisted, fallback e bloqueio por ambiente.
- `product-image-upload.ts` valida tipo/tamanho e bloqueia sem token, mas ainda nao persiste metadata.
- `package.json` tem `db:generate`, `db:migrate`, `db:studio`; falta `db:seed`.

## 3. Alternativas avaliadas

| Alternativa | Resultado | Motivo |
|-------------|-----------|--------|
| Exigir `DATABASE_URL` para qualquer build/test | Descartada | Viola criterio de aceite e modo local seguro. |
| Manter fixtures mesmo com `DATABASE_URL` | Descartada | Nao entrega persistencia real da Fase 3. |
| Liberar mutacao real em preview/producao sem auth | Descartada | Viola decisao humana e cria risco operacional. |
| Criar API HTTP nova para catalogo/admin | Descartada nesta fase | App Router/server actions ja existem; nao ha contrato externo novo requerido. |
| Persistir imagem antes do Blob | Descartada | Pode gerar metadata falsa sem arquivo real. |
| Seed sem imagens | Descartada | Clarificacao definiu imagens placeholder seguras. |

## 4. Padroes aplicaveis

- Repository como fronteira unica entre service/pages/actions e fonte de dados.
- Fallback explicito apenas por ausencia de `DATABASE_URL`.
- Erro operacional quando ha `DATABASE_URL` e a operacao Drizzle falha.
- Seed com identificadores estaveis por slug/SKU para reexecucao controlada.
- Guardrail por ambiente para mutacao admin enquanto auth nao existe.
- Metadata de imagem persistida somente apos upload Blob bem-sucedido.

## 5. Pontos que o `/reversa-to-do` deve decompor

1. Criar helper de modo de banco/ambiente.
2. Completar repository Drizzle com joins e mapeadores.
3. Definir transacoes de produto, categorias e imagens.
4. Criar seed e script.
5. Gerar/revisar migrations locais.
6. Adicionar testes de fallback, guardrail, regras publicas, seed e scripts.
7. Atualizar docs operacionais.

## 6. Bloqueadores

Nenhum bloqueador para plano. A execucao de migrations contra banco real continua bloqueada ate validacao humana explicita em etapa posterior.
