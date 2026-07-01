# Deployment - Triade Essenza Next

Atualizado em: 2026-07-01
Agente: Architect

## Estado Detectado

- 🟢 Config Next presente: `next.config.ts`.
- 🟢 Config Drizzle presente: `drizzle.config.ts`.
- 🟢 Documentação operacional Vercel/Neon/Blob/Stripe existe em `docs/operations`.
- 🟢 `.env.example` define contrato de ambiente.
- 🟢 Fase 12 adicionou checklists de producao/go-live e scripts locais seguros `ops:*`.
- 🟢 `pnpm-workspace.yaml` registra dependencias de build aprovadas para execucao local controlada.
- 🔴 Não há `.github/workflows`.
- 🔴 Não há `Dockerfile` ou `docker-compose.yml`.

## Infraestrutura Alvo Inferida

```mermaid
flowchart TB
  dev["Dev local\npnpm dev/test/build"]
  vercel["Vercel\nNext.js runtime"]
  neon["Neon/Postgres\nDATABASE_URL"]
  blob["Vercel Blob\nBLOB_READ_WRITE_TOKEN"]
  stripe["Stripe\nsecret/webhook/publishable"]
  email["Email provider futuro\nResend/SMTP"]

  dev -->|"pnpm"| vercel
  vercel --> neon
  vercel --> blob
  vercel --> stripe
  stripe -->|"webhook"| vercel
  vercel --> email
```

## Variáveis Críticas

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `BLOB_READ_WRITE_TOKEN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `ORDER_NOTIFICATION_RECIPIENTS`
- `EMAIL_PROVIDER`
- `EMAIL_FROM`

## Scripts Operacionais Seguros

| Script | Funcao | Garantia |
| --- | --- | --- |
| `pnpm ops:check-env` | Verifica contrato de variaveis por ambiente | Nao imprime valores e nao conecta rede/banco |
| `pnpm ops:check-migrations` | Analisa `drizzle/*.sql` estaticamente | Nao executa migration e nao le `DATABASE_URL` |
| `pnpm ops:check-build` | Confirma scripts locais esperados | Nao chama Vercel, banco, migration ou provider externo |
| `pnpm ops:check-smoke` | Valida alvo de smoke seguro | Default local e sem pagamento/e-mail/upload real |

## Guardrails Operacionais

- 🟢 Sem `DATABASE_URL`, app usa fallback explícito quando permitido.
- 🟢 `db:migrate` exige `DATABASE_URL` por script guardião.
- 🟢 Stripe mock só deve existir em dev/test.
- 🟢 Preview/produção sem provider real falham de modo seguro.
- 🟢 Deploy/migration real permanecem dependentes de aprovação humana explícita.
- 🔴 Deploy automático não está configurado neste repositório nem foi executado nesta re-extração.

## Estado Pos-Fase 12

- Commit funcional de referencia: `ee26749 feat: prepare production migration readiness`.
- Validações reportadas: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` e `pnpm ops:*`.
- Go-live ainda e fase posterior: requer envs reais nos providers, backup, smoke controlado, decisão avançar/abortar e rollback.

## Estado Pos-Fase 13

- Commit funcional de referencia: `9ad10b4 feat: add legacy parity and migration readiness`.
- Validacoes reportadas: `pnpm lint`, `pnpm typecheck`, `pnpm test` (37 arquivos / 108 testes), `pnpm build` e `pnpm test:e2e` (36 testes).
- Go-live real permanece bloqueado por dados: catalogo real, imagens, precos, estoque, cupons ativos e frete minimo precisam de dry-run/reconciliacao aprovados.
- Dry-run controlado ainda depende de fonte de dados aprovada e ambiente isolado; import real, migration real, banco real e deploy continuam proibidos sem aprovacao humana explicita.
- Rollback: Laravel legado deve permanecer intacto e disponivel para consulta/retorno operacional ate aceite formal pos-cutover.
