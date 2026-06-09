# Requirements Audit

> Identificador da feature: `005-fase-7-frete-cotacoes`
> Data: `2026-06-09`
> Documento auditado: `_reversa_forward/005-fase-7-frete-cotacoes/requirements.md`
> Etapa: `/reversa-quality`
> Execução: reauditoria após correção textual pós-reprovação

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de itens | 26 |
| Aprovados | 26 |
| Reprovados | 0 |
| Marcadores `[DOUBT]` / `[DÚVIDA]` restantes | 0 |
| `doubts.md` registra reprovação e correção textual | Sim |
| Veredito | Aprovado |

## Itens por categoria

### Clareza

- [X] Q-001 | Clareza | O objetivo da Fase 7 está explícito: cotação e seleção de frete manual no carrinho, sem checkout, pagamento, Stripe, pedido, reserva ou baixa de estoque.
- [X] Q-002 | Clareza | As decisões de escopo aparecem em linguagem afirmativa, sem condicionais antigas já resolvidas.
- [X] Q-003 | Clareza | Os termos `CEP`, cotação de frete, opção de frete, regra manual, fixture/mock, `shippingAmountCents`, `free_shipping` e ownership estão definidos ou contextualizados.
- [X] Q-004 | Clareza | O documento diferencia frete manual, fixture/mock e adapters futuros inativos sem sugerir cotação real de transportadora na Fase 7.

### Completude

- [X] Q-005 | Completude | Todas as seções solicitadas estão preenchidas: contexto, escopo, fora de escopo, requisitos funcionais e não funcionais, segurança, banco, CEP, cotação, opção, seleção, cálculo, `free_shipping`, ownership, server actions, UI, admin, providers/fallback, ambiente, aceite, cenários, esclarecimentos, gaps e glossário.
- [X] Q-006 | Completude | Cada requisito funcional tem prioridade e critério de aceite verificável.
- [X] Q-007 | Completude | Os critérios de aceite cobrem cotação, seleção, cálculo, ownership, fallback, ausência de APIs externas reais, admin básico e guardrails de checkout/pedido/pagamento.
- [X] Q-008 | Completude | `doubts.md` registra a rodada anterior de reprovação, os três problemas encontrados, a correção textual e a ausência de dúvidas abertas.

### Consistência

- [X] Q-009 | Consistência | Correios, Jadlog e Melhor Envio aparecem somente como adapters futuros preparados/inativos, sem participação no runtime ou cálculo MVP.
- [X] Q-010 | Consistência | O texto não exige credenciais externas para build, test, e2e ou runtime da Fase 7.
- [X] Q-011 | Consistência | `free_shipping` está descrito de forma consistente como benefício que zera apenas frete manual calculado e elegível.
- [X] Q-012 | Consistência | O cálculo monetário permanece em centavos: subtotal, desconto, frete e total parcial com frete.
- [X] Q-013 | Consistência | Carrinho anônimo por `guestCartToken`, carrinho autenticado por `session.userId` e ownership server-side estão alinhados ao SDD atual.

### Cobertura de Cenários

- [X] Q-014 | Cobertura | Há cenários Gherkin para cotação com CEP válido, CEP inválido, seleção própria, acesso cruzado, payload malicioso, invalidação por item/CEP, `free_shipping`, fallback, ausência de credenciais externas e escopo proibido.
- [X] Q-015 | Cobertura | Os cenários cobrem casos felizes e negativos relevantes para frete manual e segurança.
- [X] Q-016 | Cobertura | O cenário de escopo proibido impede checkout, pagamento, Stripe, pedido, reserva e baixa de estoque.

### Edge Cases

- [X] Q-017 | EdgeCases | A validade da cotação manual está definida em 30 minutos.
- [X] Q-018 | EdgeCases | Mudanças de carrinho, CEP e cupom estão cobertas como gatilhos de invalidação ou recálculo.
- [X] Q-019 | EdgeCases | Carrinho vazio, produto indisponível, CEP inválido, cotação expirada, cotação de outro carrinho e ausência de frete calculado estão considerados.
- [X] Q-020 | EdgeCases | Fallback sem banco e comportamento preview/produção sem banco estão descritos como explícitos e seguros.

### Jargão

- [X] Q-021 | Jargão | Siglas e termos técnicos relevantes têm definição ou contexto suficiente para alguém novo no time.
- [X] Q-022 | Jargão | O glossário separa provider da Fase 7, regra manual, fixture/mock e adapters futuros inativos.

### SoluçãoImplícita

- [X] Q-023 | SoluçãoImplícita | O documento descreve comportamento esperado e contratos sem impor biblioteca ou framework novo.
- [X] Q-024 | SoluçãoImplícita | Referências a server actions, adapters e fallback permanecem no nível de contrato esperado pelo fluxo Reversa Forward.

### Princípios

- [X] Q-025 | Princípios | O requirements preserva os guardrails das Fases 1 a 6: sem secrets, sem migration real, sem banco real, sem alteração no legado, sem deploy/push e sem checkout/pagamento/pedido.
- [X] Q-026 | Princípios | O documento mantém build/test/e2e independentes de banco real e credenciais externas.

## Itens reprovados, detalhe

Nenhum.

## Verificações explícitas

| Verificação | Resultado |
|-------------|-----------|
| Sem `[DOUBT]` no `requirements.md` | Aprovado |
| Sem `[DÚVIDA]` no `requirements.md` | Aprovado |
| Sem autorização para API externa real na Fase 7 | Aprovado |
| Sem exigência de credenciais externas | Aprovado |
| `free_shipping` limitado ao frete manual calculado e elegível | Aprovado |
| Correios/Jadlog/Melhor Envio apenas como adapters futuros inativos | Aprovado |
| Payload/client-side não força valor de frete | Aprovado |
| Seleção de frete respeita ownership | Aprovado |
| Customer/visitante bloqueados no admin de frete | Aprovado |
| Checkout/pagamento/Stripe/pedido/reserva/baixa fora de escopo | Aprovado |
| Fallback/mock/fixture explicitamente sinalizados | Aprovado |

## Veredito

**Aprovado**

O `requirements.md` está claro, completo e consistente para avançar ao plano técnico. A reauditoria confirma que as inconsistências textuais anteriores foram corrigidas e que o documento não autoriza API externa real, credenciais externas, cotação falsa, frete forçado por payload, acesso cruzado de carrinho, admin indevido, checkout, pagamento, pedido, reserva ou baixa de estoque.

## Próxima etapa recomendada

Executar `/reversa-plan`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-09 | Auditoria inicial gerada por `/reversa-quality` com veredito reprovado | reversa |
| 2026-06-09 | Reauditoria gerada por `/reversa-quality` após correção textual, com veredito aprovado | reversa |
