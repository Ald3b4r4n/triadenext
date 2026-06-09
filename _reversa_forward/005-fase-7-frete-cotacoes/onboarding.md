# Onboarding — Fase 7 Frete e Cotações

> Data: `2026-06-09`
> Objetivo: orientar validação humana da implementação futura

## 1. Antes de testar

1. Confirmar que está no projeto `D:\Projetos\triade-essenza-next`.
2. Confirmar que não está no legado Laravel.
3. Não copiar `.env` do legado.
4. Não configurar credenciais de Correios, Jadlog ou Melhor Envio para esta fase.
5. Não rodar migrations em banco real sem validação humana explícita.
6. Não fazer deploy.

## 2. Preparação esperada da implementação futura

- Regras manuais fixture em dev/test ou regras persistidas em banco local controlado.
- Carrinho com ao menos um produto publicado, vigente e com estoque.
- Cupom `free_shipping` disponível em fixture/dev ou banco local controlado.
- Admin/manager disponível apenas se banco/auth estiverem prontos.

## 3. Caminho storefront

1. Abrir `/produtos`.
2. Adicionar produto comprável ao carrinho.
3. Abrir `/carrinho`.
4. Informar CEP válido coberto por regra manual.
5. Clicar em cotar frete.
6. Verificar opções manuais com nome, prazo e valor.
7. Selecionar uma opção.
8. Confirmar subtotal, desconto, frete e total parcial com frete.
9. Alterar quantidade ou remover item.
10. Confirmar que frete selecionado foi invalidado ou recalculado.

## 4. Caminho `free_shipping`

1. Com frete manual calculado e selecionado, aplicar cupom `free_shipping`.
2. Confirmar que `shippingAmountCents` efetivo vai para 0.
3. Confirmar que o cupom não cria frete se nenhuma cotação manual válida existir.
4. Confirmar que checkout/pedido/pagamento continuam indisponíveis.

## 5. Caminho fallback

1. Rodar sem `DATABASE_URL` em development/test.
2. Cotar frete com CEP coberto por fixture.
3. Confirmar sinalização clara de fixture/mock/dev fallback.
4. Confirmar que a UI não promete prazo/preço real de transportadora.
5. Confirmar que preview/produção sem banco bloqueiam mutações reais de frete.

## 6. Caminho admin

1. Autenticar como admin/manager em ambiente local seguro.
2. Abrir `/admin/frete` ou superfície equivalente.
3. Listar regras manuais.
4. Criar/editar regra manual mínima, se implementado.
5. Confirmar bloqueio para customer/visitante.
6. Confirmar ausência de painel de credenciais externas, SLA real, contratos e relatórios avançados.

## 7. Validações finais esperadas

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

## 8. Sinais de regressão

- Frete vindo do payload do cliente.
- Chamada real a Correios, Jadlog ou Melhor Envio.
- Credencial externa exigida para build/test/e2e.
- `free_shipping` criando frete artificial.
- Seleção de frete em carrinho alheio.
- Checkout, pedido, pagamento, reserva ou baixa de estoque ativados.
