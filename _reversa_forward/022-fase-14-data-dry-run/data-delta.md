# Data Delta: Fase 14 - Controlled Data Dry-run and Reconciliation

> Data: `2026-07-02`
> Feature: `022-fase-14-data-dry-run`

## Resumo

Não há delta de schema persistido nesta fase. Nenhuma tabela, enum, índice ou migration Drizzle deve ser criada apenas pelo planejamento. O delta é um contrato intermediário para entrada local e uma saída de reconciliação que comprovam se os dados Must podem ser importados em fase futura aprovada.

## Entidades Must

| Entidade | Fonte de entrada | Destino conceitual Next | Chave de reconciliação | Critério bloqueador |
|----------|------------------|-------------------------|------------------------|---------------------|
| Categorias | `categories.csv` ou `categories.json` | `categories`, `product_categories` | `slug` | slug ausente/duplicado ou categoria obrigatória ausente |
| Produtos | `products.csv` ou `products.json` | `products` | `sku`, `slug` | SKU/slug ausente, preço inválido, estoque inválido, status incompatível |
| Imagens | `product-images.csv` ou `product-images.json` | `product_images`, Blob futuro | `product_sku`, `reference`, `is_cover` | produto publicado sem capa, fallback ou referência válida |
| Cupons ativos | `coupons.csv` ou `coupons.json` | `coupons` | `code` | cupom ativo divergente em tipo, valor, vigência ou limite |
| Frete mínimo | `shipping-rules.csv` ou `shipping-rules.json` | `shipping_rules` | `rule_code` ou `uf/range` | ausência de cobertura mínima para UF/CEP aprovado |

## Estrutura de entrada segura

```text
data/
  dry-run/
    input/
      .gitkeep
      examples/
        categories.example.csv
        products.example.csv
        product-images.example.csv
        coupons.example.csv
        shipping-rules.example.csv
```

Regras:

- Dados reais sensíveis não devem ser versionados.
- Exemplos versionados devem ser sintéticos.
- Arquivos reais podem existir localmente, mas devem ficar ignorados pelo Git.
- A fase não deve copiar `.env` nem usar secrets para localizar entrada.

## Normalizações planejadas

| Domínio | Normalização |
|---------|--------------|
| Categorias | `name` obrigatório, `slug` lowercase/kebab-case, `is_active` booleano, `parent_slug` opcional. |
| Produtos | `sku` trim, `slug` normalizado, `status` mapeado para `draft/published/inactive`, `published_at` ISO opcional, `stock_quantity` inteiro não negativo. |
| Preços | `price_cents` inteiro obrigatório ou `price` convertido para centavos com erro em ambiguidade. |
| Estoque | `stock_quantity` inteiro; produto publicado com zero deve bloquear catálogo público. |
| Imagens | `product_sku`, `reference`, `alt_text`, `sort_order`, `is_cover`; validação por referência sem copiar binário. |
| Cupons | `code` uppercase, `type` em `percentage/fixed_amount/free_shipping`, `value`, vigência e `max_uses`. |
| Frete | CEP com 8 dígitos quando houver faixa; UF em 2 letras; `price_cents`, prazo e prioridade. |

## Saída intermediária

O processamento pode gerar uma representação normalizada em memória ou em pasta local temporária ignorada, por exemplo:

```text
data/dry-run/output/
  normalized-categories.json
  normalized-products.json
  normalized-product-images.json
  normalized-coupons.json
  normalized-shipping-rules.json
  reconciliation-report.json
  reconciliation-report.md
```

Saídas com dados reais ou sensíveis não devem ser versionadas. Apenas modelos, exemplos sintéticos e relatórios mascarados podem entrar no Git.

## Sem migration real

- Não criar migration Drizzle por causa deste delta.
- Não executar `pnpm db:migrate`.
- Não conectar Neon, banco legado ou banco real.
- Não importar registros para `products`, `categories`, `product_images`, `coupons` ou `shipping_rules`.

## Fora do delta

- Clientes.
- Endereços.
- Pedidos históricos.
- Pagamentos/status históricos.
- Fiscal/Bling/NF-e.
- WhatsApp/SMS.
- Upload real de imagens.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-plan` | reversa |
