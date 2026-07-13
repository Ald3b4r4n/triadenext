# Onboarding: Fase 19 — Controlled Staging Execution

> Objetivo: orientar uma pessoa técnica a executar o diagnóstico seguro de staging e transformar o resultado em uma lista objetiva de pendências humanas.

## Antes de começar

1. Confirme o diretório `D:\Projetos\triade-essenza-next`.
2. Confirme que não está no Laravel legado `D:\Projetos\triadeessenzaparfum.com.br`.
3. Não copie `.env`.
4. Não cole nem imprima `DATABASE_URL`, URL privada, chave Stripe, webhook secret, token, cookie ou senha.
5. Não passe flags de execução, reset, deploy, migration, importação ou aprovação remota.
6. Não conecte banco remoto e não acesse produção.
7. Se `next-env.d.ts` sujar, restaure antes de finalizar.

## Sequência segura

### 1. Higiene inicial

1. Verificar `git status --short`.
2. Verificar `git status -sb`.
3. Verificar `git diff -- next-env.d.ts`.
4. Registrar somente se o worktree estava limpo e se `next-env.d.ts` está limpo.

### 2. Readiness geral

Rodar em modo padrão:

```powershell
pnpm ops:check-staging-environment
```

Resultado esperado quando infraestrutura não existe: `pending-config` e decisão `no-go`, sem valores sensíveis.

### 3. Smoke staging seguro

Rodar em modo padrão:

```powershell
pnpm ops:check-staging-smoke
```

Se não houver `STAGING_SMOKE_URL` ou equivalente, o resultado esperado é `pending-config` ou `skipped` controlado. Não inventar URL.

### 4. Import staging smoke seguro

Rodar em modo padrão:

```powershell
pnpm ops:check-staging-import-smoke
```

Se faltarem URL, envs, arquivos aprovados ou aprovação, registrar `pending-config`, `pending-input` ou `blocked`.

### 5. Dry-run de dados

Rodar:

```powershell
pnpm ops:check-data-dry-run
```

Não copiar dados reais e não buscar no Laravel legado. Se a pasta `data/dry-run/input/primeira-execucao/` não tiver arquivos aprovados, registrar `pending-input`.

### 6. Wrappers de ação remota em modo default/check

Estes comandos só podem ser usados sem flags e apenas se o default for precheck/check:

```powershell
pnpm ops:import-staging
pnpm ops:migrate-staging
pnpm ops:bootstrap-admin-staging
```

Se qualquer um exigir flag de execução, aprovação, banco remoto ou target para prosseguir, não execute a ação; registre como pendência humana.

## Matriz de interpretação

| Status | Interpretação humana | Próximo passo |
| --- | --- | --- |
| `passed` | Condição verificada no modo seguro. | Manter evidência sanitizada. |
| `pending-config` | Falta configuração externa. | Configurar Vercel, Neon, Stripe ou URL fora do Git. |
| `pending-input` | Falta arquivo aprovado ou dado de entrada. | Preparar input aprovado fora do Git. |
| `blocked` | Guardrail impediu avanço. | Corrigir alvo, aprovação, snapshot ou risco de produção. |
| `skipped` | Etapa pulada por pré-condição ausente. | Resolver pré-condição se a etapa for obrigatória. |
| `failed` | Falha inesperada. | Classificar se é problema do Next, ambiente local ou comando. |

## Checklist humano de saída

O relatório final deve responder:

1. Vercel Preview/staging está configurado?
2. Existe URL pública controlada aprovada?
3. Neon staging/dev isolado existe?
4. Snapshot/rollback de banco está definido?
5. Stripe test mode e webhook test estão configurados?
6. `ADMIN_MASTER_EMAILS` e auth/admin staging estão prontos?
7. Arquivos aprovados para import staging existem?
8. Algum script apontou produção, live mode ou ausência de aprovação?
9. Algum problema é do Next, e não de configuração externa?
10. A decisão é `go` ou `no-go`?

## Critério de avanço

A próxima fase só pode avançar para staging real se:

- todos os Must estiverem `passed`;
- nenhum provider estiver `pending-config`;
- nenhum input obrigatório estiver `pending-input`;
- nenhum bloqueio de produção/live/secrets existir;
- snapshot/rollback e aprovações humanas estiverem registradas;
- os relatórios estiverem sanitizados.

Sem isso, a conclusão correta é `no-go` com checklist acionável.
