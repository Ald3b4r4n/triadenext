# Shipping / Cotacao Publica no Carrinho, Tasks

> Checklist executavel da subunidade `shipping/cotacao-publica-carrinho`.
> Escopo: CEP publico, quote manual, fallback dev/test, selecao/remocao de frete e recalculo seguro do carrinho.

## 1. Superficie Publica

- [ ] TASK-SHIPPING-PUB-001 Confirmar que `/carrinho` renderiza `ShippingQuotePanel`.
- [ ] TASK-SHIPPING-PUB-002 Confirmar que o painel recebe estado de frete vindo do servidor.
- [ ] TASK-SHIPPING-PUB-003 Garantir que o componente nao calcula frete no cliente.
- [ ] TASK-SHIPPING-PUB-004 Exibir campo de CEP com label acessivel.
- [ ] TASK-SHIPPING-PUB-005 Exibir CTA `Cotar`.
- [ ] TASK-SHIPPING-PUB-006 Exibir estado "Cotacao ainda nao realizada." quando nao houver quote.

## 2. Schema e Validacao de CEP

- [ ] TASK-SHIPPING-PUB-007 Criar ou validar schema de `postalCode` para action.
- [ ] TASK-SHIPPING-PUB-008 Normalizar CEP removendo pontuacao e caracteres nao numericos.
- [ ] TASK-SHIPPING-PUB-009 Exigir CEP com exatamente 8 digitos.
- [ ] TASK-SHIPPING-PUB-010 Retornar `validation_error` para CEP curto.
- [ ] TASK-SHIPPING-PUB-011 Retornar `validation_error` para CEP vazio.
- [ ] TASK-SHIPPING-PUB-012 Retornar mensagem amigavel sem stack trace.

## 3. Action de Cotacao

- [ ] TASK-SHIPPING-PUB-013 Implementar ou validar `quoteShippingAction`.
- [ ] TASK-SHIPPING-PUB-014 Implementar ou validar `quoteShippingStateAction`.
- [ ] TASK-SHIPPING-PUB-015 Ler `postalCode` de `FormData`.
- [ ] TASK-SHIPPING-PUB-016 Delegar regra para `quoteShippingForActiveCart`.
- [ ] TASK-SHIPPING-PUB-017 Normalizar retorno para `CartActionResult` ou state equivalente.
- [ ] TASK-SHIPPING-PUB-018 Revalidar `/carrinho` apos sucesso.
- [ ] TASK-SHIPPING-PUB-019 Nao retornar erro tecnico bruto para UI.

## 4. Resolucao de Ator e Carrinho

- [ ] TASK-SHIPPING-PUB-020 Resolver ator com suporte a guest e customer.
- [ ] TASK-SHIPPING-PUB-021 Usar `createGuestToken: true` quando visitante iniciar cotacao.
- [ ] TASK-SHIPPING-PUB-022 Obter ou criar carrinho ativo.
- [ ] TASK-SHIPPING-PUB-023 Bloquear fluxo com erro seguro quando carrinho estiver indisponivel.
- [ ] TASK-SHIPPING-PUB-024 Garantir que cada operacao atua apenas no carrinho do ator atual.

## 5. Regras Manuais e Fixtures

- [ ] TASK-SHIPPING-PUB-025 Buscar regras manuais persistidas ativas.
- [ ] TASK-SHIPPING-PUB-026 Ignorar regras inativas no fluxo publico.
- [ ] TASK-SHIPPING-PUB-027 Gerar opcoes com source `manual` quando houver regra persistida.
- [ ] TASK-SHIPPING-PUB-028 Usar `devShippingRules` apenas quando nao houver regra persistida.
- [ ] TASK-SHIPPING-PUB-029 Marcar opcoes de fallback com source `fixture`.
- [ ] TASK-SHIPPING-PUB-030 Impedir que fixture mascare erro de banco real em producao.
- [ ] TASK-SHIPPING-PUB-031 Garantir que nenhum provider externo seja chamado.

## 6. Geracao de Opcoes

- [ ] TASK-SHIPPING-PUB-032 Usar `buildManualShippingOptions` para montar opcoes.
- [ ] TASK-SHIPPING-PUB-033 Validar cobertura por faixa de CEP.
- [ ] TASK-SHIPPING-PUB-034 Validar cobertura por UF quando aplicavel.
- [ ] TASK-SHIPPING-PUB-035 Ordenar opcoes de forma previsivel.
- [ ] TASK-SHIPPING-PUB-036 Retornar `validation_error` quando nenhuma opcao cobrir o CEP.
- [ ] TASK-SHIPPING-PUB-037 Exibir mensagem "Nao ha cobertura manual para este CEP." ou equivalente.

## 7. Criacao de Quote

- [ ] TASK-SHIPPING-PUB-038 Calcular `cartHash` antes de persistir quote.
- [ ] TASK-SHIPPING-PUB-039 Persistir `cartId`.
- [ ] TASK-SHIPPING-PUB-040 Persistir `postalCode` normalizado.
- [ ] TASK-SHIPPING-PUB-041 Persistir lista de opcoes.
- [ ] TASK-SHIPPING-PUB-042 Persistir source da quote.
- [ ] TASK-SHIPPING-PUB-043 Persistir `expiresAt` com janela operacional de 30 minutos.
- [ ] TASK-SHIPPING-PUB-044 Persistir `createdAt` quando aplicavel.
- [ ] TASK-SHIPPING-PUB-045 Garantir que quote nao seja compartilhavel entre carrinhos.

## 8. Selecao Automatica

- [ ] TASK-SHIPPING-PUB-046 Selecionar primeira opcao apos cotacao bem-sucedida quando houver opcoes.
- [ ] TASK-SHIPPING-PUB-047 Gravar `quoteId` e `optionId` selecionados no carrinho.
- [ ] TASK-SHIPPING-PUB-048 Recalcular carrinho apos selecao automatica.
- [ ] TASK-SHIPPING-PUB-049 Retornar mensagem "Cotacao de frete calculada." ou equivalente.

## 9. Exibicao de Opcoes

- [ ] TASK-SHIPPING-PUB-050 Renderizar label da opcao.
- [ ] TASK-SHIPPING-PUB-051 Renderizar prazo estimado ou "Prazo a confirmar".
- [ ] TASK-SHIPPING-PUB-052 Renderizar preco formatado via utilitario de moeda.
- [ ] TASK-SHIPPING-PUB-053 Indicar opcao selecionada.
- [ ] TASK-SHIPPING-PUB-054 Exibir source fixture apenas de forma segura quando relevante para dev/test.
- [ ] TASK-SHIPPING-PUB-055 Evitar expor ids internos alem do necessario para submit.

## 10. Selecao Manual de Opcao

- [ ] TASK-SHIPPING-PUB-056 Implementar ou validar `selectShippingOptionAction`.
- [ ] TASK-SHIPPING-PUB-057 Implementar ou validar `selectShippingOptionStateAction`.
- [ ] TASK-SHIPPING-PUB-058 Validar presenca de `quoteId`.
- [ ] TASK-SHIPPING-PUB-059 Validar presenca de `optionId`.
- [ ] TASK-SHIPPING-PUB-060 Buscar quote por id.
- [ ] TASK-SHIPPING-PUB-061 Retornar `validation_error` para quote inexistente.
- [ ] TASK-SHIPPING-PUB-062 Retornar `forbidden` quando quote pertence a outro carrinho.
- [ ] TASK-SHIPPING-PUB-063 Retornar `validation_error` para quote expirada.
- [ ] TASK-SHIPPING-PUB-064 Retornar `validation_error` para optionId inexistente.
- [ ] TASK-SHIPPING-PUB-065 Gravar opcao selecionada e recalcular carrinho.

## 11. Remocao de Frete

- [ ] TASK-SHIPPING-PUB-066 Implementar ou validar `removeShippingSelectionAction`.
- [ ] TASK-SHIPPING-PUB-067 Implementar ou validar `removeShippingSelectionStateAction`.
- [ ] TASK-SHIPPING-PUB-068 Limpar quote/opcao selecionada do carrinho.
- [ ] TASK-SHIPPING-PUB-069 Recalcular carrinho sem frete.
- [ ] TASK-SHIPPING-PUB-070 Retornar mensagem "Frete removido." ou equivalente.
- [ ] TASK-SHIPPING-PUB-071 Revalidar `/carrinho` apos remocao.

## 12. Integracao com Totais

- [ ] TASK-SHIPPING-PUB-072 Garantir que `recalculateCartView` considera frete selecionado.
- [ ] TASK-SHIPPING-PUB-073 Calcular `shippingAmountCents` server-side.
- [ ] TASK-SHIPPING-PUB-074 Compor total final com frete.
- [ ] TASK-SHIPPING-PUB-075 Aplicar cupom `free_shipping` sobre frete manual elegivel.
- [ ] TASK-SHIPPING-PUB-076 Manter quote original intacta quando frete gratis for aplicado.
- [ ] TASK-SHIPPING-PUB-077 Retornar mensagem informativa quando frete gratis zerar o valor efetivo.

## 13. Invalidacao por Mudanca de Carrinho

- [ ] TASK-SHIPPING-PUB-078 Limpar frete selecionado quando item for adicionado.
- [ ] TASK-SHIPPING-PUB-079 Limpar frete selecionado quando quantidade mudar.
- [ ] TASK-SHIPPING-PUB-080 Limpar frete selecionado quando item for removido.
- [ ] TASK-SHIPPING-PUB-081 Limpar frete selecionado quando carrinho for limpo.
- [ ] TASK-SHIPPING-PUB-082 Padronizar `cartHash` se validacao anti-stale for endurecida.

## 14. Estados de UI

- [ ] TASK-SHIPPING-PUB-083 Renderizar estado sem cotacao.
- [ ] TASK-SHIPPING-PUB-084 Renderizar pending durante cotacao.
- [ ] TASK-SHIPPING-PUB-085 Renderizar pending durante selecao.
- [ ] TASK-SHIPPING-PUB-086 Renderizar pending durante remocao.
- [ ] TASK-SHIPPING-PUB-087 Renderizar erro de CEP invalido.
- [ ] TASK-SHIPPING-PUB-088 Renderizar erro de sem cobertura.
- [ ] TASK-SHIPPING-PUB-089 Renderizar erro de quote expirada.
- [ ] TASK-SHIPPING-PUB-090 Renderizar erro generico seguro.
- [ ] TASK-SHIPPING-PUB-091 Chamar `router.refresh()` apos sucesso quando componente cliente controlar estado.

## 15. Testes Unitarios

- [ ] TASK-SHIPPING-PUB-092 Testar normalizacao de CEP mascarado.
- [ ] TASK-SHIPPING-PUB-093 Testar rejeicao de CEP curto.
- [ ] TASK-SHIPPING-PUB-094 Testar rejeicao de CEP vazio.
- [ ] TASK-SHIPPING-PUB-095 Testar regra manual ativa gerando opcao.
- [ ] TASK-SHIPPING-PUB-096 Testar regra manual inativa ignorada.
- [ ] TASK-SHIPPING-PUB-097 Testar ausencia de cobertura.
- [ ] TASK-SHIPPING-PUB-098 Testar fixture dev/test.
- [ ] TASK-SHIPPING-PUB-099 Testar que regra persistida prevalece sobre fixture.

## 16. Testes de Service/Repository

- [ ] TASK-SHIPPING-PUB-100 Testar criacao de quote com `cartId`.
- [ ] TASK-SHIPPING-PUB-101 Testar criacao de quote com `cartHash`.
- [ ] TASK-SHIPPING-PUB-102 Testar expiracao de 30 minutos.
- [ ] TASK-SHIPPING-PUB-103 Testar selecao automatica da primeira opcao.
- [ ] TASK-SHIPPING-PUB-104 Testar selecao manual valida.
- [ ] TASK-SHIPPING-PUB-105 Testar quote inexistente.
- [ ] TASK-SHIPPING-PUB-106 Testar quote de outro carrinho.
- [ ] TASK-SHIPPING-PUB-107 Testar quote expirada.
- [ ] TASK-SHIPPING-PUB-108 Testar remocao de frete.
- [ ] TASK-SHIPPING-PUB-109 Testar recalculo com `free_shipping`.

## 17. Testes de UI/E2E

- [ ] TASK-SHIPPING-PUB-110 Abrir `/carrinho` sem cotacao.
- [ ] TASK-SHIPPING-PUB-111 Confirmar campo de CEP e botao `Cotar`.
- [ ] TASK-SHIPPING-PUB-112 Cotar CEP valido com fixture segura.
- [ ] TASK-SHIPPING-PUB-113 Confirmar exibicao de opcoes.
- [ ] TASK-SHIPPING-PUB-114 Confirmar total com frete.
- [ ] TASK-SHIPPING-PUB-115 Selecionar outra opcao quando houver mais de uma.
- [ ] TASK-SHIPPING-PUB-116 Remover frete.
- [ ] TASK-SHIPPING-PUB-117 Confirmar total sem frete.
- [ ] TASK-SHIPPING-PUB-118 Testar CEP invalido.
- [ ] TASK-SHIPPING-PUB-119 Testar CEP sem cobertura.
- [ ] TASK-SHIPPING-PUB-120 Confirmar que checkout permanece bloqueado sem frete.

## 18. Guardrails

- [ ] TASK-SHIPPING-PUB-121 Nao chamar Correios real.
- [ ] TASK-SHIPPING-PUB-122 Nao chamar Jadlog real.
- [ ] TASK-SHIPPING-PUB-123 Nao chamar Melhor Envio real.
- [ ] TASK-SHIPPING-PUB-124 Nao expor credenciais.
- [ ] TASK-SHIPPING-PUB-125 Nao copiar `.env`.
- [ ] TASK-SHIPPING-PUB-126 Nao conectar banco de producao.
- [ ] TASK-SHIPPING-PUB-127 Nao rodar migrations.
- [ ] TASK-SHIPPING-PUB-128 Nao alterar pagamento, pedido, estoque ou cupom.
- [ ] TASK-SHIPPING-PUB-129 Nao alterar Laravel legado.
- [ ] TASK-SHIPPING-PUB-130 Nao confiar em total calculado no cliente.

## 19. Validacoes

- [ ] TASK-SHIPPING-PUB-131 Rodar `pnpm lint` quando houver implementacao funcional.
- [ ] TASK-SHIPPING-PUB-132 Rodar `pnpm typecheck` quando houver implementacao funcional.
- [ ] TASK-SHIPPING-PUB-133 Rodar `pnpm test`.
- [ ] TASK-SHIPPING-PUB-134 Rodar `pnpm build`.
- [ ] TASK-SHIPPING-PUB-135 Rodar `pnpm test:e2e` cobrindo carrinho/frete.

## 20. Definition of Done

- [ ] TASK-SHIPPING-PUB-136 Painel publico de frete aparece no carrinho.
- [ ] TASK-SHIPPING-PUB-137 CEP valido gera quote manual ou fixture dev/test explicita.
- [ ] TASK-SHIPPING-PUB-138 CEP invalido ou sem cobertura retorna erro amigavel.
- [ ] TASK-SHIPPING-PUB-139 Quote fica vinculada ao carrinho correto.
- [ ] TASK-SHIPPING-PUB-140 Quote de outro carrinho e bloqueada.
- [ ] TASK-SHIPPING-PUB-141 Frete selecionado recalcula totais server-side.
- [ ] TASK-SHIPPING-PUB-142 Remocao de frete recalcula carrinho.
- [ ] TASK-SHIPPING-PUB-143 Cupom de frete gratis zera apenas valor efetivo elegivel.
- [ ] TASK-SHIPPING-PUB-144 Nenhuma API externa real e chamada.
