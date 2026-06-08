# Data Delta: Fase 4 - Auth e Policies

> Data: `2026-06-08`
> Escopo: diff conceitual de dados, sem alterar schema nesta etapa.

## 1. Estado atual extraido

`_reversa_sdd/data-dictionary.md` registra que o schema ja modela `users`, `customer_profiles`, `addresses`, `carts`, `orders` e outras tabelas fora do foco funcional da Fase 3. Auth real ainda nao esta ativada.

## 2. Mudancas conceituais esperadas

| Entidade | Mudanca esperada | Regra |
|---|---|---|
| `users` | Confirmar campos exigidos por Better Auth e role da aplicacao. | Role permitido: `customer`, `admin`, `manager`. |
| `users.email` | Garantir unicidade e normalizacao compatível com login. | Cadastro simultaneo nao pode duplicar usuario. |
| `users.role` | Preservar role server-side. | Cadastro publico sempre cria `customer`. |
| `sessions` | Adicionar se ausente ou mapear tabela equivalente do provider. | Sessao deve poder expirar/invalidation no logout. |
| `accounts` | Adicionar se o provider exigir para e-mail/senha/futuros OAuth. | Google OAuth preparado, mas nao funcional nesta fase. |
| `verifications` | Adicionar se o provider exigir para fluxos internos. | Sem magic link nesta fase. |
| `customer_profiles` | Relacionar ao usuario autenticado quando area customer for funcional. | Cliente acessa apenas perfil proprio. |
| `addresses` | Relacionar ao usuario autenticado para uso futuro. | Acesso cruzado bloqueado. |

## 3. Constraints e indices esperados

| Objeto | Necessidade | Motivo |
|---|---|---|
| Unique em e-mail de usuario | Obrigatoria | Evitar duplicidade em cadastro simultaneo. |
| Indice em sessao/token | Provavel | Validar sessao por requisicao. |
| Indice em `sessions.user_id` | Provavel | Buscar sessoes por usuario/logout. |
| FK `customer_profiles.user_id` | Esperada se ausente | Garantir ownership. |
| FK `addresses.user_id` | Esperada se ausente | Garantir ownership futuro. |

## 4. Migrations

- A implementacao futura pode gerar migration local com Drizzle.
- `drizzle-kit generate` pode ser usado para produzir arquivo SQL local.
- `db:migrate`, `drizzle-kit migrate`, `drizzle-kit push` ou qualquer aplicacao direta em banco real ficam proibidos sem validacao humana explicita.
- Se o provider exigir introspeccao/conexao para gerar algum artefato e `DATABASE_URL` estiver ausente, registrar pendencia clara em vez de conectar banco real.

## 5. Seed admin dev

| Variavel | Uso | Regra |
|---|---|---|
| `DATABASE_URL` | Necessaria para persistir usuario admin dev. | Ausencia deve falhar com mensagem segura. |
| `DEV_ADMIN_EMAIL` | E-mail ficticio/controlado de desenvolvimento. | Nunca imprimir em logs alem do minimo operacional seguro. |
| `DEV_ADMIN_PASSWORD` | Senha fornecida pelo operador local. | Nunca hardcoded, nunca logada. |

Seed admin dev:

- roda apenas em `development`/local-dev;
- nunca cria admin em cadastro publico;
- deve ser idempotente ou falhar de forma controlada quando usuario ja existir;
- nao deve alterar dados do Laravel legado.

## 6. Dados fora de escopo

Sem mudanca funcional nesta fase para:

- pedidos;
- checkout;
- pagamentos;
- frete;
- cupons;
- documentos fiscais;
- migração de usuarios reais do Laravel legado.

## 7. Rollback conceitual

Antes de qualquer aplicacao real de migration, rollback significa descartar os arquivos locais gerados e manter a Fase 3 intacta. Depois de aplicacao real futura, rollback deve exigir migration reversa revisada manualmente e desativacao segura de rotas/actions protegidas.
