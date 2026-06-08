# Cross-check Audit: Fase 3 - Neon, Drizzle, migrations locais, seed controlado e persistencia real

> Data: `2026-06-08`  
> Feature: `001-fase-3-neon-drizzle`  
> Requirements: `_reversa_forward/001-fase-3-neon-drizzle/requirements.md`  
> Roadmap: `_reversa_forward/001-fase-3-neon-drizzle/roadmap.md`  
> Actions: `_reversa_forward/001-fase-3-neon-drizzle/actions.md`

## Resumo

| Severidade | Quantidade |
|------------|------------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 4 |
| LOW | 0 |

## Veredito

**Aprovado com ressalvas nao bloqueantes.**

Nao ha conflito com regra de negocio herdada, lacuna de requisito, dependencia fantasma, ciclo de dependencia, instrucao perigosa ou tarefa fora de escopo. Os achados sao de sanidade operacional do paralelismo em `actions.md`: algumas tarefas marcadas como `[//]` podem tocar o mesmo arquivo alvo e, portanto, nao deveriam ser executadas simultaneamente sem coordenacao.

Como nao ha findings CRITICAL nem HIGH, a feature pode seguir para `/reversa-coding`, desde que o executor trate os findings MEDIUM abaixo como cuidado de sequenciamento ou ajuste manual previo em `actions.md`.

## Findings

| ID | Severidade | Eixo | Descricao | Onde esta |
|----|------------|------|-----------|-----------|
| A001 | MEDIUM | Sanidade do actions | Tarefas paralelizaveis `F3-024`, `F3-025` e `F3-026` apontam para o mesmo arquivo alvo principal, `src/features/products/server/product-repository.ts`. Isso pode gerar conflito se executadas simultaneamente. | `actions.md`, Fase 5 |
| A002 | MEDIUM | Sanidade do actions | Tarefas paralelizaveis `F3-040`, `F3-041` e `F3-042` usam o mesmo glob `src/features/products/**/*.test.ts`. O plano nao garante que cada uma escrevera em arquivo de teste distinto. | `actions.md`, Fase 8 |
| A003 | MEDIUM | Sanidade do actions | `F3-012` e `F3-046` podem tocar `docs/operations/database-migrations.md`, mas `F3-046` nao depende de `F3-012`. Isso pode duplicar ou sobrescrever documentacao de pendencia de migrations. | `actions.md`, Fases 3 e 9 |
| A004 | MEDIUM | Sanidade do actions | `F3-013` e `F3-019` podem tocar `package.json`, mas `F3-019` nao depende de `F3-013`. Como ambas sao marcadas com `[//]`, ha risco de conflito na area de scripts. | `actions.md`, Fases 3 e 4 |

## Impacto e sugestoes

### A001

Impacto: execucoes paralelas no mesmo `product-repository.ts` podem produzir conflito textual ou sobrescrever imports/mapeadores.

Sugestao: antes de `/reversa-coding`, remover `[//]` de `F3-024`, `F3-025` e `F3-026`, ou declarar dependencias sequenciais entre elas. Uma ordem segura seria `F3-026 -> F3-024 -> F3-025`, ou manter todas dependentes de `F3-022` mas executar manualmente em sequencia.

### A002

Impacto: os testes podem ser criados no mesmo arquivo de dominio/repository, gerando conflito se agentes paralelos editarem a mesma suite.

Sugestao: declarar arquivos de teste distintos para cada tarefa, ou remover `[//]` de `F3-040`, `F3-041` e `F3-042`.

### A003

Impacto: `F3-012` pode registrar uma pendencia condicional sobre Drizzle exigir conexao, enquanto `F3-046` reescreve a documentacao operacional mais ampla.

Sugestao: fazer `F3-046` depender tambem de `F3-012`, ou mover o registro de pendencia para uma subtarefa dentro de `F3-046`.

### A004

Impacto: `F3-013` e `F3-019` podem editar a mesma area de scripts do `package.json`.

Sugestao: fazer `F3-019` depender de `F3-013`, ou remover `[//]` de uma das duas tarefas.

## Itens verificados que passaram

### Cobertura

- RF-01 esta coberto por `F3-001`, `F3-006`, `F3-031` e decisoes D-01/D-02 do roadmap.
- RF-02 esta coberto por `F3-023`.
- RF-03 esta coberto por `F3-024`.
- RF-04 esta coberto por `F3-025`.
- RF-05 e as regras publicas estao cobertas por `F3-036`, `F3-042` e estrategia de testes do roadmap.
- RF-06 e RF-07 estao cobertos por `F3-027`, `F3-028`, `F3-032` e `F3-033`.
- RF-08 e RF-09 estao cobertos por `F3-020`, `F3-026`, `F3-027` e `F3-028`.
- RF-10 e RF-11 estao cobertos por `F3-021`, `F3-029`, `F3-030`, `F3-037` e `F3-038`.
- RF-12 esta coberto por `F3-034` e `F3-035`.
- RF-13 esta coberto por `F3-036`, `F3-044`, `F3-051` e `F3-052`.
- RF-14 e RF-15 estao cobertos por `F3-014` a `F3-019` e `F3-043`.
- Os cenarios Gherkin do requirements estao cobertos por tarefas de repository, admin/storefront, seed, upload e validacoes finais.

### Seguranca

- Nenhuma tarefa manda expor secrets.
- Nenhuma tarefa manda copiar `.env` do legado.
- Nenhuma tarefa manda rodar migration em producao.
- Nenhuma tarefa manda conectar banco de producao.
- Nenhuma tarefa manda fazer deploy ou configurar dominio.
- Nenhuma tarefa manda fazer push automatico.
- `F3-053` e commit local opcional somente com autorizacao humana explicita e nunca inclui push.
- Upload real sem `BLOB_READ_WRITE_TOKEN` permanece bloqueado por `F3-038` e testado por `F3-045`.

### Escopo

- Nenhuma tarefa implementa checkout, pagamento, frete, cupom ou pedidos.
- Nenhuma tarefa implementa auth/policies reais; o escopo se limita a guardrails e avisos ate Fase 4.
- O Laravel legado aparece apenas como fonte de referencia, sem tarefa de modificacao.
- Nao ha tarefa de deploy, dominio, banco de producao ou migracao real de imagens do legado.

### Ordem e dependencias

- `F3-001` destrava runtime/fallback/guardrails.
- `F3-005` a `F3-008` destravam migrations e schema.
- `F3-020` a `F3-022` destravam repository real.
- `F3-031` cobre o risco de fallback mascarar erro real.
- `F3-033` a `F3-035` tratam admin/fallback/guardrail.
- `F3-040` a `F3-045` cobrem testes antes das validacoes finais.
- Todas as dependencias referenciam IDs existentes.
- Nao foi identificado ciclo de dependencia.

### Testabilidade

- Fallback sem `DATABASE_URL`: `F3-040`.
- Seed sem `DATABASE_URL`: `F3-043`.
- Scripts de banco: `F3-013`, `F3-019`, `F3-043`.
- Regra de produto publico: `F3-042`.
- Admin sem banco: `F3-034`, `F3-044`.
- Storefront sem banco: `F3-036`, `F3-044`.
- Bloqueio de mutacao fora de desenvolvimento sem auth: `F3-002`, `F3-033`, `F3-045`.
- Upload sem Blob token: `F3-038`, `F3-045`.

### Criterios de aceite e validacoes finais

- Todas as tarefas possuem criterio de aceite verificavel.
- Validacoes finais existem e estao ordenadas:
  - `F3-048`: `pnpm lint`
  - `F3-049`: `pnpm typecheck`
  - `F3-050`: `pnpm test`
  - `F3-051`: `pnpm build`
  - `F3-052`: `pnpm test:e2e`

### Riscos

- Migration contra banco errado: mitigada por `F3-005`, `F3-010`, `F3-011`, `F3-046`.
- Fallback mascarando erro real: mitigado por `F3-031`, `F3-041`.
- Admin sem auth persistindo fora de desenvolvimento: mitigado por `F3-002`, `F3-033`, `F3-035`, `F3-045`.
- Seed duplicando dados ou parecendo producao: mitigado por `F3-016`, `F3-017`, `F3-018`, `F3-046`.
- Metadata de imagem sem Blob real: mitigada por `F3-030`, `F3-037`, `F3-038`, `F3-045`.
- Build/test exigindo banco real: mitigado por `F3-006`, `F3-040`, `F3-048` a `F3-052`.

## Arquivos analisados

- `_reversa_forward/001-fase-3-neon-drizzle/requirements.md`
- `_reversa_forward/001-fase-3-neon-drizzle/doubts.md`
- `_reversa_forward/001-fase-3-neon-drizzle/audit/requirements-audit.md`
- `_reversa_forward/001-fase-3-neon-drizzle/roadmap.md`
- `_reversa_forward/001-fase-3-neon-drizzle/investigation.md`
- `_reversa_forward/001-fase-3-neon-drizzle/data-delta.md`
- `_reversa_forward/001-fase-3-neon-drizzle/onboarding.md`
- `_reversa_forward/001-fase-3-neon-drizzle/risk-plan.md`
- `_reversa_forward/001-fase-3-neon-drizzle/validation-plan.md`
- `_reversa_forward/001-fase-3-neon-drizzle/interfaces/product-persistence-contract.md`
- `_reversa_forward/001-fase-3-neon-drizzle/actions.md`

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-08 | Auditoria cruzada gerada por `/reversa-audit` | reversa |
