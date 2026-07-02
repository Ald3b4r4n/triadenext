# Plano de Validação Final

> Feature: `022-fase-14-data-dry-run`
> Data: `2026-07-02`

## Comandos obrigatórios

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
pnpm ops:check-data-dry-run
```

## O que cada comando prova

| Comando | Evidência esperada |
|---------|--------------------|
| `pnpm lint` | Código e testes sem violação de lint. |
| `pnpm typecheck` | Contratos TypeScript do módulo de dry-run íntegros. |
| `pnpm test` | Normalizadores, segurança, reconciliação e regressões existentes passam. |
| `pnpm build` | Next build continua sem exigir credenciais reais. |
| `pnpm test:e2e` | Smoke E2E existente continua estável. |
| `pnpm ops:check-data-dry-run` | Dry-run seguro roda com exemplos sintéticos e sem operação real. |

## Validações de segurança

- Confirmar `git status --short` antes do commit.
- Confirmar que `next-env.d.ts` está limpo ou restaurado.
- Confirmar que `data/dry-run/output/` está ignorado pelo Git.
- Confirmar que `data/dry-run/input/` versiona apenas `.gitkeep` e exemplos sintéticos.
- Confirmar ausência de `.env`, secrets, banco real, upload real, migration real, import real, deploy e push.
- Confirmar que nenhum arquivo do Laravel legado foi alterado.

## Comandos proibidos nesta fase

- `pnpm db:migrate`
- `drizzle-kit migrate`
- Qualquer conexão com banco real.
- Qualquer importação real de dados.
- Qualquer upload para Blob/storage.
- Qualquer deploy.
- Qualquer alteração no Laravel legado.
- `git push`

## Critério de conclusão

- Todas as 36 ações em `actions.md` marcadas `[X]`.
- `legacy-impact.md` criado.
- `regression-watch.md` criado.
- `validation-results.md` registra resultados reais dos comandos.
- `final-safety-review.md` confirma ausência de efeitos reais.
- Commit local criado somente se todas as validações passarem.

## Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Plano de validação inicial da Fase 14 | reversa-coding |
