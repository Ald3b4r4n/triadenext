# Roadmap: Fase 7 — Frete e Cotações no Carrinho

> Identificador: `005-fase-7-frete-cotacoes`
> Data: `2026-06-09`
> Requirements: `_reversa_forward/005-fase-7-frete-cotacoes/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 7 deve adicionar um módulo server-first de frete manual sobre o carrinho já existente, preservando ownership por `guestCartToken`/`session.userId`, fallback explícito e cálculo em centavos. O MVP usa regras manuais por UF e/ou faixa de CEP, retorna opções manuais com valor e prazo estimado, permite selecionar uma opção no carrinho e recalcula `partialTotalWithShippingCents = subtotalCents - discountCents + shippingAmountCents`. Correios, Jadlog e Melhor Envio ficam apenas como adapters futuros inativos, sem runtime, sem credenciais e sem cotação real. `free_shipping` passa a zerar somente frete manual calculado e elegível, sem criar frete artificial, checkout, pedido ou pagamento.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Guardrails Reversa | Plano escreve apenas em `_reversa_forward/`; implementação futura não deve modificar legado nem expor segredos. | respeita |
| Fallback explícito | Dev/test usam regra manual/fixture marcada; preview/produção sem banco falham seguro. | respeita |
| Server-side trust | CEP, cotação, seleção, frete, total e owner são validados/recalculados no servidor. | respeita |
| Escopo incremental | Frete manual entra antes de checkout/pedido/pagamento e não aciona transportadoras reais. | respeita |
| Paridade orientada pelo legado | Preserva conceito legado de frete no carrinho, mas reduz MVP para regra manual segura. | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Criar módulo `src/features/shipping` para domínio, schemas, fixtures, repository/service e admin actions. | Isola frete de carrinho/cupons e prepara adapters futuros sem ativá-los. | Colocar regras em `cart-service`; chamar provider externo direto. | 🟢 |
| D-02 | Usar apenas provider `manual` no MVP. | Decisão humana aprovada; evita credenciais, contratos externos e risco operacional. | Correios/Jadlog/Melhor Envio reais; Melhor Envio sandbox. | 🟢 |
| D-03 | Modelar regras manuais por UF e/ou faixa de CEP, com valor em centavos e prazo estimado. | Atende cotação nacional mínima por CEP sem peso/dimensões obrigatórios. | Peso/cubagem; subtotal/quantidade como critério obrigatório. | 🟢 |
| D-04 | Persistir seleção de frete no carrinho ou em cotação vinculada ao carrinho quando houver banco real. | Requirements exigem persistência por `userId`/`guestCartToken` e invalidação por carrinho/CEP/cupom. | Persistir no cookie; manter apenas em memória. | 🟢 |
| D-05 | Validar e normalizar CEP como entrada mínima. | Endereço completo está fora da Fase 7; CEP basta para regra manual. | Exigir endereço completo; usar endereço customer obrigatório. | 🟢 |
| D-06 | Definir validade padrão de 30 minutos para cotações manuais. | Reduz risco de preço/prazo stale e alinha com requirements aprovados. | Cotação sem expiração; validade indefinida. | 🟢 |
| D-07 | Invalidar ou recalcular frete quando itens, CEP ou cupom mudarem. | Carrinho, destino e cupom alteram elegibilidade e total com frete. | Manter frete selecionado até expirar; recalcular apenas no checkout. | 🟢 |
| D-08 | Aplicar `free_shipping` apenas sobre frete manual calculado e elegível. | Fase 6 preparou o tipo; Fase 7 ativa benefício restrito ao MVP manual. | Zerar frete externo; criar frete zero sem cotação; tratar como desconto monetário. | 🟢 |
| D-09 | Admin básico de regras manuais protegido por `requireAdminLike`. | Reutiliza padrão de admin produtos/cupons; customer/visitante bloqueados. | Admin sem auth; editar credenciais de transportadora; painel avançado. | 🟢 |
| D-10 | Manter adapters de Correios/Jadlog/Melhor Envio como contratos futuros inativos e documentados. | Preserva direção de paridade sem dependência operacional nesta fase. | Implementar API real; omitir qualquer desenho futuro. | 🟢 |

## 4. Premissas

Nenhuma premissa pendente de `[DOUBT]`. Todas as dúvidas foram resolvidas em `_reversa_forward/005-fase-7-frete-cotacoes/doubts.md` e a reauditoria de quality aprovou o requirements.

## 5. Delta arquitetural

| Componente | Arquivo de origem | Tipo de mudança | Resumo |
|------------|-------------------|-----------------|--------|
| `src/features/cart` | `_reversa_sdd/architecture.md#9-carrinho-e-sessao-de-compra` | regra-alterada | Carrinho passa a carregar destino/seleção de frete, `shippingAmountCents` e total parcial com frete. |
| `src/features/coupons` | `_reversa_sdd/architecture.md#10-cupons-e-descontos-no-carrinho` | regra-alterada | `free_shipping` deixa de ser apenas preparado e zera frete manual calculado elegível. |
| `src/features/shipping` | `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | componente-novo | Novo módulo server-first de regras manuais, cotação, seleção, fallback e contratos futuros inativos. |
| `src/app/(storefront)/carrinho` | `_reversa_sdd/architecture.md#9-carrinho-e-sessao-de-compra` | contrato-alterado | UI passa a aceitar CEP, listar opções manuais, selecionar frete e exibir total com frete. |
| `src/app/admin` | `_reversa_sdd/architecture.md#6-rotas-protegidas` | componente-novo | Admin mínimo de regras manuais protegido por admin/manager. |
| `src/db/schema.ts` | `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | regra-alterada | Avaliar/ativar `shipping_rules`, cotação/seleção e vínculo com `carts`, sem pedido/pagamento. |
| `src/lib/runtime-mode.ts` | `_reversa_sdd/architecture.md#3-runtime-e-guardrails` | regra-alterada | Mensagens/flags seguras para frete indisponível, fallback e preview/produção sem banco. |

## 6. Delta no modelo de dados

- `shipping_rules` deve representar regras manuais ativas/inativas por UF e/ou faixa de CEP, valor em centavos, prazo estimado e prioridade.
- Carrinho deve conseguir apontar para seleção/cotação de frete válida ou guardar snapshot mínimo de opção selecionada sem criar pedido.
- Cotações devem ter validade de 30 minutos, origem `manual`/`fixture`/`dev_fallback`, CEP normalizado e vínculo ao carrinho.
- Migration local pode ser necessária na implementação, mas não deve ser aplicada contra banco real sem validação humana explícita.
- Detalhe completo em: `_reversa_forward/005-fase-7-frete-cotacoes/data-delta.md`.

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Shipping domain/rules/quote | server-only module | `_reversa_forward/005-fase-7-frete-cotacoes/interfaces/shipping-domain-contract.md` |
| Shipping repository/service | server-only module | `_reversa_forward/005-fase-7-frete-cotacoes/interfaces/shipping-repository-service-contract.md` |
| Cart shipping actions | server actions | `_reversa_forward/005-fase-7-frete-cotacoes/interfaces/cart-shipping-actions-contract.md` |
| Admin shipping actions | server actions | `_reversa_forward/005-fase-7-frete-cotacoes/interfaces/admin-shipping-actions-contract.md` |
| Future provider adapters | server-only future contract | `_reversa_forward/005-fase-7-frete-cotacoes/interfaces/future-provider-adapters-contract.md` |

## 8. Plano de migração

1. Revisar `src/db/schema.ts` para confirmar estado real de `shipping_rules`, `carts` e campos de cotação/seleção.
2. Planejar delta local para regras manuais, cotações/seleção e índices por carrinho/CEP/expiração.
3. Gerar migration local somente na etapa de implementação, se o schema exigir.
4. Não aplicar migration em banco real sem validação humana explícita.
5. Manter fallback dev/test funcional sem `DATABASE_URL`.
6. Bloquear mutações reais de frete em preview/produção sem banco.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Frete forçado pelo payload | alto | médio | Actions aceitam apenas CEP/opção opaca e recalculam preço no servidor. |
| Cotação manual parecer transportadora real | alto | médio | UI e contratos marcam origem `manual`/`fixture`; docs proíbem promessa real. |
| `free_shipping` criar frete artificial | alto | médio | Exigir cotação manual válida antes de zerar frete. |
| Seleção de outro carrinho | alto | médio | Vincular cotação ao carrinho resolvido por `userId`/`guestCartToken`. |
| Fallback fingir persistência | alto | médio | Fixture marcada como dev/test; preview/prod falha seguro sem banco. |
| Scope creep para checkout/pedido | alto | médio | Contratos e testes negativos contra Stripe, pedido, reserva e baixa. |
| Regra manual alterada tornar cotação antiga incorreta | médio | médio | Expiração de 30 min e invalidação/recalculo em mudanças relevantes. |
| Admin de frete sem proteção | alto | baixo | Rota/action admin sempre usa `requireAdminLike`. |

## 10. Critério de pronto

- [ ] Requirements, doubts e quality permanecem aprovados.
- [ ] `actions.md` gerado em `/reversa-to-do`.
- [ ] `cross-check.md` sem CRITICAL/HIGH antes de codar.
- [ ] Cotação manual por CEP retorna opções aplicáveis ou erro controlado.
- [ ] Seleção de frete persiste no carrinho quando houver banco real.
- [ ] Alteração de carrinho, CEP ou cupom invalida/recalcula frete.
- [ ] `free_shipping` zera apenas frete manual calculado e elegível.
- [ ] Correios/Jadlog/Melhor Envio permanecem inativos e sem credenciais.
- [ ] Admin básico protegido por admin/manager.
- [ ] Fallback dev/test explícito e preview/prod seguro.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` passam na implementação futura.

## 11. Ordem recomendada de implementação

1. Revisar schema e estado real de `shipping_rules`/carrinho.
2. Definir tipos e domínio de CEP, regra manual, cotação, opção e seleção.
3. Criar repository/service de frete com fallback dev/test.
4. Integrar frete ao `cart-service` e ao cálculo de total.
5. Integrar `free_shipping` ao frete manual calculado.
6. Criar server actions de cotar/selecionar/remover frete.
7. Criar admin básico de regras manuais.
8. Atualizar UI do carrinho.
9. Cobrir testes unitários e de actions.
10. Cobrir E2E.
11. Atualizar documentação.
12. Rodar validações finais.

## 12. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-09 | Versão inicial gerada por `/reversa-plan` | reversa |
