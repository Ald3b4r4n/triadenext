# Data Delta - Fase 15

## Resumo

A Fase 15 nao altera banco, schema Drizzle, migrations, tabelas ou entidades persistidas. O delta de dados e limitado aos contratos de arquivos locais CSV/JSON usados pelo dry-run e ao modelo intermediario em memoria para reconciliacao.

## Entradas aprovadas

Pasta aprovada:

```text
data/dry-run/input/primeira-execucao/
```

Arquivos esperados:

| Dominio | Nome primario Fase 15 | Alias compativel Fase 14 | Obrigatorio para execucao aprovada |
| --- | --- | --- | --- |
| Produtos | `products.csv` ou `products.json` | `products.example.*` apenas exemplos | sim |
| Categorias | `categories.csv` ou `categories.json` | `categories.example.*` apenas exemplos | sim |
| Imagens | `product_images.csv` ou `product_images.json` | `product-images.csv` ou `product-images.json` | sim |
| Estoque | `inventory.csv` ou `inventory.json` | `products.stock_quantity` apenas compatibilidade/transicao | sim |
| Cupons | `coupons.csv` ou `coupons.json` | nenhum real necessario | nao para existencia, sim para cupons ativos se exportados |
| Frete | `shipping.csv` ou `shipping.json` | `shipping-rules.csv` ou `shipping-rules.json` | sim |

## Modelo intermediario

### Categoria

Campos esperados preservados da Fase 14:

- `name`
- `slug`
- `parent_slug`
- `description`
- `is_active`
- `sort_order`

### Produto

Campos esperados preservados da Fase 14:

- `sku`
- `slug`
- `name`
- `category_slug`
- `price_cents` ou `price`
- `stock_quantity` como compatibilidade, nao substituto definitivo de `inventory`
- `status`
- `published_at`
- `description`
- `brand`

### Imagem

Campos esperados:

- `product_sku`
- `reference`
- `alt_text`
- `sort_order`
- `is_cover`
- `fallback_approved`

### Inventario

Novo contrato intermediario necessario para a Fase 15:

- `product_sku` ou `sku`
- `stock_quantity`
- `reserved_quantity` opcional
- `is_available` opcional
- `updated_at` opcional

Regra: produto publicado destinado ao go-live precisa reconciliar estoque positivo. Se `inventory.csv/json` estiver ausente na primeira execucao aprovada, a divergencia deve ser de dados/exportacao, nao correcao silenciosa no Next.

### Cupom

Campos esperados preservados da Fase 14:

- `code`
- `type`
- `value`
- `starts_at`
- `ends_at`
- `max_uses`
- `used_count`
- `minimum_subtotal_cents`
- `is_active`

### Frete

Campos esperados preservados da Fase 14, com nome de arquivo primario `shipping.*`:

- `rule_code`
- `name`
- `uf`
- `postal_code_start`
- `postal_code_end`
- `price_cents`
- `estimated_days`
- `is_active`
- `priority`

## Saidas

Saidas brutas continuam em:

```text
data/dry-run/output/
```

Saidas brutas com dados reais nao devem ser versionadas. Quando necessario, a implementacao pode gerar um resumo sanitizado contendo:

- nome da execucao;
- horario;
- status `pending-input`, `go` ou `no-go`;
- contagens agregadas;
- quantidade de divergencias por dominio/severidade/origem;
- lista de codigos de divergencia sem linhas sensiveis;
- proxima acao recomendada.

## Migrações

Nao ha migrations nesta fase.

## Persistencia

Nao ha persistencia em banco nesta fase. Todo processamento deve ocorrer em memoria e a escrita permitida se limita a relatorios locais em `data/dry-run/output/` e artefatos Reversa/sanitizados.

## Compatibilidade

- Examples sinteticos existentes devem continuar separados de `primeira-execucao`.
- Aliases `product-images.*` e `shipping-rules.*` devem continuar aceitos para nao quebrar a Fase 14.
- A primeira execucao aprovada deve priorizar os nomes pedidos pela Fase 15: `product_images.*`, `inventory.*` e `shipping.*`.
