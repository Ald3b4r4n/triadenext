# Regression Watch: Fase 4 - Auth e Policies

> Identificador: `002-fase-4-auth-policies`

## Watch Items

| ID | Origem (arquivo, secao) | Regra esperada apos mudanca | Tipo de verificacao | Sinal de violacao |
|---|---|---|---|---|
| W001 | `_reversa_sdd/domain.md#8-admin-sem-auth-real` / RN-ADMIN-001 | Mutacao admin real exige sessao e policy admin/manager; sem auth real pronta, preview/producao e fallback sem banco bloqueiam persistencia. | presenca | Server action admin persiste produto/imagem sem `requireAdminLike` allowed. |

## Historico de re-extrações

| Data | Evento | Observacao |
|---|---|---|
| 2026-06-11 | Re-extracao pos-Fase 10 | verde: mutacoes e leituras administrativas continuam protegidas por `requireAdminLike`; status de notificacao nao e acessivel a customer/visitante. |

## Arquivadas

| ID | Motivo | Data |
|---|---|---|

## Observacoes

- Regras de produto publico, fallback sem banco, upload sem token e precos em centavos permaneceram preservadas e nao geraram watch item de mudanca.
