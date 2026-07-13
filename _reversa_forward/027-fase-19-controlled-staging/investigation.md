# Investigation: Fase 19 — Controlled Staging Execution

> Data: 2026-07-11
> Escopo: investigação técnica para executar diagnósticos seguros de staging sem conexão remota, migration, importação, deploy ou exposição de secrets.

## Fontes locais consultadas

| Fonte | Uso no plano |
| --- | --- |
| `_reversa_forward/027-fase-19-controlled-staging/requirements.md` | Definir escopo, scripts permitidos, status esperados e fora de escopo. |
| `_reversa_forward/026-fase-18-staging-environment/roadmap.md` | Reutilizar estratégia de readiness gates, wrappers protegidos e decisão `pending-config` como `no-go`. |
| `_reversa_forward/026-fase-18-staging-environment/interfaces/staging-execution-gates.md` | Confirmar gates comuns para migration, bootstrap e smoke externo. |
| `_reversa_forward/026-fase-18-staging-environment/interfaces/staging-go-no-go-report.md` | Basear formato de relatório final sanitizado. |
| `_reversa_forward/026-fase-18-staging-environment/onboarding.md` | Aproveitar sequência humana de Vercel, Neon, Stripe, bootstrap e smoke. |
| `.reversa/state.json` | Confirmar `_reversa_sdd/`, `_reversa_forward/`, caminho do projeto e legado Laravel fora do alvo. |

## Estado atual assumido

- A Fase 18 já criou os comandos `pnpm ops:check-staging-environment`, `pnpm ops:migrate-staging` e `pnpm ops:bootstrap-admin-staging`.
- As fases 16 e 17 já criaram `pnpm ops:check-staging-import-smoke`, `pnpm ops:check-staging-smoke` e `pnpm ops:import-staging`.
- A Fase 14/15 já criou `pnpm ops:check-data-dry-run`.
- O objetivo agora é executar diagnósticos em modo padrão, não criar infraestrutura nem acionar provider externo.
- A ausência de URL, envs, arquivos aprovados, snapshot ou aprovação humana é resultado esperado e deve virar checklist.

## Scripts classificados

| Script | Pode rodar sem flags? | Limite operacional | Resultado esperado se faltar configuração |
| --- | --- | --- | --- |
| `pnpm ops:check-staging-environment` | Sim | Somente readiness offline e relatório sanitizado. | `pending-config`/`no-go`. |
| `pnpm ops:check-staging-smoke` | Sim | Não inventar URL nem executar smoke remoto sem config. | `pending-config` ou `skipped` esperado. |
| `pnpm ops:check-staging-import-smoke` | Sim | Não importar; apenas avaliar preconditions. | `pending-input`/`pending-config`. |
| `pnpm ops:check-data-dry-run` | Sim | Sem banco, sem importação e sem dados reais inventados. | `pending-input` ou resultado sintético controlado. |
| `pnpm ops:import-staging` | Condicional | Apenas se default for precheck sem conexão; sem flags. | `pending-input`, `pending-config` ou `blocked`. |
| `pnpm ops:migrate-staging` | Condicional | Apenas default/check; nenhuma flag de execução. | `blocked` ou `pending-config`. |
| `pnpm ops:bootstrap-admin-staging` | Condicional | Apenas default/check; nenhuma flag de execução. | `blocked` ou `pending-config`. |

## Alternativas avaliadas

### A. Executar todos os scripts cegamente

- Vantagem: coleta rápida.
- Risco: se algum script mudar default, pode tentar conexão ou operação remota.
- Decisão: descartado como postura. A implementação deve validar comandos e tratar wrappers perigosos como pendência quando necessário.

### B. Não executar wrappers de import/migration/bootstrap

- Vantagem: risco mínimo.
- Risco: perde evidência de que os próprios wrappers bloqueiam corretamente.
- Decisão: executar apenas se o modo padrão for check/preflight sem flags; caso contrário, listar como pendência humana.

### C. Rodar comandos e anexar saída bruta

- Vantagem: prova completa.
- Risco: saída pode conter URL, host, token parcial, path sensível ou detalhes operacionais.
- Decisão: descartado. Relatório deve resumir status, exit code, categoria e ação humana, sem valores.

### D. Tratar `pending-config` como sucesso

- Vantagem: evita ruído em ambiente sem infraestrutura.
- Risco: falseia prontidão de staging.
- Decisão: `pending-config` é sucesso do diagnóstico, mas `no-go` operacional.

## Matriz de status recomendada

| Status | Significado | Exit code aceitável | Decisão |
| --- | --- | --- | --- |
| `passed` | Check seguro concluiu e a condição avaliada está pronta. | 0 | Pode contribuir para `go`. |
| `pending-config` | Falta configuração externa, URL, env, webhook, snapshot ou provider. | 0 | `no-go`. |
| `pending-input` | Falta arquivo aprovado ou input humano. | 0 | `no-go`. |
| `blocked` | Guardrail de segurança ou aprovação impediu execução. | diferente de 0 ou status explícito | `no-go` crítico. |
| `skipped` | Etapa não aplicável sem pré-condição. | 0 | `no-go` se Must; neutro se opcional. |
| `failed` | Falha inesperada do Next, script ou validação. | diferente de 0 | `no-go`; pode virar correção futura. |

## Padrões de sanitização

O relatório pode conter:

- Nome do script.
- Modo: `default`, `check`, `preflight`.
- Categoria: Vercel, Neon, Stripe, auth/admin, import staging, dry-run, smoke.
- Nome lógico de variável ausente.
- Status e classificação da pendência.
- Próxima ação humana.

O relatório não pode conter:

- Valor de env.
- `DATABASE_URL`, URL privada ou host completo.
- Chave Stripe, webhook secret, token, cookie ou session secret.
- Payload de pagamento.
- Dados reais de cliente, pedido, produto importado ou arquivo real.
- Stack trace bruto com contexto sensível.

## Conclusão

A Fase 19 deve funcionar como uma bancada de diagnóstico: executa o que é seguro, registra o que está pendente e impede avanço operacional quando faltar configuração, input ou aprovação. O melhor resultado possível sem infraestrutura externa é um `no-go` claro, não uma falha do projeto.
