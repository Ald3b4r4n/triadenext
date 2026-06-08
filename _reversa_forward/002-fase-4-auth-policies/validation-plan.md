# Validation Plan: Fase 4 - Auth e Policies

> Data: `2026-06-08`

## 1. Estrategia

A validacao deve provar que auth/session/policies protegem rotas e mutations sem quebrar fallback, build/test ou regras herdadas de catalogo. Testes de unidade cobrem policies e guardrails; e2e cobre fluxos essenciais de usuario.

## 2. Testes unitarios

| Area | Casos |
|---|---|
| Roles | `admin` e `manager` aprovados para admin; `customer` bloqueado. |
| Sessao | ausente, expirada, invalida e timeout viram nao autenticado. |
| Policies admin | anonimo/customer bloqueados; admin/manager permitidos. |
| Policies customer | owner permitido; acesso cruzado bloqueado. |
| Guardrails ambiente | preview/producao bloqueiam mutation sem auth/policy real. |
| Cadastro publico | role enviada ignorada/rejeitada; e-mail duplicado; senha fraca. |
| Login/logout | erro generico, sessao criada, sessao invalidada. |
| Seed admin dev | exige envs; bloqueia production/preview; nao loga secrets. |
| Fallback | sem `DATABASE_URL`, build/test nao conectam banco. |

## 3. Testes e2e

| Fluxo | Resultado esperado |
|---|---|
| Anonimo acessa `/admin/**` | Bloqueio/redirect seguro. |
| Customer acessa `/admin/**` | Forbidden/redirect seguro. |
| Admin/manager acessa `/admin/**` | Renderiza admin. |
| Mutation admin sem sessao | Falha antes da persistencia. |
| Cadastro publico valido | Cria `customer`. |
| Cadastro tentando role admin | Nao cria admin/manager. |
| Login com credenciais invalidas | Erro generico controlado. |
| Logout | Invalida sessao e bloqueia acesso posterior. |
| Customer acessa propria area | Permitido. |
| Customer tenta recurso alheio | Bloqueado sem vazamento de dados. |

## 4. Validacoes finais obrigatorias

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Todos devem passar sem credenciais reais. Qualquer teste que precise de usuario deve usar fixture/mock controlado ou banco local/dev explicitamente configurado.

## 5. Checks manuais

- Confirmar que nenhuma migration foi aplicada em banco real sem aprovacao.
- Confirmar que logs nao contem senha, token, cookie, `DATABASE_URL` ou secret.
- Confirmar que docs nao incluem valores reais de env.
- Confirmar que checkout, pagamento, frete, cupom e pedidos reais continuam fora de escopo.
- Confirmar que storefront publico de produtos continua acessivel sem login.

## 6. Matriz de aceite

| Criterio | Evidencia esperada |
|---|---|
| CA-01 a CA-03 | E2E admin anonimo/customer/admin-manager. |
| CA-04 | Unit/action test de mutation admin sem policy. |
| CA-05 | Unit/e2e de customer ownership. |
| CA-06 | CI/local sem credenciais reais. |
| CA-07 | Teste de fallback sem `DATABASE_URL`. |
| CA-08 | Revisao de logs/docs/test snapshots. |
| CA-09 | Teste de runtime-mode preview/producao. |
| CA-10 | Docs e UI com placeholders bloqueantes. |
| CA-11 | Suite final obrigatoria aprovada. |
