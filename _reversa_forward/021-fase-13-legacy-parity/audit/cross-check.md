# Cross-check: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`
> Data: `2026-07-01`
> Requirements: `_reversa_forward/021-fase-13-legacy-parity/requirements.md`
> Roadmap: `_reversa_forward/021-fase-13-legacy-parity/roadmap.md`
> Actions: `_reversa_forward/021-fase-13-legacy-parity/actions.md`

## Veredito

**Aprovado.**

O `actions.md` cobre a macrofase sem virar microfeature excessiva, preserva o Laravel legado como fonte somente leitura e nao introduz deploy real, migration real, conexao com banco real, importacao real automatica ou exposicao de secrets. As tarefas paralelizaveis nao compartilham arquivo alvo e as dependencias nao possuem ciclo.

## Resumo de findings

| Severidade | Quantidade |
|------------|------------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 0 |

## Findings

| ID | Severidade | Eixo | Descricao | Onde esta |
|----|------------|------|-----------|-----------|
| - | - | - | Nenhum finding registrado. | - |

## Itens verificados que passaram

### Cobertura

- RF-01, comparacao Laravel x Next por dominios publicos, comerciais, cliente/admin e regras, esta coberto por T001-T007 e T014-T020.
- RF-02 e RF-03, classificacao de lacunas e identificacao do que o Next substitui, estao cobertos por T006, T019, T020, T031 e T034.
- RF-04, inventario de dados migraveis, esta coberto por T021-T024.
- RF-05, dry-run seguro sem gravacao em producao e sem banco real por padrao, esta coberto por T010, T025, T026 e T032.
- RF-06 e RF-07, reconciliacao e relatorio de divergencias, estao cobertos por T011, T027, T028 e T032.
- RF-08 e RF-13, checklist de substituicao e rollback, estao cobertos por T029-T031, T034 e T035.
- RF-09, limites seguros para leitura do Laravel, esta coberto por T001, T003, T005, T036 e T039.
- RF-10, lacunas explicitamente fora do escopo, incluindo Bling, NF-e, rotinas fiscais, WhatsApp, SMS e redesign premium, esta coberto por T018, T020 e T034.
- RF-11, midias/imagens sem upload real automatico, esta coberto por T015, T023, T024 e T027.
- RF-12, smoke de paridade sobre dados controlados, esta coberto por T012 e T035.

### Escopo da macrofase

- Auditoria de modulos Laravel x Next: T001-T007.
- Paridade de storefront e paginas publicas: T014, T019 e T020.
- Paridade de catalogo, produtos, categorias, imagens, precos e estoque: T015, T021, T023 e T024.
- Paridade de carrinho, cupons, frete, checkout e pedidos: T016, T022 e T024-T028.
- Paridade de clientes/auth/admin: T017, T022 e T024.
- Inventario legado: T021-T024.
- Estrategia de migracao dry-run: T025, T026 e T032.
- Reconciliacao e divergencias: T027, T028 e T032.
- Checklist go-live/substituicao: T029, T031, T034 e T035.
- Rollback e riscos: T030, T031 e T034.

### Consistencia com roadmap

- D-01, comparacao por dominio funcional, esta refletida em T014-T020.
- D-02, Laravel como fonte read-only, esta refletida em T001, T003, T005, T036 e T039.
- D-03, matriz com status de paridade, esta refletida em T006 e T019.
- D-04, dry-run e formato intermediario sanitizado, esta refletida em T010, T025 e T026.
- D-05, reconciliacao por contagem, chaves, amostras mascaradas e checksums quando viaveis, esta refletida em T011, T027 e T028.
- D-06, criterio de bloqueador por impacto em venda, financeiro, seguranca, privacidade ou catalogo vendavel, esta refletida em T006, T020, T031 e T034.
- D-07, ausencia de contrato externo novo, permanece respeitada; nao ha `interfaces/` na feature e nenhuma acao cria API/fila/webhook externo.

### Coerencia com legado e guardrails

- O plano nao contradiz as regras confirmadas no SDD: produto publico, carrinho, cupom, frete manual, checkout autenticado, pedido, Stripe/webhook e notificacao pos-settlement permanecem como objetos de comparacao, nao de alteracao de regra.
- Bling, NF-e, rotinas fiscais, WhatsApp e SMS aparecem como lacunas/out-of-scope ou decisao humana, nao como implementacao.
- O Laravel legado esta explicitamente limitado a leitura de arquivos/metadados; as tarefas proíbem `.env`, artisan, banco, escrita e comandos destrutivos.
- Nao ha tarefa de deploy real, migration real, importacao real automatica, conexao com banco real ou exposicao de secrets.

### Sanidade do actions

- Total declarado e verificado: 39 tarefas.
- Total paralelizavel declarado e verificado: 18 tarefas.
- Todas as dependencias apontam para IDs existentes.
- Nao ha ciclo de dependencias.
- Tarefas marcadas com `[//]` nao compartilham arquivo alvo.
- As tarefas estao distribuidas em cinco fases canonicas: Preparacao, Testes, Nucleo, Integracao e Polimento.

## Bloqueios reais

Nenhum bloqueio real encontrado.

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-07-01 | Auditoria inicial gerada por `/reversa-audit` | reversa |
