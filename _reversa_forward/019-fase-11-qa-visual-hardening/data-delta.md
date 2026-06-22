# Data Delta: Fase 11 - QA visual, hardening frontend e preparacao segura de producao

> Identificador: `019-fase-11-qa-visual-hardening`
> Data: `2026-06-22`

## 1. Panorama

A Fase 11 nao introduz novo modelo de dados. O escopo e visual, frontend, testes e preparacao operacional segura. Portanto, o delta de dados esperado e negativo: nao criar tabelas, nao alterar schema Drizzle, nao gerar migration e nao aplicar migration real.

## 2. Entidades impactadas

| Entidade ou agregado | Delta esperado |
|----------------------|----------------|
| `products`, `product_images`, `categories` | Sem mudanca de schema ou regra. Apenas UI/catalogo/cards podem ser ajustados. |
| `carts`, `cart_items`, `coupons`, `shipping_quotes` | Sem mudanca de schema ou regra. Apenas mensagens, CTAs, estados e testes podem ser ajustados. |
| `orders`, `order_items`, `order_events` | Sem mudanca de schema ou regra. Apenas leitura visual de pedidos/status pode ser endurecida. |
| `payment_intents`, `payment_events` | Sem mudanca de schema ou regra. Payment mock/test permanece guardrail de QA. |
| `notification_deliveries`, `admin_notifications` | Sem mudanca de schema ou regra. UI/status admin pode ser revisado sem envio real. |
| `users`, `sessions`, `accounts`, `customer_profiles`, `addresses` | Sem mudanca de schema ou regra. Customer pages podem ganhar estados minimos sem implementar perfil completo. |
| `fiscal_documents` | Sem mudanca funcional. Bling, NF-e e rotinas fiscais continuam fora de escopo. |

## 3. Migrations

- Nenhuma migration deve ser criada como parte normal da Fase 11.
- `drizzle.config.ts` nao deve ser alterado.
- `drizzle/` nao deve ser alterado.
- `src/db/schema.ts` nao deve ser alterado.
- `pnpm db:migrate` nao deve ser executado contra banco real.
- Checklist de producao pode documentar a ordem futura de migrations, mas sem aplicar nada.

## 4. Delta de configuracao

O unico delta operacional permitido e documental/seguro:

| Arquivo ou area | Delta permitido |
|-----------------|-----------------|
| `.env.example` | Revisar nomes de variaveis, obrigatorias/opcionais e placeholders vazios. Nenhum valor real. |
| `docs/operations/env.md` ou checklist equivalente | Listar variaveis e proposito, sem secrets. |
| `docs/operations/stripe.md` | Reforcar test mode e webhook futuro sem chave real. |
| `docs/operations/neon.md` | Reforcar provisionamento/checklist sem conectar banco real. |
| `docs/operations/database-migrations.md` | Reforcar etapa operacional futura, sem execucao real. |
| `docs/operations/blob.md` | Reforcar token de Blob como segredo externo e bloqueio seguro sem token. |
| `docs/operations/vercel.md` | Reforcar dominio/deploy como checklist futuro, sem deploy. |

## 5. Script local opcional

Um script de readiness de env pode ser considerado no coding futuro se permanecer estritamente local e seguro.

Contrato conceitual:

```txt
Entrada: process.env e uma lista fixa de nomes esperados.
Saida: tabela de status por variavel, usando apenas "presente", "ausente", "opcional" ou "obrigatoria".
Proibido: imprimir valores, conectar providers, validar credenciais, rodar migrations, enviar e-mail, fazer deploy.
```

Variaveis que o checklist deve classificar:

| Variavel | Classe inicial sugerida | Observacao |
|----------|-------------------------|------------|
| `DATABASE_URL` | obrigatoria para producao real | Nao conectar nesta fase. |
| `BETTER_AUTH_SECRET` | obrigatoria para producao real | Nunca imprimir. |
| `BETTER_AUTH_URL` | obrigatoria para producao real | Validar apenas presenca se script existir. |
| `NEXT_PUBLIC_APP_URL` | obrigatoria para producao real | Valor nao deve aparecer em log sensivel. |
| `NEXT_PUBLIC_SITE_NAME` | opcional/recomendada | Pode ter fallback de marca. |
| `STRIPE_SECRET_KEY` | obrigatoria para pagamento real | Test mode apenas no checklist. |
| `STRIPE_WEBHOOK_SECRET` | obrigatoria para webhook real | Nunca imprimir. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | obrigatoria para pagamento real | Chave publica, mas ainda sem imprimir por padrao. |
| `BLOB_READ_WRITE_TOKEN` | obrigatoria para upload real | Nunca imprimir. |
| `EMAIL_PROVIDER`, `EMAIL_FROM`, `ORDER_NOTIFICATION_RECIPIENTS` | conforme provider futuro | Mock/unavailable permitido em dev/test. |
| `RESEND_API_KEY`, `EMAIL_API_KEY`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | opcionais por provider | Nunca imprimir; nao testar rede. |
| `SENTRY_DSN` | opcional | Sem validacao externa nesta fase. |
| `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD` | dev/test apenas | Nao usar credencial real de producao. |

## 6. Dados de teste

- Preferir fixtures, mocks e fallback dev/test existentes.
- Nao exigir seed real.
- Nao conectar banco real para smoke visual.
- Se dados fixture forem insuficientes para fluxo feliz, a acao futura deve registrar o gap e usar mock/dev controlado, sem alterar regra de dominio.

## 7. Dados proibidos em UI, docs ou logs

- Secrets/API keys.
- Tokens/cookies/session.
- `DATABASE_URL` real.
- Senhas SMTP.
- Stripe secret/webhook secret.
- Payload Stripe bruto.
- Dados de cartao.
- Valores reais de credenciais Neon, Blob, email ou deploy.

## 8. Resultado

O delta de dados da Fase 11 e "sem alteracao de dados". Qualquer necessidade de schema/migration descoberta durante o coding deve ser tratada como desvio de escopo e pausada para decisao humana.
