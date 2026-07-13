# Contrato: Checklist Humano de Staging

## Objetivo

Transformar o diagnóstico da Fase 19 em uma lista enxuta de ações humanas fora do Git para preparar Vercel, Neon, Stripe test, auth/admin e import staging.

## Formato

| Item | Área | Status origem | Responsável sugerido | Ação humana | Evidência esperada | Gate antes de avançar |
| --- | --- | --- | --- | --- | --- | --- |
| H-001 | Vercel | `pending-config` | Responsável por infraestrutura | Configurar Preview/staging conectado ao GitHub. | Ambiente existe fora do Git. | Não é Production. |
| H-002 | URL staging | `pending-config` | Responsável por infraestrutura | Definir URL pública controlada. | Presença validada sem registrar valor completo. | URL aprovada por humano. |
| H-003 | Neon | `pending-config` | Responsável pelo banco | Criar Neon dev/staging isolado e role mínima. | Banco/branch não produtivo existe. | Produção bloqueada. |
| H-004 | Snapshot | `blocked` | Responsável pelo banco | Confirmar snapshot e procedimento de rollback antes de migration. | Restore documentado, com responsável e janela. | Dono e janela aprovados. |
| H-005 | Stripe test | `pending-config` | Responsável por pagamentos | Configurar chaves test, webhook test e eventos requeridos. | Presença das envs test validada sem valores. | Live mode bloqueado. |
| H-006 | Auth/admin | `pending-config` | Responsável pela aplicação | Garantir `ADMIN_MASTER_EMAILS`, auth staging e schema pronto. | Master esperado e login futuro documentados. | Sem senha ou sessão em Git/log. |
| H-007 | Import staging | `pending-input` | Responsável pelos dados | Disponibilizar arquivos aprovados em pasta controlada. | Arquivos presentes, ignorados pelo Git e dry-run registrado. | Dry-run sem bloqueio crítico e aprovação futura. |

## Regras

- O checklist não substitui aprovação humana futura.
- Nenhum item deve conter segredo, URL privada ou connection string.
- Itens `blocked` têm prioridade sobre `pending-config`.
- Itens classificados como problema do Next devem virar feature/correção separada.
- Itens de dados devem ser corrigidos na fonte/export, não em código, salvo mapeamento claramente errado do Next.
