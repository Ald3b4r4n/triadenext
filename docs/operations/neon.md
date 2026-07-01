# Neon

Neon/Postgres e o banco alvo para staging e producao futura. Esta etapa prepara readiness e nao
autoriza conexao real, migration real ou seed sem aprovacao humana explicita.

## Ambientes

| Ambiente | Uso | Regra |
|----------|-----|-------|
| Local | Desenvolvimento e testes com fallback quando `DATABASE_URL` ausente. | Sem banco real obrigatorio. |
| Preview/Staging | Primeiro alvo real controlado. | Usar branch/banco separado e aprovado. |
| Producao | Go-live posterior. | Somente apos checklist, backup, rollback e smoke verde. |

## Checklist de staging

- [ ] Identificar projeto Neon sem registrar string de conexao.
- [ ] Identificar branch/banco alvo sem colar `DATABASE_URL`.
- [ ] Confirmar role/usuario com menor permissao suficiente.
- [ ] Confirmar backup, restore window ou branch de rollback.
- [ ] Rodar `pnpm ops:check-migrations` localmente.
- [ ] Revisar migrations `0000` a `0007`.
- [ ] Obter aprovacao humana antes de `pnpm db:migrate`.
- [ ] Registrar resultado sem imprimir URL.

## Rollback

Rollback de banco deve ser separado do rollback de deploy. Para staging, usar branch/restore
aprovado. Para producao futura, exigir janela, backup validado e decisao explicita de avancar
ou abortar.

## Proibido nesta fase

- Conectar ao Neon apenas para descobrir estado.
- Executar `pnpm db:migrate` sem alvo e aprovacao.
- Rodar seed em staging/producao sem aprovacao.
- Copiar `.env` do legado ou do provedor.
- Publicar `DATABASE_URL` em logs, docs ou mensagens.
