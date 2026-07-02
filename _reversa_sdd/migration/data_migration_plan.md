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

## Estratégia

- Criar exporters read-only no legado ou dump controlado.
- Normalizar para formato intermediário versionado.
- Importar em ambiente isolado.
- Reconciliar contagens e checksums por domínio.
- Repetir dry-run até divergência aceitável ser zero nos domínios críticos.
- Separar relatorios versionaveis de arquivos com dados pessoais/secretos; relatorios devem usar amostras mascaradas.
- Exigir aprovacao humana antes de banco legado, export real, import real ou migration real.
- Executar primeiro `ops:check-data-dry-run` com exemplos sinteticos e depois com pasta local real aprovada, sem usar `.env`.

## Não fazer nesta etapa

- Não rodar migration real.
- Não conectar banco de produção.
- Não copiar secrets.
- Não alterar dados do legado.
- Não importar dados reais automaticamente.
- Não imprimir dados pessoais crus ou URLs reais de banco.
- Não copiar binários reais de imagem nem fazer upload real durante o dry-run.
