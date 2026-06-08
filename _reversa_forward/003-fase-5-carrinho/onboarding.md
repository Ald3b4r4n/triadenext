# Onboarding: Fase 5 - Carrinho

> Data: `2026-06-08`  
> Objetivo: orientar teste humano da feature quando implementada.

## 1. Pre-condicoes

- Usar apenas o projeto `D:\Projetos\triade-essenza-next`.
- Nao usar `.env` real do legado.
- Nao conectar banco de producao.
- Nao rodar migration real sem validacao humana.
- Nao esperar checkout, frete, cupom, pagamento, pedido ou reserva de estoque.

## 2. Teste local sem banco

1. Iniciar a aplicacao sem `DATABASE_URL`.
2. Acessar `/carrinho`.
3. Confirmar estado vazio e aviso de fallback quando aplicavel.
4. Tentar interacao controlada de carrinho em dev/test.
5. Confirmar que nenhuma mensagem promete persistencia real.
6. Confirmar que cookie/token nao aparece em logs ou UI.

## 3. Teste local/dev com banco autorizado

1. Usar banco local/dev explicitamente autorizado.
2. Aplicar migrations somente se houver validacao humana.
3. Adicionar produto publicado, vigente e com estoque.
4. Atualizar quantidade dentro do estoque.
5. Remover item.
6. Limpar carrinho.
7. Fazer login e validar merge do carrinho anonimo.
8. Confirmar carrinho autenticado entre sessoes/dispositivos quando houver banco real.

## 4. Fluxos manuais essenciais

| Fluxo | Resultado esperado |
|---|---|
| Visitante abre `/carrinho` | Estado vazio sem exigir login. |
| Visitante adiciona produto elegivel | Item entra no carrinho e subtotal usa centavos. |
| Visitante adiciona `draft`/`inactive`/futuro/sem estoque | Erro controlado e carrinho inalterado. |
| Quantidade acima do estoque | Erro controlado e estado anterior preservado. |
| Usuario faz login com carrinho anonimo | Merge soma quantidades e limita estoque. |
| Usuario tenta carrinho de outro usuario | Bloqueio seguro sem dados alheios. |
| Admin/manager usa carrinho | Mesmas regras de usuario autenticado comum. |
| Checkout/cupom/frete | Placeholder/desabilitado, sem operacao real. |

## 5. Validacoes futuras obrigatorias

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

As validacoes devem passar sem credenciais reais. Testes com banco devem usar ambiente local/dev ou fixture controlada, nunca producao.

## 6. Sinais de falha

- Cookie contem itens, precos, `userId`, role ou dados sensiveis.
- Produto indisponivel entra no carrinho.
- Quantidade ultrapassa estoque.
- Subtotal usa float e apresenta arredondamento.
- Carrinho anonimo mescla mais de uma vez.
- Carrinho autenticado de outro usuario fica acessivel.
- Fallback sem banco parece persistente.
- Algum fluxo cria pedido, chama Stripe, calcula frete real ou aplica cupom.
