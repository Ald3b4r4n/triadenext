# Legacy Impact — 001-fase-3-neon-drizzle

> Data: 2026-06-08  
> Projeto atual: `D:\Projetos\triade-essenza-next`  
> Legado Laravel: somente referencia; nenhum arquivo do legado foi modificado.

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `src/lib/runtime-mode.ts` | Runtime/env | regra-nova | HIGH | Define modo com banco, sem banco, Blob e guardrail de mutacao real sem expor secrets. |
| `src/db/client.ts` | Banco | regra-alterada | MEDIUM | Mantem `db = null` sem `DATABASE_URL` e cria Drizzle/Neon somente com URL presente. |
| `src/db/schema.ts` | Banco/catalogo | delta-de-dados | HIGH | Adiciona uniques/indices de catalogo, N:N e capa unica parcial. |
| `drizzle/0000_shallow_shinko_yamashiro.sql` | Banco/migration | componente-novo | HIGH | Gera migration local inicial revisada sem aplicacao em banco real. |
| `scripts/db/seed.mjs` | Banco/seed | componente-novo | MEDIUM | Cria seed idempotente de desenvolvimento com dados ficticios e placeholder. |
| `scripts/db/require-database-url.mjs` | Operacao/migration | regra-nova | HIGH | Bloqueia migrate sem alvo configurado para evitar execucao indefinida. |
| `src/features/products/server/product-repository.ts` | Catalogo/repository | regra-alterada | HIGH | Completa leituras/mutacoes Drizzle, hidrata categorias/imagens e preserva fallback isolado. |
| `src/features/products/server/product-service.ts` | Catalogo/service | regra-alterada | MEDIUM | Propaga modo de runtime para admin/storefront sem bypass de service. |
| `src/features/products/server/product-actions.ts` | Admin/actions | regra-alterada | HIGH | Diferencia persistido, fallback e bloqueado em mensagens de server action. |
| `src/app/admin/produtos/**` | Admin UI | regra-alterada | MEDIUM | Exibe avisos de modo sem banco e admin sem auth real. |
| `src/features/uploads/product-image-upload.ts` | Upload/imagens | regra-alterada | HIGH | Persiste metadata de imagem apos upload real e preserva bloqueio sem token Blob. |
| `src/app/api/upload/route.ts` | Upload/API | regra-alterada | MEDIUM | Usa mensagem centralizada de bloqueio sem token Blob. |
| `src/tests/unit/*.test.ts` | Testes | componente-novo | MEDIUM | Cobre fallback, scripts, seed sem URL, regra publica, guardrail e upload sem token. |
| `docs/**` | Documentacao | regra-alterada | LOW | Documenta Neon, migrations, seed, env, persistencia, admin e uploads. |
| `_reversa_forward/001-fase-3-neon-drizzle/actions.md` | Reversa Forward | regra-alterada | LOW | Marca F3-001 a F3-053 como concluidas apos validacao. |

## Diff conceitual por componente

### Runtime/env

O sistema agora diferencia explicitamente ambiente com banco, sem banco, token Blob ausente e
ambiente bloqueado para mutacao real. Essa regra substitui mensagens dispersas por um contrato
seguro e sem valores sensiveis.

### Banco e migrations

Drizzle continua compatível com build/test sem `DATABASE_URL`. A migration local inicial foi
gerada, mas nao aplicada. O schema passou a expressar as invariantes necessarias para catalogo:
slugs/SKU unicos, indice de regra publica, N:N unica e no maximo uma capa por produto.

### Catalogo/repository

O repository deixa de retornar fixtures quando `db` existe. Leituras reais de produtos, categorias
e imagens usam Drizzle e hidratam o dominio. Mutacoes de produto/categorias sao transacionais no
caminho real; sem banco, retornam `dev_fallback` explicito.

### Admin

O admin comunica modo sem banco e painel sem auth real. Mutacoes bloqueadas viram erro de action, e
fallback nao e tratado como gravacao real indistinta.

### Storefront

O storefront continua consumindo service/repository. A regra publica permanece no dominio:
`published`, `publishedAt <= now`, `stockQuantity > 0`.

### Upload/imagens

Upload real permanece bloqueado sem `BLOB_READ_WRITE_TOKEN`. Quando o upload real ocorre, a
metadata e encaminhada para `product_images`; fora de ambiente permitido, o guardrail bloqueia a
mutacao.

## Preservadas

- 🟢 Produto publico exige `status = published`.
- 🟢 Produto publico exige `publishedAt <= now`.
- 🟢 Produto publico exige `stockQuantity > 0`.
- 🟢 Produto `draft` nao e publico.
- 🟢 Produto futuro nao e publico.
- 🟢 Produto sem estoque nao e publico/disponivel.
- 🟢 Produto `inactive` nao e publico e segue como inativo/arquivado inicial.
- 🟢 Slug de produto permanece normalizado.
- 🟢 Precos de dominio permanecem em centavos.
- 🟢 Banco salva metadata de imagem, nao binario.
- 🟢 Upload real exige `BLOB_READ_WRITE_TOKEN`.
- 🟢 Sem `DATABASE_URL`, build/test nao exigem banco real.
- 🟢 Checkout, pagamento, frete, cupom e pedidos continuam fora do escopo.
- 🟢 Nenhuma migration foi aplicada contra banco real.

## Modificadas

Nenhuma regra 🟢 do dominio legado foi removida ou alterada semanticamente. A Fase 3 adicionou
persistencia real e guardrails mantendo as regras preservadas acima.
