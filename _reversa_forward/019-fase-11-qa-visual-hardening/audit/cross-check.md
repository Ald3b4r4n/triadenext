# Cross-check Audit: Fase 11 - QA visual, hardening frontend e preparacao segura de producao

> Data: `2026-06-22`
> Feature: `019-fase-11-qa-visual-hardening`
> Requirements: `_reversa_forward/019-fase-11-qa-visual-hardening/requirements.md`
> Roadmap: `_reversa_forward/019-fase-11-qa-visual-hardening/roadmap.md`
> Actions: `_reversa_forward/019-fase-11-qa-visual-hardening/actions.md`
> Veredito: **aprovado com ressalvas leves**

## Resumo

| Severidade | Quantidade |
|------------|-----------:|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 2 |

## Findings

| ID | Severidade | Eixo | Descricao | Onde esta |
|----|------------|------|-----------|-----------|
| A001 | LOW | Sanidade do actions / paralelismo | `T020` e `T024` estao marcadas como paralelizaveis, mas apontam para o mesmo arquivo alvo `src/features/products/components/product-grid.tsx`. Nao ha dependencia quebrada nem conflito de escopo, mas a execucao paralela deve ser serializada ou coordenada para evitar edicao concorrente. | `actions.md#4-estados-loadingvazioerro`, `actions.md#5-responsividade` |
| A002 | LOW | Sanidade do actions / paralelismo | `T036` e `T037` estao marcadas como paralelizaveis, mas apontam para o mesmo arquivo alvo `src/tests/unit/storefront-home.test.tsx`. Nao bloqueia a fase, mas a execucao paralela real pode causar conflito de edicao no mesmo teste. | `actions.md#8-testes-unitarios` |

## Itens verificados que passaram

### Cobertura

- Os 15 requisitos funcionais de `requirements.md` possuem cobertura no `roadmap.md` e em `actions.md`.
- QA visual do storefront esta coberto por `T002`, `T005`, `T006` a `T012`, `T040` e `T041`.
- QA visual do admin esta coberto por `T013` a `T018` e `T043`.
- Estados loading/vazio/erro estao cobertos por `T019` a `T022`, com validacao textual em `T030`.
- Responsividade 360px, 430px, 768px e 1366px esta coberta por `T023` a `T026` e `T044`.
- Textos finais em PT-BR e remocao de placeholders estao cobertos por `T027` a `T030`.
- Checklist seguro de producao e env esta coberto por `T031` a `T035`.
- Testes unitarios estao cobertos por `T036` a `T039`.
- E2E/smoke visual esta coberto por `T040` a `T044`.
- Validacoes finais, regression watch e impacto estao cobertos por `T045` a `T049`.
- Todos os cenarios Gherkin de `requirements.md` possuem uma ou mais acoes correspondentes.

### Consistencia

- `requirements.md`, `roadmap.md` e `actions.md` usam a mesma fronteira de escopo: QA visual, hardening frontend e preparacao segura de producao.
- O fora de escopo aparece de forma consistente: deploy real, migration real, banco real, credenciais reais, Bling, NF-e, rotinas fiscais, WhatsApp, SMS e redesign premium.
- `actions.md` contem 49 tarefas, todas com status inicial `[ ]`.
- Nao ha identificadores de tarefa duplicados.
- Nao ha dependencia apontando para ID inexistente.
- Nao ha ciclo de dependencia.
- Nao ha diretorio `interfaces/`, coerente com o roadmap: a Fase 11 nao cria contrato externo novo.

### Coerencia com o SDD/legado

- O plano nao contradiz regras verdes de dominio em `_reversa_sdd/domain.md`.
- As acoes preservam as regras ja implementadas de pagamento, estoque, cupom, frete, checkout, pedidos e notificacoes.
- Admin permanece protegido por `requireAdminLike`; nao ha tarefa para bypass ou relaxamento de auth.
- O delta de dados e coerente com `data-delta.md`: sem schema novo, sem migration nova e sem aplicacao real de migration.
- Scripts locais de env aparecem como opcionais e seguros, sem imprimir valores e sem rede.

### Fora de escopo e seguranca

- Nao ha tarefa para deploy real.
- Nao ha tarefa para migration real.
- Nao ha tarefa para conectar banco real.
- Nao ha tarefa para usar credenciais reais.
- Nao ha tarefa para enviar e-mail real.
- Nao ha tarefa para integrar Bling, NF-e, rotinas fiscais, WhatsApp ou SMS.
- Nao ha tarefa de push ou commit automatico.

## Recomendacao

Como nao ha findings CRITICAL, HIGH ou MEDIUM, a feature pode seguir para `/reversa-coding`.

Ressalva operacional: ao executar o coding, serializar ou coordenar `T020/T024` e `T036/T037` para evitar conflito de edicao nos mesmos arquivos alvo.
