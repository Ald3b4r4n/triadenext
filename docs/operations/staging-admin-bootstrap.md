# Bootstrap do Admin Master em Staging

O wrapper `pnpm ops:bootstrap-admin-staging` inicia em modo check e não carrega
banco ou auth.

## Pré-condições futuras

- Neon staging migrado e aprovado.
- Better Auth configurado para staging.
- `ADMIN_MASTER_EMAILS` contém o master autorizado.
- Senha disponível apenas no processo, nunca no Git.
- Flags de execução e confirmação staging.
- Aprovação humana geral e específica do bootstrap.

O wrapper reaproveita o bootstrap idempotente existente. Conta já administrativa não
é duplicada nem tem senha redefinida. Customer continua bloqueado em `/admin`.

Não existe remoção automática de usuário como rollback.
