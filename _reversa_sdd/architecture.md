# Arquitetura Reversa - Triade Essenza Next

Atualizado em: 2026-06-11
Escopo: arquitetura do projeto Next.js apos Fase 10.

## Visao geral

O sistema usa Next.js App Router, server components/actions, Drizzle ORM e PostgreSQL/Neon quando configurado. O checkout cria pedido pendente; Stripe confirma o pagamento exclusivamente por webhook assinado e idempotente. O settlement conclui pagamento, pedido, estoque e cupom. Somente depois dessa unidade financeira terminar, a camada de notificacoes tenta registrar e entregar mensagens de pedido pago.

## Camadas

| Camada | Responsabilidade |
|---|---|
| `src/app` | Rotas, layouts, pages, route handlers e server actions |
| `src/features` | Dominio, services, repositories, policies e adapters |
| `src/db` | Schema, conexao e persistencia Drizzle |
| `src/lib` | Infraestrutura compartilhada e configuracao |
| `tests` / `e2e` | Provas unitarias, integracao e navegacao |

## Modulos funcionais

### Catalogo, auth e carrinho

- Catalogo publico filtra produtos compraveis.
- Auth aplica papeis e ownership server-side.
- Carrinho persiste itens, cupom e frete; carrinho convertido fica bloqueado.

### Checkout, orders e payments

- Checkout exige customer autenticado e recalcula tudo no servidor.
- Pedido nasce `aguardando_pagamento` com snapshots imutaveis.
- PaymentIntent usa valor/moeda server-side.
- Webhook Stripe assinado e `payment_events.event_id` unico comandam o settlement.
- Client return e admin nao marcam pedido como pago.

### Notifications

- `src/features/notifications` concentra contrato do provider, configuracao, templates, repositories e service.
- `post-payment-event.ts` recarrega o pedido pago e dispara o service apos o settlement.
- O service cria uma entrega customer e uma por destinatario admin configurado.
- A chave idempotente impede segunda entrega efetiva do mesmo evento/tipo/destinatario.
- O repository usa Drizzle com banco e memoria no fallback seguro.
- Templates usam snapshots do pedido, escape de conteudo e mensagens sem dados sensiveis.
- Erros de provider sao sanitizados antes de persistir.

## Persistencia

Migrations locais observadas: `drizzle/0000` ate `drizzle/0007_outstanding_midnight.sql`.

Entidades centrais:

- catalogo: produtos e imagens;
- identidade: usuarios, contas e sessoes;
- compra: carrinhos, itens, cupons e frete;
- checkout: pedidos e itens;
- pagamentos: `payment_intents` e `payment_events`;
- notificacoes: `notification_deliveries`.

Nenhuma migration foi aplicada a banco real nesta re-extracao.

## Integracoes externas

- Stripe: adapter real quando configurado, mock dev/test e indisponibilidade segura.
- E-mail: adapter contratual; mock dev/test; preview/producao sem provider real ficam indisponiveis.
- Frete externo: adapters futuros inativos.
- WhatsApp, SMS, Bling, NF-e e fiscal: nao integrados.

## Guardrails arquiteturais atuais

- Totais, estoque, cupom, frete, pedido e pagamento sao server-side.
- Pagamento so e confirmado por webhook assinado/idempotente.
- Settlement financeiro ocorre antes da notificacao.
- Notificacao roda fora da transacao financeira e nao propaga falha para o settlement.
- Replay de webhook nao cria segunda entrega efetiva.
- Mock de notificacao nao opera em preview/producao.
- Admin/manager consultam status mascarado e nao reenviam notificacoes.
- Customer nao possui historico de notificacoes.
- Nenhum dado de cartao ou segredo de provider e persistido na entrega.

## Proxima evolucao

Committar os artefatos Reversa pos-Fase 10 e, apos validacao humana, fazer push dos commits locais.
