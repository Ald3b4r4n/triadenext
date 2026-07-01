# Cutover Plan

## Pré-cutover

- Congelar escopo funcional por domínio.
- Executar dry-run de migração de dados em ambiente isolado.
- Validar contagem de produtos, clientes, pedidos, cupons, endereços e imagens.
- Validar checkout e pagamento em sandbox.
- Validar e-mails com provider fake ou ambiente de teste.
- Validar frete/fiscal com sandbox ou adapters fake.
- Resolver bloqueadores da Fase 13: catalogo real, imagens, precos, estoque, cupons ativos e frete minimo reconciliados.
- Fechar decisoes humanas: URLs legadas/privacidade, frete externo, historico de clientes/pedidos e fiscal/Bling/NF-e.

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

## No-go Pos-Fase 13

- Catalogo real sem reconciliacao.
- Produto publicado sem preco, estoque, SKU/slug ou imagem/fallback aprovado.
- Divergencia financeira nao explicada.
- Dry-run nao executado ou nao aprovado.
- Secret/dado pessoal cru em log ou relatorio.
- Necessidade de frete externo/fiscal no dia zero sem implementacao aprovada.
