# Vercel

Vercel sera usado para hosting, preview/staging, producao futura e variaveis por ambiente. Esta
fase nao executa deploy real automatico, nao configura dominio real e nao faz rollback real.

## Ambientes

| Ambiente Vercel | Objetivo | Status na Fase 12 |
|-----------------|----------|-------------------|
| Development | Referencia local. | Permitido via comandos locais. |
| Preview | Staging controlado para smoke. | Preparar checklist; executar deploy somente com aprovacao. |
| Production | Go-live posterior. | Checklist, sem deploy automatico. |

## Checklist Preview/Staging

- [ ] Confirmar repositorio/branch alvo.
- [ ] Configurar env vars no painel/CLI sem registrar valores.
- [ ] Rodar `pnpm build` local antes de qualquer deploy.
- [ ] Obter aprovacao humana antes de `vercel`.
- [ ] Registrar URL de preview aprovada para smoke sem querystring secreta.
- [ ] Validar logs sem secrets.
- [ ] Confirmar rollback de deploy e separar rollback de banco.

## Checklist Production futuro

- [ ] Staging verde.
- [ ] Neon com backup/rollback aprovado.
- [ ] Stripe test mode validado e decisao separada para live mode.
- [ ] Blob configurado ou fallback aceito.
- [ ] Dominio/DNS em janela aprovada.
- [ ] Smoke final em URL publica aprovada.
- [ ] Decisao explicita de avancar ou abortar.

## Proibido nesta fase

- Rodar `vercel` ou `vercel --prod` automaticamente.
- Configurar dominio real.
- Fazer rollback real sem incidente e aprovacao.
- Tratar rollback Vercel como rollback de banco.
- Versionar env vars reais.
