# Data Migration Plan

## Fontes

- Banco legado Laravel.
- Storage público de imagens.
- Configurações comerciais e administrativas.
- Histórico de pedidos, clientes e cupons.

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

## Estratégia

- Criar exporters read-only no legado ou dump controlado.
- Normalizar para formato intermediário versionado.
- Importar em ambiente isolado.
- Reconciliar contagens e checksums por domínio.
- Repetir dry-run até divergência aceitável ser zero nos domínios críticos.
- Separar relatorios versionaveis de arquivos com dados pessoais/secretos; relatorios devem usar amostras mascaradas.
- Exigir aprovacao humana antes de banco legado, export real, import real ou migration real.

## Não fazer nesta etapa

- Não rodar migration real.
- Não conectar banco de produção.
- Não copiar secrets.
- Não alterar dados do legado.
- Não importar dados reais automaticamente.
- Não imprimir dados pessoais crus ou URLs reais de banco.
