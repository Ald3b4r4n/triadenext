# Actions — Fase 6 Cupons e Descontos

> Feature: `004-fase-6-cupons-descontos`
> Data: `2026-06-08`
> Base: `requirements.md`, `doubts.md`, `requirements-audit.md`, `roadmap.md`, `data-delta.md`, `validation-plan.md`, `interfaces/*`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 86 |
| Ações paralelizáveis | 6 |
| Maior cadeia crítica | F6-001 → F6-086 |
| Próxima etapa | `/reversa-audit` |

## Guardrails

- Não implementar checkout, pagamento, Stripe, frete real, pedido, reserva ou baixa de estoque.
- Não consumir `usedCount` ao aplicar/remover cupom no carrinho.
- Não implementar cupom acumulativo, limite por usuário, restrição por produto/categoria, campanhas avançadas ou relatórios.
- Não aplicar migration em banco real.
- Não conectar banco de produção.
- Não copiar `.env` do legado.
- Não expor secrets, `DATABASE_URL`, cookies, tokens ou credenciais.
- Não fazer deploy.
- Não fazer push.

## 1. Preparação e Segurança

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-001 | Confirmar diretório e Git | Confirmar projeto Next, branch e worktree antes de codar. | n/a | - | validation | - | `git status` mostra apenas artefatos Reversa pendentes esperados. | alto | `[X]` |
| F6-002 | Revisar guardrails da Fase 6 | Registrar escopo proibido antes de qualquer alteração funcional. | `_reversa_forward/004-fase-6-cupons-descontos/progress.jsonl` | F6-001 | validation | - | Progresso inicial registra proibições de checkout, frete real, pedido, push e migration real. | alto | `[X]` |
| F6-003 | Ler contratos do plano | Ler requirements, doubts, roadmap, data-delta e interfaces antes de implementar. | n/a | F6-002 | validation | - | Agente confirma contratos lidos e sem dúvidas abertas. | médio | `[X]` |
| F6-004 | Mapear arquivos atuais de cart/coupon | Inventariar schema, cart service/actions/UI e presença atual de coupons. | `src/db/schema.ts`, `src/features/cart/**`, `src/app/(storefront)/carrinho/**` | F6-003 | validation | - | Lista de arquivos-alvo reais registrada em progresso. | médio | `[X]` |

## 2. Schema e Migrations Locais

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-005 | Revisar schema de coupons | Verificar se `coupons` existe e quais campos faltam. | `src/db/schema.ts` | F6-004 | code | - | Campos existentes/faltantes identificados sem aplicar migration. | alto | `[X]` |
| F6-006 | Ajustar enum/tipo de cupom | Modelar `percentage`, `fixed_amount`, `free_shipping` preparado. | `src/db/schema.ts` | F6-005 | code | - | Schema representa tipos do MVP e frete grátis preparado. | alto | `[X]` |
| F6-007 | Ajustar campos de cupom | Garantir código, ativo, datas, limite global, `usedCount`, valor e subtotal mínimo. | `src/db/schema.ts` | F6-006 | code | - | `minimumSubtotalCents` e campos mínimos existem ou são preservados. | alto | `[X]` |
| F6-008 | Garantir unicidade de código | Planejar/ajustar unique para código normalizado. | `src/db/schema.ts` | F6-007 | code | - | Código normalizado tem constraint/índice coerente. | alto | `[X]` |
| F6-009 | Modelar cupom aplicado no carrinho | Persistir referência única de cupom aplicado por carrinho. | `src/db/schema.ts` | F6-008 | code | - | Carrinho suporta no máximo um cupom aplicado. | alto | `[X]` |
| F6-010 | Revisar relações e índices | Ajustar FK/índices de coupon/cart sem afetar pedido/frete. | `src/db/schema.ts` | F6-009 | code | - | Relações não criam pedido, frete ou consumo de uso. | médio | `[X]` |
| F6-011 | Gerar migration local | Gerar migration local se houver delta de schema. | `drizzle/` | F6-010 | config | - | Nova migration local gerada ou pendência explicada; nenhuma migration aplicada. | alto | `[X]` |
| F6-012 | Revisar SQL da migration | Conferir que migration local não inclui checkout/frete/pedido indevidos. | `drizzle/*.sql` | F6-011 | validation | - | SQL local contém apenas delta de cupons/carrinho. | alto | `[X]` |

## 3. Domínio de Cupons

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-013 | Criar tipos de cupom | Definir tipos conceituais de coupon, status e cálculo. | `src/features/coupons/types.ts` | F6-012 | code | - | Tipos cobrem percent, fixed, free_shipping preparado e status. | médio | `[X]` |
| F6-014 | Criar schemas de input | Validar código, tipo, valor, datas, limite e subtotal mínimo. | `src/features/coupons/schemas.ts` | F6-013 | code | - | Schemas rejeitam payload inválido e campos fora de escopo. | médio | `[X]` |
| F6-015 | Normalizar código | Implementar normalização trim/uppercase consistente. | `src/features/coupons/domain.ts` | F6-014 | code | - | Código normalizado é determinístico. | médio | `[X]` |
| F6-016 | Calcular status de cupom | Implementar ativo, inativo, futuro, expirado e esgotado. | `src/features/coupons/domain.ts` | F6-015 | code | - | Status cobre datas, ativo e limite global. | médio | `[X]` |
| F6-017 | Validar tipo percentual | Garantir percentual positivo e domínio suportado. | `src/features/coupons/domain.ts` | F6-016 | code | - | Percentual inválido é rejeitado. | médio | `[X]` |
| F6-018 | Validar tipo valor fixo | Garantir valor fixo positivo em centavos. | `src/features/coupons/domain.ts` | F6-017 | code | - | Valor fixo inválido é rejeitado. | médio | `[X]` |
| F6-019 | Modelar free_shipping preparado | Retornar indisponível/preparado sem benefício real. | `src/features/coupons/domain.ts` | F6-018 | code | - | Tipo não altera frete nem total parcial. | alto | `[X]` |
| F6-020 | Validar subtotal mínimo | Implementar elegibilidade por `minimumSubtotalCents`. | `src/features/coupons/domain.ts` | F6-019 | code | - | Subtotal abaixo do mínimo gera erro controlado. | médio | `[X]` |

## 4. Cálculo de Desconto

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-021 | Calcular percentual | Calcular desconto percentual sobre subtotal em centavos. | `src/features/coupons/domain.ts` | F6-020 | code | - | Resultado é determinístico e em centavos. | médio | `[X]` |
| F6-022 | Calcular valor fixo | Calcular desconto fixo em centavos. | `src/features/coupons/domain.ts` | F6-021 | code | - | Valor fixo reduz subtotal corretamente. | médio | `[X]` |
| F6-023 | Limitar desconto ao subtotal | Garantir `discountCents <= subtotalCents`. | `src/features/coupons/domain.ts` | F6-022 | code | - | Desconto nunca deixa total parcial negativo. | alto | `[X]` |
| F6-024 | Calcular total parcial | Gerar `partialTotalCents = subtotalCents - discountCents`. | `src/features/coupons/domain.ts` | F6-023 | code | - | Total parcial ignora frete real e pedido. | médio | `[X]` |
| F6-025 | Padronizar mensagens de cálculo | Retornar mensagens para cupom aplicado, bloqueado ou preparado. | `src/features/coupons/domain.ts` | F6-024 | code | - | Mensagens não expõem dados sensíveis. | baixo | `[X]` |

## 5. Repository/Service de Cupons

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-026 | Criar fixtures de cupons | Definir cupons dev/test explícitos. | `src/features/coupons/server/coupon-fixtures.ts` | F6-025 | code | - | Fixtures indicam `dev_fallback` e cobrem casos principais. | médio | `[X]` |
| F6-027 | Criar repository base | Implementar estrutura repository Drizzle/fallback. | `src/features/coupons/server/coupon-repository.ts` | F6-026 | code | - | Repository distingue db real, dev_fallback e unavailable. | alto | `[X]` |
| F6-028 | Buscar por código normalizado | Implementar busca real/fallback por código. | `src/features/coupons/server/coupon-repository.ts` | F6-027 | code | - | Busca não depende de caixa/espaço externo. | médio | `[X]` |
| F6-029 | Buscar cupom por id | Carregar cupom aplicado ao carrinho. | `src/features/coupons/server/coupon-repository.ts` | F6-028 | code | - | Cupom aplicado é carregado sem expor carrinho alheio. | médio | `[X]` |
| F6-030 | Listar cupons admin | Implementar listagem real/fallback para admin. | `src/features/coupons/server/coupon-repository.ts` | F6-029 | code | - | Lista respeita disponibilidade de banco. | médio | `[X]` |
| F6-031 | Criar cupom admin | Implementar criação básica, se banco real estiver disponível. | `src/features/coupons/server/coupon-repository.ts` | F6-030 | code | - | Criação valida campos e não usa fallback silencioso com db real. | alto | `[X]` |
| F6-032 | Editar cupom admin | Implementar edição básica protegida. | `src/features/coupons/server/coupon-repository.ts` | F6-031 | code | - | Edição não altera campos fora de escopo. | alto | `[X]` |
| F6-033 | Criar coupon service | Orquestrar validação, cálculo e repository. | `src/features/coupons/server/coupon-service.ts` | F6-032 | code | - | Service centraliza regras e não acessa UI. | alto | `[X]` |
| F6-034 | Bloquear fallback em preview/prod | Garantir falha segura sem banco fora de dev/test. | `src/features/coupons/server/coupon-service.ts` | F6-033 | code | - | Preview/prod sem banco retornam unavailable. | alto | `[X]` |
| F6-035 | Impedir fallback silencioso | Garantir que erro real com `DATABASE_URL` não vira fixture. | `src/features/coupons/server/coupon-service.ts` | F6-034 | code | - | Erros reais retornam erro controlado, não fixture. | alto | `[X]` |

## 6. Integração com Carrinho

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-036 | Estender tipos de carrinho | Adicionar cupom, desconto e total parcial à view. | `src/features/cart/types.ts` | F6-035 | code | - | `CartView` expressa cupom aplicado e cálculo. | alto | `[X]` |
| F6-037 | Estender repository de carrinho | Adicionar persistência/removal de cupom aplicado. | `src/features/cart/server/cart-repository.ts` | F6-036 | code | - | Repository suporta um cupom por carrinho. | alto | `[X]` |
| F6-038 | Recalcular carrinho com cupom | Integrar coupon service ao recálculo do carrinho. | `src/features/cart/server/cart-service.ts` | F6-037 | code | - | Carrinho retorna subtotal, desconto e total parcial. | alto | `[X]` |
| F6-039 | Aplicar cupom no carrinho | Implementar fluxo service de apply sobre carrinho ativo. | `src/features/cart/server/cart-service.ts` | F6-038 | code | - | Cupom válido é persistido/recalculado sem criar pedido. | alto | `[X]` |
| F6-040 | Remover cupom do carrinho | Implementar fluxo service de remove. | `src/features/cart/server/cart-service.ts` | F6-039 | code | - | Remoção deixa desconto 0 e subtotal intacto. | médio | `[X]` |
| F6-041 | Revalidar cupom em alterações | Revalidar cupom após add/update/remove/clear item. | `src/features/cart/server/cart-service.ts` | F6-040 | code | - | Subtotal abaixo do mínimo invalida/remove/sinaliza cupom. | alto | `[X]` |
| F6-042 | Revalidar cupom no merge | Garantir merge no login revalida cupom resultante. | `src/features/cart/server/cart-service.ts`, `src/features/auth/server/actions.ts` | F6-041 | code | - | Merge não duplica cupom nem mantém cupom inelegível silenciosamente. | alto | `[X]` |
| F6-043 | Garantir usedCount intacto | Verificar que apply/remove/merge não incrementam `usedCount`. | `src/features/cart/server/cart-service.ts`, `src/features/coupons/server/coupon-service.ts` | F6-042 | code | - | Nenhum fluxo de carrinho altera contador de uso. | alto | `[X]` |

## 7. Ownership e Segurança

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-044 | Bloquear owner no payload | Garantir actions não aceitam `cartId`, `userId` ou owner. | `src/features/cart/server/cart-actions.ts` | F6-043 | code | - | Owner sempre vem de sessão/cookie. | alto | `[X]` |
| F6-045 | Bloquear desconto no payload | Ignorar/recusar discount, subtotal, total e couponId enviados pelo cliente. | `src/features/cart/server/cart-actions.ts` | F6-044 | code | - | Desconto sempre é recalculado no servidor. | alto | `[X]` |
| F6-046 | Revisar mensagens seguras | Garantir mensagens sem secrets, tokens ou dados sensíveis. | `src/lib/runtime-mode.ts`, `src/features/coupons/**`, `src/features/cart/**` | F6-045 | code | - | Erros são controlados e seguros. | médio | `[X]` |
| F6-047 | Proteger admin com policy | Garantir admin de cupons com `requireAdminLike`. | `src/app/admin/cupons/**`, `src/features/coupons/server/admin-coupon-actions.ts` | F6-046 | code | - | Customer/visitante bloqueados. | alto | `[X]` |

## 8. Server Actions

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-048 | Criar applyCouponAction | Action de aplicar cupom ao carrinho. | `src/features/cart/server/cart-actions.ts` | F6-047 | code | - | Action valida input e retorna erro controlado. | alto | `[X]` |
| F6-049 | Criar removeCouponAction | Action de remover cupom do carrinho. | `src/features/cart/server/cart-actions.ts` | F6-048 | code | - | Action recalcula carrinho após remoção. | médio | `[X]` |
| F6-050 | Atualizar getCartAction | Retornar cupom, desconto e total parcial. | `src/features/cart/server/cart-actions.ts` | F6-049 | code | - | View do carrinho recebe novos campos. | médio | `[X]` |
| F6-051 | Criar listCouponsAction | Action/admin loader para listar cupons. | `src/features/coupons/server/admin-coupon-actions.ts` | F6-050 | code | - | Exige admin-like e respeita fallback. | alto | `[X]` |
| F6-052 | Criar createCouponAction | Action de criação básica admin. | `src/features/coupons/server/admin-coupon-actions.ts` | F6-051 | code | - | Cria apenas campos permitidos. | alto | `[X]` |
| F6-053 | Criar updateCouponAction | Action de edição básica admin. | `src/features/coupons/server/admin-coupon-actions.ts` | F6-052 | code | - | Edita sem campanhas/restrições/relatórios. | alto | `[X]` |

## 9. Admin Básico de Cupons

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-054 | Criar rota admin de listagem | Implementar `/admin/cupons` mínima. | `src/app/admin/cupons/page.tsx` | F6-053 | code | - | Página lista cupons ou fallback/bloqueio controlado. | médio | `[X]` |
| F6-055 | Criar componente tabela admin | Exibir código, tipo, status, datas, uso e mínimo. | `src/features/coupons/components/*` | F6-054 | code | - | Tabela não mostra dados sensíveis. | baixo | `[X]` |
| F6-056 | Criar formulário básico de cupom | Formulário para criação/edição segura. | `src/features/coupons/components/*` | F6-055 | code | - | Formulário cobre apenas campos permitidos. | médio | `[X]` |
| F6-057 | Criar rota novo cupom | Implementar `/admin/cupons/novo`, se seguro. | `src/app/admin/cupons/novo/page.tsx` | F6-056 | code | - | Rota usa form protegido e não aparece para customer. | médio | `[X]` |
| F6-058 | Criar rota editar cupom | Implementar `/admin/cupons/[id]/editar`, se seguro. | `src/app/admin/cupons/[id]/editar/page.tsx` | F6-057 | code | - | Edição básica não toca campos fora de escopo. | médio | `[X]` |
| F6-059 | Validar bloqueio de admin sem banco | Garantir admin real sem banco falha seguro. | `src/app/admin/cupons/**`, `src/features/coupons/server/*` | F6-058 | code | - | Sem banco/auth prontos não há falsa persistência. | alto | `[X]` |

## 10. UI no Carrinho

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-060 | Criar formulário de cupom | Campo e botão aplicar no carrinho. | `src/features/cart/components/*` | F6-050 | code | - | Form usa action e não calcula desconto client-side. | médio | `[X]` |
| F6-061 | Criar estado de cupom aplicado | Exibir código aplicado e botão remover. | `src/features/cart/components/*` | F6-060 | code | - | Remoção chama action e atualiza view. | médio | `[X]` |
| F6-062 | Exibir desconto e total parcial | Mostrar subtotal, desconto e total parcial. | `src/features/cart/components/*` | F6-061 | code | - | Valores vêm do servidor e em centavos formatados. | médio | `[X]` |
| F6-063 | Exibir mensagens de cupom | Mensagens para inválido, expirado, futuro, esgotado, mínimo e frete grátis preparado. | `src/features/cart/components/*` | F6-062 | code | - | Mensagens são claras e seguras. | baixo | `[X]` |
| F6-064 | Manter checkout desabilitado | Garantir que UI não ativa checkout, pedido ou frete real. | `src/app/(storefront)/carrinho/page.tsx`, `src/features/cart/components/*` | F6-063 | code | - | CTA continua sem fluxo real. | alto | `[X]` |

## 11. Testes Unitários

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-065 | Testar normalização e status | Cobrir código normalizado, ativo, inativo, futuro, expirado e esgotado. | `src/tests/unit/coupon-domain.test.ts` | F6-025 | test | `[//]` | Testes cobrem status principais. | médio | `[X]` |
| F6-066 | Testar cálculo de desconto | Cobrir percentual, fixo, centavos e limite ao subtotal. | `src/tests/unit/coupon-domain.test.ts` | F6-025 | test | - | Desconto nunca excede subtotal. | alto | `[X]` |
| F6-067 | Testar subtotal mínimo | Cobrir aplicação/recusa por `minimumSubtotalCents`. | `src/tests/unit/coupon-domain.test.ts` | F6-025 | test | - | Subtotal insuficiente retorna erro controlado. | médio | `[X]` |
| F6-068 | Testar free_shipping preparado | Garantir que não altera frete/total. | `src/tests/unit/coupon-domain.test.ts` | F6-025 | test | - | Frete real não é calculado. | alto | `[X]` |
| F6-069 | Testar repository fallback | Cobrir fixture dev/test e unavailable preview/prod. | `src/tests/unit/coupon-service.test.ts` | F6-035 | test | `[//]` | Fallback explícito e sem persistência real. | alto | `[X]` |
| F6-070 | Testar apply/remove no service | Cobrir aplicação, remoção e um cupom por carrinho. | `src/tests/unit/cart-coupon-service.test.ts` | F6-043 | test | - | Segundo cupom não acumula. | alto | `[X]` |
| F6-071 | Testar usedCount intacto | Garantir apply/remove não incrementam uso. | `src/tests/unit/cart-coupon-service.test.ts` | F6-043 | test | - | `usedCount` permanece inalterado. | alto | `[X]` |
| F6-072 | Testar ownership e payload | Cobrir carrinho alheio e desconto forçado pelo cliente. | `src/tests/unit/cart-coupon-actions.test.ts` | F6-050 | test | - | Payload malicioso não define desconto/owner. | alto | `[X]` |
| F6-073 | Testar admin actions | Cobrir list/create/update protegidos. | `src/tests/unit/admin-coupon-actions.test.ts` | F6-053 | test | `[//]` | Customer/visitante bloqueados; admin/manager permitidos quando runtime permite. | alto | `[X]` |
| F6-074 | Testar escopo proibido | Garantir que cupom não chama checkout/frete/pedido/Stripe. | `src/tests/unit/cart-coupon-actions.test.ts` | F6-050 | test | - | Nenhum módulo fora de escopo é chamado. | alto | `[X]` |

## 12. E2E

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-075 | E2E aplicar cupom válido | Visitante/usuário aplica cupom fixture válido. | `src/tests/e2e/coupons.spec.ts` | F6-064 | test | - | Carrinho mostra desconto e total parcial. | médio | `[X]` |
| F6-076 | E2E cupom inválido | Cupom inválido exibe erro controlado. | `src/tests/e2e/coupons.spec.ts` | F6-075 | test | - | UI não altera desconto. | médio | `[X]` |
| F6-077 | E2E remover cupom | Remover cupom volta desconto para 0. | `src/tests/e2e/coupons.spec.ts` | F6-076 | test | - | UI remove cupom aplicado. | médio | `[X]` |
| F6-078 | E2E subtotal mínimo | Cupom com mínimo insuficiente bloqueia aplicação. | `src/tests/e2e/coupons.spec.ts` | F6-077 | test | - | Mensagem controlada aparece. | médio | `[X]` |
| F6-079 | E2E admin listar cupons | Admin mínimo lista cupons ou fallback controlado. | `src/tests/e2e/admin-coupons.spec.ts` | F6-059 | test | `[//]` | Admin listagem funciona sem banco real via fallback quando aplicável. | médio | `[X]` |
| F6-080 | E2E escopo proibido | Confirmar que não há checkout/frete real/pedido. | `src/tests/e2e/coupons.spec.ts` | F6-078 | test | - | Nenhum fluxo fora de escopo dispara. | alto | `[X]` |

## 13. Documentação

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-081 | Documentar feature de cupons | Criar documentação funcional de cupons. | `docs/features/coupons.md` | F6-064 | docs | `[//]` | Doc explica tipos, regras, fallback e fora de escopo. | baixo | `[X]` |
| F6-082 | Documentar arquitetura de cupons | Criar documentação técnica de domínio/repository/service/actions. | `docs/architecture/coupons.md` | F6-064 | docs | `[//]` | Doc cobre server-side trust e usedCount. | baixo | `[X]` |
| F6-083 | Atualizar docs relacionadas | Atualizar cart/database/auth-policies se impactados. | `docs/features/cart.md`, `docs/architecture/database.md`, `docs/features/auth-policies.md` | F6-081, F6-082 | docs | - | Docs preservam fora de escopo e guardrails. | baixo | `[X]` |

## 14. Validações Finais e Commit Opcional

| ID | Título | Objetivo | Arquivos prováveis | Dependências | Tipo | Paralelismo | Critério de aceite | Risco | Status |
|----|--------|----------|--------------------|--------------|------|-------------|--------------------|-------|--------|
| F6-084 | Rodar validações finais | Executar lint, typecheck, test, build e e2e. | n/a | F6-074, F6-080, F6-083 | validation | - | Todos os comandos passam sem banco real/credenciais reais. | alto | `[X]` |
| F6-085 | Revisar diff final | Conferir que não houve checkout, frete real, pedido, push, deploy ou secrets. | n/a | F6-084 | validation | - | Diff respeita requirements e guardrails. | alto | `[X]` |
| F6-086 | Commit local opcional | Criar commit local apenas se todas validações passarem. | n/a | F6-085 | validation | - | Commit local criado ou decisão de não commitar registrada; sem push. | médio | `[X]` |

## Dependências críticas

- Schema (`F6-005` a `F6-012`) vem antes de repository/service real.
- Domínio e cálculo (`F6-013` a `F6-025`) vêm antes de repository/service e UI.
- Repository/service (`F6-026` a `F6-035`) vem antes de integração com carrinho.
- Integração com carrinho (`F6-036` a `F6-043`) vem antes de actions e UI.
- Server actions (`F6-048` a `F6-053`) vêm antes de UI e E2E.
- Tarefas que tocam `src/db/schema.ts`, `drizzle/`, `src/features/cart/**`, `src/features/coupons/**`, `src/app/admin/cupons/**` e `src/app/(storefront)/carrinho/**` são sequenciais.

## Paralelismo autorizado

Marcadas com `[//]` apenas tarefas que podem ser preparadas em paralelo quando seus arquivos não conflitam com a cadeia principal:

- F6-065
- F6-069
- F6-073
- F6-079
- F6-081
- F6-082

Apesar disso, a execução final deve respeitar dependências e rodar validações completas ao final.

