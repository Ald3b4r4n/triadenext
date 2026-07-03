# Data Delta - Fase 16 Approved Staging Import

> Identificador: `024-fase-16-staging-import`
> Data: `2026-07-02`

## Resumo

A Fase 16 nao exige nova tabela, novo enum, novo campo ou nova migration por padrao. O delta de dados e operacional: arquivos aprovados em `data/dry-run/input/primeira-execucao/` passam a poder alimentar uma importacao controlada em banco remoto nao produtivo, preferencialmente Neon dev/staging separado.

Produção continua fora do escopo. Migration real automatica continua fora do escopo.

## Estado de entrada

| Entrada | Obrigatorio | Observacao |
| --- | --- | --- |
| `categories.csv/json` | sim | Fonte de `categories` e relacionamentos de produtos. |
| `products.csv/json` | sim | Fonte de `products`, preco, status, slug, SKU e estoque transicional. |
| `product_images.csv/json` | sim | Fonte de referencias de imagem; alias `product-images.*` continua aceito. |
| `inventory.csv/json` | sim para import aprovado | Fonte principal de estoque disponivel por SKU para staging. |
| `coupons.csv/json` | condicional | Importa cupons se houver campanha ativa aprovada. |
| `shipping.csv/json` | sim | Fonte de frete minimo; alias `shipping-rules.*` continua aceito. |

Se qualquer arquivo Must estiver ausente, a Fase 16 deve retornar `pending-input` ou pendencia operacional e nao tentar importar.

## Entidades alvo existentes

| Fonte aprovada | Destino Next existente | Chave natural de upsert | Notas |
| --- | --- | --- | --- |
| `categories` | `categories` | `slug` | Upsert seguro por slug; parent slug exige categoria existente/importada. |
| `products` | `products` | `sku` e/ou `slug` | Conflito SKU/slug divergente deve abortar ou virar divergencia de mapeamento. |
| `product_images` | `product_images` | `product_sku + reference/pathname` | Validar referencia; nao fazer upload real por padrao. |
| `products.category_slug` | `product_categories` ou `products.categoryId` | `product + category` | Depende do modelo atual; relacionamento precisa ser idempotente. |
| `inventory` | `products.stockQuantity` | `sku` | Fase 16 nao cria `inventory_movements`; estoque auditavel segue lacuna futura. |
| `coupons` | `coupons` | `code` | Upsert por codigo normalizado uppercase. |
| `shipping` | `shipping_rules` | `rule_code` | Upsert por codigo de regra; frete externo permanece fora. |

## Modos de escrita

| Modo | Permitido por padrao | Requisitos | Comportamento |
| --- | --- | --- | --- |
| `plan` / `check` | sim | Nenhum segredo impresso | Valida entrada, ambiente, dry-run e gera relatorio sem escrita. |
| `upsert` | sim, se pre-condicoes aprovadas | Ambiente nao produtivo, dry-run `go` ou sem bloqueio critico, backup/snapshot declarado, confirmacao humana | Insere/atualiza chaves naturais aprovadas, sem apagar registros fora do escopo. |
| `reset-and-upsert` | nao | Snapshot/backup confirmado, flag explicita, aprovacao humana explicita, ambiente nao produtivo confirmado | Limpa subconjunto aprovado e reimporta; qualquer sinal de producao aborta. |
| `production` | nunca nesta fase | n/a | Deve abortar antes de conectar. |

## Dados que nao entram na Fase 16

- Clientes reais.
- Enderecos reais.
- Pedidos historicos.
- Pagamentos historicos.
- Fiscal/Bling/NF-e.
- WhatsApp/SMS.
- Upload real para storage produtivo.
- Dados do Laravel lidos diretamente.

## Relatorios gerados

| Relatorio | Conteudo | Versionavel |
| --- | --- | --- |
| Pre-importacao | Ambiente, commit, entrada, dry-run, snapshot/backup declarado, modo de escrita e bloqueios. | Sim, se sanitizado. |
| Pos-importacao | Contagens antes/depois, chaves importadas, warnings, divergencias e status. | Sim, se sanitizado. |
| Divergencias | Origem `dados`, `next`, `mapeamento`, `humana`, severidade e acao recomendada. | Sim, se sem dados reais crus. |
| Rollback | Snapshot/backup, acao de reversao, status e decisao humana. | Sim, se sanitizado. |
| Bruto local | Evidencias detalhadas de dados reais. | Nao; deve ficar fora do Git. |

## Invariantes de seguranca

- Nao imprimir `DATABASE_URL`, tokens, Stripe keys, Blob tokens ou qualquer secret.
- Nao versionar arquivos reais em `data/dry-run/input/primeira-execucao/`.
- Nao versionar relatorios brutos com dados reais.
- Nao conectar producao.
- Nao rodar migration real automatica.
- Nao apagar dados sem aprovacao humana explicita.
- Nao alterar Laravel legado.

## Criterios de bloqueio

| Bloqueio | Resultado esperado |
| --- | --- |
| Ambiente ausente ou nao aprovado | pendencia operacional, sem escrita |
| Arquivos Must ausentes | `pending-input`, sem escrita |
| Dry-run `no-go` ou bloqueio critico | no-go, sem escrita |
| Sinal de producao | abortar antes de conectar |
| Snapshot/backup ausente | bloquear import e reset |
| Reset sem flag/aprovacao | abortar |
| Secret detectado em entrada/log/report | abortar e redigir |
| Schema remoto incompativel | bloquear import e pedir decisao humana |

## Sem migration de schema

A Fase 16 deve tratar incompatibilidade de schema remoto como bloqueio operacional. Ela nao deve gerar nem aplicar migration real automaticamente. Se o schema remoto precisar de migration, isso deve virar decisao humana separada antes da execucao.
