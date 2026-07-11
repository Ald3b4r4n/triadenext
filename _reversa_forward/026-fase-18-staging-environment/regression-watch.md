# Regression Watch: Fase 18 — Staging Environment Setup

> Feature: `026-fase-18-staging-environment`

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
| --- | --- | --- | --- | --- |
| W001 | `requirements.md#RN-08` | Infraestrutura ausente retorna `pending-config` sem rede/banco e decisão `no-go`. | presença | Check tenta descobrir provider, falha CI local ou retorna `go`. |
| W002 | `requirements.md#RN-02` | Produção, domínio definitivo e Stripe live são bloqueados antes de efeito externo. | presença | Driver, deploy ou Stripe é carregado antes do guard. |
| W003 | `requirements.md#RN-04` | Migration staging exige alvo, flags, aprovações, revisão e snapshot. | presença | Migration pode rodar com gate parcial ou durante build/deploy. |
| W004 | `requirements.md#RN-05` | Bootstrap master é staging-only, allowlisted e idempotente. | presença | Usuário fora da allowlist é promovido ou produção é aceita. |
| W005 | `requirements.md#RN-03` | Outputs nunca incluem URL, connection string, chave, token, cookie ou webhook secret. | ausência | Relatório, stdout ou stderr contém valor sensível. |
| W006 | `requirements.md#RN-10` | Relatório da Fase 18 não autoriza produção e só retorna `go` com todos os Must verdes e aprovação final. | redação | `pending-config`, `pending-input` ou skip não autorizado vira `go`. |
| W007 | `requirements.md#RN-11` | Lint, typecheck, testes, build e E2E locais não dependem de infraestrutura externa. | presença | Validação local exige URL, banco ou credencial real. |

## Histórico de re-extrações

### Re-extração 2026-07-11 00:00

| ID | Veredito | Observação |
| --- | --- | --- |
| W001 | 🟢 verde | `pending-config` permanece estado offline, sem rede/banco e com decisão `no-go`, registrado em `_reversa_sdd/domain.md`. |
| W002 | 🟢 verde | Produção e Stripe live permanecem bloqueados antes de efeitos externos em `_reversa_sdd/architecture.md` e no ADR 013. |
| W003 | 🟢 verde | Migration staging continua condicionada a alvo, flags, aprovações, revisão e snapshot em `_reversa_sdd/deployment.md`. |
| W004 | 🟢 verde | Bootstrap master permanece staging-only, allowlisted e protegido em `_reversa_sdd/domain.md` e `_reversa_sdd/deployment.md`. |
| W005 | 🟢 verde | Outputs sanitizados continuam proibidos de incluir URLs, connection strings ou secrets, conforme ADR 013. |
| W006 | 🟢 verde | Decisão `go` continua restrita a critérios obrigatórios verdes e aprovação humana final. |
| W007 | 🟢 verde | Validações locais permanecem independentes de infraestrutura externa, com 160 testes e E2E opt-in. |

## Arquivadas

Nenhuma.

## Observações

- O smoke remoto real permanece condicionado à infraestrutura e aprovação futura.
- O wrapper de migration e o wrapper de bootstrap foram testados apenas em modo check.
