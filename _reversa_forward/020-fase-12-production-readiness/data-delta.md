# Data Delta: Fase 12 - Production Migration Readiness

> Identificador: `020-fase-12-production-readiness`
> Data: `2026-06-26`
> Fonte base: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/architecture.md`, `_reversa_sdd/inventory.md`

## 1. Resumo

A Fase 12 não prevê novas tabelas, colunas, enums, índices ou FKs. O delta de dados é operacional: revisar migrations existentes, documentar ordem e risco, preparar execução segura em staging/preview e definir rollback/backup antes de qualquer migration real.

## 2. Migrations existentes a consolidar

| Migration | Status esperado na Fase 12 | Observação |
|-----------|----------------------------|------------|
| `drizzle/0000_shallow_shinko_yamashiro.sql` | Revisar | Base inicial de catálogo e entidades principais conforme docs de Fase 3. |
| `drizzle/0001_curvy_blink.sql` | Revisar | Auth/Better Auth conforme docs de Fase 4. |
| `drizzle/0002_tiny_enchantress.sql` | Revisar | Complementos posteriores de domínio; mapear entidades afetadas na implementação. |
| `drizzle/0003_elite_titanium_man.sql` | Revisar | Complementos posteriores de domínio; mapear entidades afetadas na implementação. |
| `drizzle/0004_mute_ghost_rider.sql` | Revisar | Frete manual/cotações conforme checkpoint pós-Fase 7. |
| `drizzle/0005_glossy_talisman.sql` | Revisar | Checkout/pedidos pendentes conforme checkpoint pós-Fase 8. |
| `drizzle/0006_soft_mole_man.sql` | Revisar | Pagamentos Stripe/PaymentIntent conforme checkpoint pós-Fase 9. |
| `drizzle/0007_outstanding_midnight.sql` | Revisar | Notificações pós-pagamento conforme checkpoint pós-Fase 10. |

## 3. Modelo lógico afetado

| Agregado | Entidades existentes | Delta da Fase 12 |
|----------|----------------------|------------------|
| Auth/Customer | `users`, `sessions`, `accounts`, `verifications`, `customer_profiles`, `addresses` | Sem alteração planejada; validar presença nas migrations e readiness de env auth. |
| Catalog | `products`, `product_images`, `categories`, `product_categories` | Sem alteração planejada; validar readiness de upload/imagens. |
| Cart/Commerce | `carts`, `cart_items`, `coupons`, `shipping_rules`, `shipping_quotes` | Sem alteração planejada; smoke seguro deve usar dados controlados. |
| Orders | `orders`, `order_items`, `order_events` | Sem alteração planejada; validar pedidos em test/mock sem mudar estados. |
| Payments | `payment_intents`, `payment_events` | Sem alteração planejada; Stripe test mode deve preservar webhook como fonte da verdade. |
| Notifications | `notification_deliveries`, `admin_notifications` | Sem alteração planejada; smoke deve usar mock/skipped/provider seguro. |
| Fiscal | `fiscal_documents` | Fora de escopo funcional; não implementar Bling/NF-e/rotinas fiscais. |

## 4. Operações proibidas nesta fase

- Criar migration real sem justificativa e aprovação humana.
- Executar `pnpm db:migrate` contra Neon ou qualquer banco real sem autorização explícita.
- Conectar ao banco real apenas para descobrir estado.
- Rodar seed em staging/produção sem aprovação explícita.
- Migrar dados reais do Laravel legado.
- Copiar `.env` ou registrar `DATABASE_URL` em logs/docs.

## 5. Operações permitidas na implementação futura

- Ler arquivos `drizzle/*.sql` e `drizzle/meta/*.json`.
- Comparar migrations com `src/db/schema.ts` localmente.
- Documentar ordem, entidades, riscos e pendências.
- Criar scripts de verificação estática sem rede obrigatória.
- Criar checklist manual para migration remota com ponto de aprovação.
- Registrar que uma validação real foi bloqueada por falta de aprovação humana.

## 6. Plano de rollback de dados

| Situação | Rollback permitido sem aprovação? | Plano |
|----------|-----------------------------------|-------|
| Erro detectado antes de migration real | Sim | Não executar; corrigir migration/doc/script local. |
| Migration aplicada em staging aprovado | Não automaticamente | Restaurar branch/backup Neon conforme checklist aprovado e registrar impacto. |
| Migration aplicada em produção futura | Não nesta fase | Exige plano de go-live posterior, backup confirmado, janela e aprovação explícita. |
| Dados reais importados por engano | Não | Pausar, preservar evidências, não tentar reparo destrutivo sem decisão humana. |

## 7. Critério de pronto do delta de dados

- [ ] Migrations 0000-0007 listadas e classificadas.
- [ ] Riscos de DDL destrutivo, dependência de ordem e entidades críticas registrados.
- [ ] Checklist Neon inclui backup/rollback antes de migration real.
- [ ] `DATABASE_URL` tratado apenas como presença/ausência, nunca valor.
- [ ] Nenhuma migration real executada durante a fase sem autorização explícita.

## 8. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Data delta inicial gerado por `/reversa-plan` | reversa |
