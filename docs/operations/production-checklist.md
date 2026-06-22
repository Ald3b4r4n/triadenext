# Checklist seguro de producao

Este checklist prepara a primeira validacao de producao da Tríade Essenza Parfum. Ele nao executa deploy, nao conecta banco real, nao roda migration real, nao envia e-mail real e nao valida credenciais imprimindo valores.

## Ambiente

- [ ] `.env.example` lista nomes esperados sem valores reais.
- [ ] Secrets reais ficam somente no provedor de deploy/ambiente seguro.
- [ ] `pnpm build`, `pnpm test` e `pnpm test:e2e` continuam capazes de rodar sem credenciais reais.
- [ ] `pnpm ops:check-env` pode ser usado localmente para ver apenas presença/ausência.
- [ ] `pnpm ops:check-env -- --production` deve ser usado apenas como checklist local; ele nao testa rede nem imprime valores.

## Variaveis obrigatorias para producao real

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SITE_NAME`
- `BLOB_READ_WRITE_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Variaveis opcionais ou condicionais

- `DEV_ADMIN_EMAIL`
- `DEV_ADMIN_PASSWORD`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`
- `ORDER_NOTIFICATION_RECIPIENTS`
- `RESEND_API_KEY`
- `EMAIL_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SENTRY_DSN`

## Stripe test mode

- [ ] Usar chaves de teste antes de qualquer validacao com pagamento real.
- [ ] Conferir webhook em modo teste antes de producao.
- [ ] Confirmar que retorno do navegador nao marca pedido como pago.
- [ ] Confirmar que evento duplicado nao repete settlement.

## Neon e migrations

- [ ] Provisionar banco fora desta fase.
- [ ] Revisar migrations localmente antes de qualquer aplicacao real.
- [ ] Aplicar migration real somente em etapa operacional autorizada.
- [ ] Confirmar plano de backup/rollback antes da primeira aplicacao real.

## Blob/upload

- [ ] Configurar token real apenas no ambiente seguro.
- [ ] Confirmar que ausencia de token bloqueia upload definitivo com mensagem segura.
- [ ] Validar tamanho e tipo de arquivo antes de liberar upload real.

## E-mail

- [ ] Dev/test usam provider de teste sem rede real.
- [ ] Producao sem provider configurado nao finge envio.
- [ ] Destinatarios internos devem ser configurados fora do repositorio.
- [ ] Nenhum template deve conter secret, token ou payload bruto de pagamento.

## Dominio e deploy

- [ ] Configurar dominio em etapa separada.
- [ ] Rodar smoke visual em 360px, 430px, 768px e 1366px antes de publicar.
- [ ] Validar home, catalogo, carrinho, checkout, pedidos e admin protegido.
- [ ] Nao fazer deploy a partir deste checklist sem decisao operacional explicita.

## Fora do escopo da Fase 11

- Deploy real.
- Migration real.
- Banco real.
- Credenciais reais no repositorio.
- Integracoes fiscais.
- Canais externos de mensagem.
- Redesign premium.
