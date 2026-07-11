# Contrato: Bootstrap Admin Staging

## Objetivo

Promover e validar o administrador master no ambiente staging/dev remoto sem credencial hardcoded, sem produção e sem duplicação de conta.

## Identidade autorizada

- E-mail esperado: `rafasouzacruz@gmail.com`.
- Fonte de autorização: `ADMIN_MASTER_EMAILS` configurada fora do Git.
- Papel final permitido: `admin` ou `manager`, conforme política atual.

## Pré-condições

1. Neon staging/dev aprovado e migrado.
2. Better Auth configurado para a URL de staging.
3. Produção bloqueada.
4. Aprovação humana específica para bootstrap.
5. Senha/secret fornecidos apenas pelo ambiente do processo.

## Comportamento idempotente

- Conta inexistente: criar somente se o serviço atual suportar criação segura e todos os campos obrigatórios estiverem presentes; caso contrário, retornar `pending-config`.
- Conta existente como customer: promover uma vez para papel administrativo permitido.
- Conta já administrativa: retornar `passed` sem duplicar ou redefinir senha.
- E-mail fora da allowlist: retornar `blocked`.

## Saída permitida

```json
{
  "status": "passed",
  "environment": "staging",
  "identity": "admin-master",
  "role": "admin",
  "created": false,
  "promoted": true
}
```

Não incluir senha, hash, token, cookie, URL de auth ou connection string.

## Validação posterior

- Login real funciona em staging.
- `/admin` é acessível ao master.
- Customer continua bloqueado.
- Navegação pública não expõe admin para usuários comuns.
