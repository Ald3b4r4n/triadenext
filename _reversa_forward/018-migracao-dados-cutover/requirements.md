# Requirements - Migração de Dados e Cutover

## Objetivo

Planejar execução segura de migração dos dados legados para o Next, sem tocar produção durante planejamento.

## Escopo

- Export read-only.
- Formato intermediário.
- Import isolado.
- Reconciliação por domínio.
- Plano de rollback e smoke tests.

## Regras

- Não copiar secrets.
- Não alterar banco legado.
- Não conectar produção sem aprovação explícita.
- Cutover exige janela e checklist.

## Fora do escopo

- Deploy automático.
- Execução real de migração.
