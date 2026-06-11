# Dependencias Reversa - Triade Essenza Next

Atualizado em: 2026-06-11
Escopo: dependencias apos Fase 10.

## Runtime observado

- Next.js App Router, React e TypeScript.
- Drizzle ORM e PostgreSQL/Neon quando `DATABASE_URL` existe.
- Auth.js para sessao e papeis.
- Stripe server SDK e Stripe.js/Payment Element.
- Zod e utilitarios internos de validacao.
- Nenhum SDK adicional de e-mail e obrigatorio na Fase 10.

## Modulos internos

- `src/features/catalog`: produtos e disponibilidade.
- `src/features/auth`: sessao, papeis e policies.
- `src/features/cart`, `coupons`, `shipping`: compra antes do checkout.
- `src/features/orders`: pedidos e snapshots.
- `src/features/payments`: PaymentIntent, webhook e settlement.
- `src/features/notifications`: entregas, templates, provider e consulta administrativa.

## Dependencias do fluxo de notificacao

- O disparo depende de settlement confirmado, nunca do client return.
- `post-payment-event.ts` depende de leitura do pedido pago.
- O service depende do repository de entregas e do adapter de provider.
- Templates dependem somente de snapshots seguros do pedido.
- A consulta administrativa depende de `requireAdminLike`.
- Falha do provider e capturada e nao retorna ao fluxo financeiro.

## Configuracao

- Destinatarios administrativos sao definidos por variavel de ambiente contratual, sem valores versionados.
- Dev/test selecionam provider mock.
- Preview/producao sem provider real selecionam adapter indisponivel.
- Build, testes unitarios e E2E nao exigem provider real nem credenciais de e-mail.
- Nenhum segredo e copiado ou materializado nos artefatos Reversa.

## Persistencia

- Drizzle contem catalogo, auth, carrinho, cupons, frete, pedidos, pagamentos e notificacoes.
- `notification_deliveries.idempotency_key` e unica.
- Indices cobrem pedido, status, evento de pagamento e criacao.
- Migration Fase 10: `drizzle/0007_outstanding_midnight.sql`, gerada e nao aplicada em banco real.
- Fallback em memoria existe para ambiente seguro sem banco.

## Scripts validados na Fase 10

- `pnpm lint`: passou.
- `pnpm typecheck`: passou.
- `pnpm test`: passou, 32 arquivos / 96 testes.
- `pnpm build`: passou.
- `pnpm test:e2e`: passou, 29 testes.

## Riscos de dependencia

- Provider real de e-mail ainda nao e obrigatorio; preview/producao podem registrar falha segura.
- Configuracao vazia de admins produz `skipped`, nao envio implicito.
- Replays exigem preservacao da unique de idempotencia.
- Remover o isolamento pos-settlement poderia acoplar notificacao a regras financeiras.
- Persistencia em memoria nao substitui garantias transacionais de banco real.
