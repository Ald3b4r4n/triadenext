# Coupons / Cupom Publico no Carrinho, Tasks

> Checklist executavel da subunit `coupons/cupom-publico-carrinho`.
> Escopo: UI publica, actions, service de carrinho, service de cupom, recalculo, fallback, testes e guardrails.

---

## 1. Preparacao

- [ ] TASK-PUBLIC-COUPON-001 Confirmar que a UI publica de cupom vive no fluxo do carrinho.
- [ ] TASK-PUBLIC-COUPON-002 Confirmar que o painel de cupom nao calcula subtotal, desconto ou total no client.
- [ ] TASK-PUBLIC-COUPON-003 Confirmar que actions de cupom usam server-side como fonte de verdade.
- [ ] TASK-PUBLIC-COUPON-004 Confirmar que esta subunit nao altera checkout, pagamento, estoque, email ou admin de cupons.

## 2. UI Sem Cupom Aplicado

- [ ] TASK-PUBLIC-COUPON-005 Renderizar heading "Cupom".
- [ ] TASK-PUBLIC-COUPON-006 Renderizar campo de codigo com label acessivel.
- [ ] TASK-PUBLIC-COUPON-007 Renderizar CTA "Aplicar".
- [ ] TASK-PUBLIC-COUPON-008 Desabilitar CTA durante pending.
- [ ] TASK-PUBLIC-COUPON-009 Exibir mensagem de erro/sucesso em area com `role="status"` ou equivalente acessivel.
- [ ] TASK-PUBLIC-COUPON-010 Nao expor id interno do cupom na UI publica.

## 3. UI Com Cupom Aplicado

- [ ] TASK-PUBLIC-COUPON-011 Renderizar codigo do cupom aplicado.
- [ ] TASK-PUBLIC-COUPON-012 Renderizar label de valor do cupom.
- [ ] TASK-PUBLIC-COUPON-013 Renderizar indicacao de beneficio preparado para `free_shipping`.
- [ ] TASK-PUBLIC-COUPON-014 Renderizar CTA "Remover".
- [ ] TASK-PUBLIC-COUPON-015 Desabilitar CTA de remocao durante pending.
- [ ] TASK-PUBLIC-COUPON-016 Atualizar visual apos refresh sem depender de estado client como fonte de verdade.

## 4. Action de Aplicar Cupom

- [ ] TASK-PUBLIC-COUPON-017 Implementar ou validar `applyCouponAction`.
- [ ] TASK-PUBLIC-COUPON-018 Implementar ou validar `applyCouponStateAction`.
- [ ] TASK-PUBLIC-COUPON-019 Validar FormData com schema de aplicacao de cupom.
- [ ] TASK-PUBLIC-COUPON-020 Retornar `validation_error` para codigo vazio ou formato invalido.
- [ ] TASK-PUBLIC-COUPON-021 Delegar input valido para `applyCouponToActiveCart`.
- [ ] TASK-PUBLIC-COUPON-022 Revalidar paths do carrinho/produtos apos sucesso.
- [ ] TASK-PUBLIC-COUPON-023 Converter resultado de sucesso em mensagem amigavel.
- [ ] TASK-PUBLIC-COUPON-024 Converter `coupon_invalid` em mensagem amigavel.
- [ ] TASK-PUBLIC-COUPON-025 Nao aceitar subtotal, desconto ou couponId vindos do FormData.

## 5. Service de Aplicacao

- [ ] TASK-PUBLIC-COUPON-026 Resolver ator com suporte a guest token.
- [ ] TASK-PUBLIC-COUPON-027 Obter ou criar carrinho ativo para guest/customer.
- [ ] TASK-PUBLIC-COUPON-028 Recalcular carrinho antes da validacao de cupom.
- [ ] TASK-PUBLIC-COUPON-029 Usar subtotal server-side atual.
- [ ] TASK-PUBLIC-COUPON-030 Chamar `validateCouponForCart` com codigo e subtotal.
- [ ] TASK-PUBLIC-COUPON-031 Persistir apenas `coupon.id` validado pelo servidor.
- [ ] TASK-PUBLIC-COUPON-032 Recalcular carrinho apos persistir cupom valido.
- [ ] TASK-PUBLIC-COUPON-033 Retornar carrinho/totais recalculados.
- [ ] TASK-PUBLIC-COUPON-034 Nao alterar `usedCount` ao aplicar cupom.

## 6. Validacao de Cupom

- [ ] TASK-PUBLIC-COUPON-035 Normalizar codigo com trim e uppercase.
- [ ] TASK-PUBLIC-COUPON-036 Buscar cupom por codigo normalizado.
- [ ] TASK-PUBLIC-COUPON-037 Retornar `coupon_not_found` para cupom inexistente.
- [ ] TASK-PUBLIC-COUPON-038 Rejeitar cupom inativo.
- [ ] TASK-PUBLIC-COUPON-039 Rejeitar cupom agendado/futuro.
- [ ] TASK-PUBLIC-COUPON-040 Rejeitar cupom expirado.
- [ ] TASK-PUBLIC-COUPON-041 Rejeitar cupom esgotado.
- [ ] TASK-PUBLIC-COUPON-042 Rejeitar subtotal menor ou igual a zero.
- [ ] TASK-PUBLIC-COUPON-043 Rejeitar subtotal abaixo do minimo.
- [ ] TASK-PUBLIC-COUPON-044 Rejeitar valor percentual fora de 1..100.
- [ ] TASK-PUBLIC-COUPON-045 Rejeitar valor fixo nao positivo.
- [ ] TASK-PUBLIC-COUPON-046 Tratar `free_shipping` como beneficio preparado.
- [ ] TASK-PUBLIC-COUPON-047 Traduzir invalidade para `coupon_invalid` no carrinho.

## 7. Calculo e Recalculo

- [ ] TASK-PUBLIC-COUPON-048 Calcular desconto percentual com arredondamento deterministico.
- [ ] TASK-PUBLIC-COUPON-049 Limitar desconto percentual ao subtotal.
- [ ] TASK-PUBLIC-COUPON-050 Calcular desconto fixo limitado ao subtotal.
- [ ] TASK-PUBLIC-COUPON-051 Garantir desconto zero para `free_shipping` no subtotal de itens.
- [ ] TASK-PUBLIC-COUPON-052 Calcular `partialTotalCents` sem permitir negativo.
- [ ] TASK-PUBLIC-COUPON-053 Revalidar cupom aplicado em `recalculateCartView`.
- [ ] TASK-PUBLIC-COUPON-054 Remover cupom stale quando recalculo retornar cupom invalido/nulo.
- [ ] TASK-PUBLIC-COUPON-055 Preservar mensagens seguras de cupom no resultado do carrinho.

## 8. Action de Remover Cupom

- [ ] TASK-PUBLIC-COUPON-056 Implementar ou validar `removeCouponAction`.
- [ ] TASK-PUBLIC-COUPON-057 Implementar ou validar `removeCouponStateAction`.
- [ ] TASK-PUBLIC-COUPON-058 Resolver ator do carrinho atual.
- [ ] TASK-PUBLIC-COUPON-059 Limpar referencia de cupom aplicado.
- [ ] TASK-PUBLIC-COUPON-060 Recalcular carrinho apos limpar cupom.
- [ ] TASK-PUBLIC-COUPON-061 Revalidar paths do carrinho/produtos apos sucesso.
- [ ] TASK-PUBLIC-COUPON-062 Retornar mensagem "Cupom removido do carrinho." ou equivalente.
- [ ] TASK-PUBLIC-COUPON-063 Tratar carrinho ausente com erro seguro.

## 9. Fallback e Ambiente

- [ ] TASK-PUBLIC-COUPON-064 Permitir fixture/fallback apenas em dev/test sem banco.
- [ ] TASK-PUBLIC-COUPON-065 Retornar `database_unavailable` sem banco fora dev/test.
- [ ] TASK-PUBLIC-COUPON-066 Garantir que fallback nao pareca persistencia real.
- [ ] TASK-PUBLIC-COUPON-067 Nao copiar `.env` para habilitar cupons.
- [ ] TASK-PUBLIC-COUPON-068 Nao expor secrets ou DSN em mensagens de erro.

## 10. Free Shipping

- [ ] TASK-PUBLIC-COUPON-069 Garantir que cupom `free_shipping` aparece como beneficio preparado.
- [ ] TASK-PUBLIC-COUPON-070 Garantir que `free_shipping` nao reduz subtotal de itens.
- [ ] TASK-PUBLIC-COUPON-071 Garantir que frete efetivo e zerado somente quando frete manual elegivel existir.
- [ ] TASK-PUBLIC-COUPON-072 Garantir que quote original de frete nao precisa ser alterada pelo cupom.
- [ ] TASK-PUBLIC-COUPON-073 Testar carrinho com `free_shipping` sem frete selecionado.
- [ ] TASK-PUBLIC-COUPON-074 Testar carrinho com `free_shipping` e frete manual selecionado.

## 11. Testes Unitarios

- [ ] TASK-PUBLIC-COUPON-075 Testar schema de aplicar cupom com codigo valido.
- [ ] TASK-PUBLIC-COUPON-076 Testar schema de aplicar cupom com codigo vazio.
- [ ] TASK-PUBLIC-COUPON-077 Testar normalizacao de codigo.
- [ ] TASK-PUBLIC-COUPON-078 Testar aplicacao de cupom percentual valido.
- [ ] TASK-PUBLIC-COUPON-079 Testar aplicacao de cupom fixo valido.
- [ ] TASK-PUBLIC-COUPON-080 Testar desconto fixo maior que subtotal.
- [ ] TASK-PUBLIC-COUPON-081 Testar cupom inexistente.
- [ ] TASK-PUBLIC-COUPON-082 Testar cupom inativo/futuro/expirado/esgotado.
- [ ] TASK-PUBLIC-COUPON-083 Testar subtotal minimo nao atendido.
- [ ] TASK-PUBLIC-COUPON-084 Testar remocao de cupom.
- [ ] TASK-PUBLIC-COUPON-085 Testar que `usedCount` nao muda ao aplicar/remover.
- [ ] TASK-PUBLIC-COUPON-086 Testar fallback dev/test.
- [ ] TASK-PUBLIC-COUPON-087 Testar bloqueio sem banco fora dev/test.

## 12. Testes de Componente

- [ ] TASK-PUBLIC-COUPON-088 Renderizar painel sem cupom.
- [ ] TASK-PUBLIC-COUPON-089 Renderizar painel com cupom aplicado.
- [ ] TASK-PUBLIC-COUPON-090 Verificar CTA "Aplicar".
- [ ] TASK-PUBLIC-COUPON-091 Verificar CTA "Remover".
- [ ] TASK-PUBLIC-COUPON-092 Verificar mensagens de erro/sucesso.
- [ ] TASK-PUBLIC-COUPON-093 Verificar estado pending desabilitando botoes.
- [ ] TASK-PUBLIC-COUPON-094 Verificar label de `free_shipping`.

## 13. E2E

- [ ] TASK-PUBLIC-COUPON-095 Abrir carrinho publico sem cupom aplicado.
- [ ] TASK-PUBLIC-COUPON-096 Aplicar cupom valido de fixture/mock.
- [ ] TASK-PUBLIC-COUPON-097 Confirmar desconto no resumo.
- [ ] TASK-PUBLIC-COUPON-098 Aplicar cupom invalido e confirmar erro amigavel.
- [ ] TASK-PUBLIC-COUPON-099 Remover cupom aplicado.
- [ ] TASK-PUBLIC-COUPON-100 Confirmar que desconto sai do resumo.
- [ ] TASK-PUBLIC-COUPON-101 Confirmar que fluxo nao cria pedido nem inicia pagamento.

## 14. Guardrails

- [ ] TASK-PUBLIC-COUPON-102 Nao incrementar `usedCount` no carrinho.
- [ ] TASK-PUBLIC-COUPON-103 Nao criar pedido.
- [ ] TASK-PUBLIC-COUPON-104 Nao confirmar pagamento.
- [ ] TASK-PUBLIC-COUPON-105 Nao decrementar estoque.
- [ ] TASK-PUBLIC-COUPON-106 Nao enviar email.
- [ ] TASK-PUBLIC-COUPON-107 Nao rodar migrations.
- [ ] TASK-PUBLIC-COUPON-108 Nao conectar banco de producao em validacao documental.
- [ ] TASK-PUBLIC-COUPON-109 Nao expor secrets.
- [ ] TASK-PUBLIC-COUPON-110 Nao modificar Laravel legado.

## 15. Validacoes Finais

- [ ] TASK-PUBLIC-COUPON-111 Executar `pnpm lint` quando houver alteracao funcional.
- [ ] TASK-PUBLIC-COUPON-112 Executar `pnpm typecheck` quando houver alteracao funcional.
- [ ] TASK-PUBLIC-COUPON-113 Executar `pnpm test` cobrindo dominio, service, action e UI.
- [ ] TASK-PUBLIC-COUPON-114 Executar `pnpm build` antes de concluir feature funcional.
- [ ] TASK-PUBLIC-COUPON-115 Executar `pnpm test:e2e` para fluxo publico de cupom no carrinho.

## 16. Definition of Done

- [ ] TASK-PUBLIC-COUPON-116 Painel sem cupom renderiza corretamente.
- [ ] TASK-PUBLIC-COUPON-117 Painel com cupom aplicado renderiza corretamente.
- [ ] TASK-PUBLIC-COUPON-118 Cupom valido aplica desconto ou beneficio preparado server-side.
- [ ] TASK-PUBLIC-COUPON-119 Cupom invalido falha sem alterar totais.
- [ ] TASK-PUBLIC-COUPON-120 Remocao limpa referencia e recalcula carrinho.
- [ ] TASK-PUBLIC-COUPON-121 Recalculo remove cupom stale.
- [ ] TASK-PUBLIC-COUPON-122 Guest/customer operam apenas no proprio carrinho.
- [ ] TASK-PUBLIC-COUPON-123 `usedCount` permanece inalterado ate settlement financeiro confirmado.
