# QA Copy Audit: Fase 11

> Data: `2026-06-22`

## Varredura inicial

Comando de referencia:

```powershell
rg -n "Reconstrucao|Reconstrução|Placeholder funcional|Storefront|DATABASE_URL|secret|token|client_secret|BLOB_READ_WRITE_TOKEN|STRIPE_SECRET_KEY|SMTP_PASSWORD" src/app src/components src/features src/tests
```

Achados que precisam de hardening visual:

| Categoria | Local | Decisao |
|-----------|-------|---------|
| Placeholder visivel | `src/components/layout/placeholder-page.tsx` | Substituir copy de reconstrucao por estado futuro controlado. |
| Customer placeholder | `src/app/(customer)/minha-conta/page.tsx`, `src/app/(customer)/enderecos/page.tsx` | Trocar para telas minimas apresentaveis. |
| Admin placeholder | `src/app/admin/page.tsx`, `src/app/admin/fretes/page.tsx`, `src/app/admin/documentos-fiscais/page.tsx` | Trocar para dashboard/estados controlados. |
| Texto tecnico em UI | mensagens com `DATABASE_URL ausente` vindas de guardrails | Mascarar em paginas visiveis quando possivel, preservando seguranca. |
| Mock/dev | pagamento e notificacoes | Explicar como modo de teste seguro, sem simular cobranca/envio real. |

## Termos proibidos para usuario final

- `Reconstrucao em andamento`
- `Placeholder funcional`
- `Storefront` generico
- `DATABASE_URL`
- nomes de secrets/tokens
- stack trace ou provider bruto

## Excecoes aceitaveis

- Testes unitarios/E2E podem conter termos proibidos como assertivas de ausencia.
- Codigo server-side de sanitizacao pode conter nomes de variaveis sensiveis quando a finalidade e bloquear vazamento.
- `.env.example` deve listar nomes de variaveis, sempre sem valores reais.

## Varredura final

Comandos executados durante o coding:

```powershell
rg -n "\b(Nao|nao|invalido|invalidos|publico|Criacao|criacao|validacao|persistencia|operacao|confirmacao|cobranca|cartao|endereco|areas|area|Selecao|selecao|Cotacao|Codigo)\b" src/app src/components src/features -g "*.ts" -g "*.tsx"
rg -n "Reconstrucao|Reconstrução|Placeholder funcional|DATABASE_URL|dev/fixture|credenciais|snapshot|webhook|PaymentIntent|Stripe|client secret" src/app src/components src/features -g "*.ts" -g "*.tsx"
```

Resultado:

| Categoria | Resultado | Observacao |
|-----------|-----------|------------|
| Placeholder antigo | Sem ocorrencias visiveis em `src/app`, `src/components` ou `src/features`. | Testes continuam assertando ausencia. |
| Texto tecnico de ambiente | Sem `DATABASE_URL`, `dev/fixture`, secrets ou credenciais em copy visivel. | Nomes de variaveis permanecem apenas em docs operacionais e scripts seguros. |
| Pagamento/provedor | Ocorrencias restantes sao imports, tipos, adapters e rota interna de webhook. | Mensagens renderizadas passam por copy segura/sanitizacao. |
| PT-BR | Mensagens visiveis de cart, cupom, frete, checkout, auth, produtos, pagamento e notificacoes foram normalizadas. | Valores de enum internos, como `nao_informado`, foram mantidos. |

Excecoes aceitas:

- Tipos e identificadores internos como `PaymentIntentRecord`, `StripeIntentPayload`, `useStripe`, `createStripePaymentAdapter` e `processStripeWebhook`.
- Endpoint interno `src/app/api/webhooks/stripe/route.ts`.
- Guards de sanitizacao que precisam conter nomes tecnicos para bloquear vazamentos.
