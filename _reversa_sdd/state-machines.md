# State Machines — triade-essenza-next

> Data: 2026-06-08  
> Escopo: estados confirmados ate Fase 3  
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Produto

Estados confirmados:

| Estado | Publico | Compravel | Observacao |
|---|---|---|---|
| `draft` | Nao | Nao | Rascunho/admin. |
| `published` | Sim, se `publishedAt <= now` e estoque > 0 | Sim, nesta fase | Depende de data e estoque. |
| `inactive` | Nao | Nao | Inativo/arquivado inicial. |

Transicoes administraveis atuais:

- criar produto como `draft`, `published` ou `inactive`;
- editar produto e substituir categorias;
- publicar so passa na validacao se nome, slug, SKU, preco, estoque positivo e data valida existirem.

## Runtime de persistencia

| Estado | Condicao | Comportamento |
|---|---|---|
| `fallback_sem_banco` | `DATABASE_URL` ausente | Fixtures + `dev_fallback`; nenhuma promessa de persistencia real. |
| `db_real_dev` | `DATABASE_URL` presente e ambiente `development`/`test` | Drizzle real; mutacoes permitidas temporariamente. |
| `db_real_bloqueado` | `DATABASE_URL` presente e ambiente `preview`/`production` | Leituras podem usar repository real; mutacoes reais bloqueadas ate Fase 4. |

## Upload de imagem

| Estado | Condicao | Comportamento |
|---|---|---|
| `rejected` | Tipo/tamanho invalido | Nao chama Blob; nao persiste metadata. |
| `blocked/missing_blob_token` | `BLOB_READ_WRITE_TOKEN` ausente | Nao chama Blob; nao persiste metadata. |
| `uploaded + metadata persisted` | Token Blob, banco e ambiente permitido | Upload real e metadata salva em `product_images`. |
| `uploaded + metadata dev_fallback` | Token Blob presente, sem banco | Upload real pode ocorrer, mas metadata nao e persistida em banco real. |
| `uploaded + metadata blocked` | Token Blob e banco presentes, ambiente bloqueado | Metadata real bloqueada sem auth/policies. |

## Fase 4 esperada

Fase 4 deve introduzir estados reais de autenticacao/sessao e policies para admin/customer.
