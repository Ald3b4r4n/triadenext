# Vercel Preview/Staging

Este checklist prepara um ambiente Vercel não produtivo. Nenhum comando deste
documento autoriza deploy automático ou promoção para produção.

## Checklist

- [ ] Confirmar acesso humano ao projeto Vercel.
- [ ] Vincular o repositório GitHub correto sem alterar a branch de produção.
- [ ] Selecionar Preview ou ambiente customizado de staging.
- [ ] Configurar variáveis somente no escopo não produtivo.
- [ ] Confirmar build local verde antes de qualquer deployment manual.
- [ ] Validar logs sem URL privada, token ou secret.
- [ ] Registrar apenas a presença da URL aprovada, nunca seu valor no relatório.
- [ ] Confirmar que não houve promoção, domínio definitivo ou `--prod`.

Sem projeto, acesso ou URL, o resultado esperado é `pending-config` e `no-go`.
