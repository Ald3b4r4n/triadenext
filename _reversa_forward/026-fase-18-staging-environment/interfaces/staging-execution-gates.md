# Contrato: Gates de Execução Staging

## Objetivo

Separar checks offline de ações externas autorizadas: migration staging, bootstrap admin e smoke mutável.

## Gate comum

Toda ação externa exige cumulativamente:

1. `targetEnvironment` não produtivo.
2. Produção e Stripe live não detectados.
3. Aprovação humana explícita para a ação e janela atuais.
4. Configuração necessária presente sem imprimir valores.
5. Relatório de preflight sanitizado.

## Gate de migration

Entradas adicionais:

- migrations selecionadas e revisadas;
- snapshot/branch de restore confirmado;
- rollback owner identificado;
- comando separado do build/deploy;
- confirmação de banco staging/dev remoto.

Ausência de qualquer item retorna `blocked` antes da conexão.

## Gate de bootstrap

Entradas adicionais:

- schema staging compatível;
- auth staging configurado;
- `ADMIN_MASTER_EMAILS` configurado;
- usuário master esperado;
- execução idempotente.

## Gate de smoke externo

Entradas adicionais:

- URL staging presente e aprovada;
- deployment não produtivo;
- para pagamento: Stripe test e webhook test validados;
- para import: arquivos aprovados e dry-run `go`.

## Códigos de saída planejados

| Resultado | Exit code | Uso |
| --- | --- | --- |
| `passed` | 0 | Gate ou ação concluída. |
| `pending-config` | 0 | Check offline concluído; ação não iniciada. |
| `pending-input` | 0 | Check offline concluído; import não iniciado. |
| `blocked` | diferente de 0 | Violação de segurança ou aprovação. |
| `failed` | diferente de 0 | Ação autorizada falhou. |

`pending-config` e `pending-input` nunca produzem `go` no relatório final.
