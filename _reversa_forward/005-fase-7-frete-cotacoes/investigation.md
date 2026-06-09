# Investigation — Fase 7 Frete e Cotações

> Data: `2026-06-09`
> Base: `requirements.md`, `doubts.md`, `audit/requirements-audit.md`, `_reversa_sdd/*`

## 1. Fontes consultadas

| Fonte | Uso no plano | Confiança |
|-------|--------------|-----------|
| `_reversa_sdd/architecture.md#9-carrinho-e-sessao-de-compra` | Padrão de carrinho server-first, ownership e fallback. | 🟢 |
| `_reversa_sdd/architecture.md#10-cupons-e-descontos-no-carrinho` | Integração atual de cupom e total parcial. | 🟢 |
| `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | Presença preparada de `shipping_rules`. | 🟢 |
| `_reversa_sdd/permissions.md#carrinho` | Acesso por `guestCartToken`/`session.userId`, sem bypass admin. | 🟢 |
| `_reversa_sdd/state-machines.md#carrinho` | Estados de carrinho active/guest/user/fallback/unavailable. | 🟢 |
| `_reversa_sdd/dependencies.md#scripts-relevantes` | Validações futuras obrigatórias. | 🟢 |
| Legado `_reversa_sdd/shipping/requirements.md` | Paridade conceitual: cotação selecionada válida e expirada. | 🟢 |

## 2. Estado atual confirmado

- Carrinho já possui domínio, repository/service/actions e UI mínima.
- Cupons já possuem domínio, repository/service/actions/admin e integração com carrinho.
- `free_shipping` existe como tipo modelado, mas na Fase 6 não aplicava frete.
- Schema cita `shipping_rules` como modelado/preparado, mas não ativado no fluxo funcional.
- Auth/policies reais existem e `requireAdminLike` protege admin.
- Fallback sem `DATABASE_URL` é padrão do projeto em dev/test; preview/produção falham seguro.

## 3. Alternativas avaliadas

| Alternativa | Decisão | Motivo |
|-------------|---------|--------|
| Frete manual por UF/faixa de CEP | Escolhida | Atende MVP sem credenciais, sem API real e com testabilidade local. |
| Correios/Jadlog/Melhor Envio reais | Descartada | Fora da Fase 7; exigiria credenciais/contratos e risco de cotação real. |
| Frete calculado por peso/dimensão | Descartada no MVP | Dados não são obrigatórios e não devem bloquear produtos. |
| Persistir frete em cookie | Descartada | Cookie deve seguir opaco; valores/preços não devem ir para cliente como fonte de verdade. |
| Aplicar `free_shipping` como desconto monetário | Descartada | Benefício deve afetar apenas `shippingAmountCents` do frete manual. |
| Criar pedido pendente para guardar frete | Descartada | Checkout/pedido estão fora de escopo. |

## 4. Padrões aplicáveis

- Server-only modules para regras sensíveis.
- Zod para validação de CEP, regra manual e actions.
- Repository/service para separar Drizzle/fallback.
- Server actions como fronteira de mutação.
- Erros controlados e mensagens seguras via padrão de runtime.
- UI do carrinho consumindo apenas valores retornados pelo servidor.

## 5. Questões fechadas

- Sem `[DOUBT]` pendente.
- CEP é entrada mínima.
- Validade de cotação é 30 minutos.
- Admin básico entra.
- `free_shipping` zera frete manual elegível.
- Provedores externos reais ficam inativos.

## 6. Observações para implementação futura

- Confirmar se `shipping_rules` já existe em `src/db/schema.ts` e se seus campos atendem UF/faixa de CEP.
- Confirmar melhor forma de persistir seleção: campos em `carts` ou tabela de `shipping_quotes`.
- Evitar qualquer env de transportadora na Fase 7.
- Garantir testes negativos contra payload de frete, API real e checkout/pedido.
