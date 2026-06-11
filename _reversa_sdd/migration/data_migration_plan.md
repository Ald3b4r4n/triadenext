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

## Estratégia

- Criar exporters read-only no legado ou dump controlado.
- Normalizar para formato intermediário versionado.
- Importar em ambiente isolado.
- Reconciliar contagens e checksums por domínio.
- Repetir dry-run até divergência aceitável ser zero nos domínios críticos.

## Não fazer nesta etapa

- Não rodar migration real.
- Não conectar banco de produção.
- Não copiar secrets.
- Não alterar dados do legado.
