# Interface: Dry-run Input Files

> Tipo: arquivo local CSV/JSON
> Feature: `022-fase-14-data-dry-run`
> Diretório sugerido: `data/dry-run/input/`

## Finalidade

Definir o contrato de arquivos locais usados pelo dry-run inicial. Este contrato não autoriza conexão com banco real, leitura automática do Laravel, importação no Next, upload real ou versionamento de dados reais sensíveis.

## Arquivos aceitos

| Entidade | CSV | JSON | Obrigatório |
|----------|-----|------|-------------|
| Categorias | `categories.csv` | `categories.json` | sim |
| Produtos | `products.csv` | `products.json` | sim |
| Imagens | `product-images.csv` | `product-images.json` | sim |
| Cupons ativos | `coupons.csv` | `coupons.json` | se houver campanha ativa |
| Frete mínimo | `shipping-rules.csv` | `shipping-rules.json` | sim |

## Convenções gerais

- Encoding: UTF-8.
- CSV: primeira linha deve conter cabeçalhos.
- JSON: array de objetos.
- Campos monetários devem preferir centavos inteiros (`*_cents`).
- Datas devem usar ISO 8601 quando disponíveis.
- Booleanos aceitos: `true/false`, `1/0`, `yes/no`, `sim/nao`.
- Arquivos reais devem ficar fora do Git.

## Campos por entidade

### `categories`

| Campo | Obrigatório | Observação |
|-------|-------------|------------|
| `name` | sim | Nome comercial. |
| `slug` | sim | Chave de reconciliação. |
| `parent_slug` | não | Relaciona categoria pai. |
| `description` | não | Texto opcional. |
| `is_active` | não | Default planejado: `true`. |
| `sort_order` | não | Inteiro. |

### `products`

| Campo | Obrigatório | Observação |
|-------|-------------|------------|
| `sku` | sim | Chave comercial e de reconciliação. |
| `slug` | sim | Chave pública. |
| `name` | sim | Nome do produto. |
| `category_slug` | sim | Categoria principal. |
| `price_cents` | sim se `price` ausente | Inteiro em centavos. |
| `price` | sim se `price_cents` ausente | Deve ser convertido para centavos sem ambiguidade. |
| `stock_quantity` | sim | Inteiro não negativo. |
| `status` | sim | Mapear para `draft`, `published` ou `inactive`. |
| `published_at` | não | ISO 8601. |
| `description` | não | Texto comercial. |
| `brand` | não | Marca/linha. |

### `product-images`

| Campo | Obrigatório | Observação |
|-------|-------------|------------|
| `product_sku` | sim | Relaciona produto. |
| `reference` | sim | Caminho, URL ou identificador exportado. |
| `alt_text` | não | Texto alternativo. |
| `sort_order` | não | Inteiro. |
| `is_cover` | não | Booleano; pelo menos uma capa por produto publicado ou fallback aprovado. |
| `fallback_approved` | não | Booleano para ausência aceita. |

### `coupons`

| Campo | Obrigatório | Observação |
|-------|-------------|------------|
| `code` | sim | Normalizar uppercase. |
| `type` | sim | `percentage`, `fixed_amount` ou `free_shipping`. |
| `value` | sim | Percentual ou valor conforme tipo. |
| `starts_at` | não | ISO 8601. |
| `ends_at` | não | ISO 8601. |
| `max_uses` | não | Inteiro. |
| `used_count` | não | Inteiro, apenas para reconciliação. |
| `minimum_subtotal_cents` | não | Inteiro em centavos. |
| `is_active` | sim | Booleano. |

### `shipping-rules`

| Campo | Obrigatório | Observação |
|-------|-------------|------------|
| `rule_code` | sim | Chave estável da regra. |
| `name` | sim | Nome exibível. |
| `uf` | condicional | Obrigatório para regra por UF. |
| `postal_code_start` | condicional | 8 dígitos para faixa CEP. |
| `postal_code_end` | condicional | 8 dígitos para faixa CEP. |
| `price_cents` | sim | Inteiro em centavos. |
| `estimated_days` | sim | Inteiro positivo. |
| `is_active` | sim | Booleano. |
| `priority` | não | Inteiro. |

## Erros esperados

| Código | Condição |
|--------|----------|
| `INPUT_MISSING` | Arquivo Must ausente. |
| `INVALID_HEADER` | Cabeçalho CSV ou chave JSON desconhecida/ausente. |
| `INVALID_VALUE` | Campo não normalizável. |
| `DUPLICATE_KEY` | SKU, slug, código ou regra duplicada. |
| `UNSAFE_INPUT` | Arquivo, path ou valor sugere secret, `.env`, banco real ou dado bruto sensível. |

## Idempotência

Rodar o dry-run duas vezes sobre os mesmos arquivos deve produzir o mesmo resumo de contagens e divergências, exceto timestamps de execução.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-plan` | reversa |
