# Roadmap: Fase 6 — Cupons e Descontos no Carrinho

> Identificador: `004-fase-6-cupons-descontos`
> Data: `2026-06-08`
> Requirements: `_reversa_forward/004-fase-6-cupons-descontos/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 6 deve adicionar domínio de cupons sobre o carrinho já implementado na Fase 5, preservando o padrão server-only de repository/service/actions, fallback explícito e ownership server-side. O cupom será validado e calculado no servidor, com tipos `percentage`, `fixed_amount` e `free_shipping` preparado, sem benefício real de frete. O carrinho passará a expor subtotal, desconto e total parcial, mantendo checkout, pagamento, frete real, pedido, reserva e baixa de estoque fora de escopo. A área admin receberá fundação mínima para listar cupons e, se seguro na execução, criar/editar cupons básicos com `requireAdminLike`.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Guardrails Reversa | Escreve plano apenas em `_reversa_forward/`; implementação futura não deve modificar legado nem expor segredos. | respeita |
| Fallback explícito | Mantém dev/test com fixture controlada e preview/produção sem banco com falha segura. | respeita |
| Server-side trust | Desconto, subtotal, owner e cupom aplicado são recalculados no servidor. | respeita |
| Escopo incremental | Cupom entra antes de checkout/frete/pedido sem acionar esses domínios. | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Criar módulo conceitual `src/features/coupons` para domínio, schemas, repository/service e admin actions. | Isola regras de cupom e evita inflar `src/features/cart` além da integração necessária. | Regras espalhadas em cart-service; cupom inline na UI. | 🟢 |
| D-02 | Integrar cupom ao `CartView` com `coupon`, `discountCents`, `partialTotalCents` e mensagens de elegibilidade. | Carrinho já é a superfície de subtotal e ownership; desconto precisa aparecer junto ao cálculo do carrinho. | Criar tela separada de desconto; calcular no cliente. | 🟢 |
| D-03 | Persistir referência do cupom aplicado no carrinho quando houver banco real. | Requirements exigem persistência do cupom aplicado e carrinho real já vive em `carts`. | Persistir cupom no cookie; manter só em memória. | 🟢 |
| D-04 | Usar `minimumSubtotalCents` no cupom. | Decisão humana: subtotal mínimo entra na Fase 6 e deve ser validado/revalidado. | Subtotal mínimo fora da fase; mínimo em decimal. | 🟢 |
| D-05 | Não incrementar `usedCount` ao aplicar/remover cupom. | Aplicação no carrinho não é venda final; consumo fica para pedido/checkout futuro. | Consumir uso na aplicação; consumir uso na visualização. | 🟢 |
| D-06 | Tratar `free_shipping` como tipo reservado/preparado. | Frete real está fora do escopo e não pode ser prometido. | Zerar frete; esconder completamente o tipo do modelo. | 🟢 |
| D-07 | Aceitar apenas um cupom por carrinho. | Decisão humana e redução de complexidade para MVP. | Cupons acumulativos; múltiplos cupons por item. | 🟢 |
| D-08 | Admin mínimo protegido por `requireAdminLike`. | Padrão Fase 4 para superfícies administrativas. | Admin sem auth; customer criando cupom por action. | 🟢 |
| D-09 | Fallback dev/test deve usar cupons fixture marcados como não persistidos. | Build/test/e2e não exigem banco real e não fingem persistência. | Fallback silencioso; bloquear tudo em dev/test. | 🟢 |

## 4. Premissas

Nenhuma premissa pendente de `[DOUBT]`. Todas as dúvidas foram resolvidas em `_reversa_forward/004-fase-6-cupons-descontos/doubts.md`.

## 5. Delta arquitetural

| Componente | Arquivo de origem | Tipo de mudança | Resumo |
|------------|-------------------|-----------------|--------|
| `src/features/cart` | `_reversa_sdd/architecture.md#9-carrinho-e-sessao-de-compra` | regra-alterada | Recalcular carrinho com cupom aplicado, desconto e total parcial. |
| `src/features/coupons` | `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | componente-novo | Novo módulo server-first para cupom, validação, cálculo e repository/fallback. |
| `src/app/(storefront)/carrinho` | `_reversa_sdd/architecture.md#9-carrinho-e-sessao-de-compra` | contrato-alterado | UI passa a aplicar/remover cupom e exibir desconto. |
| `src/app/admin` | `_reversa_sdd/architecture.md#6-rotas-protegidas` | componente-novo | Admin mínimo de cupons protegido por admin/manager. |
| `src/db/schema.ts` | `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | regra-alterada | Confirmar/ajustar `coupons`, `minimumSubtotalCents` e vínculo de cupom aplicado ao carrinho. |
| `src/lib/runtime-mode.ts` | `_reversa_sdd/architecture.md#3-runtime-e-guardrails` | regra-alterada | Mensagens de fallback/indisponibilidade para cupom. |

## 6. Delta no modelo de dados

- `coupons` deve ser confirmado ou ajustado para tipos, datas, limite global, `usedCount`, ativo e `minimumSubtotalCents`.
- `carts` deve guardar referência ao cupom aplicado ou relação equivalente de um cupom por carrinho.
- Migration local pode ser necessária, mas não deve ser aplicada contra banco real nesta etapa.
- Detalhe completo em: `_reversa_forward/004-fase-6-cupons-descontos/data-delta.md`.

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Coupon domain/calculation | server-only module | `_reversa_forward/004-fase-6-cupons-descontos/interfaces/coupon-domain-contract.md` |
| Coupon repository/service | server-only module | `_reversa_forward/004-fase-6-cupons-descontos/interfaces/coupon-repository-service-contract.md` |
| Cart coupon actions | server actions | `_reversa_forward/004-fase-6-cupons-descontos/interfaces/cart-coupon-actions-contract.md` |
| Admin coupon actions | server actions | `_reversa_forward/004-fase-6-cupons-descontos/interfaces/admin-coupon-actions-contract.md` |

## 8. Plano de migração

1. Revisar `src/db/schema.ts` para descobrir o estado real de `coupons` e vínculo com `carts`.
2. Planejar delta local: tipo de cupom, `minimumSubtotalCents`, índices/unique por código normalizado e FK de cupom aplicado no carrinho.
3. Gerar migration local com `pnpm db:generate` somente na etapa de implementação, se necessário.
4. Não aplicar migration em banco real sem validação humana explícita.
5. Manter fallback dev/test sem exigir `DATABASE_URL`.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Consumir `usedCount` cedo demais | alto | médio | Testes e contrato proibindo incremento em apply/remove. |
| Frete grátis parecer benefício real | alto | médio | Mensagens de recurso preparado/indisponível e nenhum cálculo de frete. |
| Desconto forçado pelo cliente | alto | médio | Actions ignoram desconto/total do payload e recalculam no servidor. |
| Fallback fingir persistência | alto | médio | Fixture marcada como `dev_fallback`; preview/prod falha segura. |
| Admin sem proteção | alto | baixo | Toda rota/action admin usa `requireAdminLike`. |
| Scope creep para checkout/pedido | alto | médio | Critérios e testes de ausência de Stripe, pedido, frete real e baixa de estoque. |

## 10. Critério de pronto

- [ ] Requirements, doubts e quality permanecem aprovados.
- [ ] `actions.md` gerado em `/reversa-to-do`.
- [ ] `cross-check.md` sem CRITICAL/HIGH antes de codar.
- [ ] Cupons percentual/fixo aplicam desconto correto e limitado ao subtotal.
- [ ] Cupom de frete grátis fica preparado sem benefício real.
- [ ] `usedCount` não é consumido em apply/remove.
- [ ] Admin mínimo protegido por admin/manager.
- [ ] Fallback dev/test explícito e preview/prod seguro.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` passam na implementação futura.

## 11. Ordem recomendada de implementação

1. Revisar schema e modelagem local de coupons/carts.
2. Definir domínio de cupom e cálculo.
3. Criar repository/service com fallback.
4. Integrar service de cupom ao cart-service.
5. Criar server actions do carrinho para aplicar/remover cupom.
6. Criar admin mínimo de cupons.
7. Atualizar UI do carrinho.
8. Cobrir testes unitários.
9. Cobrir E2E.
10. Atualizar documentação.
11. Rodar validações finais.

## 12. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-08 | Versão inicial gerada por `/reversa-plan` | reversa |
