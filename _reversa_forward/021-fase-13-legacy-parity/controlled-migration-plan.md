# Controlled Migration Plan

## Objetivo

Preparar migracao controlada sem executar import real nesta fase.

## Formato intermediario proposto

| Arquivo futuro | Entidades | Observacao |
|----------------|-----------|------------|
| `categories.jsonl` | categorias | slugs unicos |
| `products.jsonl` | produtos | SKU, slug, preco em centavos, status, estoque |
| `product-images.jsonl` | imagens | produto, arquivo, capa, ordem, alt |
| `coupons.jsonl` | cupons | codigo, tipo, valor, vigencia, limite |
| `shipping-rules.jsonl` | frete | UF/faixa CEP, preco, prazo |
| `customers.jsonl` | clientes | somente com aprovacao; dados mascarados no relatorio |
| `orders.jsonl` | pedidos historicos | somente se decisao humana aprovar |

## Gates

1. Aprovacao humana da fonte de dados.
2. Sanitizacao e validacao local do formato.
3. Ambiente isolado identificado.
4. Backup/checkpoint se houver qualquer alvo persistente.
5. Dry-run sem provider externo, e-mail real, deploy ou migration real.
6. Reconciliacao aceita.
7. Nova aprovacao antes de import real.

## Transformacoes chave

- Dinheiro para centavos.
- Status legado para enums Next.
- SKU/slug normalizados.
- CPF/telefone/email mascarados em relatorios.
- Imagens associadas por produto e capa.

## Bloqueio

Este plano nao autoriza import real. Ele define a trilha segura para uma fase posterior aprovada.
