# Onboarding — Fase 6 Cupons e Descontos

> Objetivo: orientar a futura implementação e validação manual da feature.

## 1. Pré-condições

- Estar em `D:\Projetos\triade-essenza-next`.
- Não usar o Laravel legado como diretório de trabalho.
- Não ler `.env` real nem expor `DATABASE_URL`.
- Não rodar migrations reais.
- Não fazer deploy ou push.

## 2. Leitura inicial

1. Ler `_reversa_forward/004-fase-6-cupons-descontos/requirements.md`.
2. Ler `_reversa_forward/004-fase-6-cupons-descontos/doubts.md`.
3. Ler `_reversa_forward/004-fase-6-cupons-descontos/audit/requirements-audit.md`.
4. Ler este plano técnico e os contratos em `interfaces/`.

## 3. Como testar manualmente depois da implementação

1. Abrir `/carrinho` sem banco real e confirmar aviso de fallback.
2. Aplicar cupom fixture percentual válido.
3. Confirmar subtotal, desconto e total parcial.
4. Remover cupom e confirmar desconto 0.
5. Tentar cupom inativo, futuro, expirado, esgotado e abaixo do subtotal mínimo.
6. Tentar cupom de frete grátis preparado e confirmar mensagem de indisponibilidade/preparo.
7. Confirmar que checkout continua desabilitado e não cria pedido.
8. Acessar admin de cupons como visitante/customer e confirmar bloqueio.
9. Acessar admin de cupons como admin/manager em ambiente com auth/banco prontos, quando disponível.

## 4. Cupons fixture sugeridos

| Código | Tipo | Regra |
|--------|------|-------|
| `TRIADE10` | percentage | 10% válido. |
| `FIXO20` | fixed_amount | R$ 20,00 em centavos. |
| `MINIMO100` | percentage | Exige subtotal mínimo. |
| `EXPIRADO` | percentage | Expirado. |
| `FUTURO` | fixed_amount | Ainda não vigente. |
| `ESGOTADO` | percentage | `usedCount >= usageLimit`. |
| `FRETEGRATIS` | free_shipping | Preparado, sem benefício real. |

## 5. Sinais de regressão

- Cupom aplicado altera frete real.
- `usedCount` sobe ao aplicar/remover no carrinho.
- Payload client-side define desconto aceito pelo servidor.
- Admin/customer aplica cupom em carrinho alheio.
- Fallback sem banco promete persistência real.
- Código cria pedido, chama Stripe, reserva ou baixa estoque.

## 6. Validações finais esperadas na implementação

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`
