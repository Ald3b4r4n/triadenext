# Shipping, Tasks

> Checklist executavel da unit `shipping`.
> Escopo: dominio de CEP, regras manuais, quotes, fixtures, integracao com carrinho, UI, providers futuros e testes.

---

## 1. Dominio de CEP

- [ ] TASK-SHIPPING-001 Implementar ou validar `normalizePostalCode`.
- [ ] TASK-SHIPPING-002 Remover caracteres nao numericos do CEP.
- [ ] TASK-SHIPPING-003 Validar CEP com exatamente 8 digitos.
- [ ] TASK-SHIPPING-004 Retornar `validation_error` para CEP invalido.
- [ ] TASK-SHIPPING-005 Garantir que CEP normalizado e usado em quote, regras e snapshot futuro.

## 2. Regras Manuais

- [ ] TASK-SHIPPING-006 Definir contrato `ManualShippingRule`.
- [ ] TASK-SHIPPING-007 Ignorar regra manual inativa.
- [ ] TASK-SHIPPING-008 Suportar regra por UF quando aplicavel.
- [ ] TASK-SHIPPING-009 Suportar regra por faixa de CEP.
- [ ] TASK-SHIPPING-010 Suportar regra combinada por UF e faixa.
- [ ] TASK-SHIPPING-011 Validar `amountCents` positivo.
- [ ] TASK-SHIPPING-012 Validar prazo opcional.
- [ ] TASK-SHIPPING-013 Gerar `ShippingOption` para cada regra elegivel.
- [ ] TASK-SHIPPING-014 Ordenar opcoes de forma previsivel.
- [ ] TASK-SHIPPING-015 Retornar lista vazia quando nenhuma regra cobre o CEP.

## 3. Fixtures Dev/Test

- [ ] TASK-SHIPPING-016 Manter `devShippingRules` como fallback explicito.
- [ ] TASK-SHIPPING-017 Usar fixtures somente quando nao houver regras persistidas.
- [ ] TASK-SHIPPING-018 Marcar source de fixture como `fixture`.
- [ ] TASK-SHIPPING-019 Nao usar fixture como persistencia real.
- [ ] TASK-SHIPPING-020 Nao acionar provider externo ao usar fixture.
- [ ] TASK-SHIPPING-021 Exibir ou registrar mensagem segura de fallback quando relevante.

## 4. Cotacao de Frete

- [ ] TASK-SHIPPING-022 Implementar ou validar `quoteShippingAction`.
- [ ] TASK-SHIPPING-023 Implementar ou validar `quoteShippingStateAction`.
- [ ] TASK-SHIPPING-024 Validar `FormData` de cotacao.
- [ ] TASK-SHIPPING-025 Resolver ator com suporte a guest token.
- [ ] TASK-SHIPPING-026 Obter ou criar carrinho ativo.
- [ ] TASK-SHIPPING-027 Normalizar e validar CEP antes de consultar regras.
- [ ] TASK-SHIPPING-028 Buscar regras manuais persistidas.
- [ ] TASK-SHIPPING-029 Gerar opcoes com regras persistidas quando existirem.
- [ ] TASK-SHIPPING-030 Gerar opcoes com fixture quando permitido.
- [ ] TASK-SHIPPING-031 Retornar mensagem amigavel quando CEP nao tem cobertura.
- [ ] TASK-SHIPPING-032 Persistir quote com `cartId`, `cartHash`, `postalCode`, opcoes, source e expiracao.
- [ ] TASK-SHIPPING-033 Selecionar primeira opcao apos cotacao bem-sucedida quando aplicavel.
- [ ] TASK-SHIPPING-034 Recalcular carrinho apos cotacao.
- [ ] TASK-SHIPPING-035 Revalidar paths do carrinho/produtos apos sucesso.

## 5. Quotes

- [ ] TASK-SHIPPING-036 Definir contrato `ShippingQuote`.
- [ ] TASK-SHIPPING-037 Definir contrato `ShippingOption`.
- [ ] TASK-SHIPPING-038 Persistir `expiresAt` com janela de 30 minutos.
- [ ] TASK-SHIPPING-039 Persistir `source`.
- [ ] TASK-SHIPPING-040 Persistir `cartHash`.
- [ ] TASK-SHIPPING-041 Garantir que quote pertence a apenas um carrinho.
- [ ] TASK-SHIPPING-042 Bloquear reutilizacao de quote entre carrinhos.
- [ ] TASK-SHIPPING-043 Tratar quote expirada como invalida quando selecionada.
- [ ] TASK-SHIPPING-044 Nao expor detalhes internos de quote na UI publica.

## 6. Selecionar Opcao

- [ ] TASK-SHIPPING-045 Implementar ou validar `selectShippingOptionAction`.
- [ ] TASK-SHIPPING-046 Implementar ou validar `selectShippingOptionStateAction`.
- [ ] TASK-SHIPPING-047 Validar `quoteId` e `optionId`.
- [ ] TASK-SHIPPING-048 Resolver ator e carrinho ativo.
- [ ] TASK-SHIPPING-049 Buscar quote por id.
- [ ] TASK-SHIPPING-050 Retornar `validation_error` para quote inexistente.
- [ ] TASK-SHIPPING-051 Retornar `forbidden` para quote de outro carrinho.
- [ ] TASK-SHIPPING-052 Retornar `validation_error` para quote expirada.
- [ ] TASK-SHIPPING-053 Retornar `validation_error` para optionId inexistente.
- [ ] TASK-SHIPPING-054 Gravar opcao selecionada no carrinho.
- [ ] TASK-SHIPPING-055 Recalcular carrinho apos selecao.

## 7. Remover Frete

- [ ] TASK-SHIPPING-056 Implementar ou validar `removeShippingSelectionAction`.
- [ ] TASK-SHIPPING-057 Implementar ou validar `removeShippingSelectionStateAction`.
- [ ] TASK-SHIPPING-058 Resolver ator do carrinho.
- [ ] TASK-SHIPPING-059 Limpar selecao de frete.
- [ ] TASK-SHIPPING-060 Recalcular carrinho sem frete.
- [ ] TASK-SHIPPING-061 Retornar mensagem "Frete removido." ou equivalente.
- [ ] TASK-SHIPPING-062 Tratar carrinho ausente com erro seguro.

## 8. Integracao com Carrinho

- [ ] TASK-SHIPPING-063 Calcular `shippingAmountCents` a partir da opcao selecionada.
- [ ] TASK-SHIPPING-064 Compor total com frete em `recalculateCartView`.
- [ ] TASK-SHIPPING-065 Limpar frete selecionado quando item/quantidade muda.
- [ ] TASK-SHIPPING-066 Usar `cartHash` para detectar obsolescencia quando validacao forte existir.
- [ ] TASK-SHIPPING-067 Preservar quote original quando cupom `free_shipping` zera valor efetivo.
- [ ] TASK-SHIPPING-068 Garantir que frete selecionado vira snapshot no checkout.
- [ ] TASK-SHIPPING-069 Nao recalcular frete no client.

## 9. Free Shipping

- [ ] TASK-SHIPPING-070 Detectar cupom `free_shipping` no recalculo.
- [ ] TASK-SHIPPING-071 Zerar apenas frete manual elegivel.
- [ ] TASK-SHIPPING-072 Nao alterar quote original.
- [ ] TASK-SHIPPING-073 Adicionar mensagem explicativa ao carrinho.
- [ ] TASK-SHIPPING-074 Testar carrinho com frete e cupom de frete gratis.

## 10. UI Publica de Frete

- [ ] TASK-SHIPPING-075 Renderizar campo de CEP com label acessivel.
- [ ] TASK-SHIPPING-076 Renderizar CTA "Cotar".
- [ ] TASK-SHIPPING-077 Exibir "Cotacao ainda nao realizada." quando sem quote.
- [ ] TASK-SHIPPING-078 Exibir pending durante cotacao.
- [ ] TASK-SHIPPING-079 Exibir opcoes com label, prazo e preco.
- [ ] TASK-SHIPPING-080 Exibir CTA de selecionar opcao.
- [ ] TASK-SHIPPING-081 Exibir CTA de remover frete.
- [ ] TASK-SHIPPING-082 Exibir erro de CEP invalido.
- [ ] TASK-SHIPPING-083 Exibir erro de sem cobertura.
- [ ] TASK-SHIPPING-084 Exibir erro de quote expirada/invalida.
- [ ] TASK-SHIPPING-085 Chamar `router.refresh()` apos sucesso.

## 11. Providers Futuros

- [ ] TASK-SHIPPING-086 Manter contrato para Correios futuro sem chamada real.
- [ ] TASK-SHIPPING-087 Manter contrato para Jadlog futuro sem chamada real.
- [ ] TASK-SHIPPING-088 Manter contrato para Melhor Envio futuro sem chamada real.
- [ ] TASK-SHIPPING-089 Bloquear provider externo sem credenciais e fase dedicada.
- [ ] TASK-SHIPPING-090 Planejar timeouts, retries e rate limit para fase futura.
- [ ] TASK-SHIPPING-091 Mascarar qualquer credencial em logs futuros.

## 12. Testes Unitarios

- [ ] TASK-SHIPPING-092 Testar normalizacao de CEP com mascara.
- [ ] TASK-SHIPPING-093 Testar rejeicao de CEP curto.
- [ ] TASK-SHIPPING-094 Testar rejeicao de CEP nao numerico.
- [ ] TASK-SHIPPING-095 Testar regra manual por faixa.
- [ ] TASK-SHIPPING-096 Testar regra manual por UF.
- [ ] TASK-SHIPPING-097 Testar regra inativa ignorada.
- [ ] TASK-SHIPPING-098 Testar ordenacao de opcoes.
- [ ] TASK-SHIPPING-099 Testar CEP sem cobertura.
- [ ] TASK-SHIPPING-100 Testar fixture dev/test.
- [ ] TASK-SHIPPING-101 Testar que regra persistida prevalece sobre fixture.

## 13. Testes de Service/Repository

- [ ] TASK-SHIPPING-102 Testar criacao de quote com cartId/cartHash.
- [ ] TASK-SHIPPING-103 Testar quote com expiracao de 30 minutos.
- [ ] TASK-SHIPPING-104 Testar selecao de primeira opcao apos cotacao.
- [ ] TASK-SHIPPING-105 Testar quote inexistente.
- [ ] TASK-SHIPPING-106 Testar quote de outro carrinho.
- [ ] TASK-SHIPPING-107 Testar quote expirada.
- [ ] TASK-SHIPPING-108 Testar optionId inexistente.
- [ ] TASK-SHIPPING-109 Testar remocao de frete.
- [ ] TASK-SHIPPING-110 Testar limpeza de frete ao alterar item.

## 14. E2E

- [ ] TASK-SHIPPING-111 Abrir carrinho sem cotacao de frete.
- [ ] TASK-SHIPPING-112 Cotar frete com CEP valido.
- [ ] TASK-SHIPPING-113 Confirmar exibicao de opcoes.
- [ ] TASK-SHIPPING-114 Selecionar opcao de frete.
- [ ] TASK-SHIPPING-115 Confirmar total com frete.
- [ ] TASK-SHIPPING-116 Remover frete.
- [ ] TASK-SHIPPING-117 Confirmar total sem frete.
- [ ] TASK-SHIPPING-118 Testar CEP invalido.
- [ ] TASK-SHIPPING-119 Testar CEP sem cobertura.

## 15. Guardrails

- [ ] TASK-SHIPPING-120 Nao chamar API real de Correios.
- [ ] TASK-SHIPPING-121 Nao chamar API real de Jadlog.
- [ ] TASK-SHIPPING-122 Nao chamar API real de Melhor Envio.
- [ ] TASK-SHIPPING-123 Nao armazenar credenciais em docs, logs ou fixtures.
- [ ] TASK-SHIPPING-124 Nao copiar `.env`.
- [ ] TASK-SHIPPING-125 Nao rodar migrations nesta execucao documental.
- [ ] TASK-SHIPPING-126 Nao conectar banco de producao.
- [ ] TASK-SHIPPING-127 Nao alterar pagamento, pedido, estoque ou notificacao.
- [ ] TASK-SHIPPING-128 Nao modificar Laravel legado.

## 16. Validacoes Finais

- [ ] TASK-SHIPPING-129 Executar `pnpm lint` quando houver alteracao funcional.
- [ ] TASK-SHIPPING-130 Executar `pnpm typecheck` quando houver alteracao funcional.
- [ ] TASK-SHIPPING-131 Executar `pnpm test` cobrindo dominio, service, repository e UI.
- [ ] TASK-SHIPPING-132 Executar `pnpm build` antes de concluir feature funcional.
- [ ] TASK-SHIPPING-133 Executar `pnpm test:e2e` para fluxo de cotacao/selecao/remocao.

## 17. Definition of Done

- [ ] TASK-SHIPPING-134 CEP normalizado e validado.
- [ ] TASK-SHIPPING-135 Cotacao manual gera opcoes para CEP coberto.
- [ ] TASK-SHIPPING-136 CEP sem cobertura falha com mensagem amigavel.
- [ ] TASK-SHIPPING-137 Quote e vinculada ao carrinho e protegida contra uso cruzado.
- [ ] TASK-SHIPPING-138 Remocao de frete recalcula carrinho.
- [ ] TASK-SHIPPING-139 Fallback dev/test e explicito.
- [ ] TASK-SHIPPING-140 Providers externos reais permanecem inativos.
