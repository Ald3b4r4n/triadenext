# Data Delta: Fase 18 — Staging Environment Setup

> Data: 2026-07-11

## Resumo

Não há delta no schema persistido da aplicação. A Fase 18 não cria tabela, coluna, enum, índice ou nova migration. O delta consiste em aplicar, quando autorizado, as migrations já versionadas em um banco Neon staging/dev isolado e produzir evidências operacionais sanitizadas.

## Modelo persistido

| Área | Mudança | Regra |
| --- | --- | --- |
| `src/db/schema.ts` | Nenhuma | Não alterar schema para configurar staging. |
| `drizzle/0000` a `0007` | Aplicação condicional em staging | Somente após revisão, snapshot, alvo não produtivo e aprovação humana. |
| Meta Drizzle | Nenhuma alteração planejada | `_journal.json` e snapshots permanecem fonte versionada. |
| Usuários/auth | Nenhuma mudança estrutural | Bootstrap promove conta existente ou cria/ajusta conforme serviço idempotente já definido, apenas em staging autorizado. |
| Catálogo/pedidos/pagamentos/outbox | Nenhuma regra nova | Dados controlados existem apenas para smoke; produção e importação definitiva não participam. |

## Sequência de schema staging

| Ordem | Migration | Área | Gate adicional |
| --- | --- | --- | --- |
| 1 | `0000_shallow_shinko_yamashiro.sql` | Base comercial e usuários | Revisão integral por ser migration-base ampla. |
| 2 | `0001_curvy_blink.sql` | Better Auth | Confirmar dependência de `users`. |
| 3 | `0002_tiny_enchantress.sql` | Carrinho | Verificar índices e snapshots. |
| 4 | `0003_elite_titanium_man.sql` | Cupons | Confirmar aditividade. |
| 5 | `0004_mute_ghost_rider.sql` | Frete | Confirmar defaults e tabelas de cotação. |
| 6 | `0005_glossy_talisman.sql` | Pedido | Confirmar unique de carrinho. |
| 7 | `0006_soft_mole_man.sql` | Pagamentos | Confirmar idempotência e índices. |
| 8 | `0007_outstanding_midnight.sql` | Outbox | Confirmar constraints de entrega. |

## Estados operacionais

| Condição | Status | Escrita permitida? | Decisão go/no-go |
| --- | --- | --- | --- |
| Vercel/URL ausente | `pending-config` | Não | `no-go` |
| Neon staging ausente | `pending-config` | Não | `no-go` |
| Aprovação ou snapshot ausente | `blocked` | Não | `no-go` |
| Stripe test/webhook ausente | `pending-config` | Não | `no-go` para pagamento externo |
| Arquivos aprovados ausentes | `pending-input` | Não pelo import | `no-go` para import smoke |
| Target produtivo/live | `blocked` | Não | `no-go` crítico |
| Todos os gates e smokes verdes | `passed` | Apenas staging aprovado | candidato a `go` humano |

## Dados operacionais e relatórios

| Artefato | Persistência | Versionável? | Conteúdo permitido |
| --- | --- | --- | --- |
| Inventário de configuração | Memória/saída sanitizada | Sim | Nome lógico e status, sem valor. |
| Evidência de migration | Saída operacional ignorada | Não por padrão | IDs das migrations e resultado, sem URL. |
| Evidência de bootstrap | Saída operacional ignorada | Não por padrão | E-mail mascarado/identificador lógico e status. |
| Relatório de smoke | Saída operacional ignorada | Não por padrão | Etapas, status e erro sanitizado. |
| Template go/no-go | Feature/docs | Sim | Campos e critérios, sem evidência bruta. |

## Migration staging

Pré-condições cumulativas:

1. Alvo explicitamente classificado como staging/dev remoto.
2. Produção bloqueada antes de abrir conexão.
3. `pnpm ops:check-migrations` verde e SQL revisado.
4. Snapshot/branch de restore ou mecanismo equivalente confirmado.
5. Aprovação humana identifica alvo lógico, janela e conjunto de migrations.
6. Execução usa segredo apenas no processo e nunca o imprime.
7. Verificação pós-migration compara journal/schema esperado sem dados sensíveis.

## Bootstrap administrativo

- `ADMIN_MASTER_EMAILS` deve conter `rafasouzacruz@gmail.com` no ambiente staging.
- Senha e secrets de auth permanecem externos.
- A operação deve ser idempotente e restrita ao alvo staging aprovado.
- Falta de banco, auth, usuário ou aprovação retorna `pending-config`/`blocked`, sem fallback administrativo falso.

## Rollback

- Rollback da aplicação: reverter/reapontar o preview aprovado, sem promover produção.
- Rollback do banco: restaurar branch/snapshot Neon conforme evidência pré-migration.
- Rollback de bootstrap: seguir decisão humana; não apagar usuário automaticamente.
- Rollback de smoke: encerrar execução e preservar apenas evidência sanitizada.
- O Laravel legado não é mecanismo de rollback técnico desta fase e permanece intocado.
