# Cutover Plan

## Pré-cutover

- Congelar escopo funcional por domínio.
- Executar `pnpm ops:check-data-dry-run` com fonte local real aprovada dentro de `data/dry-run/input/`.
- Manter relatorios reais em `data/dry-run/output/` fora do Git.
- Validar contagem de produtos, clientes, pedidos, cupons, endereços e imagens.
- Validar checkout e pagamento em sandbox.
- Validar e-mails com provider fake ou ambiente de teste.
- Validar frete/fiscal com sandbox ou adapters fake.
- Resolver bloqueadores da Fase 13/Fase 14: catalogo real, imagens, precos, estoque, cupons ativos e frete minimo reconciliados com fonte real aprovada.
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

## No-go Pos-Fase 14

- Catalogo real sem reconciliacao.
- Produto publicado sem preco, estoque, SKU/slug ou imagem/fallback aprovado.
- Divergencia financeira nao explicada.
- Dry-run com fonte real aprovada nao executado ou nao aprovado.
- `ops:check-data-dry-run` retornando `no-go`.
- Divergencia `CRITICAL` ou `HIGH` sem correcao ou excecao formal.
- Secret/dado pessoal cru em log ou relatorio.
- Necessidade de frete externo/fiscal no dia zero sem implementacao aprovada.
- Relatorio real versionado por engano em Git.
