# Investigation: Fase 4 - Auth e Policies

> Data: `2026-06-08`
> Escopo: pesquisa tecnica para planejamento, sem implementacao.

## 1. Fontes internas

| Fonte | Uso no plano |
|---|---|
| `_reversa_sdd/architecture.md` | Identifica runtime, Drizzle, admin, upload e lacuna de auth. |
| `_reversa_sdd/domain.md` | Preserva fallback sem banco e regras de produto publico. |
| `_reversa_sdd/permissions.md` | Base para substituir guardrail temporario por policy real. |
| `_reversa_sdd/data-dictionary.md` | Confirma existencia conceitual de `users`, `customer_profiles` e `addresses`. |
| `_reversa_sdd/state-machines.md` | Preserva estados de runtime e define novos estados esperados de auth. |
| `_reversa_sdd/dependencies.md` | Confirma Drizzle/Neon/Vitest/Playwright e scripts de validacao. |
| `requirements.md` | Define provider, roles, escopo e criterios de aceite. |
| `requirements-audit.md` | Confirma que nao restam duvidas abertas. |

## 2. Fontes externas consultadas

| Fonte | Observacao para o plano |
|---|---|
| [Better Auth - Drizzle ORM Adapter](https://better-auth.com/docs/adapters/drizzle) | Confirma adapter Drizzle, provider `pg` e possibilidade de mapear nomes de tabelas/campos. |
| [Better Auth - Database](https://better-auth.com/docs/concepts/database) | Confirma que Better Auth armazena usuarios/sessoes e pode gerar schema via CLI; para Drizzle, schema/migration deve ser tratado pelo ORM. |
| [Next.js - Authentication](https://nextjs.org/docs/app/guides/authentication) | Reforca separacao entre autenticacao, sessao e autorizacao, e que autorizacao segura deve ocorrer server-side. |
| [Next.js - Server Actions and Mutations](https://nextjs.org/docs/13/app/building-your-application/data-fetching/server-actions-and-mutations) | Reforca que Server Actions devem ser tratadas como endpoints publicos e verificar autorizacao. |
| [Drizzle - Generate](https://orm.drizzle.team/docs/drizzle-kit-generate) | Confirma fluxo de gerar migration SQL local. |
| [Drizzle - Migrations](https://orm.drizzle.team/docs/migrations) | Confirma diferenca entre gerar arquivos e aplicar migrations em banco. |

## 3. Alternativas avaliadas

| Alternativa | Decisao | Motivo |
|---|---|---|
| Auth custom | Descartada | Mais risco de seguranca e mais superficie de manutencao. |
| Auth.js | Descartada nesta fase | Decisao humana validou Better Auth. |
| Better Auth com Drizzle | Escolhida | Alinha com stack atual e decisao validada. |
| Login por Google OAuth ja nesta fase | Descartada | Fora de escopo; apenas preparar extensibilidade. |
| Magic link | Descartada | Fora de escopo. |
| Proteger apenas por middleware/layout | Descartada | Server actions e route handlers precisam de autorizacao propria. |
| Rodar `db:migrate` durante implementacao | Descartada sem aprovacao | Regra humana proibe aplicar banco real sem validacao explicita. |

## 4. Padroes aplicaveis

- Camada `server-only` para auth/session/policies, impedindo import acidental em cliente.
- Policy como funcao pura/testavel quando possivel, recebendo sessao normalizada e contexto de recurso.
- Guardrails por ambiente centralizados em `src/lib/runtime-mode.ts`.
- Erros controlados com estados distintos: `unauthenticated`, `forbidden`, `blocked`, `validation_error`, `transient_error`.
- Schema como fonte TypeScript em Drizzle, migration gerada localmente e revisada.
- Seed admin dev separado e estritamente condicionado a ambiente/variaveis.

## 5. Pontos a investigar durante coding

| Tema | Pergunta tecnica | Acao recomendada |
|---|---|---|
| Mapeamento `users` | O schema existente atende aos campos minimos do Better Auth? | Comparar schema gerado pelo provider com `src/db/schema.ts`. |
| Nome de tabelas | Usar `users` existente ou nomes padrao do provider? | Preferir mapeamento explicito se o provider permitir sem duplicar usuarios. |
| Sessao | Qual estrutura exata de cookie/session o provider usa? | Encapsular em contrato local sem vazar detalhes. |
| Senha fraca | Politica minima deve vir do provider ou validação local? | Definir regra no plano de coding e testar erro seguro. |
| E-mail duplicado | Como o adapter propaga unique violation? | Normalizar erro para mensagem segura. |
| Testes e2e | Como criar usuarios sem credenciais reais? | Usar test setup isolado/mocks ou banco de teste explicitamente controlado. |

## 6. Conclusao

O caminho tecnico e viavel desde que a implementacao preserve tres limites: auth/policies sempre server-side, migration apenas gerada ate validacao humana, e build/test sem dependencias de secrets reais.
