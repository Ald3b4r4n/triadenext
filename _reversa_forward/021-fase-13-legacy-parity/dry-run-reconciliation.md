# Dry-run Reconciliation

## Relatorios esperados

| Relatorio | Conteudo |
|-----------|----------|
| `counts` | Origem, destino, diferenca e justificativa |
| `keys` | SKU, slug, codigo de cupom, numero de pedido |
| `money` | Precos, descontos, frete e totais em centavos |
| `statuses` | Mapping de status legado para enums Next |
| `assets` | Produto, imagem, capa, fallback e arquivo |
| `privacy` | Confirmacao de mascaramento |

## Criterios de aceite

- Divergencia critica zero para produtos publicados, precos, estoque, cupons ativos e frete minimo.
- Divergencias historicas podem ser aceitas se classificadas como pos-go-live ou decisao humana.
- Relatorio nao pode conter dados pessoais crus.
- Relatorio nao pode conter secrets.

## Checksums seguros

Quando viavel, gerar checksum de campos normalizados sem incluir dado sensivel cru:

- Produto: `sku|slug|priceCents|stockQuantity|status`.
- Cupom: `code|type|value|startsAt|endsAt`.
- Pedido: `number|status|totalCents|itemCount`.

## Resultado de go/no-go

O dry-run so recomenda avancar se todos os Must estiverem reconciliados ou explicitamente aceitos como divergencia nao bloqueadora.
