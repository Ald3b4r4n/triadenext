# Rollback Plan

## Principio

O Laravel legado permanece intacto ate aceite pos-cutover. Ele e a base de rollback operacional.

## Antes de import real futuro

- [ ] Backup do alvo Next/Neon.
- [ ] Identificacao do ambiente alvo.
- [ ] Janela de corte aprovada.
- [ ] Criterios de abortar conhecidos.
- [ ] Plano de DNS/domínio reversivel em fase de deploy futura.

## Durante cutover futuro

- Se dry-run/import falhar, descartar ambiente ou restaurar backup.
- Se smoke final falhar, manter trafego no Laravel.
- Se divergencia financeira aparecer, abortar e investigar.
- Se secret/dado pessoal cru aparecer em log, abortar e rotacionar conforme necessidade.

## Depois do cutover futuro

- Manter legado em modo consulta por periodo acordado.
- Registrar divergencias pos-go-live.
- Nao apagar dados legados ate aceite formal.

## Nesta Fase 13

Nenhum rollback tecnico foi necessario porque nao houve deploy, migration real, banco real, import real ou alteracao no Laravel.
