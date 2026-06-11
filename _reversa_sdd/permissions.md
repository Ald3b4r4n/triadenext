# Permissoes Reversa - Triade Essenza Next

Atualizado em: 2026-06-11
Escopo: permissoes apos Fase 10.

## Papeis

| Papel | Descricao |
|---|---|
| Visitante | Navegacao publica e carrinho guest |
| Customer | Compra autenticada e leitura dos proprios pedidos |
| Manager | Operacao administrativa permitida |
| Admin | Administracao ampla dentro dos guardrails |

## Matriz de acesso

| Recurso/acao | Visitante | Customer | Manager | Admin |
|---|---:|---:|---:|---:|
| Catalogo publico | Sim | Sim | Sim | Sim |
| Carrinho proprio | Sim | Sim | Sim | Sim |
| Checkout/criar pedido | Nao | Sim | Nao | Nao |
| Ler pedido proprio | Nao | Sim | Nao | Nao |
| Ler pedidos administrativos | Nao | Nao | Sim | Sim |
| Criar PaymentIntent do proprio pedido | Nao | Sim | Nao | Nao |
| Marcar pedido pago | Nao | Nao | Nao | Nao |
| Receber notificacao do proprio pedido | Nao | Sistema | Nao | Nao |
| Ler historico customer de notificacoes | Nao | Nao | Nao | Nao |
| Ler status admin de notificacoes | Nao | Nao | Sim | Sim |
| Reenviar notificacao | Nao | Nao | Nao | Nao |

## Protecoes server-side

- `requireCustomer` protege checkout, pagamento e pedidos customer.
- Ownership do carrinho, pedido e PaymentIntent e verificado no servidor.
- `requireAdminLike` protege paginas/actions administrativas.
- Webhook Stripe valida assinatura e nao depende de sessao browser.
- Consulta administrativa de notificacoes usa `requireAdminLike`.
- Destinatarios e conteudo de notificacao sao derivados de snapshots/configuracao server-side.

## Checkout, pagamento e notificacoes

- Customer nao escolhe valor, moeda, status financeiro ou destinatario admin.
- Admin/manager nao marcam pago, editam totais, baixam estoque ou consomem cupom.
- A notificacao customer so e criada para pedido pago confirmado.
- Status administrativo mascara destinatarios e erros.
- Falha de provider nao concede permissao nem altera dominio financeiro.
- Nao ha endpoint/action de reenvio manual.

## Fora do escopo de permissao atual

- Pedido anonimo.
- Delegacao granular alem de manager/admin.
- Historico customer de notificacoes.
- Reenvio manual.
- Operacoes fiscais, Bling/NF-e, WhatsApp ou SMS.
