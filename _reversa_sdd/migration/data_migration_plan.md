# Data Migration Plan

## Fontes

- Banco legado Laravel.
- Storage público de imagens.
- Configurações comerciais e administrativas.
- Histórico de pedidos, clientes e cupons.
- Arquivos locais aprovados CSV/JSON em `data/dry-run/input/` para ensaio inicial.

## Ordem de migração

1. Categorias.
2. Produtos.
3. Imagens.
4. Clientes.
5. Endereços.
6. Cupons.
7. Pedidos.
8. Itens de pedido.
9. Pagamentos e status.
10. Dados fiscais e integrações.

## Classificacao Pos-Fase 13

| Entidade | Obrigatoriedade inicial | Observacao |
| --- | --- | --- |
| Categorias | Must | Necessarias para catalogo vendavel. |
| Produtos | Must | SKU, slug, preco em centavos, status e estoque sao bloqueadores. |
| Imagens | Must | Produto publicado precisa capa ou fallback aprovado. |
| Cupons ativos | Must se houver campanha ativa | Cupom ativo divergente pode afetar financeiro. |
| Frete minimo | Must | Checkout precisa cobertura UF/CEP aceita. |
| Clientes | Decisao humana | Pode migrar ou manter consulta temporaria no legado. |
| Enderecos | Decisao humana | Depende de migracao de clientes existentes. |
| Pedidos historicos | Decisao humana | Pode ficar para pos-go-live se aceito. |
| Fiscal/Bling/NF-e | Fora de escopo/decisao | Fase futura se obrigatorio no dia zero. |

## Estado Pos-Fase 14

- O dry-run controlado agora possui implementacao local segura via `pnpm ops:check-data-dry-run`.
- A fonte inicial aprovada para ensaio e arquivo local CSV/JSON dentro de `data/dry-run/input/`.
- A Fase 14 versiona apenas `.gitkeep`, exemplos sinteticos e contratos; dados reais continuam fora do Git.
- A reconciliacao gera relatorios JSON/Markdown em `data/dry-run/output/`, ignorados pelo Git.
- A execucao com exemplos sinteticos retornou `go`, 0 bloqueadores e 0 avisos.
- A execucao com fonte real aprovada ainda precisa ocorrer em etapa futura antes de qualquer importacao real.

## Estado Pos-Fase 15

- A primeira execucao aprovada foi nomeada como `data/dry-run/input/primeira-execucao/`.
- Se essa pasta nao tiver arquivos reais/exportados Must, o dry-run retorna `pending-input` e lista pendencias humanas sem inventar dados reais.
- Arquivos esperados para a primeira execucao aprovada: `products.csv/json`, `categories.csv/json`, `product_images.csv/json`, `inventory.csv/json`, `coupons.csv/json` e `shipping.csv/json`.
- Aliases da Fase 14 continuam aceitos para compatibilidade: `product-images.csv/json` e `shipping-rules.csv/json`.
- O inventario e reconciliado em memoria por SKU e nao cria migration, tabela, seed, importacao ou conexao com banco.
- Divergencias passam a indicar origem `dados`, `next`, `mapeamento` ou `humana`; problemas de dados/exportacao devem voltar para a fonte, problemas `next`/`mapeamento` podem gerar correcao futura no projeto.
- Smoke reportado: exemplos sinteticos retornaram `go`; `primeira-execucao` sem arquivos retornou `pending-input` com 5 pendencias humanas.
- A execucao com fonte real aprovada ainda precisa ocorrer antes de qualquer importacao real futura.

## Estado Pos-Fase 16

- A Fase 16 preparou importacao controlada para staging/dev remoto via `pnpm ops:import-staging`.
- A importacao staging so pode avancar se houver arquivos aprovados em `data/dry-run/input/primeira-execucao/`, dry-run anterior `go` ou sem bloqueio critico, `STAGING_DATABASE_URL` configurada fora do Git, aprovacao humana e backup/snapshot quando necessario.
- Sem arquivos aprovados, sem ambiente staging/dev remoto ou sem aprovacao, o resultado esperado e `pending-input`/bloqueio operacional; nao ha conexao com banco.
- O modo padrao e upsert seguro em staging; reset/limpeza exige backup confirmado, flag explicita, aprovacao humana e ambiente nao produtivo.
- Relatorios antes/depois, divergencias e rollback/checklist humano registram a execucao sem imprimir secrets.
- Producao, deploy, migration real, banco real de producao, upload real e alteracao do Laravel legado continuam fora do escopo.

## Divergencias Bloqueadoras do Dry-run

| Codigo | Condicao | Impacto |
| --- | --- | --- |
| `UNSAFE_INPUT` | `.env`, secret, token, URL real de banco ou credencial em caminho/campo/valor | Bloqueia qualquer avanço |
| `INPUT_MISSING` | Arquivo Must ausente | Bloqueia reconciliacao |
| `INVALID_HEADER` | Campo fora do contrato CSV/JSON | Bloqueia mapeamento |
| `INVALID_VALUE` | Valor nao normalizavel ou regra invalida | Bloqueia entidade afetada |
| `DUPLICATE_KEY` | SKU, slug, codigo de cupom ou regra duplicada | Bloqueia import futuro |
| `UNKNOWN_REFERENCE` | Produto sem categoria ou imagem sem produto | Bloqueia integridade |
| `IMAGE_MISSING` | Produto publicado sem capa nem fallback aprovado | Bloqueia catalogo vendavel |
| `SHIPPING_COVERAGE_MISSING` | Nenhuma regra ativa de frete minimo com preco positivo | Bloqueia checkout |

## Origem das Divergencias Pos-Fase 15

| Origem | Significado | Encaminhamento |
| --- | --- | --- |
| `dados` | Export/fonte contem valor ausente, invalido, duplicado ou referencia inexistente. | Corrigir origem/export e repetir dry-run. |
| `next` | Bug no parser, normalizador, reconciliacao, relatorio ou mensagem operacional do Next. | Corrigir codigo em fase aprovada e repetir validacoes. |
| `mapeamento` | Contrato CSV/JSON nao representa corretamente o dado legado aprovado. | Ajustar contrato/mapping com decisao humana. |
| `humana` | Falta entrada aprovada, excecao formal ou decisao de go-live. | Registrar aprovacao/decisao antes de avancar. |

## Estratégia

- Criar exporters read-only no legado ou dump controlado.
- Normalizar para formato intermediário versionado.
- Importar em ambiente isolado.
- Reconciliar contagens e checksums por domínio.
- Repetir dry-run até divergência aceitável ser zero nos domínios críticos.
- Separar relatorios versionaveis de arquivos com dados pessoais/secretos; relatorios devem usar amostras mascaradas.
- Exigir aprovacao humana antes de banco legado, export real, import real ou migration real.
- Executar primeiro `ops:check-data-dry-run` com exemplos sinteticos e depois com `data/dry-run/input/primeira-execucao`, sem usar `.env`.
- Depois de dry-run `go` aprovado, executar `ops:import-staging` somente contra staging/dev remoto autorizado, com backup/snapshot e aprovacao humana registrados.

## Não fazer nesta etapa

- Não rodar migration real.
- Não conectar banco de produção.
- Não copiar secrets.
- Não alterar dados do legado.
- Não importar dados reais automaticamente.
- Não imprimir dados pessoais crus ou URLs reais de banco.
- Não copiar binários reais de imagem nem fazer upload real durante o dry-run.
- Não usar `ops:import-staging` contra producao nem contra ambiente sem backup/aprovacao quando houver reset/limpeza.
