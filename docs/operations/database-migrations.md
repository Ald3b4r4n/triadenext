# Database Migrations

Migrations locais sao versionadas em `drizzle/` com Drizzle Kit. Esta documentacao prepara
execucao segura, mas nao autoriza migration real, banco real ou conexao remota sem aprovacao
humana explicita.

## Scripts

- `pnpm db:generate`: gera SQL local em `drizzle/` a partir de `src/db/schema.ts`.
- `pnpm db:migrate`: exige `DATABASE_URL` e depois executa `drizzle-kit migrate`.
- `pnpm db:studio`: abre Drizzle Studio para inspecao manual.
- `pnpm ops:check-migrations`: faz leitura estatica das migrations e nao conecta banco.

`scripts/db/require-database-url.mjs` bloqueia migrate sem alvo configurado e nao imprime o
valor da URL. A presenca de `DATABASE_URL` nao basta para executar: o alvo precisa ser
confirmado por humano antes de qualquer banco real.

## Ordem consolidada

| Migration | Fase | Area principal | Risco operacional |
|-----------|------|----------------|-------------------|
| `0000_shallow_shinko_yamashiro.sql` | Fase 3 | Base catalogo, carrinho, pedidos, pagamentos, fiscal futuro, users | Base ampla; revisar antes de banco vazio real. |
| `0001_curvy_blink.sql` | Fase 4 | Better Auth: accounts, sessions, verifications e campos de users | Depende da base `users`. |
| `0002_tiny_enchantress.sql` | Fase 5 | Carrinho: snapshots, session, indices | Aditiva. |
| `0003_elite_titanium_man.sql` | Fase 6 | Cupons aplicados ao carrinho | Aditiva. |
| `0004_mute_ghost_rider.sql` | Fase 7 | Frete manual, cotacoes e selecao no carrinho | Aditiva com defaults. |
| `0005_glossy_talisman.sql` | Fase 8 | Pedido pendente, snapshots e totais | Aditiva com unique de `orders.cart_id`. |
| `0006_soft_mole_man.sql` | Fase 9 | PaymentIntent e eventos Stripe | Indices/idempotencia. |
| `0007_outstanding_midnight.sql` | Fase 10 | Outbox de notificacoes pos-pagamento | Aditiva. |

## Checklist antes de migration real

- [ ] Confirmar ambiente alvo: local-dev, preview/staging ou producao.
- [ ] Confirmar projeto/branch Neon sem registrar string de conexao.
- [ ] Rodar `pnpm ops:check-migrations` localmente.
- [ ] Revisar SQL gerado/versionado e procurar DDL destrutivo.
- [ ] Confirmar backup/restore ou branch de rollback.
- [ ] Registrar aprovacao humana com comando e alvo.
- [ ] Executar `pnpm db:migrate` somente apos a aprovacao.
- [ ] Registrar resultado sem imprimir `DATABASE_URL`.

## Operacoes proibidas nesta fase

- Rodar `pnpm db:migrate` contra Neon sem aprovacao explicita.
- Rodar `drizzle-kit push` contra qualquer banco real.
- Copiar `.env` ou colar `DATABASE_URL` em chat, docs ou logs.
- Usar producao como primeiro alvo.
- Migrar dados reais do Laravel legado.

## Rollback

Rollback de app nao reverte banco. Para staging, preferir branch/restore Neon aprovado. Para
producao futura, exigir janela, backup confirmado e plano de restauracao antes da migration.
