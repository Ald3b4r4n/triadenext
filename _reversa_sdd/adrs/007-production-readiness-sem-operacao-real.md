# ADR 007 - Production Readiness sem Operacao Real Automatica

Data: 2026-07-01
Status: aceito

## Contexto

A Fase 12 preparou o projeto para staging/producao controlados, consolidando Neon, Vercel, Stripe test mode, Blob/upload, envs, scripts `ops:*`, smoke tests e checklists.

## Decisao

Readiness de producao deve ser documental e verificavel localmente, mas nao deve executar deploy real, migration real, conexao com banco real, upload real, pagamento real ou envio real sem aprovacao humana explicita.

## Consequencias

- `.env.example` lista nomes de variaveis sem valores reais.
- `ops:check-env` reporta somente presenca/ausencia.
- `ops:check-migrations` analisa `drizzle/` estaticamente.
- `ops:check-build` verifica scripts locais sem chamar providers.
- `ops:check-smoke` usa alvo local seguro por padrao.
- Go-live continua sendo uma decisao posterior com checklist, backup, rollback e smoke manual controlado.

## Nao Objetivos

- Nao automatizar deploy.
- Nao rodar migration real.
- Nao validar credenciais reais imprimindo valores.
- Nao integrar Bling, NF-e, rotinas fiscais, WhatsApp ou SMS nesta fase.
