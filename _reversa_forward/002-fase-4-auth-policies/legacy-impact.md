# Legacy Impact: Fase 4 - Auth e Policies

> Identificador: `002-fase-4-auth-policies`
> Data: `2026-06-08`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|---|---|---|---|---|
| `.env.example`, `src/lib/env.ts`, `src/lib/runtime-mode.ts` | Runtime e guardrails | regra-alterada | HIGH | Auth real passa a fazer parte das condicoes seguras de mutacao e operacao. |
| `package.json`, `pnpm-lock.yaml` | Dependencias | componente-novo | MEDIUM | Adiciona Better Auth, adapter Drizzle, `server-only` e `tsx` para seed dev. |
| `src/db/schema.ts`, `drizzle/0001_curvy_blink.sql` | Banco e Drizzle | delta-de-dados | HIGH | Adiciona suporte local a users/sessions/accounts/verifications sem aplicar migration real. |
| `src/features/auth/**`, `src/app/api/auth/[...all]/route.ts` | Auth/session/policies | componente-novo | HIGH | Introduz provider, sessao normalizada, policies e server actions de auth. |
| `src/app/admin/layout.tsx`, `src/app/(customer)/layout.tsx` | Admin/customer routes | regra-alterada | HIGH | Rotas protegidas passam a bloquear sem sessao/policy real. |
| `src/features/products/server/product-actions.ts`, `src/features/uploads/product-image-upload.ts` | Product actions/upload | regra-alterada | HIGH | Mutacoes administrativas exigem policy admin/manager antes de persistir. |
| `scripts/db/seed-admin-dev.ts` | Seed | componente-novo | MEDIUM | Seed admin dev controlado por envs e ambiente local/dev. |
| `src/tests/**`, `playwright.config.ts` | Testes | componente-novo | MEDIUM | Cobertura unit/e2e de auth, policies, guardrails e superficies protegidas. |
| `docs/**` | Documentacao | regra-alterada | LOW | Documenta auth/env/database/admin e limites da Fase 4. |

## Diff conceitual por componente

### Runtime e guardrails

O runtime agora diferencia `hasAuthSecret`, `isAuthReady` e fallback sem banco. Mutacoes reais deixam de depender apenas de ambiente e passam a exigir auth/policies reais.

### Banco e Drizzle

O schema preserva `users` e `user_role`, adiciona `email_verified` e `image`, e cria `sessions`, `accounts` e `verifications`. A migration `drizzle/0001_curvy_blink.sql` foi gerada localmente e nao foi aplicada em banco real.

### Auth/session/policies

A Fase 4 introduz Better Auth, route handler, leitura server-side de sessao, policies para `admin`, `manager`, `customer` e ownership, alem de login/cadastro/logout.

### Admin, customer e actions

`/admin/**` e superficies customer passam por layouts protegidos. Product actions e upload metadata chamam policy server-side antes de qualquer persistencia real.

## Preservadas

- RN-PUB-001 a RN-PUB-007: regras publicas de produto seguem intactas.
- RN-IMG-001 e RN-IMG-002: imagem de capa e metadata sem binario no banco seguem intactas.
- RN-PRICE-001: precos do dominio continuam em centavos.
- RN-SLUG-001: slug de produto continua normalizado.
- RN-FALLBACK-001: sem `DATABASE_URL`, fallback permanece explicito e nao promete persistencia real.
- RN-UPLOAD-001: sem `BLOB_READ_WRITE_TOKEN`, upload real continua bloqueado.

## Modificadas

- RN-ADMIN-001: antes da Fase 4, mutacao real admin era permitida temporariamente em development/test sem auth real; agora mutacoes admin exigem sessao/policy admin ou manager, e continuam bloqueadas quando auth real nao esta pronta.
