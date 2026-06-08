# Requirements Audit

> Identificador da feature: `003-fase-5-carrinho`
> Data: `2026-06-08`
> Documento auditado: `_reversa_forward/003-fase-5-carrinho/requirements.md`

## Resumo

| Métrica | Valor |
|---|---|
| Total de itens | 24 |
| Aprovados | 24 |
| Reprovados | 0 |
| Veredito | Aprovado |

## Itens por categoria

### Clareza

- [X] Q-001 | Clareza | O objetivo da Fase 5 declara claramente que a entrega é carrinho de compras, não checkout.
- [X] Q-002 | Clareza | Os atores principais aparecem com significado único: visitante, usuario autenticado, admin e manager.
- [X] Q-003 | Clareza | As regras de produto compravel usam critérios concretos: `published`, `publishedAt <= now` e `stockQuantity > 0`.
- [X] Q-004 | Clareza | O texto diferencia subtotal, total final, frete, cupom, pedido e checkout sem misturar responsabilidades.

### Completude

- [X] Q-005 | Completude | Todas as seções solicitadas pelo prompt estão preenchidas: objetivo, contexto, escopo, fora de escopo, requisitos, aceite, testes, gaps e glossario.
- [X] Q-006 | Completude | O requirements cobre carrinho anonimo, carrinho autenticado, merge no login, ownership, estoque, subtotal, server actions, UI e fallback.
- [X] Q-007 | Completude | `doubts.md` registra as sete decisões humanas aplicadas na clarificação.
- [X] Q-008 | Completude | Não restam marcadores `[DOUBT]`, `[DÚVIDA]` ou lacunas sem justificativa.

### Consistência

- [X] Q-009 | Consistência | A regra de carrinho anonimo é consistente entre requisitos, segurança, sessão anonima e esclarecimentos.
- [X] Q-010 | Consistência | A regra de merge por soma de quantidades aparece de forma consistente em RF-12, RML e esclarecimentos.
- [X] Q-011 | Consistência | O documento mantém a decisão de não reservar estoque em regras herdadas, estoque/disponibilidade, fora de escopo e esclarecimentos.
- [X] Q-012 | Consistência | O fallback sem `DATABASE_URL` é descrito sem contradição: dev/test controlado, preview/producao falha segura, sem falsa persistencia.

### Cobertura

- [X] Q-013 | Cobertura | Há cenários Gherkin para carrinho vazio, adicionar, bloquear indisponiveis, estoque insuficiente, atualizar, remover, limpar, ownership, merge, fallback e checkout fora de escopo.
- [X] Q-014 | Cobertura | Os critérios de aceite verificam produto indisponivel, limite de estoque, subtotal, ownership, fallback e validações futuras obrigatórias.
- [X] Q-015 | Cobertura | As regras herdadas das Fases 1 a 4 foram preservadas, incluindo produto publico, preços em centavos, ownership e fallback sem banco.

### EdgeCases

- [X] Q-016 | EdgeCases | Quantidade minima e maxima estão definidas: minimo 1 e maximo `stockQuantity`.
- [X] Q-017 | EdgeCases | O documento cobre mudança de estoque após item estar no carrinho e exige ajuste ou sinalização controlada.
- [X] Q-018 | EdgeCases | Retentativa/idempotencia do merge está contemplada para evitar duplicidade.
- [X] Q-019 | EdgeCases | Estados vazio, carrinho convertido/mesclado, carrinho expirado/abandonado e carrinho sem banco estão considerados.

### Jargão

- [X] Q-020 | Jargão | O glossário define carrinho, carrinho anonimo, carrinho autenticado, guest token, snapshot, subtotal, produto compravel, merge, ownership e fallback.
- [X] Q-021 | Jargão | Termos técnicos inevitáveis aparecem com contexto operacional suficiente para orientar o plano técnico.

### SoluçãoImplícita

- [X] Q-022 | SoluçãoImplícita | O requirements descreve comportamento esperado e contratos de negócio, sem implementar código.
- [X] Q-023 | SoluçãoImplícita | Referências técnicas como cookie, tabela `carts` e `guestToken` são decisões humanas de domínio/segurança, não implementação detalhada de código.

### Princípios e Guardrails

- [X] Q-024 | Princípios | O documento preserva guardrails: não expor secrets, não rodar migration real, não conectar banco real, não fazer deploy/push, não modificar legado e não fingir persistência.

## Itens reprovados, detalhe

Nenhum item reprovado.

## Veredito

**Aprovado**

O `requirements.md` está claro, completo e operacionalmente seguro para avançar ao plano técnico. A auditoria confirma que os requisitos não autorizam adicionar produto indisponivel, ultrapassar estoque, criar pedido, implementar checkout/pagamento/frete/cupom, reservar estoque, expor carrinho alheio ou fingir persistência sem banco.

## Histórico de alterações

| Data | Alteração | Autor |
|---|---|---|
| 2026-06-08 | Auditoria gerada por `/reversa-quality` | reversa |
