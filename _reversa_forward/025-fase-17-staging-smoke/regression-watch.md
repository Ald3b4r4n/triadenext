# Regression Watch - 025-fase-17-staging-smoke

## Watch Items

Nenhum watch item principal foi criado nesta rodada, pois nenhuma regra verde de dominio foi modificada ou removida.

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
| --- | --- | --- | --- | --- |

## Observações

- `pnpm ops:check-staging-smoke` deve continuar retornando `pending-config` sem URL/env/webhook e sem depender de credenciais reais.
- Ausencia de arquivos aprovados para import staging smoke deve continuar retornando `pending-input`.
- Qualquer sinal de producao ou Stripe live mode deve continuar bloqueando antes de requisicao externa.
- Relatorios em `data/dry-run/output/` devem continuar sem `DATABASE_URL`, tokens, chaves Stripe, Blob, Auth ou secrets.
- Smoke remoto deve continuar exigindo URL aprovada, `--allow-network` e aprovacao humana.
- Fase 17 nao deve executar deploy, migration, banco real, Stripe live, go-live definitivo ou alterar Laravel legado.

## Histórico de re-extrações

### 2026-07-03 - Re-extracao pos-Fase 17 e identidade visual

- Contexto validado: `c8b752f feat: implement staging smoke readiness` e `547146a feat: apply triade visual identity` ja estavam em `main`.
- `pnpm ops:check-staging-smoke` registrado como smoke staging/preview opt-in, com `pending-config` para URL/env/webhook ausentes.
- `pending-input` preservado para arquivos aprovados ausentes em import staging smoke.
- Producao e Stripe live mode permanecem bloqueados antes de qualquer requisicao externa.
- Storefront publico atualizado como baseline visual Triade: logo horizontal, paleta verde profundo/dourado, hero com frasco premium, vitrine Essenza Gold/Amber Imperial/Noir Absolu e admin oculto para usuarios comuns.
- Nenhuma regra de pagamento, estoque, cupom, frete, checkout, pedido ou notificacao foi marcada como alterada nesta re-extracao.

## Arquivadas

Vazio.
