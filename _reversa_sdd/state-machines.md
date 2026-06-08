# State Machines — triade-essenza-next

> Data: 2026-06-08
> Escopo: estados confirmados ate Fase 4
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## Auth/session

| Estado | Condicao | Comportamento |
|---|---|---|
| `unauthenticated/missing` | Provider nao retorna usuario na sessao | Rotas protegidas redirecionam/bloqueiam; actions recusam. |
| `unauthenticated/unavailable` | Auth real nao esta pronto no runtime | Admin/action retorna bloqueio seguro. |
| `unauthenticated/invalid` | Role ausente/invalida ou erro do provider | Acesso negado por falha segura. |
| `unauthenticated/timeout` | Leitura de sessao excede timeout | Acesso negado por falha segura. |
| `authenticated` | Sessao valida com `userId`, `email`, `role` | Policies decidem acesso por role/ownership. |

## Roles

| Role | Admin | Customer area | Observacao |
|---|---|---|---|
| `customer` | Nao | Sim | Cadastro publico cria este papel por default. |
| `admin` | Sim | Sim, como autenticado | Papel administrativo. |
| `manager` | Sim | Sim, como autenticado | Equivalente a admin no MVP. |

## Policy decision

| Estado | Origem | Comportamento |
|---|---|---|
| `allowed` | Sessao valida e regra satisfeita | Rota/action prossegue. |
| `unauthenticated` | Sessao ausente, invalida, expirada, timeout ou indisponivel | Redirect ou erro controlado. |
| `forbidden/insufficient_role` | Usuario autenticado sem role exigida | Bloqueio seguro. |
| `forbidden/not_owner` | Usuario autenticado tenta recurso de outro dono | Bloqueio seguro sem expor dados. |
| `blocked/missing_database` | Policy admin-like sem banco | Operacao admin real bloqueada. |
| `blocked/auth_not_ready` | Banco/secret auth insuficiente | Operacao admin real bloqueada. |

## Login/cadastro/logout

| Fluxo | Entrada | Saida esperada |
|---|---|---|
| Login valido | E-mail/senha validos e auth pronto | Sessao criada pelo Better Auth e redirect para `returnTo` seguro. |
| Login invalido | Credenciais invalidas ou provider indisponivel | Erro generico/controlado. |
| Cadastro valido | Nome, e-mail e senha forte | Usuario criado como `customer` e redirect para `/minha-conta`. |
| Cadastro invalido | Payload invalido, senha fraca ou duplicidade | Erro controlado sem criar admin/manager publico. |
| Logout | Sessao atual | `signOut` server-side e redirect para `/login`. |

## Produto

Estados confirmados:

| Estado | Publico | Compravel | Observacao |
|---|---|---|---|
| `draft` | Nao | Nao | Rascunho/admin. |
| `published` | Sim, se `publishedAt <= now` e estoque > 0 | Sim, nesta fase | Depende de data e estoque. |
| `inactive` | Nao | Nao | Inativo/arquivado inicial. |

Transicoes administraveis atuais:

- criar produto como `draft`, `published` ou `inactive`;
- editar produto e substituir categorias;
- publicar so passa na validacao se nome, slug, SKU, preco, estoque positivo e data valida existirem;
- todas as mutations administrativas exigem `requireAdminLike`.

## Runtime de persistencia

| Estado | Condicao | Comportamento |
|---|---|---|
| `fallback_sem_banco` | `DATABASE_URL` ausente | Fixtures + fallback/bloqueio explicito; nenhuma promessa de persistencia real. |
| `auth_indisponivel` | Banco ou secret de auth ausente | Auth real indisponivel; admin/action bloqueiam quando exigem policy. |
| `db_real_auth_pronto_dev` | `DATABASE_URL` e auth secret presentes em development/test | Drizzle real; mutations admin exigem admin/manager. |
| `db_real_preview_producao` | Ambiente preview/production | Operacoes reais dependem de auth/policies prontas e validacao operacional. |

## Upload de imagem

| Estado | Condicao | Comportamento |
|---|---|---|
| `blocked/policy` | Sem policy admin-like allowed | Nao valida/chama Blob; retorna mensagem segura. |
| `rejected` | Tipo/tamanho invalido | Nao chama Blob; nao persiste metadata. |
| `blocked/missing_blob_token` | `BLOB_READ_WRITE_TOKEN` ausente | Nao chama Blob; nao persiste metadata. |
| `uploaded + metadata persisted` | Policy allowed, token Blob, banco e ambiente permitido | Upload real e metadata salva em `product_images`. |
| `uploaded + metadata dev_fallback` | Policy allowed e token Blob, sem banco | Upload pode ocorrer, mas metadata nao e persistida em banco real. |
| `uploaded + metadata blocked` | Policy allowed e token Blob, ambiente bloqueado | Metadata real bloqueada. |

## Proxima fase esperada

A proxima feature deve ser aberta com `/reversa-requirements`, escolhendo novo escopo sobre a base de
auth/policies ja confirmada.
