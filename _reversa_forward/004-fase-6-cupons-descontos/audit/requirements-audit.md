# Requirements Audit

> Identificador da feature: `004-fase-6-cupons-descontos`
> Data: `2026-06-08`
> Documento auditado: `_reversa_forward/004-fase-6-cupons-descontos/requirements.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de itens | 24 |
| Aprovados | 24 |
| Reprovados | 0 |
| Veredito | Aprovado |

## Itens por categoria

### Clareza

- [X] Q-001 | Clareza | O objetivo da Fase 6 está explícito e separa cupom/desconto de checkout, frete real, pagamento e pedido.
- [X] Q-002 | Clareza | Os termos centrais `cupom`, `subtotal`, `desconto`, `total parcial`, `ownership`, `fallback sem banco` e `cupom de frete grátis preparado` estão definidos no glossário.
- [X] Q-003 | Clareza | As regras de cupom inativo, futuro, expirado, esgotado e subtotal mínimo têm comportamento observável e sem dupla interpretação.

### Completude

- [X] Q-004 | Completude | Todas as seções esperadas pelo pedido estão preenchidas com conteúdo operacional, incluindo objetivo, contexto, escopo, fora de escopo via regras/aceite, requisitos, testes, gaps e glossário.
- [X] Q-005 | Completude | Os requisitos cobrem aplicação, remoção, cálculo, persistência do cupom aplicado, fallback, ownership, server actions, UI e admin básico.
- [X] Q-006 | Completude | O documento preserva os guardrails das Fases 1 a 5, incluindo produto comprável, centavos, auth/policies, carrinho por owner e fallback explícito.
- [X] Q-007 | Completude | `doubts.md` registra as decisões de clarificação e o requirements incorpora essas decisões.

### Consistência

- [X] Q-008 | Consistência | Não há marcadores `[DOUBT]`, `[DÚVIDA]` ou equivalentes remanescentes no `requirements.md`.
- [X] Q-009 | Consistência | A decisão de apenas um cupom por carrinho aparece de forma consistente em regras, requisitos, critérios de aceite, cenários e MoSCoW.
- [X] Q-010 | Consistência | Cupom de frete grátis aparece sempre como preparado/modelado, sem benefício real antes da fase de frete.
- [X] Q-011 | Consistência | `usedCount` é tratado consistentemente: consultado para limite global, mas não consumido ao aplicar/remover cupom no carrinho.

### Cobertura de Cenários

- [X] Q-012 | Cobertura | Há cenários Gherkin para cupom percentual e fixo válidos.
- [X] Q-013 | Cobertura | Há cenários negativos para cupom inativo, futuro, expirado, esgotado e subtotal mínimo insuficiente.
- [X] Q-014 | Cobertura | Há cenários para remoção de cupom, bloqueio de manipulação client-side, acesso cruzado, fallback sem banco, não acumulação e escopo proibido.

### Edge Cases

- [X] Q-015 | EdgeCases | Carrinho vazio, subtotal abaixo do mínimo, queda de elegibilidade após alteração do carrinho e revalidação do cupom aplicado foram considerados.
- [X] Q-016 | EdgeCases | O documento considera preview/produção sem banco, dev/test sem banco e erro real com `DATABASE_URL`.
- [X] Q-017 | EdgeCases | Arredondamento de percentual, limite do desconto ao subtotal e cálculo em centavos foram explicitados.

### Ausência De Jargão

- [X] Q-018 | Jargão | Os termos técnicos usados têm definição ou contexto suficiente para um integrante novo do time entender a feature.
- [X] Q-019 | Jargão | Siglas e termos de fluxo, como MVP, E2E e `DATABASE_URL`, aparecem em contexto conhecido do projeto e com impacto operacional claro.

### Ausência De Solução Implícita

- [X] Q-020 | SoluçãoImplícita | O requirements descreve comportamento esperado sem impor biblioteca, framework, adapter ou implementação específica fora das bases já existentes do projeto.
- [X] Q-021 | SoluçãoImplícita | O texto permite ao plano técnico decidir detalhes como substituir ou recusar segundo cupom, mantendo a regra de não acumulação.

### Segurança E Guardrails

- [X] Q-022 | Segurança | O documento bloqueia desconto forçado por payload/client-side, acesso a carrinho alheio e bypass por admin/manager.
- [X] Q-023 | Segurança | Não há instrução para expor secrets, copiar `.env`, conectar banco de produção, rodar migration real, fazer deploy ou push.
- [X] Q-024 | Segurança | O documento não autoriza checkout, pagamento, Stripe, pedido, frete real, reserva ou baixa de estoque.

## Itens Reprovados, Detalhe

Nenhum item reprovado.

## Veredito

**Aprovado**

O `requirements.md` está claro, completo e operacionalmente seguro para avançar ao plano técnico. A auditoria confirma que os requisitos não autorizam cupom inativo, expirado, futuro, esgotado, desconto acima do subtotal, consumo de `usedCount` no carrinho, múltiplos cupons, cupom acumulativo, frete real, checkout, pagamento, pedido, reserva/baixa de estoque, acesso cruzado de carrinho ou falsa persistência sem banco.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-08 | Auditoria gerada por `/reversa-quality` | reversa |
