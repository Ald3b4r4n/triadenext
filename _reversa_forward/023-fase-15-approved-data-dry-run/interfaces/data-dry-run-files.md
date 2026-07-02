# Interface: data-dry-run-files

## Tipo

Contrato de arquivos locais CSV/JSON para dry-run controlado.

## Diretorio permitido

```text
data/dry-run/input/primeira-execucao/
```

Qualquer entrada fora de `data/dry-run/input/` deve falhar fechada.

## Arquivos

| Entidade | Arquivo primario | Aliases aceitos | Obrigatorio |
| --- | --- | --- | --- |
| Categorias | `categories.csv` ou `categories.json` | nenhum real; `categories.example.*` apenas exemplos | sim |
| Produtos | `products.csv` ou `products.json` | nenhum real; `products.example.*` apenas exemplos | sim |
| Imagens | `product_images.csv` ou `product_images.json` | `product-images.csv`, `product-images.json` | sim |
| Inventario | `inventory.csv` ou `inventory.json` | `products.stock_quantity` apenas como compatibilidade/transicao | sim para primeira execucao aprovada |
| Cupons | `coupons.csv` ou `coupons.json` | nenhum real; `coupons.example.*` apenas exemplos | nao, mas cupons ativos exportados devem reconciliar |
| Frete | `shipping.csv` ou `shipping.json` | `shipping-rules.csv`, `shipping-rules.json` | sim |

## Formato CSV

- UTF-8.
- Primeira linha com cabecalhos.
- Separador `,`.
- Aspas duplas permitidas para valores com virgula.
- Linhas vazias ignoradas.

## Formato JSON

- Array de objetos.
- Cada objeto representa um registro.
- Campos desconhecidos devem gerar `INVALID_HEADER` ou decisao humana, conforme dominio.

## Campos por entidade

### `categories`

```text
name,slug,parent_slug,description,is_active,sort_order
```

### `products`

```text
sku,slug,name,category_slug,price_cents,price,stock_quantity,status,published_at,description,brand
```

### `product_images`

```text
product_sku,reference,alt_text,sort_order,is_cover,fallback_approved
```

### `inventory`

```text
product_sku,sku,stock_quantity,reserved_quantity,is_available,updated_at
```

Ao menos `product_sku` ou `sku` deve existir. `stock_quantity` e obrigatorio para reconciliar estoque.

### `coupons`

```text
code,type,value,starts_at,ends_at,max_uses,used_count,minimum_subtotal_cents,is_active
```

### `shipping`

```text
rule_code,name,uf,postal_code_start,postal_code_end,price_cents,estimated_days,is_active,priority
```

## Erros esperados

| Codigo | Quando ocorre | Impacto padrao |
| --- | --- | --- |
| `UNSAFE_INPUT` | Caminho, campo ou valor contem indicio de `.env`, secret, token, credencial ou URL real de banco. | bloqueador |
| `INPUT_MISSING` | Arquivo obrigatorio ausente. | bloqueador |
| `INVALID_EXTENSION` | Arquivo nao e CSV nem JSON. | bloqueador |
| `INVALID_JSON` | JSON invalido ou nao-array. | bloqueador |
| `EMPTY_FILE` | CSV vazio. | bloqueador |
| `INVALID_ROW` | Linha CSV com quantidade de colunas diferente do cabecalho. | bloqueador |
| `INVALID_HEADER` | Campo fora do contrato. | bloqueador ou decisao humana |
| `INVALID_VALUE` | Valor invalido para campo normalizado. | bloqueador ou nao bloqueador conforme dominio |
| `DUPLICATE_KEY` | Chave natural duplicada. | bloqueador |
| `UNKNOWN_REFERENCE` | Referencia a categoria/produto inexistente. | bloqueador |
| `IMAGE_MISSING` | Produto publicado sem imagem/fallback aprovado. | bloqueador |
| `SHIPPING_COVERAGE_MISSING` | Frete minimo ativo ausente. | bloqueador |

## Idempotencia

O dry-run deve ser read-only. A mesma pasta de entrada deve gerar resultado equivalente, salvo timestamp/caminho de saida do relatorio.

## Timeout e performance

Execucao local esperada em ate 60 segundos para catalogo inicial. Se passar disso, registrar risco operacional sem conectar banco ou servicos externos.

## Seguranca

- Nao ler `.env`.
- Nao imprimir secrets.
- Nao versionar arquivos reais.
- Nao copiar dados do Laravel.
- Nao fazer upload de imagens.
- Nao importar dados em banco.
