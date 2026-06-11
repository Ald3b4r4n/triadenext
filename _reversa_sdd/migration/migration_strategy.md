# Migration Strategy

## Estratégia recomendada

**Transformacional por domínios verticais, com execução strangler-by-domain e paralelismo controlado para integrações críticas.**

Mesmo com apetite transformacional, evitar big bang para pagamento, fiscal, frete e estoque. Esses domínios devem ter contratos, adapters fake e provas de equivalência antes de substituir o legado.

## Ordem macro

1. Completar experiência pública e área do cliente.
2. Fechar operação de pedidos pós-pagamento.
3. Fortalecer admin operacional.
4. Integrar frete real e rastreamento.
5. Integrar fiscal/Bling de modo sandbox-first.
6. Consolidar estoque, relatórios, auditoria e analytics.
7. Executar migração de dados e cutover.

## Padrões obrigatórios

- Cada domínio deve expor contratos testáveis.
- Mutação deve validar entrada no servidor.
- Webhooks e eventos devem ser idempotentes.
- Integrações externas devem ter fake em teste.
- Dados financeiros/fiscais devem preservar snapshots.
- UI pública deve degradar com fallback seguro.

## Provas por fase

- Unit tests para regra de domínio.
- Integration tests para repositories/actions.
- E2E para jornada crítica.
- Regression watch comparando regra legada versus regra alvo.
