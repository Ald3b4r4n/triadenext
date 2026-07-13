# Contrato: Sequência Diagnóstica Controlada de Staging

## Objetivo

Definir a ordem e os limites dos comandos seguros da Fase 19, sem autorização para deploy, migration remota, conexão remota, importação real ou alteração no Laravel legado.

## Ordem recomendada

| Ordem | Comando | Modo permitido | Pode conectar remoto? | Pode escrever dados? |
| --- | --- | --- | --- | --- |
| 1 | `git status --short` | leitura | Não | Não |
| 2 | `git status -sb` | leitura | Não | Não |
| 3 | `git diff -- next-env.d.ts` | leitura | Não | Não |
| 4 | `pnpm ops:check-staging-environment` | default/check | Não | Não |
| 5 | `pnpm ops:check-staging-smoke` | default/check | Não, salvo URL aprovada futura e comando explicitamente seguro | Não |
| 6 | `pnpm ops:check-staging-import-smoke` | default/check | Não | Não |
| 7 | `pnpm ops:check-data-dry-run` | default/check | Não | Não |
| 8 | `pnpm ops:import-staging` | default/precheck apenas | Não | Não |
| 9 | `pnpm ops:migrate-staging` | default/check apenas | Não | Não |
| 10 | `pnpm ops:bootstrap-admin-staging` | default/check apenas | Não | Não |

## Flags proibidas

São proibidas nesta fase flags ou variáveis que representem:

- execução remota;
- aprovação humana simulada;
- target produtivo;
- reset/limpeza;
- migration efetiva;
- importação efetiva;
- deploy;
- impressão de valores de env;
- conexão obrigatória a banco.

## Pré-check de sanitização

Antes de cada comando, o operador deve confirmar por inspeção estática que o
modo padrão não imprime valores de configuração. Se um entrypoint puder revelar
URL, connection string, token, chave ou segredo, o comando deve permanecer
`blocked` até a saída ser sanitizada e coberta por teste local.

O diagnóstico pode verificar apenas se uma variável está presente. O valor não
deve ser exibido, copiado para relatório ou incluído na linha de comando.

## Saída mínima por comando

Cada comando deve ser resumido no relatório com:

- nome do comando;
- modo usado;
- status normalizado;
- exit code;
- categoria da pendência;
- evidência sanitizada;
- próxima ação humana.

## Regra de interrupção

Interromper e marcar `blocked` se aparecer qualquer sinal de:

- produção;
- Stripe live mode;
- `DATABASE_URL` ou secret em saída;
- tentativa de conexão remota não aprovada;
- migration/import/deploy armado;
- alteração no Laravel legado.
