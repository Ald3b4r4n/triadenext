# Cross-check Audit: Fase 4 - Auth e Policies

> Identificador: `002-fase-4-auth-policies`
> Data: `2026-06-08`
> Requirements: `_reversa_forward/002-fase-4-auth-policies/requirements.md`
> Roadmap: `_reversa_forward/002-fase-4-auth-policies/roadmap.md`
> Actions: `_reversa_forward/002-fase-4-auth-policies/actions.md`

## Veredito

**Aprovado com ressalva LOW.**

Nao foram encontrados findings CRITICAL ou HIGH. A feature pode seguir para `/reversa-coding` apos ciencia da ressalva de paralelismo em testes, pois ela nao altera escopo, seguranca funcional, cobertura de requisitos ou ordem critica de implementacao.

## Resumo

| Severidade | Quantidade |
|------------|------------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 1 |

## Findings

| ID | Severidade | Eixo | Descricao | Onde esta |
|----|------------|------|-----------|-----------|
| A001 | LOW | Sanidade do actions / paralelismo | Duas tarefas marcadas como paralelizaveis apontam para o mesmo arquivo alvo principal `src/tests/unit/auth-policies.test.ts`. Isso pode gerar conflito mecanico se dois agentes editarem o mesmo arquivo ao mesmo tempo. | `actions.md`: F4-046 e F4-048 |

### Detalhe de A001

F4-046 cobre roles e policies admin; F4-048 cobre customer ownership. Ambas sao tarefas de teste coerentes e necessarias, mas compartilham `src/tests/unit/auth-policies.test.ts` enquanto aparecem com marcador `[//]`. A correcao sugerida e remover o marcador `[//]` de uma delas ou dividir os alvos em arquivos distintos, por exemplo `auth-admin-policies.test.ts` e `auth-ownership-policies.test.ts`. Como o impacto e apenas de planejamento de paralelismo e nao compromete a cobertura ou seguranca, a severidade e LOW.

## Itens Verificados Que Passaram

### Cobertura requirements -> roadmap -> actions

- RF-01 esta coberto por D-01, D-02, D-03 e pelas tarefas F4-006 a F4-015.
- RF-02 a RF-05 estao cobertos por D-04, D-05 e pelas tarefas F4-020 a F4-026, F4-046, F4-054.
- RF-06 esta coberto por D-04, D-09 e pelas tarefas F4-022, F4-023, F4-027 a F4-029, F4-048, F4-055.
- RF-07 e RSA-01 a RSA-05 estao cobertos por D-04, D-09 e pelas tarefas F4-031 a F4-035, F4-051.
- RF-08 e requisitos de ambiente estao cobertos por D-10 e pelas tarefas F4-003, F4-024, F4-052.
- RF-09, RF-10, RF-11 e RA-03 a RA-07 estao cobertos por F4-036 a F4-041, F4-049, F4-050 e F4-056.
- RF-12 e placeholders de seguranca estao cobertos por F4-026, F4-029, F4-035, F4-058 e F4-061.
- RB-01 a RB-06 estao cobertos por F4-010 a F4-015, F4-042 a F4-045 e F4-061.
- RC-01 a RC-11 estao cobertos por F4-011, F4-018, F4-020, F4-024, F4-035, F4-037, F4-047, F4-049, F4-051 e F4-052.
- Os cenarios Gherkin de admin, customer, logout, cadastro publico, build sem credenciais e producao sem auth completa possuem tarefas de implementacao e teste correspondentes.

### Contratos e interfaces

- `auth-session-contract.md` aparece no roadmap como contrato Auth/session e esta decomposto em F4-007, F4-008, F4-016 a F4-019 e F4-036 a F4-041.
- `policies-contract.md` aparece no roadmap como contrato Policies e esta decomposto em F4-020 a F4-024, F4-046 e F4-048.
- `protected-surfaces-contract.md` aparece no roadmap como contrato Protected routes/actions e esta decomposto em F4-025 a F4-035, F4-054 e F4-055.
- Os estados `allowed`, `unauthenticated`, `forbidden` e `blocked` aparecem nas actions e preservam o contrato esperado.

### Seguranca e escopo

- Nenhuma tarefa manda expor secrets, copiar `.env` do legado, hardcodar senha, criar admin publico, criar bypass global, conectar banco de producao, fazer deploy ou push automatico.
- As migrations ficam limitadas a geracao/revisao local: F4-014 e F4-015 explicitam que nada e aplicado em banco real.
- Google OAuth fica apenas preparado/documentado em F4-009; magic link nao e ativado.
- Checkout, pagamento, frete, cupom, documentos fiscais e pedidos reais permanecem fora de escopo em F4-029, F4-058 e nas notas de execucao.
- Admin/manager permanecem equivalentes no MVP; granularidade fina fica fora da implementacao inicial.

### Ordem e dependencias

- Dependencias/configuracao de auth precedem provider, route handler, sessao e fluxos.
- Schema/migrations locais precedem sessao persistente, cadastro e seed admin dev.
- Sessao server-side precede policies.
- Policies precedem protecao de rotas e server actions.
- Protecao de rotas e actions precede testes e2e e validacoes finais.
- Seed admin dev depende de schema/auth necessario e das variaveis exigidas.
- Testes unitarios precedem lint/typecheck/test/build/e2e finais.
- Nao foi encontrado ciclo de dependencias nem dependencia apontando para ID inexistente.

### Arquivos criticos

- `package.json` e `pnpm-lock.yaml` aparecem de forma sequencial em F4-006 e F4-045, sem conflito de paralelismo.
- `src/db/schema.ts` aparece sequencialmente em F4-010 a F4-013.
- `drizzle.config.ts` e `drizzle/` aparecem sequencialmente em F4-014 e F4-015.
- Auth config, route handler, policies e server actions aparecem em blocos sequenciais antes dos testes.
- O unico problema de paralelismo encontrado em arquivo critico/teste esta registrado em A001.

### Testabilidade e validacoes

- Ha testes planejados para roles/policies, customer ownership, sessao ausente, sessao expirada, timeout, cadastro publico customer-only, payload tentando criar admin, email duplicado, senha fraca, login invalido, logout, action protegida sem sessao, admin protegido, customer protegido, seed admin dev sem env e build/test sem credenciais reais.
- As validacoes finais incluem `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`.
- Os criterios de aceite das tarefas sao verificaveis e orientados a comportamento observavel.

### Coerencia com SDD

- O plano preserva produto publico com `published`, `publishedAt <= now` e estoque positivo.
- O fallback sem banco segue explicito e nao promete persistencia real.
- O guardrail atual de preview/producao e substituido por auth/policies reais sem liberar mutacao desprotegida.
- Upload metadata continua respeitando Blob token, banco e policy quando houver persistencia real.
- O projeto Laravel legado permanece apenas como referencia e nao ha tarefa que o modifique.

## Recomendacao

Como nao ha findings CRITICAL ou HIGH, a proxima etapa recomendada e `/reversa-coding`. A ressalva LOW pode ser tratada durante a execucao removendo paralelismo de uma tarefa de teste ou separando os arquivos de teste, sem necessidade de reabrir requirements ou roadmap.

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-08 | Auditoria cruzada inicial gerada por `/reversa-audit` | reversa |
