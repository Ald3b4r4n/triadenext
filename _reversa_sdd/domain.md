# Dominio Reversa - Triade Essenza Next

Atualizado em: 2026-06-11
Escopo: dominio apos Fase 10.

## Subdominios atuais

- Catalogo e estoque.
- Identidade, autenticacao e papeis.
- Carrinho, cupons e frete manual.
- Checkout e pedidos.
- Pagamentos Stripe.
- Notificacoes pos-pagamento.

## Catalogo

Produto compravel precisa estar publicado, ativo no periodo aplicavel e com estoque positivo. Precos e totais sao tratados em centavos. Nao ha reserva na criacao do pedido ou PaymentIntent; a baixa ocorre uma vez no settlement confirmado.

## Carrinho, cupons e frete

- Carrinho pertence a guest token opaco ou customer.
- Carrinho convertido e terminal para mutacoes.
- Um cupom pode ser aplicado; desconto e elegibilidade sao server-side.
- `usedCount` nao muda em apply/remove e incrementa uma vez no settlement.
- Frete manual e recalculado no servidor; providers externos permanecem inativos.

## Checkout e pedido

- Checkout exige customer autenticado, carrinho ativo e endereco completo.
- Produtos, estoque, cupom, frete e totais sao revalidados no servidor.
- Pedido nasce `aguardando_pagamento`, com expiracao e snapshots.
- Customer le apenas pedidos proprios.
- Admin/manager possuem leitura minima sem mutacao financeira.

## Pagamento Stripe

- PaymentIntent e criado no servidor com valor e moeda do pedido.
- Stripe.js/Payment Element coleta dados diretamente para Stripe.
- Client return nao confirma pagamento.
- Somente `payment_intent.succeeded` recebido por webhook assinado pode iniciar settlement.
- `payment_events.event_id` unico evita efeitos duplicados.
- Eventos de falha/cancelamento nao marcam pedido pago.

## Settlement financeiro e operacional

O settlement confirmado atualiza de forma coerente:

1. pagamento interno para pago;
2. pedido para `pago`;
3. estoque decrementado uma vez;
4. `usedCount` do cupom incrementado uma vez, quando aplicavel;
5. evento marcado como processado.

Divergencia de valor, moeda, ownership ou estoque impede conclusao parcial. A notificacao nao faz parte dessa transacao: ela comeca somente depois do settlement terminar.

## Notificacoes pos-pagamento

- Evento de dominio suportado: pedido pago.
- Tipos: `customer_order_paid` e `admin_order_paid`.
- Destinatario customer vem do snapshot/usuario do pedido.
- Destinatarios admin vêm de configuracao explicita; ausencia gera entrega `skipped`.
- A chave idempotente inclui pedido, evento, tipo de notificacao e destinatario normalizado.
- Duplicata retorna a entrega existente e nao envia novamente.
- Estados: `pending`, `sending`, `sent`, `mocked`, `failed`, `skipped`.
- Mock e permitido somente em dev/test.
- Preview/producao sem provider real registram indisponibilidade segura, sem envio ficticio.
- Templates usam nome, numero do pedido, itens e totais seguros; conteudo e escapado.
- Falhas e mensagens de provider sao sanitizadas, sem stack ou segredo.
- Falha de notificacao nao altera pedido pago, pagamento, estoque ou cupom.
- Retorno client-side nao dispara notificacao; apenas o evento processado depois do settlement pode faze-lo.

## Customer e admin

- Customer pode receber a notificacao do proprio pedido pago.
- Customer nao consulta historico de entregas nesta fase.
- Admin/manager podem consultar status mascarado das entregas.
- Visitante/customer nao acessam a consulta administrativa.
- Nao existe reenvio manual.

## Fallback sem banco

- Repositories de dominio usam memoria apenas em dev/test quando previsto.
- Stripe e notificacoes usam mocks explicitos em dev/test.
- Preview/producao sem configuracao real falham de forma segura.
- Fallback nao promete persistencia, pagamento ou envio real.

## Regras fora do escopo

- Pedido anonimo.
- Pagamento confirmado pelo browser ou admin.
- Refunds/disputas completas.
- Provider real de e-mail obrigatorio.
- Retry agendado ou reenvio manual.
- Historico customer de notificacoes.
- WhatsApp, SMS, Bling, NF-e e fiscal.
- Frete externo real.
- Migration em banco real e deploy.

## Proxima fase

Committar os artefatos Reversa pos-Fase 10 e depois fazer push dos commits locais quando aprovado.
