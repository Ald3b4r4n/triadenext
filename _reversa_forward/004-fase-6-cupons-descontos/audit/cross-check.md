# Cross-check Audit - Fase 6 Cupons e Descontos

Data: 2026-06-08

Feature: `004-fase-6-cupons-descontos`

Artefatos analisados:

- `_reversa_forward/004-fase-6-cupons-descontos/requirements.md`
- `_reversa_forward/004-fase-6-cupons-descontos/doubts.md`
- `_reversa_forward/004-fase-6-cupons-descontos/audit/requirements-audit.md`
- `_reversa_forward/004-fase-6-cupons-descontos/audit/legacy-direction-check.md`
- `_reversa_forward/004-fase-6-cupons-descontos/roadmap.md`
- `_reversa_forward/004-fase-6-cupons-descontos/investigation.md`
- `_reversa_forward/004-fase-6-cupons-descontos/data-delta.md`
- `_reversa_forward/004-fase-6-cupons-descontos/onboarding.md`
- `_reversa_forward/004-fase-6-cupons-descontos/risk-plan.md`
- `_reversa_forward/004-fase-6-cupons-descontos/validation-plan.md`
- `_reversa_forward/004-fase-6-cupons-descontos/interfaces/coupon-domain-contract.md`
- `_reversa_forward/004-fase-6-cupons-descontos/interfaces/coupon-repository-service-contract.md`
- `_reversa_forward/004-fase-6-cupons-descontos/interfaces/cart-coupon-actions-contract.md`
- `_reversa_forward/004-fase-6-cupons-descontos/interfaces/admin-coupon-actions-contract.md`
- `_reversa_forward/004-fase-6-cupons-descontos/actions.md`

## Veredito

**Aprovado para seguir para `/reversa-coding`, sem findings CRITICAL ou HIGH.**

O `actions.md` cobre o escopo funcional, de seguranca, banco, fallback, ownership, admin minimo, testes, documentacao e validacoes finais. Os achados abaixo sao ajustes de rastreabilidade e precisao textual para orientar a implementacao, sem bloquear a codificacao.

## Resumo de Findings

| Severidade | Quantidade |
|------------|------------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 3 |
| LOW | 2 |

## Findings

| ID | Severidade | Eixo | Descricao | Onde esta |
|----|------------|------|-----------|-----------|
| A001 | MEDIUM | Consistencia / Legado | O mapeamento legado `percent` -> `percentage` e `fixed` -> `fixed_amount` foi identificado no `legacy-direction-check.md`, mas nao aparece como tarefa explicita no `actions.md`. Ha tambem termos mistos: `requirements.md` usa `percent/fixed` em `RC-02.1`, enquanto `roadmap.md`, `data-delta.md` e contratos usam `percentage/fixed_amount`. | `requirements.md#10`, `roadmap.md#3`, `data-delta.md#2`, `interfaces/coupon-domain-contract.md`, `actions.md` F6-006/F6-013 |
| A002 | MEDIUM | Testabilidade | O arredondamento percentual em centavos esta claro no `requirements.md` e `validation-plan.md`, mas a tarefa de teste F6-066 nao cita explicitamente arredondamento. Para evitar diferenca entre PHP decimal/`round` do legado e JS em centavos, a implementacao deve tratar F6-066 como teste obrigatorio de arredondamento. | `requirements.md#12`, `validation-plan.md#Unitarios`, `legacy-direction-check.md#Reviewer Findings`, `actions.md` F6-021/F6-066 |
| A003 | MEDIUM | Escopo / UX Admin | `free_shipping` esta corretamente modelado como preparado e sem frete real, mas as tarefas de admin F6-055/F6-056 nao deixam explicito que a UI admin deve comunicar ou restringir esse tipo para nao parecer beneficio real antes da fase de frete. O dominio, UI do carrinho e testes cobrem o bloqueio, mas a superficie admin precisa carregar a mesma cautela na implementacao. | `requirements.md` RF-15/RC-11/RCL-09/CA-22, `legacy-direction-check.md`, `actions.md` F6-019/F6-055/F6-056/F6-063/F6-068 |
| A004 | LOW | Documentacao | A mudanca de persistencia do cupom aplicado, de sessao no legado (`cart_coupon_code`) para persistencia no carrinho no Next, esta documentada no `legacy-direction-check.md` e implementada por F6-037, mas nao esta nomeada como divergencia intencional nas tarefas de documentacao. F6-083 e suficiente, mas deve receber essa observacao durante a execucao. | `legacy-direction-check.md#Reviewer Findings`, `actions.md` F6-037/F6-083 |
| A005 | LOW | Paridade Admin | O legado possuia uma administracao de cupons mais ampla que o recorte minimo da Fase 6. O recorte esta documentado como consciente e seguro, mas a implementacao deve evitar apresentar a fase como paridade administrativa completa. | `requirements.md` RAD-04/RAD-06, `legacy-direction-check.md#Reviewer Findings`, `actions.md` F6-051 a F6-059/F6-081 |

## Itens Verificados que Passaram

### Cobertura

- Requisitos de aplicar/remover cupom estao cobertos por F6-039, F6-040, F6-048 e F6-049.
- Requisitos de subtotal, desconto e total parcial estao cobertos por F6-021 a F6-024, F6-038, F6-050 e F6-062.
- Requisitos de cupom inativo, futuro, expirado e esgotado estao cobertos por F6-016, F6-065 e F6-076.
- Requisitos de subtotal minimo estao cobertos por F6-007, F6-020, F6-067 e F6-078.
- Requisito de apenas um cupom por carrinho esta coberto por F6-009, F6-037 e F6-070.
- Requisito de `usedCount` consultado e nao consumido esta coberto por F6-043 e F6-071.
- Requisitos de ownership e payload nao confiavel estao cobertos por F6-044, F6-045 e F6-072.
- Requisitos de admin minimo protegido estao cobertos por F6-047 e F6-051 a F6-059.
- Requisitos de fallback sem banco estao cobertos por F6-026, F6-027, F6-034, F6-035, F6-059 e F6-069.
- Requisitos de documentacao estao cobertos por F6-081 a F6-083.
- Validacoes finais obrigatorias estao cobertas por F6-084.

### Seguranca

- Nenhuma tarefa manda expor secrets, `DATABASE_URL`, cookies, tokens ou credenciais.
- Nenhuma tarefa manda copiar `.env` do legado.
- Nenhuma tarefa aceita desconto, subtotal, total, role, owner ou `couponId` como fonte confiavel do cliente.
- Nenhuma tarefa permite customer/visitante acessar admin de cupons.
- Nenhuma tarefa permite fallback silencioso quando `DATABASE_URL` existe.
- Nenhuma tarefa manda rodar migration em producao ou conectar banco de producao.
- Nenhuma tarefa manda fazer deploy, configurar dominio ou fazer push automatico.

### Escopo

- Nenhuma tarefa implementa checkout, pagamento, Stripe, frete real, pedido, reserva ou baixa de estoque.
- Nenhuma tarefa consome `usedCount` ao aplicar/remover cupom no carrinho.
- Nenhuma tarefa implementa cupom acumulativo, limite por usuario, restricao por produto/categoria, campanhas avancadas ou relatorios.
- Nenhuma tarefa aplica beneficio real de frete gratis.

### Ordem e Dependencias

- Schema/migration local vem antes de repository real.
- Dominio/calculo vem antes de service, cart integration, actions e UI.
- Repository/service vem antes de server actions.
- Actions vem antes de UI/E2E.
- Testes unitarios vem antes das validacoes finais.
- E2E vem depois da UI minima.
- Dependencias citadas em `actions.md` apontam para IDs existentes.
- Nao foi identificado ciclo de dependencia.

### Paralelismo

- As 6 tarefas marcadas com `[//]` sao F6-065, F6-069, F6-073, F6-079, F6-081 e F6-082.
- Essas tarefas nao compartilham o mesmo arquivo alvo entre si.
- As tarefas que tocam `src/db/schema.ts`, `drizzle/`, `src/features/cart/**`, `src/features/coupons/**`, `src/app/admin/cupons/**` e `src/app/(storefront)/carrinho/**` permanecem sequenciais na cadeia principal.

### Riscos

- Consumo indevido de `usedCount` esta mitigado por contrato e teste.
- Frete gratis parecer beneficio real esta mitigado no dominio, UI do carrinho, testes e documentacao, com ressalva A003 para admin.
- Desconto forçado pelo cliente esta mitigado por actions e testes.
- Falsa persistencia no fallback esta mitigada por repository/service, testes e guardrails.
- Acesso a carrinho alheio esta mitigado por ownership server-side.
- Scope creep para checkout/frete/pedido esta mitigado por guardrails, testes e diff final.
- Divergencia de tipo legado esta parcialmente mitigada, com ressalva A001.
- Diferenca de arredondamento PHP decimal vs JS centavos esta parcialmente mitigada, com ressalva A002.

## Recomendacao

Seguir para `/reversa-coding`.

Durante a implementacao, tratar A001, A002 e A003 como pontos obrigatorios de cuidado em progresso/testes/docs, sem alterar as decisoes humanas ja validadas.
