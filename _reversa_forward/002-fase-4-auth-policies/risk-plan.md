# Risk Plan: Fase 4 - Auth e Policies

> Data: `2026-06-08`

## 1. Riscos principais

| ID | Risco | Severidade | Probabilidade | Mitigacao | Sinal de alerta |
|---|---|---|---|---|---|
| R-01 | Schema Better Auth duplicar ou conflitar com `users`. | Alta | Media | Comparar schema gerado com `src/db/schema.ts` antes de migration. | Tabelas `user` e `users` coexistindo sem mapeamento claro. |
| R-02 | Mutation admin ficar protegida apenas por rota/layout. | Critica | Media | Policy server-side obrigatoria em cada action. | Teste chama action diretamente e persiste. |
| R-03 | Build/test passarem a exigir credenciais reais. | Alta | Media | Manter env opcional e mocks/fallback. | CI falha sem `DATABASE_URL`. |
| R-04 | Seed admin dev vazar senha ou rodar fora de dev. | Critica | Baixa | Guardrail de ambiente e logs redigidos. | Script aceita production/preview. |
| R-05 | Timeout de sessao liberar acesso por fallback permissivo. | Critica | Baixa | Falha segura como nao autenticado. | Rota protegida renderiza em erro de auth. |
| R-06 | Cadastro simultaneo duplicar e-mail. | Alta | Media | Unique constraint e tratamento de erro. | Dois usuarios com mesmo e-mail. |
| R-07 | Customer acessar dados de outro customer. | Critica | Media | Ownership server-side por `session.user.id`. | Query aceita `userId` do cliente. |
| R-08 | Scope creep para pedidos/checkout/pagamento. | Media | Media | Manter placeholders protegidos e docs explicitas. | Novas mutations de pedido/pagamento reais. |

## 2. Guardrails de seguranca

- Nenhuma senha hardcoded.
- Nenhum bypass global de auth.
- Nenhuma mutation real em preview/producao sem auth/policies reais.
- Nenhum secret em docs, logs, erros ou testes.
- Nenhuma migration aplicada em banco real sem validacao humana.
- Nenhuma alteracao no Laravel legado.

## 3. Criterios de rollback

Antes de aplicar migration real:

- remover dependencias/camada de auth da branch;
- descartar migration local gerada;
- manter guardrail temporario da Fase 3.

Depois de aplicar migration real em ambiente dev autorizado:

- preservar backup/snapshot do banco dev;
- aplicar migration reversa revisada manualmente;
- desativar seed admin dev;
- bloquear rotas/actions protegidas ate policy voltar a ficar valida.

## 4. Decisoes que nao devem ser reabertas no coding

- Provider inicial: Better Auth.
- Login inicial: e-mail/senha.
- Roles: `customer`, `admin`, `manager`.
- `admin` e `manager` equivalentes no MVP.
- Cadastro publico cria apenas `customer`.
- Google OAuth e magic link fora da Fase 4.
