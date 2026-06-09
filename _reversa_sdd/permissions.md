# Permissions — triade-essenza-next

> Data: 2026-06-08
> Escopo: auth, roles, policies reais, carrinho e cupons da Fase 6
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
| `requireAdminLike` | `admin` ou `manager` com auth pronto e banco | Anonimo, `customer`, banco ausente, auth indisponivel | `/admin/**`, product actions, upload, admin de cupons. |
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
| `/carrinho` | Permitido | Permitido | Permitido sem bypass | Permitido sem bypass | Carrinho por guest token ou `session.userId`. |
| Cart actions | Permitido para carrinho anonimo | Permitido para proprio carrinho | Permitido como autenticado normal | Permitido como autenticado normal | Owner resolvido server-side; sem bypass de estoque. |
| Aplicar/remover cupom no carrinho | Permitido para proprio carrinho anonimo | Permitido para proprio carrinho | Permitido sem bypass | Permitido sem bypass | Owner resolvido server-side; desconto recalculado no servidor. |
| `/admin/cupons/**` | Redirect/bloqueio | Forbidden | Permitido se runtime permitir | Permitido se runtime permitir | `requireAdminLike`; admin minimo. |
| Admin coupon actions | Erro controlado | Erro controlado | Permitido se runtime permitir | Permitido se runtime permitir | List/create/update basicos; sem campanhas/relatorios. |
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

## Carrinho

| Regra | Comportamento |
|---|---|
| Carrinho anonimo | Resolvido por cookie opaco `guestCartToken`; cookie nao contem itens/precos/dados sensiveis. |
| Carrinho autenticado | Resolvido por `session.userId`; cliente nao envia owner confiavel. |
| Acesso cruzado | Item/carrinho de outro usuario ou outro token nao deve ser lido/modificado. |
| Admin/manager | Podem usar carrinho como usuarios autenticados normais; nao ignoram estoque/disponibilidade. |
| Merge no login | Usa `session.userId` e guest token resolvido no servidor; marca anonimo convertido. |
| Fallback sem banco | Dev/test explicito; preview/producao sem banco falham seguro para mutacoes reais. |

## Cupons

| Regra | Comportamento |
|---|---|
| Aplicacao de cupom | Carrinho ativo e resolvido no servidor por guest token ou `session.userId`. |
| Payload client-side | Nao pode definir desconto, subtotal, total, `couponId`, `cartId`, owner ou role. |
| Acesso cruzado | Usuario/token nao aplica nem remove cupom de carrinho alheio. |
| Admin/manager no carrinho | Nao ignoram validade, limite global, subtotal minimo ou tipo indisponivel. |
| Admin de cupons | Exige `requireAdminLike`; customer/visitante bloqueados. |
| Fallback sem banco | Dev/test usam fixture explicita; preview/producao falham seguro; erro real com banco nao vira fallback silencioso. |
| `free_shipping` | Nao aplica frete real e nao promete checkout/frete gratis nesta fase. |
| `usedCount` | Nao e consumido em apply/remove/merge do carrinho. |

## Fora de escopo

- Google OAuth.
- Magic link.
- Permissoes granulares alem de `admin`/`manager`, `customer` e ownership.
- Criacao publica de admin/manager.
- Politicas reais de pedidos, pagamentos, fretes e documentos fiscais.
- Checkout, pagamento, frete real, pedido, reserva e baixa de estoque.
- Cupom acumulativo, limite por usuario, restricao por produto/categoria, campanhas avancadas e relatorios.
