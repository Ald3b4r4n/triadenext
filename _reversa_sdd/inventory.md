# Inventario tecnico Reversa - Triade Essenza Next

Atualizado em: 2026-06-11
Escopo: estado do projeto Next.js apos Fase 10 concluida e commitada localmente.

## Confirmacao de contexto

- Projeto atual: `D:\Projetos\triade-essenza-next`.
- Nao e o Laravel legado `D:\Projetos\triadeessenzaparfum.com.br`.
- Branch: `main`, um commit a frente de `origin/main` no inicio da re-extracao.
- Commit funcional observado: `f1c2bf4` (`feat: implement post-payment notifications`).
- Worktree estava limpo antes da re-extracao.

## Fases implementadas

| Fase | Commit | Estado | Capacidade principal |
|---|---|---|---|
| 1-6 | historico | Concluidas | Fundacao, catalogo, auth, carrinho e cupons |
| 7 | `5d103b7` | Concluida | Frete manual e cotacoes |
| 8 | `1ace51b` | Concluida | Checkout autenticado e pedido pendente |
| 9 | `8d01351` | Concluida | Stripe PaymentIntent, webhook e settlement |
| 10 | `f1c2bf4` | Concluida | Notificacoes pos-pagamento idempotentes |

## Artefatos principais

- Aplicacao: `src/app`, `src/features`, `src/db`, `src/lib`.
- Notificacoes: `src/features/notifications`.
- Persistencia: `src/db/schema.ts` e migrations `drizzle/0000` a `drizzle/0007`.
- Testes unitarios/integracao: `tests`.
- E2E: `e2e`.
- Reversa: `.reversa`, `_reversa_sdd` e `_reversa_forward`.
- Feature atual: `_reversa_forward/008-fase-10-notificacoes-email`.

## Capacidades atuais

- Catalogo publico com produtos compraveis e estoque.
- Auth com papeis `customer`, `manager` e `admin`.
- Carrinho com cupom, frete manual e conversao em pedido.
- Checkout autenticado com snapshots server-side.
- Pedido `aguardando_pagamento` confirmado por webhook Stripe.
- Settlement atomico de pagamento, pedido, estoque e cupom.
- Notificacoes de pedido pago para customer e administradores configurados.
- Historico administrativo mascarado e somente leitura.

## Notificacoes - superficie tecnica

- Subdominio dedicado com service, repositories, templates e provider adapter.
- Entregas persistidas em `notification_deliveries`.
- Tipos `customer_order_paid` e `admin_order_paid`.
- Estados `pending`, `sending`, `sent`, `mocked`, `failed` e `skipped`.
- Chave idempotente combina pedido, evento, tipo e destinatario normalizado.
- Mock explicito em dev/test; preview/producao sem provider real falham de forma segura.
- Falha de notificacao nao reverte pagamento, pedido, estoque ou cupom.
- Nao ha reenvio manual nem historico de notificacoes para customer.

## Integracoes externas

| Integracao | Estado |
|---|---|
| Stripe | Ativa por adapter; mock dev/test e indisponibilidade segura sem configuracao |
| E-mail transacional | Contrato de provider; mock dev/test; provider real nao obrigatorio |
| Correios/Jadlog/Melhor Envio | Adapters futuros inativos |
| WhatsApp/SMS/Bling/NF-e | Ausentes |

## Persistencia recente

- `drizzle/0005_glossy_talisman.sql`: checkout e pedidos.
- `drizzle/0006_soft_mole_man.sql`: indices de pagamentos.
- `drizzle/0007_outstanding_midnight.sql`: entregas de notificacao, enums, FKs e indices.
- Migrations geradas localmente; nenhuma migration foi aplicada em banco real nesta re-extracao.

## Validacoes informadas para Fase 10

- `pnpm lint`: passou.
- `pnpm typecheck`: passou.
- `pnpm test`: passou, 32 arquivos / 96 testes.
- `pnpm build`: passou.
- `pnpm test:e2e`: passou, 29 testes.

## Fora do escopo atual

- Pedido anonimo.
- Transicao financeira por client ou admin.
- Coleta/armazenamento proprio de cartao.
- Refunds e disputas completas.
- Provider real de e-mail obrigatorio.
- Reenvio manual e historico customer de notificacoes.
- WhatsApp, SMS, Bling, NF-e e fiscal.
- Frete externo real.
- Aplicacao de migration em banco real, deploy ou push.

## Proxima etapa recomendada

Committar apenas os artefatos Reversa pos-Fase 10 e depois fazer push dos commits locais quando aprovado.
