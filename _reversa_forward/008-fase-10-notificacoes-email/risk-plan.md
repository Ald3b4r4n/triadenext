# Risk Plan: Fase 10 - Notificacoes e e-mails transacionais pos-pagamento

> Identificador: `008-fase-10-notificacoes-email`
> Data: `2026-06-10`

## Riscos principais

| ID | Risco | Severidade | Probabilidade | Mitigacao | Sinal de alerta |
|----|-------|------------|---------------|-----------|-----------------|
| R-01 | Falha de e-mail reverter pagamento confirmado | CRITICAL | media | Isolar notificacao apos settlement, capturar erro e registrar falha. | Pedido volta de `pago` ou transaction falha por provider. |
| R-02 | Webhook duplicado gerar e-mail duplicado | HIGH | media | Unique `idempotency_key`; create-if-new no repository. | Dois registros/envios com mesma chave logica. |
| R-03 | Mock ativo em preview/producao | HIGH | baixa | Config bloquear mock fora de dev/test. | Status `mocked` em ambiente nao dev/test. |
| R-04 | Vazamento de dados sensiveis | HIGH | media | Whitelist de campos em templates e erro sanitizado. | Logs/templates com token, payload bruto, cartao ou secret. |
| R-05 | Hardcode de e-mails reais | MEDIUM | media | Usar config server-side e placeholder em `.env.example`. | E-mail pessoal em codigo/teste/doc. |
| R-06 | Escopo crescer para fiscal/canais | MEDIUM | media | Manter fora de escopo em docs, testes e regression-watch futuro. | Tarefa citando Bling/NF-e/WhatsApp/SMS como implementacao. |
| R-07 | Retry automatico parcial sem controle | MEDIUM | baixa | Preparar status/tentativas, mas nao agendar retry completo. | Loop de reenvio sem idempotencia. |

## Guardrails de coding futuro

- Nao alterar regras de pagamento, estoque ou cupom da Fase 9.
- Nao chamar provider de e-mail antes do pedido estar `pago`.
- Nao propagar erro de notificacao para o settlement.
- Nao guardar payload Stripe bruto.
- Nao usar provider real em testes automatizados.
- Nao adicionar WhatsApp/SMS/Bling/NF-e.

## Rollback seguro

1. Desabilitar chamada do servico de notificacao no ponto pos-settlement.
2. Manter outbox sem processamento ativo.
3. Preservar registros ja criados para auditoria.
4. Manter pagamento/estoque/cupom intocados.

## Watch items sugeridos para `/reversa-coding`

- Pedido pago continua sendo definido apenas por webhook Stripe valido.
- Webhook duplicado nao duplica notificacao.
- Falha de notificacao nao reverte pagamento/estoque/cupom.
- Mock de e-mail nao opera como envio real fora de dev/test.
- Templates/logs seguem sem dados sensiveis.
