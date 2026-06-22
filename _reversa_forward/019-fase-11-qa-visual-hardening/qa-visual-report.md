# QA Visual Report: Fase 11

> Data: `2026-06-22`

## Must-fix

| Item | Motivo | Acao |
|------|--------|------|
| `PlaceholderPage` expõe linguagem de reconstrucao | Texto nao e aceitavel para primeira producao. | Substituir copy e reaproveitar como estado futuro controlado. |
| `/minha-conta` e `/enderecos` usam placeholder | Area customer precisa parecer produto minimamente testavel. | Criar telas simples com links para pedidos/carrinho. |
| `/admin` usa placeholder | Admin precisa de dashboard minimo. | Criar atalhos e guardrails visuais. |
| `/admin/fretes` e `/admin/documentos-fiscais` usam placeholder | Rotas visiveis nao devem parecer reconstrucao. | Orientar para frete manual ou declarar fiscal fora de escopo. |
| Footer ausente | Requisito minimo da Fase 11. | Adicionar footer simples no shell global. |
| Responsividade sem smoke dedicado | Breakpoints obrigatorios precisam de prova automatica. | Criar E2E responsivo. |

## Should-fix

| Item | Motivo | Acao |
|------|--------|------|
| Admin tables em mobile/tablet | Tabelas podem ficar apertadas. | Melhorar CSS para overflow controlado e desktop 1366px. |
| Mensagens de mock/dev | Dev/test precisa ser claro sem parecer envio/cobranca real. | Ajustar copy em pagamento/notificacoes. |
| `.env.example` sem classificacao | Preparacao de producao pede obrigatorias/opcionais. | Criar checklist e script local seguro. |

## Fora de escopo preservado

- Deploy real.
- Migration real.
- Banco real.
- Credenciais reais.
- Bling, NF-e e rotinas fiscais.
- WhatsApp e SMS.
- Redesign premium.
