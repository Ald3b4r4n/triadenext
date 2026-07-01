# Interface: Neon/Postgres

> Feature: `020-fase-12-production-readiness`
> Tipo: banco externo
> Status: contrato operacional; nenhuma conexão real autorizada por este documento.

## 1. Objetivo

Preparar Neon/Postgres como alvo de staging/produção com backup, rollback, migrations Drizzle e verificação segura.

## 2. Entradas

| Entrada | Origem | Sensível | Observação |
|---------|--------|----------|------------|
| `DATABASE_URL` | Vercel/env local aprovado | Sim | Nunca imprimir nem registrar. |
| Nome do projeto Neon | Operador | Não, se sem credenciais | Pode ser documentado sem URL. |
| Branch/banco alvo | Operador | Parcial | Registrar identificador sem string de conexão. |
| Restore window/backup | Neon dashboard | Não | Registrar estado, não segredo. |

## 3. Operações planejadas

| Operação | Permitida automaticamente? | Ponto de aprovação |
|----------|----------------------------|--------------------|
| Revisar migrations locais | Sim | Não exige banco. |
| Verificar presença de `DATABASE_URL` | Sim | Sem imprimir valor. |
| Conectar ao Neon staging | Não | Aprovação explícita do alvo. |
| Rodar `pnpm db:migrate` | Não | Aprovação explícita + backup/rollback revisados. |
| Rodar seed | Não | Aprovação explícita + ambiente não-produção confirmado. |
| Restaurar backup/branch | Não | Aprovação explícita de impacto. |

## 4. Critérios de sucesso

- Migrations 0000-0007 revisadas.
- Alvo staging identificado sem expor URL.
- Backup/restore documentado antes de migration real.
- Rollback de banco separado do rollback Vercel.
- Nenhuma conexão real executada sem aprovação.

## 5. Critérios de falha

- `DATABASE_URL` aparece em log ou doc.
- Migration contém operação destrutiva não explicada.
- Alvo de banco não está claro.
- Não há plano de backup ou rollback.
- Operador tenta usar produção como primeiro alvo.

## 6. Idempotência e rollback

Migrations Drizzle devem ser tratadas como sequência aplicada uma vez por banco alvo. Rollback não deve assumir reversão automática de DDL; deve usar backup, branch restore ou plano manual aprovado.

## 7. Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Contrato inicial gerado por `/reversa-plan` | reversa |
