# Permissions — triade-essenza-next

> Data: 2026-06-08
> Escopo: auth, roles e policies reais da Fase 4
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Estado atual

Auth/policies reais existem e substituem o guardrail temporario de "admin sem auth" para as
superficies implementadas. 🟢

Provider: Better Auth. Login inicial: e-mail/senha. Sessao: server-side via headers/cookies do
provider. 🟢

## Roles

| Role | Origem | Permissoes MVP |
|---|---|---|
| `customer` | Cadastro publico/default no schema | Area customer e recursos proprios. |
| `admin` | Seed/admin dev ou ajuste operacional seguro | Area admin e mutations administrativas. |
| `manager` | Ajuste operacional seguro futuro | Mesmo poder administrativo de `admin` no MVP. |

## Policies

| Policy | Permite | Bloqueia | Uso atual |
|---|---|---|---|
| `requireAuthenticated` | Qualquer sessao autenticada | Sessao ausente/invalida/timeout/indisponivel | Base generica. |
| `requireAdminLike` | `admin` ou `manager` com auth pronto e banco | Anonimo, `customer`, banco ausente, auth indisponivel | `/admin/**`, product actions, upload. |
| `requireCustomer` | Qualquer usuario autenticado | Anonimo ou sessao invalida | Layout customer. |
| `requireOwner` | Usuario autenticado dono do recurso | Anonimo, role invalida, outro usuario | Preparada para recursos customer futuros. |

## Matriz de acesso

| Superficie | Anonimo | Customer | Admin | Manager | Regra |
|---|---|---|---|---|---|
| Storefront publico | Permitido | Permitido | Permitido | Permitido | Catalogo publico preservado. |
| `/login` | Permitido | Redirect se ja autenticado | Redirect se ja autenticado | Redirect se ja autenticado | Sessao existente redireciona. |
| `/cadastro` | Permitido | Redirect se ja autenticado | Redirect se ja autenticado | Redirect se ja autenticado | Cadastro publico cria customer. |
| `/admin/**` | Redirect/bloqueio | Forbidden | Permitido | Permitido | `requireAdminLike`. |
| `/minha-conta`, `/enderecos`, `/pedidos` | Redirect para login | Permitido | Permitido como autenticado | Permitido como autenticado | `requireCustomer`. |
| Product create/update actions | Erro controlado | Erro controlado | Permitido se runtime permitir | Permitido se runtime permitir | `requireAdminLike` antes da persistencia. |
| Upload produto | Erro controlado | Erro controlado | Permitido se token/runtime permitirem | Permitido se token/runtime permitirem | `requireAdminLike` antes do Blob. |

## Guardrail de mutation admin

| Condicao | Resultado |
|---|---|
| Sem `DATABASE_URL` | `requireAdminLike` retorna bloqueio por banco ausente; nenhuma persistencia real. |
| Sem auth pronta | Bloqueio por `auth_not_ready`. |
| Sessao ausente/expirada/invalida | `unauthenticated`. |
| Role `customer` | `forbidden/insufficient_role`. |
| Role `admin` ou `manager` | `allowed`, desde que banco/auth estejam prontos. |

## Upload

| Condicao | Permissao |
|---|---|
| Sem policy admin-like | Upload real bloqueado. |
| Sem `BLOB_READ_WRITE_TOKEN` | Upload real bloqueado. |
| Com token, sem banco/auth pronto | Bloqueio seguro antes do Blob. |
| Com token, banco/auth prontos e admin/manager | Upload e metadata podem prosseguir conforme repository. |

## Seed admin dev

| Condicao | Permissao |
|---|---|
| Ambiente diferente de development/local-dev | Bloqueado. |
| Ausencia de `DATABASE_URL`, `DEV_ADMIN_EMAIL` ou `DEV_ADMIN_PASSWORD` | Bloqueado antes da conexao. |
| Senha fraca | Bloqueado. |
| Preconditions validas | Cria usuario se necessario e promove para `admin`. |

## Fora de escopo

- Google OAuth.
- Magic link.
- Permissoes granulares alem de `admin`/`manager`, `customer` e ownership.
- Criacao publica de admin/manager.
- Politicas reais de pedidos, pagamentos, cupons, fretes e documentos fiscais.
