# Neon Staging/Dev Remoto

O primeiro banco remoto deve ser isolado e não produtivo. Readiness não abre
conexão para descobrir configuração.

## Checklist

- [ ] Confirmar projeto ou branch Neon dedicado a staging/dev.
- [ ] Confirmar role com a menor permissão suficiente.
- [ ] Confirmar janela de restore, snapshot ou branch de rollback.
- [ ] Rodar `pnpm ops:check-migrations` localmente.
- [ ] Revisar migrations `0000` a `0007`.
- [ ] Registrar aprovação humana para alvo, janela e migrations.
- [ ] Executar migration somente pelo wrapper protegido e em ação separada.
- [ ] Verificar schema sem imprimir connection string.

Sem Neon staging aprovado, o resultado é `pending-config`, sem conexão.
