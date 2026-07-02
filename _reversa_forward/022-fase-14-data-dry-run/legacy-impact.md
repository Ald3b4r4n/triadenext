# Legacy Impact: Fase 14 - Controlled Data Dry-run and Reconciliation

> Identificador: `022-fase-14-data-dry-run`
> Data: `2026-07-02`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `data/dry-run/input/.gitkeep` | Operational Readiness | componente-novo | LOW | Cria ponto seguro para entrada local aprovada sem versionar dados reais. |
| `data/dry-run/input/examples/*.csv` | Operational Readiness | delta-de-dados | LOW | Exemplos sintéticos permitem validar contratos CSV sem usar dados reais. |
| `.gitignore` | Operational Readiness | regra-nova | LOW | Bloqueia versionamento acidental de entradas reais e relatórios de saída. |
| `src/features/data-dry-run/**` | Legacy Parity Readiness | componente-novo | MEDIUM | Adiciona normalização e reconciliação em memória para catálogo, imagens, cupons e frete. |
| `scripts/ops/check-data-dry-run-readiness.mjs` | Scripts Ops | componente-novo | LOW | Expõe comando local seguro sem banco, migration, upload, import ou deploy. |
| `package.json` | Scripts Ops | delta-de-contrato-externo | LOW | Registra `ops:check-data-dry-run` como verificação operacional local. |
| `src/tests/unit/data-dry-run-*.test.ts` | Test Suite | componente-novo | LOW | Cobre entrada segura, normalizadores, imagens, reconciliação e privacidade. |
| `src/tests/fixtures/data-dry-run/**` | Test Suite | delta-de-dados | LOW | Fixtures sintéticas validam contratos sem dados reais sensíveis. |
| `_reversa_forward/022-fase-14-data-dry-run/*.md` | Reversa Workflow | regra-nova | LOW | Registra checklist, guia operacional, validação, impacto e watch da Fase 14. |
| `.reversa/active-requirements.json` | Reversa Workflow | regra-alterada | LOW | Mantém feature ativa da Fase 14 no ciclo forward. |

## Diff conceitual por componente

### Operational Readiness

A Fase 14 introduz uma trilha local de dry-run para arquivos CSV/JSON controlados. A entrada permitida fica limitada a `data/dry-run/input/`, com exemplos sintéticos versionados e dados reais ignorados. A saída padrão fica em `data/dry-run/output/`, também ignorada.

### Legacy Parity Readiness

O novo módulo `src/features/data-dry-run` normaliza categorias, produtos, referências de imagem, cupons e frete mínimo para um modelo intermediário compatível com o Next. A reconciliação gera contagens, chaves, dinheiro, assets, frete, cupons, divergências e privacidade, sem persistir nada.

### Scripts Ops

O script `pnpm ops:check-data-dry-run` roda localmente sobre exemplos sintéticos por padrão ou sobre pasta aprovada dentro de `data/dry-run/input/`. Ele não lê `.env`, não exige credenciais, não conecta banco, não roda migration, não importa dados, não copia binários, não faz upload e não faz deploy.

### Laravel legado

O Laravel legado permaneceu fora da escrita. Nenhum arquivo, banco, storage, cache, configuração, migration ou comando do legado foi alterado ou executado.

### Domain Modules

Não houve alteração nas regras funcionais já implementadas de pagamento, estoque, cupons, frete, checkout, pedidos ou notificações. A fase adiciona apenas leitura/normalização local e relatórios de prontidão.

## Preservadas

- Produto público continua exigindo `published`, `publishedAt <= now` e estoque positivo no fluxo real.
- Preços continuam representados em centavos no modelo Next.
- Imagens de produto continuam associadas por produto, ordem e capa no modelo Next.
- Cupom vigente continua validado por status, janela, limite, subtotal e valor.
- Frete atual continua manual por UF/faixa de CEP no fluxo real.
- Checkout continua exigindo customer autenticado.
- Pedido pendente continua com snapshots server-side e expiração.
- Stripe webhook continua fonte de verdade financeira.
- Settlement continua transacional antes de notificação.
- Readiness operacional continua sem deploy, migration real, banco real, import real ou upload real automático.
- Laravel legado continua fonte de leitura/análise e base de rollback até aceite futuro.

## Modificadas

Nenhuma regra verde do domínio foi modificada ou removida.
