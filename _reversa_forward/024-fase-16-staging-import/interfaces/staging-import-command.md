# Interface: staging-import-command

> Feature: `024-fase-16-staging-import`
> Tipo: CLI/operacional
> Status: contrato implementado na Fase 16

## Objetivo

Definir o contrato do comando seguro de importacao controlada em staging/dev remoto. A implementacao existe em `src/features/staging-import/cli.ts` e e exposta por `pnpm ops:import-staging`.

## Nome sugerido

```text
pnpm ops:import-staging
```

Nome alternativo aceitavel:

```text
pnpm import:staging
```

## Escopo permitido

- Ambiente remoto nao produtivo.
- Preferencia: Neon dev/staging separado.
- Entrada: `data/dry-run/input/primeira-execucao/`.
- Escrita padrao: upsert seguro.
- Relatorios: `data/dry-run/output/` ou pasta operacional sanitizada equivalente.

## Escopo proibido

- Producao.
- Go-live.
- Deploy.
- Migration real automatica.
- Conexao com producao.
- Reset sem backup/flag/aprovacao.
- Upload real para storage produtivo.
- Leitura ou escrita no Laravel legado.
- Impressao de `DATABASE_URL` ou secrets.

## Flags planejadas

| Flag | Obrigatoria | Valores | Descricao |
| --- | --- | --- | --- |
| `--target` | sim | `staging`, `preview`, `remote-dev` | Ambiente nao produtivo alvo. |
| `--input` | sim | caminho dentro de `data/dry-run/input/` | Pasta aprovada; default seguro pode ser `primeira-execucao`. |
| `--mode` | sim | `check`, `upsert`, `reset-and-upsert` | `check` nao escreve; `upsert` e padrao de escrita; reset exige confirmacoes extras. |
| `--confirm-staging` | sim para escrita | literal configurado pela implementacao | Confirma que o operador entende que o alvo e nao produtivo. |
| `--backup-confirmed` | sim para escrita | boolean/literal | Declara snapshot/backup confirmado sem imprimir caminho secreto. |
| `--allow-reset` | sim para reset | boolean/literal | Permite reset apenas quando combinado com aprovacao humana. |
| `--human-approval` | sim para escrita/reset | id ou texto curto nao sensivel | Referencia de aprovacao humana. |
| `--format` | nao | `json`, `markdown`, `both` | Formato de relatorio. |

## Variaveis de ambiente

O comando pode exigir variavel de conexao remota aprovada, mas nunca deve imprimir valor.

| Variavel | Uso | Regra |
| --- | --- | --- |
| `STAGING_DATABASE_URL` ou equivalente | Conexao com staging/dev remoto | Validar presenca sem imprimir. |
| `DATABASE_URL` | Deve ser tratado como risco se apontar para producao | Nao imprimir; abortar se ambiente nao for explicitamente staging/dev. |
| `NODE_ENV` / `VERCEL_ENV` | Sinal auxiliar | Nunca usar sozinho como prova de seguranca. |

## Estados de saida

| Status | Exit code sugerido | Significado |
| --- | ---: | --- |
| `pending-input` | 0 | Arquivos ou ambiente ausentes; nenhuma escrita feita. |
| `blocked` | 1 | Precondicao falhou, producao detectada, secret detectado ou dry-run no-go. |
| `planned` | 0 | Check/preflight concluido sem escrita. |
| `imported` | 0 | Upsert seguro concluido em ambiente nao produtivo. |
| `rolled-back` | 0 ou 1 | Rollback executado ou orientado; depende do resultado. |

## Preflight obrigatorio

1. Resolver e validar pasta `--input`.
2. Reaproveitar validacao do dry-run.
3. Verificar resultado `go` ou ausencia de bloqueio critico.
4. Validar `--target` como nao produtivo.
5. Detectar sinais de producao em target, host, branch, env label e flags.
6. Confirmar snapshot/backup para qualquer escrita.
7. Confirmar aprovacao humana para qualquer escrita.
8. Bloquear reset sem `--allow-reset`, backup e aprovacao.
9. Redigir valores sensiveis antes de log/report.

## Operacao `check`

- Nao conecta se ambiente nao estiver aprovado.
- Nao escreve dados.
- Pode validar presenca de variaveis sem imprimir valores.
- Pode validar dry-run e schema esperado sem migration.
- Gera relatorio pre-importacao.

## Operacao `upsert`

- Exige todos os preflights.
- Escreve apenas no ambiente nao produtivo.
- Usa chaves naturais aprovadas.
- Nao apaga registros fora do escopo.
- Aborta em conflito nao mapeado.
- Gera relatorio antes/depois.

## Operacao `reset-and-upsert`

- Nao e default.
- Exige `--allow-reset`.
- Exige snapshot/backup confirmado.
- Exige aprovacao humana explicita.
- Exige ambiente nao produtivo confirmado.
- Deve limitar limpeza ao subconjunto de entidades aprovadas.

## Erros esperados

| Codigo | Quando ocorre | Resultado |
| --- | --- | --- |
| `PRODUCTION_BLOCKED` | Sinal de producao ou alvo proibido | abortar antes de conectar |
| `TARGET_NOT_APPROVED` | Ambiente staging/dev nao configurado/aprovado | pendencia operacional |
| `INPUT_PENDING` | Arquivos Must ausentes | `pending-input`, sem escrita |
| `DRY_RUN_BLOCKED` | Dry-run `no-go` ou bloqueio critico | abortar |
| `BACKUP_REQUIRED` | Escrita sem snapshot/backup confirmado | abortar |
| `APPROVAL_REQUIRED` | Escrita sem aprovacao humana | abortar |
| `RESET_BLOCKED` | Reset sem flag/aprovacao/backup | abortar |
| `SECRET_REDACTED` | Valor sensivel detectado | abortar ou redigir e marcar bloqueio |
| `SCHEMA_MISMATCH` | Schema remoto incompativel | abortar sem migration automatica |

## Idempotencia

O modo `upsert` deve ser idempotente por chaves naturais:

- categoria por `slug`;
- produto por `sku` e/ou `slug`;
- imagem por `product_sku + reference`;
- cupom por `code`;
- frete por `rule_code`.

## Observabilidade

O comando deve imprimir apenas:

- status;
- contagens;
- nomes de arquivos;
- nomes de entidades;
- ids de relatorio;
- mensagem de bloqueio sem valores sensiveis.

Nunca imprimir valores de connection string, tokens, secrets, chaves privadas ou `.env`.
