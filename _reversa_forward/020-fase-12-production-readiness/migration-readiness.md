# Migration Readiness - Fase 12

Data: 2026-07-01

## Resumo

Migrations Drizzle foram revisadas de forma estatica. Nenhuma migration real foi executada e nenhum
banco real foi acessado.

## Migrations

| Migration | Area | Tipo | Risco |
|-----------|------|------|-------|
| `0000_shallow_shinko_yamashiro.sql` | Base e-commerce | Cria enums, tabelas, FKs e indices | Alta abrangencia; aplicar primeiro em banco vazio/staging aprovado. |
| `0001_curvy_blink.sql` | Auth | Cria tabelas Better Auth e campos de users | Depende de `users`. |
| `0002_tiny_enchantress.sql` | Carrinho | Colunas e indices aditivos | Baixo, mas exige ordem. |
| `0003_elite_titanium_man.sql` | Cupons | Cupom aplicado ao carrinho e indices | Baixo, aditivo. |
| `0004_mute_ghost_rider.sql` | Frete | Cotacoes, colunas de frete e indices | Medio por defaults e nova tabela. |
| `0005_glossy_talisman.sql` | Checkout/pedidos | Snapshots e totais de pedido | Medio por unique de `orders.cart_id`. |
| `0006_soft_mole_man.sql` | Pagamentos | Indices de idempotencia e PaymentIntent | Baixo, protege duplicidade. |
| `0007_outstanding_midnight.sql` | Notificacoes | Outbox e enums de delivery | Baixo/medio por enum novo. |

## Guardrails

- `pnpm ops:check-migrations` nao exige `DATABASE_URL`.
- `pnpm db:migrate` continua bloqueado sem `DATABASE_URL`.
- Presenca de `DATABASE_URL` nao autoriza execucao real.
- Backup/rollback e aprovacao humana sao obrigatorios antes de staging ou producao.

## Pendencias antes de banco real

- Confirmar projeto/branch Neon alvo.
- Confirmar backup/restore.
- Confirmar janela e responsavel.
- Registrar comando exato sem imprimir URL.
