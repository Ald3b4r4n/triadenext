# Auth

Better Auth e o provider inicial da Fase 4, com login por e-mail/senha.

## Roles

- `customer`
- `admin`
- `manager`

`admin` e `manager` sao equivalentes no MVP.

## Camadas

- `src/features/auth/server/auth.ts`: configuracao do provider.
- `src/features/auth/server/session.ts`: leitura de sessao normalizada.
- `src/features/auth/server/policies.ts`: policies `requireAuthenticated`, `requireAdminLike`, `requireCustomer` e `requireOwner`.
- `src/features/auth/server/actions.ts`: login, cadastro e logout.

## Regras

- Policies sempre rodam no servidor.
- A sessao nao confia em role enviada pelo cliente.
- Login, signup e logout mantem mensagens controladas.
- Preview/producao bloqueiam mutacoes admin se auth/policies reais nao estiverem ativas.
- Build e testes continuam possiveis sem credenciais reais.
