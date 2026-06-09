# Actions: Fase 7 — Frete e Cotações no Carrinho

> Identificador: `005-fase-7-frete-cotacoes`
> Data: `2026-06-09`
> Roadmap: `_reversa_forward/005-fase-7-frete-cotacoes/roadmap.md`
> Base: `requirements.md`, `doubts.md`, `audit/requirements-audit.md`, `data-delta.md`, `validation-plan.md`, `interfaces/*`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 103 |
| Ações paralelizáveis (`[//]`) | 10 |
| Maior cadeia de dependência | F7-001 → F7-103 |
| Próxima etapa | `/reversa-audit` |

## Guardrails

- Não implementar checkout, pagamento, Stripe, pedido, reserva ou baixa de estoque.
- Não chamar API externa real de Correios, Jadlog, Melhor Envio ou qualquer transportadora.
- Não exigir credenciais externas para build, test, e2e ou runtime da Fase 7.
- Não copiar `.env` do legado.
- Não expor secrets, `DATABASE_URL`, cookies, tokens ou credenciais.
- Não aplicar migration em banco real.
- Não conectar banco real sem validação humana explícita.
- Não modificar o Laravel legado.
- Não fazer deploy.
- Não fazer push.
- Commit local é opcional somente após todas as validações passarem.

## 1. Preparação e Segurança

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-001 | Confirmar diretório, branch, status Git e ausência de alterações funcionais inesperadas. | - | - | n/a | 🟢 | `[X]` |
| F7-002 | Registrar guardrails da Fase 7 no progresso antes de qualquer alteração funcional. | F7-001 | - | `_reversa_forward/005-fase-7-frete-cotacoes/progress.jsonl` | 🟢 | `[X]` |
| F7-003 | Ler requirements, doubts, audit, roadmap, data-delta, validation-plan e interfaces. | F7-002 | - | n/a | 🟢 | `[X]` |
| F7-004 | Mapear arquivos atuais de cart, coupons, auth/admin, schema e testes relevantes. | F7-003 | - | n/a | 🟢 | `[X]` |
| F7-005 | Confirmar que `actions.md` será executado sem push, deploy, banco real ou legado. | F7-004 | - | `_reversa_forward/005-fase-7-frete-cotacoes/progress.jsonl` | 🟢 | `[X]` |

## 2. Schema e Migrations Locais

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-006 | Revisar `src/db/schema.ts` para confirmar estado real de `shipping_rules`, `carts` e tabelas relacionadas. | F7-005 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F7-007 | Modelar/ajustar regras manuais de frete com provider manual, UF/faixa de CEP, valor em centavos, prazo, prioridade e ativo. | F7-006 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F7-008 | Modelar/ajustar estrutura de cotação vinculada ao carrinho, CEP normalizado, expiração e origem manual/fallback. | F7-007 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F7-009 | Modelar/ajustar seleção de frete no carrinho ou referência para cotação selecionada. | F7-008 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F7-010 | Garantir que schema não cria pedido, pagamento, Stripe, label, webhook ou baixa de estoque. | F7-009 | - | `src/db/schema.ts` | 🟢 | `[X]` |
| F7-011 | Gerar migration local se houver delta de schema. | F7-010 | - | `drizzle/` | 🟢 | `[X]` |
| F7-012 | Revisar SQL local gerado para confirmar ausência de checkout/pagamento/pedido e ausência de integração externa. | F7-011 | - | `drizzle/*.sql` | 🟢 | `[X]` |

## 3. Domínio de Frete

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-013 | Criar tipos conceituais de destino, regra manual, cotação, opção e seleção de frete. | F7-012 | - | `src/features/shipping/types.ts` | 🟢 | `[X]` |
| F7-014 | Criar schemas de CEP, cotação, seleção e regra manual com Zod. | F7-013 | - | `src/features/shipping/schemas.ts` | 🟢 | `[X]` |
| F7-015 | Implementar normalização de CEP brasileiro com forma canônica. | F7-014 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-016 | Implementar validação de CEP inválido, vazio e fora do formato aceito. | F7-015 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-017 | Implementar validação de UF quando regra manual usar estado. | F7-016 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-018 | Implementar validação de faixa de CEP com início/fim normalizados e ordenados. | F7-017 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-019 | Implementar validação de valor de frete em centavos, prazo estimado e prioridade. | F7-018 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-020 | Implementar expiração padrão de cotação manual em 30 minutos. | F7-019 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-021 | Garantir que domínio reconhece Correios/Jadlog/Melhor Envio apenas como adapters futuros inativos. | F7-020 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |

## 4. Regras Manuais

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-022 | Implementar matching de regra manual por UF. | F7-021 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-023 | Implementar matching de regra manual por faixa de CEP. | F7-022 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-024 | Implementar filtro de regra ativa/inativa. | F7-023 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-025 | Implementar ordenação/prioridade determinística entre regras aplicáveis. | F7-024 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-026 | Implementar geração de uma ou mais opções manuais com nome, valor e prazo. | F7-025 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |
| F7-027 | Implementar erro controlado para CEP sem regra aplicável. | F7-026 | - | `src/features/shipping/domain.ts` | 🟢 | `[X]` |

## 5. Cotação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-028 | Criar fixtures dev/test de regras manuais e cotações marcadas como fallback. | F7-027 | - | `src/features/shipping/server/shipping-fixtures.ts` | 🟢 | `[X]` |
| F7-029 | Implementar cálculo de `cartHash` ou equivalente para invalidar cotação quando itens mudam. | F7-028 | - | `src/features/shipping/server/shipping-service.ts` | 🟢 | `[X]` |
| F7-030 | Implementar fluxo de cotação por CEP para carrinho resolvido no servidor. | F7-029 | - | `src/features/shipping/server/shipping-service.ts` | 🟢 | `[X]` |
| F7-031 | Garantir que cotação retorna apenas opções `manual`, `fixture` ou `dev_fallback`. | F7-030 | - | `src/features/shipping/server/shipping-service.ts` | 🟢 | `[X]` |
| F7-032 | Garantir que cotação não chama API externa, não exige credencial e não promete transportadora real. | F7-031 | - | `src/features/shipping/server/shipping-service.ts` | 🟢 | `[X]` |
| F7-033 | Implementar comportamento preview/produção sem banco como falha segura para mutações reais de frete. | F7-032 | - | `src/features/shipping/server/shipping-service.ts` | 🟢 | `[X]` |

## 6. Seleção no Carrinho

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-034 | Estender tipos de carrinho para destino, opções, seleção, frete e total parcial com frete. | F7-033 | - | `src/features/cart/types.ts` | 🟢 | `[X]` |
| F7-035 | Implementar persistência/retrieval de seleção de frete no repository de carrinho. | F7-034 | - | `src/features/cart/server/cart-repository.ts` | 🟢 | `[X]` |
| F7-036 | Implementar remoção de seleção de frete no repository de carrinho. | F7-035 | - | `src/features/cart/server/cart-repository.ts` | 🟢 | `[X]` |
| F7-037 | Integrar seleção de frete ao `cart-service` para carrinho autenticado por `userId`. | F7-036 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F7-038 | Integrar seleção de frete ao `cart-service` para carrinho anônimo por `guestCartToken`. | F7-037 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F7-039 | Recalcular `shippingAmountCents` e `partialTotalWithShippingCents` no service de carrinho. | F7-038 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F7-040 | Invalidar seleção de frete ao adicionar, atualizar, remover ou limpar item. | F7-039 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F7-041 | Invalidar seleção de frete quando CEP de destino mudar. | F7-040 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F7-042 | Invalidar ou recalcular frete no merge de carrinho após login. | F7-041 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |

## 7. Integração com Cupons

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-043 | Ajustar domínio de cupons para representar `free_shipping` aplicável a frete manual calculado. | F7-042 | - | `src/features/coupons/domain.ts` | 🟢 | `[X]` |
| F7-044 | Integrar benefício `free_shipping` ao cálculo de frete sem alterar `discountCents`. | F7-043 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F7-045 | Garantir que `free_shipping` não cria opção de frete artificial. | F7-044 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F7-046 | Recalcular total com frete ao aplicar ou remover cupom. | F7-045 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |
| F7-047 | Garantir que apply/remove de cupom não cria checkout, pedido, pagamento, reserva ou baixa. | F7-046 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |

## 8. Repository/Service

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-048 | Criar repository de frete com Drizzle/fallback e leitura de regras manuais. | F7-033 | - | `src/features/shipping/server/shipping-repository.ts` | 🟢 | `[X]` |
| F7-049 | Implementar criação/listagem/seleção de cotações no repository de frete. | F7-048 | - | `src/features/shipping/server/shipping-repository.ts` | 🟢 | `[X]` |
| F7-050 | Implementar criação/edição/listagem de regras manuais no repository admin. | F7-049 | - | `src/features/shipping/server/shipping-repository.ts` | 🟢 | `[X]` |
| F7-051 | Garantir fallback dev/test explícito no repository de frete. | F7-050 | - | `src/features/shipping/server/shipping-repository.ts` | 🟢 | `[X]` |
| F7-052 | Garantir que erro real com `DATABASE_URL` não vira fixture silenciosa. | F7-051 | - | `src/features/shipping/server/shipping-repository.ts` | 🟢 | `[X]` |
| F7-053 | Criar service público de frete para cotar, selecionar, remover e invalidar frete. | F7-052 | - | `src/features/shipping/server/shipping-service.ts` | 🟢 | `[X]` |
| F7-054 | Integrar service de frete ao service de carrinho sem ciclo indevido de dependências. | F7-053, F7-047 | - | `src/features/cart/server/cart-service.ts` | 🟢 | `[X]` |

## 9. Server Actions

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-055 | Criar `quoteShippingAction` validando CEP e resolvendo owner no servidor. | F7-054 | - | `src/features/cart/server/cart-actions.ts` | 🟢 | `[X]` |
| F7-056 | Criar `selectShippingOptionAction` usando quote token opaco e ownership. | F7-055 | - | `src/features/cart/server/cart-actions.ts` | 🟢 | `[X]` |
| F7-057 | Criar `removeShippingSelectionAction` para limpar frete selecionado. | F7-056 | - | `src/features/cart/server/cart-actions.ts` | 🟢 | `[X]` |
| F7-058 | Atualizar `getCartAction` para retornar frete, opções, seleção e total com frete. | F7-057 | - | `src/features/cart/server/cart-actions.ts` | 🟢 | `[X]` |
| F7-059 | Garantir que actions rejeitam payload com frete, total, owner, `cartId` ou provider confiável. | F7-058 | - | `src/features/cart/server/cart-actions.ts` | 🟢 | `[X]` |
| F7-060 | Criar admin shipping actions para listar, criar e editar regras manuais. | F7-050 | - | `src/features/shipping/server/admin-shipping-actions.ts` | 🟢 | `[X]` |
| F7-061 | Proteger admin shipping actions com `requireAdminLike` e bloqueios seguros. | F7-060 | - | `src/features/shipping/server/admin-shipping-actions.ts` | 🟢 | `[X]` |

## 10. Admin Básico de Frete

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-062 | Criar rota/página mínima de listagem de regras manuais de frete. | F7-061 | - | `src/app/admin/frete/page.tsx` | 🟢 | `[X]` |
| F7-063 | Criar componentes de tabela/listagem de regras manuais. | F7-062 | - | `src/features/shipping/components/*` | 🟢 | `[X]` |
| F7-064 | Criar formulário básico de regra manual com UF/faixa CEP, valor, prazo, ativo e prioridade. | F7-063 | - | `src/features/shipping/components/*` | 🟢 | `[X]` |
| F7-065 | Criar rota de nova regra manual, se compatível com a estrutura admin existente. | F7-064 | - | `src/app/admin/frete/novo/page.tsx` | 🟢 | `[X]` |
| F7-066 | Criar rota de edição de regra manual, se compatível com a estrutura admin existente. | F7-065 | - | `src/app/admin/frete/[id]/editar/page.tsx` | 🟢 | `[X]` |
| F7-067 | Garantir bloqueio de customer/visitante e mensagens de banco/auth indisponíveis. | F7-066 | - | `src/app/admin/frete/**` | 🟢 | `[X]` |
| F7-068 | Garantir que admin não expõe credenciais, contratos, SLA, relatórios ou painel avançado. | F7-067 | - | `src/app/admin/frete/**` | 🟢 | `[X]` |

## 11. UI no Carrinho

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-069 | Criar componente de formulário de CEP para cotação de frete. | F7-058 | - | `src/features/cart/components/*` | 🟢 | `[X]` |
| F7-070 | Criar componente de lista de opções manuais de frete. | F7-069 | - | `src/features/cart/components/*` | 🟢 | `[X]` |
| F7-071 | Criar interação de seleção/removal de frete via server actions. | F7-070 | - | `src/features/cart/components/*` | 🟢 | `[X]` |
| F7-072 | Exibir frete, total parcial com frete e mensagens de invalidação no carrinho. | F7-071 | - | `src/features/cart/components/*` | 🟢 | `[X]` |
| F7-073 | Sinalizar fixture/mock/dev fallback quando aplicável. | F7-072 | - | `src/features/cart/components/*` | 🟢 | `[X]` |
| F7-074 | Exibir mensagem clara quando `free_shipping` zerar frete manual. | F7-073 | - | `src/features/cart/components/*` | 🟢 | `[X]` |
| F7-075 | Garantir que CTA de checkout permanece desabilitado/fora de escopo. | F7-074 | - | `src/app/(storefront)/carrinho/page.tsx` | 🟢 | `[X]` |

## 12. Providers Futuros Inativos

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-076 | Criar contratos/types futuros de providers externos sem implementação runtime. | F7-021 | `[//]` | `src/features/shipping/future-providers.ts` | 🟢 | `[X]` |
| F7-077 | Garantir que nenhum código chama Correios, Jadlog ou Melhor Envio. | F7-076 | - | `src/features/shipping/**` | 🟢 | `[X]` |
| F7-078 | Garantir que nenhuma dependência externa de transportadora é instalada. | F7-077 | - | `package.json` | 🟢 | `[X]` |

## 13. Testes Unitários

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-079 | Testar normalização e validação de CEP. | F7-021 | `[//]` | `src/tests/unit/shipping-domain.test.ts` | 🟢 | `[X]` |
| F7-080 | Testar regra manual por UF e faixa de CEP. | F7-027 | - | `src/tests/unit/shipping-domain.test.ts` | 🟢 | `[X]` |
| F7-081 | Testar regra inativa, prioridade e ausência de cobertura. | F7-027 | - | `src/tests/unit/shipping-domain.test.ts` | 🟢 | `[X]` |
| F7-082 | Testar expiração de cotação e invalidação por `cartHash`. | F7-033 | `[//]` | `src/tests/unit/shipping-service.test.ts` | 🟢 | `[X]` |
| F7-083 | Testar fallback sem banco e preview/prod seguro. | F7-053 | - | `src/tests/unit/shipping-service.test.ts` | 🟢 | `[X]` |
| F7-084 | Testar payload malicioso e ownership nas actions de frete. | F7-059 | `[//]` | `src/tests/unit/cart-shipping-actions.test.ts` | 🟢 | `[X]` |
| F7-085 | Testar integração de seleção de frete e total com carrinho. | F7-054 | - | `src/tests/unit/cart-shipping-service.test.ts` | 🟢 | `[X]` |
| F7-086 | Testar `free_shipping` zerando apenas frete manual e sem criar frete artificial. | F7-047 | `[//]` | `src/tests/unit/cart-shipping-coupon.test.ts` | 🟢 | `[X]` |
| F7-087 | Testar admin shipping actions protegidas por admin/manager. | F7-061 | `[//]` | `src/tests/unit/admin-shipping-actions.test.ts` | 🟢 | `[X]` |
| F7-088 | Testar que providers externos permanecem inativos e sem chamadas reais. | F7-078 | `[//]` | `src/tests/unit/shipping-provider-guards.test.ts` | 🟢 | `[X]` |

## 14. E2E

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-089 | E2E visitante informa CEP e vê opções manuais. | F7-075 | - | `src/tests/e2e/shipping.spec.ts` | 🟢 | `[X]` |
| F7-090 | E2E visitante seleciona frete e total parcial com frete atualiza. | F7-089 | - | `src/tests/e2e/shipping.spec.ts` | 🟢 | `[X]` |
| F7-091 | E2E `free_shipping` zera frete manual elegível sem checkout/pedido. | F7-090 | - | `src/tests/e2e/shipping.spec.ts` | 🟢 | `[X]` |
| F7-092 | E2E CEP sem cobertura mostra erro controlado. | F7-091 | - | `src/tests/e2e/shipping.spec.ts` | 🟢 | `[X]` |
| F7-093 | E2E admin lista regras manuais e bloqueia customer/visitante. | F7-068 | `[//]` | `src/tests/e2e/admin-shipping.spec.ts` | 🟢 | `[X]` |

## 15. Documentação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-094 | Criar documentação funcional de frete manual, fallback e fora de escopo. | F7-075 | `[//]` | `docs/features/shipping.md` | 🟢 | `[X]` |
| F7-095 | Criar documentação arquitetural de frete, repository/service/actions e providers futuros inativos. | F7-054 | `[//]` | `docs/architecture/shipping.md` | 🟢 | `[X]` |
| F7-096 | Atualizar docs de cart, coupons e database com frete manual e `free_shipping`. | F7-094, F7-095 | - | `docs/features/cart.md`, `docs/features/coupons.md`, `docs/architecture/database.md` | 🟢 | `[X]` |

## 16. Validações Finais e Commit Opcional

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| F7-097 | Rodar `pnpm lint`. | F7-088, F7-093, F7-096 | - | n/a | 🟢 | `[X]` |
| F7-098 | Rodar `pnpm typecheck`. | F7-097 | - | n/a | 🟢 | `[X]` |
| F7-099 | Rodar `pnpm test`. | F7-098 | - | n/a | 🟢 | `[X]` |
| F7-100 | Rodar `pnpm build`. | F7-099 | - | n/a | 🟢 | `[X]` |
| F7-101 | Rodar `pnpm test:e2e`. | F7-100 | - | n/a | 🟢 | `[X]` |
| F7-102 | Revisar diff final contra guardrails da Fase 7. | F7-101 | - | n/a | 🟢 | `[X]` |
| F7-103 | Criar commit local opcional somente se todas as validações passarem. | F7-102 | - | n/a | 🟢 | `[X]` |

## Dependências críticas

- Schema e migration local (`F7-006` a `F7-012`) vêm antes de repository/service real.
- Domínio e regras manuais (`F7-013` a `F7-027`) vêm antes de cotação e seleção.
- Cotação (`F7-028` a `F7-033`) vem antes de seleção no carrinho.
- Integração com carrinho (`F7-034` a `F7-042`) vem antes de `free_shipping` efetivo e actions.
- Repository/service (`F7-048` a `F7-054`) vem antes de server actions e UI.
- Server actions (`F7-055` a `F7-061`) vêm antes de UI e E2E.
- Tarefas que tocam `src/db/schema.ts`, `drizzle/`, `src/features/shipping/**`, `src/features/cart/**`, `src/features/coupons/**`, `src/app/(storefront)/carrinho/**` e `src/app/admin/frete/**` são sequenciais.

## Paralelismo autorizado

Marcadas com `[//]` apenas tarefas que podem ser preparadas em paralelo quando seus arquivos não conflitam e suas dependências estiverem satisfeitas:

- F7-076
- F7-079
- F7-082
- F7-084
- F7-086
- F7-087
- F7-088
- F7-093
- F7-094
- F7-095

Apesar disso, a execução final deve respeitar dependências e rodar validações completas ao final.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-09 | Versão inicial gerada por `/reversa-to-do` | reversa |
