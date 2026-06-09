# Risk Plan — Fase 7 Frete e Cotações

> Data: `2026-06-09`

## Riscos principais

| ID | Risco | Impacto | Probabilidade | Mitigação |
|----|-------|---------|---------------|-----------|
| R-01 | Payload/client-side forçar valor de frete | alto | médio | Server actions aceitam apenas CEP/opção opaca; service recalcula valor. |
| R-02 | API externa real chamada por engano | alto | baixo | Adapters externos inativos, testes negativos e ausência de env obrigatório. |
| R-03 | Fixture/mock parecer cotação real | alto | médio | Origem explícita `fixture`/`dev_fallback` e mensagens na UI. |
| R-04 | Seleção de frete em carrinho alheio | alto | médio | Cotação vinculada ao carrinho resolvido por `userId`/`guestCartToken`. |
| R-05 | `free_shipping` criar frete artificial | alto | médio | Exigir cotação manual válida antes de zerar frete. |
| R-06 | Cotação stale após mudança no carrinho | médio | médio | `cartHash`/invalidação em add/update/remove/clear e expiração de 30 min. |
| R-07 | Admin de frete exposto para customer/visitante | alto | baixo | `requireAdminLike` em rotas e actions. |
| R-08 | Preview/produção sem banco fingir persistência | alto | médio | Runtime bloqueia mutações reais sem `DATABASE_URL`. |
| R-09 | Escopo escapar para checkout/pedido | alto | médio | Critérios de aceite e testes negativos contra Stripe/pedido/pagamento. |
| R-10 | Regra manual conflitante por UF/faixa | médio | médio | Prioridade/sort order e resolução determinística no domínio. |

## Critérios de rollback

- Desabilitar UI de cotação e seleção de frete mantendo carrinho/cupom existente.
- Remover seleção de frete do cálculo, retornando a `partialTotalCents`.
- Manter regras manuais inativas no admin.
- Preservar migrations locais sem aplicá-las em banco real até validação.
- Reverter apenas mudanças de Fase 7, sem tocar em catálogo, auth, carrinho base ou cupons monetários.

## Guardrails de execução

- Não rodar migrations reais sem validação humana.
- Não configurar credenciais externas.
- Não ativar checkout/pagamento/pedido.
- Não alterar Laravel legado.
- Não fazer deploy/push na execução de planejamento.
