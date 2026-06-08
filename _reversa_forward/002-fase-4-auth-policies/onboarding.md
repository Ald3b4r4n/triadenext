# Onboarding: Fase 4 - Auth e Policies

> Data: `2026-06-08`
> Objetivo: orientar um humano a testar a feature quando ela for implementada. Este documento nao executa comandos.

## 1. Pre-condicoes

- Estar no projeto `D:\Projetos\triade-essenza-next`.
- Nao usar credenciais reais de producao.
- Nao copiar `.env` do Laravel legado.
- Nao rodar migrations em banco real sem validacao humana explicita.
- Ter lido `requirements.md`, `roadmap.md` e `docs/operations/auth-env.md` quando existir.

## 2. Teste local sem banco

1. Rodar validacoes de build/test sem `DATABASE_URL`.
2. Confirmar que o app nao tenta conectar banco real.
3. Confirmar que rotas protegidas exibem bloqueio/redirect seguro.
4. Confirmar que mutations reais nao fingem persistencia.
5. Confirmar que logs nao exibem secrets ou valores de env.

## 3. Teste local/dev com banco autorizado

1. Configurar um banco exclusivamente local/dev.
2. Definir `DATABASE_URL`, `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD` com valores ficticios/controlados.
3. Aplicar migrations somente se a validacao humana tiver autorizado.
4. Rodar seed admin dev.
5. Acessar login com admin dev.
6. Confirmar acesso a `/admin/**`.
7. Confirmar que `customer` nao acessa `/admin/**`.
8. Confirmar cadastro publico criando apenas `customer`.
9. Confirmar logout invalidando sessao.

## 4. Fluxos manuais essenciais

| Fluxo | Resultado esperado |
|---|---|
| Anonimo abre `/admin/produtos` | Redirect/bloqueio seguro, sem dados admin. |
| Customer abre `/admin/produtos` | Forbidden/redirect seguro. |
| Admin abre `/admin/produtos` | Admin renderiza. |
| Admin cria/edita produto | Mutation passa apenas com policy valida. |
| Visitante cadastra conta | Usuario criado como `customer`. |
| Visitante envia role `admin` no cadastro | Role rejeitada/ignorada; usuario nunca vira admin. |
| Cadastro duplicado | Erro controlado, sem duplicidade. |
| Senha fraca | Erro de validacao seguro. |
| Logout | Sessao invalidada; rotas/actions protegidas falham depois. |

## 5. Validacoes obrigatorias da implementacao futura

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Esses comandos devem continuar executando sem credenciais reais. Quando cenarios e2e precisarem de usuario, usar setup controlado de teste ou ambiente local/dev explicitamente aprovado.

## 6. Sinais de falha

- Build falha por ausencia de `DATABASE_URL`.
- Log imprime senha, token, cookie, `DATABASE_URL` ou secret.
- Cadastro publico cria `admin` ou `manager`.
- Server action admin persiste sem sessao admin/manager.
- Preview/producao permitir mutation admin sem auth/policy real.
- Cliente consegue acessar recurso de outro cliente.
- Pedido, checkout, pagamento, frete, cupom ou fiscal real aparece como funcional.
