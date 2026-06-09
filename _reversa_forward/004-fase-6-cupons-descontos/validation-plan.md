# Validation Plan — Fase 6 Cupons e Descontos

> Data: `2026-06-08`

## Unitários

| Área | Casos |
|------|-------|
| Normalização | Trim, uppercase e busca consistente por código. |
| Status | Ativo, inativo, futuro, expirado e esgotado. |
| Cálculo | Percentual, fixo, arredondamento e limite ao subtotal. |
| Subtotal mínimo | Aplica quando atende; recusa quando abaixo; invalida se cair abaixo. |
| Uso | `usedCount` consultado e não incrementado em apply/remove. |
| Frete grátis | Tipo preparado não altera total parcial nem frete real. |
| Ownership | Usuário/token não altera carrinho alheio. |
| Fallback | Dev/test explícito; preview/prod seguro; erro real sem fallback silencioso. |

## Integração/service

| Fluxo | Critério |
|-------|----------|
| Aplicar cupom válido | Carrinho retorna cupom, desconto e total parcial. |
| Remover cupom | Carrinho retorna desconto 0 e subtotal preservado. |
| Segundo cupom | Não acumula; substitui ou recusa conforme implementação definida. |
| Merge no login | Cupom aplicado é revalidado no carrinho resultante. |
| Admin listar cupons | Exige admin/manager e respeita fallback. |
| Admin criar/editar básico | Valida tipo, valor, datas, mínimo e ativo, se implementado. |

## E2E

| Cenário | Critério |
|---------|----------|
| Visitante aplica cupom válido | `/carrinho` mostra desconto e total parcial. |
| Cupom inválido | UI exibe erro controlado. |
| Remover cupom | UI remove desconto. |
| Subtotal mínimo | UI exibe aviso de subtotal insuficiente. |
| Frete grátis preparado | UI não promete frete real. |
| Admin cupons | Admin/manager acessa listagem; customer/visitante bloqueados. |
| Sem banco real | E2E roda com fixture/fallback explícito. |

## Validações finais obrigatórias

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

## Guardrails a verificar no diff final

- Não expor secrets, tokens, cookies ou `DATABASE_URL`.
- Não ler/copiar `.env`.
- Não conectar banco de produção.
- Não aplicar migration real.
- Não implementar checkout, pagamento, Stripe, frete real, pedido, reserva ou baixa de estoque.
- Não fazer deploy.
- Não fazer push.
