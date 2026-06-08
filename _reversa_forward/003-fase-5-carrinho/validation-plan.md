# Validation Plan: Fase 5 - Carrinho

> Data: `2026-06-08`

## 1. Estrategia

Validar carrinho em tres camadas: dominio puro, repository/service/actions server-side e e2e de superficie. A suite deve provar que produto indisponivel nao entra, ownership e respeitado, merge e idempotente e fallback sem banco e explicito.

## 2. Testes unitarios

| Area | Casos |
|---|---|
| Produto compravel | `published` valido entra; `draft`, `inactive`, futuro e sem estoque bloqueiam. |
| Quantidade | minimo 1; maximo `stockQuantity`; atualizacao invalida preserva estado. |
| Subtotal | item e carrinho calculados em centavos; carrinho vazio = 0. |
| Cookie/session | token opaco; cookie sem itens/precos/dados sensiveis. |
| Ownership | user A nao acessa carrinho de user B; guest token A nao acessa B. |
| Merge | soma quantidades, limita estoque, remove/bloqueia indisponiveis, marca anonimo convertido. |
| Fallback | sem `DATABASE_URL`, resultado explicito e sem falsa persistencia. |
| Actions | adicionar, atualizar, remover, limpar e obter carrinho ativo retornam erros controlados. |

## 3. Testes e2e

| Fluxo | Resultado esperado |
|---|---|
| Visitante abre carrinho | Estado vazio sem login. |
| Visitante adiciona produto valido | Item aparece e subtotal recalcula. |
| Visitante tenta produto indisponivel | Erro controlado. |
| Quantidade acima do estoque | Erro controlado. |
| Usuario autenticado abre carrinho | Carrinho protegido por sessao/ownership. |
| Admin/manager usa carrinho | Sem bypass de estoque/disponibilidade. |
| Login com carrinho anonimo | Merge aplicado. |
| Sem banco real | Pagina carrega e fallback e explicito. |
| Checkout fora de escopo | Nenhum pedido/pagamento/frete/cupom e criado. |

## 4. Validacoes finais

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Esses comandos devem passar sem credenciais reais e sem conectar banco de producao.

## 5. Checks manuais

- Revisar cookies para confirmar que `guestCartToken` nao contem payload sensivel.
- Revisar logs/test snapshots para tokens/secrets.
- Revisar SQL gerado localmente antes de qualquer aplicacao.
- Confirmar que Stripe/webhook/checkout permanecem inativos.
- Confirmar que produto publico do catalogo continua sem exigir login.

## 6. Matriz de aceite

| Criterio | Evidencia |
|---|---|
| CA-01/CA-02 | E2E carrinho vazio visitante/autenticado. |
| CA-03 a CA-08 | Unit/actions/e2e de produto e estoque. |
| CA-09 a CA-11 | Unit/actions/e2e de atualizar/remover/limpar. |
| CA-12 | Unit de subtotal em centavos. |
| CA-13/CA-14 | Unit/e2e de ownership. |
| CA-15 | Unit/e2e de fallback sem banco. |
| CA-16 | Build/test sem credenciais reais. |
| CA-17 | Checks contra checkout/pagamento/frete/cupom/pedido. |
| CA-18 | Suite final obrigatoria. |
