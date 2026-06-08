# Permissions — triade-essenza-next

> Data: 2026-06-08  
> Escopo: guardrails atuais e lacunas para Fase 4  
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Estado atual

Auth/policies reais ainda nao existem. 🟢

O projeto possui superficies de admin e customer, mas a protecao definitiva de rotas e mutacoes e a
proxima fase recomendada. 🟢

## Guardrail de mutacao admin

| Ambiente | Banco real | Mutacao admin real | Regra |
|---|---|---|---|
| `development` | presente | Permitida temporariamente | Permitida ate Fase 4 com aviso de painel sem auth real. |
| `test` | presente | Permitida para teste | Usada para cobertura automatizada. |
| `preview` | presente | Bloqueada | Sem auth/policies reais. |
| `production` | presente | Bloqueada | Sem auth/policies reais. |
| qualquer | ausente | `dev_fallback` | Nao persiste em banco real. |

## Upload

| Condicao | Permissao |
|---|---|
| Sem `BLOB_READ_WRITE_TOKEN` | Upload real bloqueado. |
| Com token, sem banco | Upload pode retornar `uploaded`, mas metadata nao persiste em banco real. |
| Com token e banco em dev/test | Metadata pode persistir. |
| Com token e banco em preview/producao | Metadata real bloqueada ate auth/policies. |

## Lacunas da Fase 4

- Definir provider/session de auth.
- Proteger rotas admin.
- Definir roles admin/customer.
- Bloquear server actions por policy real, nao apenas por ambiente.
- Definir acesso customer a conta, enderecos e pedidos.
- Definir politica de preview/producao para operacoes reais.
