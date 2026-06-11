# Cutover Plan

## Pré-cutover

- Congelar escopo funcional por domínio.
- Executar dry-run de migração de dados em ambiente isolado.
- Validar contagem de produtos, clientes, pedidos, cupons, endereços e imagens.
- Validar checkout e pagamento em sandbox.
- Validar e-mails com provider fake ou ambiente de teste.
- Validar frete/fiscal com sandbox ou adapters fake.

## Janela de cutover

1. Colocar legado em modo leitura ou congelar operações sensíveis.
2. Exportar dados finais.
3. Importar no alvo.
4. Rodar reconciliação.
5. Ativar DNS/tráfego somente após smoke tests.

## Smoke tests mínimos

- Home pública carrega.
- Produto publicado abre.
- Carrinho aceita item.
- Checkout cria pedido pendente.
- Pagamento sandbox confirma pedido.
- Cliente vê pedido próprio.
- Admin vê pedido e histórico.

## Rollback

- Manter legado intacto até aceite pós-cutover.
- Preservar backup do banco antes de migração.
- Não alterar credenciais de produção sem plano reversível.
