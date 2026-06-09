# Interface Contract: Admin Shipping Actions

> Data: `2026-06-09`
> Tipo: Next.js server actions administrativas

## Actions esperadas

| Action | Policy | Entrada |
|--------|--------|---------|
| `listManualShippingRulesAction` | `requireAdminLike` | filtros simples opcionais |
| `createManualShippingRuleAction` | `requireAdminLike` | nome, UF/faixa de CEP, valor em centavos, prazo, ativo, prioridade |
| `updateManualShippingRuleAction` | `requireAdminLike` | id da regra e campos permitidos |

## Campos permitidos

- `name`
- `state`
- `postalCodeStart`
- `postalCodeEnd`
- `priceCents`
- `estimatedDays`
- `estimatedLabel`
- `priority`
- `isActive`

## Bloqueios

- Customer e visitante não acessam.
- Sem banco/auth prontos, admin real falha seguro.
- Sem `DATABASE_URL`, não fingir persistência real.
- Não configurar credenciais externas.
- Não configurar contrato, SLA real, transportadora real, relatórios ou painel avançado.

## Erros controlados

- `unauthenticated`
- `forbidden`
- `auth_not_ready`
- `database_unavailable`
- `shipping_rule_invalid`
- `shipping_rule_not_found`
- `validation_error`
