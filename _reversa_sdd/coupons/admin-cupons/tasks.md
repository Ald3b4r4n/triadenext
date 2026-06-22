# Coupons / Admin Cupons, Tasks

> Checklist executavel da subunit `coupons/admin-cupons`.
> Escopo: actions administrativas, policy, schemas, service, repository, fallback, UI states e testes.

---

## 1. Preparacao

- [ ] TASK-ADMIN-COUPON-001 Confirmar que a rota administrativa de cupons usa somente APIs server-side.
- [ ] TASK-ADMIN-COUPON-002 Confirmar que a pagina ou componente admin nao executa mutacao direta no client.
- [ ] TASK-ADMIN-COUPON-003 Confirmar que contratos de `Coupon`, `CouponView`, `CouponAdminInput` e `CouponMutationResult` estao centralizados.
- [ ] TASK-ADMIN-COUPON-004 Confirmar que esta subunit nao altera aplicacao publica de cupom, checkout, pagamento, estoque ou email.

## 2. Politica e Autorizacao

- [ ] TASK-ADMIN-COUPON-005 Chamar `requireAdminLike` em `listCouponsAction`.
- [ ] TASK-ADMIN-COUPON-006 Chamar `requireAdminLike` em `createCouponAction`.
- [ ] TASK-ADMIN-COUPON-007 Chamar `requireAdminLike` em `updateCouponAction`.
- [ ] TASK-ADMIN-COUPON-008 Garantir que usuario customer nao liste cupons administrativos.
- [ ] TASK-ADMIN-COUPON-009 Garantir que usuario guest nao liste cupons administrativos.
- [ ] TASK-ADMIN-COUPON-010 Garantir que usuario sem permissao nao crie cupom.
- [ ] TASK-ADMIN-COUPON-011 Garantir que usuario sem permissao nao atualize cupom.
- [ ] TASK-ADMIN-COUPON-012 Mapear falha comum de permissao para `forbidden`.
- [ ] TASK-ADMIN-COUPON-013 Mapear bloqueio de policy/ambiente para `blocked`.
- [ ] TASK-ADMIN-COUPON-014 Nao expor detalhes internos da sessao, policy ou runtime em respostas administrativas.

## 3. Listagem Admin

- [ ] TASK-ADMIN-COUPON-015 Implementar ou validar `listCouponsAction`.
- [ ] TASK-ADMIN-COUPON-016 Delegar listagem autorizada para `listAdminCoupons`.
- [ ] TASK-ADMIN-COUPON-017 Garantir que `listAdminCoupons` retorna `CouponView[]`.
- [ ] TASK-ADMIN-COUPON-018 Garantir ordenacao previsivel por codigo.
- [ ] TASK-ADMIN-COUPON-019 Exibir tambem cupons inativos, agendados, expirados e esgotados no admin.
- [ ] TASK-ADMIN-COUPON-020 Garantir que a listagem admin nao aplica filtro publico de elegibilidade.
- [ ] TASK-ADMIN-COUPON-021 Tratar lista vazia com estado amigavel.
- [ ] TASK-ADMIN-COUPON-022 Tratar erro seguro de ambiente/banco sem stack trace.

## 4. Criacao Admin

- [ ] TASK-ADMIN-COUPON-023 Implementar ou validar `createCouponAction`.
- [ ] TASK-ADMIN-COUPON-024 Converter `FormData` para objeto bruto antes do schema.
- [ ] TASK-ADMIN-COUPON-025 Validar input com schema administrativo antes do service.
- [ ] TASK-ADMIN-COUPON-026 Retornar `validation_error` quando schema falhar.
- [ ] TASK-ADMIN-COUPON-027 Normalizar codigo antes de persistir ou gravar fallback.
- [ ] TASK-ADMIN-COUPON-028 Delegar criacao autorizada para `createAdminCoupon`.
- [ ] TASK-ADMIN-COUPON-029 Garantir que `createAdminCoupon` chama repository e converte resultado para view.
- [ ] TASK-ADMIN-COUPON-030 Revalidar `/admin/cupons` apos criacao bem-sucedida.
- [ ] TASK-ADMIN-COUPON-031 Redirecionar form action somente apos `success` ou `dev_fallback`.

## 5. Atualizacao Admin

- [ ] TASK-ADMIN-COUPON-032 Implementar ou validar `updateCouponAction`.
- [ ] TASK-ADMIN-COUPON-033 Validar id de cupom antes de delegar para repository.
- [ ] TASK-ADMIN-COUPON-034 Converter `FormData` para objeto bruto antes do schema.
- [ ] TASK-ADMIN-COUPON-035 Validar input com o mesmo schema administrativo de criacao.
- [ ] TASK-ADMIN-COUPON-036 Retornar `validation_error` quando schema falhar.
- [ ] TASK-ADMIN-COUPON-037 Delegar atualizacao autorizada para `updateAdminCoupon`.
- [ ] TASK-ADMIN-COUPON-038 Garantir que update de id inexistente retorna erro seguro.
- [ ] TASK-ADMIN-COUPON-039 Revalidar `/admin/cupons` apos atualizacao bem-sucedida.
- [ ] TASK-ADMIN-COUPON-040 Redirecionar form action somente apos `success` ou `dev_fallback`.

## 6. Schema e Parse

- [ ] TASK-ADMIN-COUPON-041 Validar `code` como string obrigatoria.
- [ ] TASK-ADMIN-COUPON-042 Aplicar trim e limite maximo de 64 caracteres ao codigo.
- [ ] TASK-ADMIN-COUPON-043 Aceitar apenas `percentage`, `fixed_amount` e `free_shipping`.
- [ ] TASK-ADMIN-COUPON-044 Validar percentual maior que 0 e menor ou igual a 100.
- [ ] TASK-ADMIN-COUPON-045 Validar valor fixo como inteiro positivo.
- [ ] TASK-ADMIN-COUPON-046 Validar `free_shipping` como beneficio preparado sem desconto direto de itens.
- [ ] TASK-ADMIN-COUPON-047 Converter checkbox `isActive` para boolean.
- [ ] TASK-ADMIN-COUPON-048 Converter datas vazias para `null`.
- [ ] TASK-ADMIN-COUPON-049 Rejeitar datas invalidas antes de chamar repository.
- [ ] TASK-ADMIN-COUPON-050 Validar coerencia opcional entre `startsAt` e `endsAt`.
- [ ] TASK-ADMIN-COUPON-051 Validar `maxUses` como inteiro positivo quando informado.
- [ ] TASK-ADMIN-COUPON-052 Validar `minimumSubtotalCents` como inteiro nao negativo quando informado.
- [ ] TASK-ADMIN-COUPON-053 Retornar field errors estaveis para a UI.

## 7. Repository Drizzle

- [ ] TASK-ADMIN-COUPON-054 Garantir que listagem Drizzle ordena por codigo.
- [ ] TASK-ADMIN-COUPON-055 Garantir que criacao Drizzle chama `assertCanMutateRealData`.
- [ ] TASK-ADMIN-COUPON-056 Garantir que atualizacao Drizzle chama `assertCanMutateRealData`.
- [ ] TASK-ADMIN-COUPON-057 Converter input administrativo para row de insert com tipos corretos.
- [ ] TASK-ADMIN-COUPON-058 Converter input administrativo para row de update com `updatedAt`.
- [ ] TASK-ADMIN-COUPON-059 Retornar `blocked` quando guardrail negar mutacao real.
- [ ] TASK-ADMIN-COUPON-060 Retornar erro seguro quando update nao encontra cupom.
- [ ] TASK-ADMIN-COUPON-061 Traduzir erros de banco esperados para mensagens seguras.
- [ ] TASK-ADMIN-COUPON-062 Nao vazar SQL, DSN, stack trace ou constraint interna.

## 8. Repository Fallback

- [ ] TASK-ADMIN-COUPON-063 Garantir que fallback inicializa a partir de `devCoupons`.
- [ ] TASK-ADMIN-COUPON-064 Garantir que fallback lista cupons em ordem previsivel.
- [ ] TASK-ADMIN-COUPON-065 Garantir que fallback cria id previsivel `coupon-dev-{codigo}`.
- [ ] TASK-ADMIN-COUPON-066 Garantir que fallback atualiza Map em memoria.
- [ ] TASK-ADMIN-COUPON-067 Retornar status `dev_fallback` em criacao sem banco dev/test.
- [ ] TASK-ADMIN-COUPON-068 Retornar status `dev_fallback` em atualizacao sem banco dev/test.
- [ ] TASK-ADMIN-COUPON-069 Exibir mensagem clara de ausencia de persistencia real.
- [ ] TASK-ADMIN-COUPON-070 Bloquear fallback silencioso fora de dev/test.
- [ ] TASK-ADMIN-COUPON-071 Documentar que fallback de update pode reiniciar `usedCount`.

## 9. UI Administrativa

- [ ] TASK-ADMIN-COUPON-072 Exibir nome/codigo do cupom.
- [ ] TASK-ADMIN-COUPON-073 Exibir tipo e label de valor.
- [ ] TASK-ADMIN-COUPON-074 Exibir status calculado: ativo, inativo, agendado, expirado ou esgotado.
- [ ] TASK-ADMIN-COUPON-075 Exibir limite de uso e contador de uso.
- [ ] TASK-ADMIN-COUPON-076 Exibir subtotal minimo quando configurado.
- [ ] TASK-ADMIN-COUPON-077 Exibir janela de validade quando configurada.
- [ ] TASK-ADMIN-COUPON-078 Exibir aviso visual para fallback dev/test.
- [ ] TASK-ADMIN-COUPON-079 Exibir erro de permissao sem detalhes internos.
- [ ] TASK-ADMIN-COUPON-080 Exibir erro de validacao por campo.
- [ ] TASK-ADMIN-COUPON-081 Exibir estado vazio quando nao houver cupons.
- [ ] TASK-ADMIN-COUPON-082 Manter navegacao admin sem expor checkout ou pagamento direto.

## 10. Integracao com Outras Units

- [ ] TASK-ADMIN-COUPON-083 Nao aplicar cupom ao carrinho a partir da tela admin.
- [ ] TASK-ADMIN-COUPON-084 Nao incrementar `usedCount` em criacao ou edicao admin.
- [ ] TASK-ADMIN-COUPON-085 Nao alterar snapshots de checkout por edicao posterior de cupom.
- [ ] TASK-ADMIN-COUPON-086 Nao modificar pedido, pagamento, estoque ou notificacoes nesta subunit.
- [ ] TASK-ADMIN-COUPON-087 Garantir que cupom `free_shipping` permanece beneficio preparado para o carrinho.

## 11. Testes Unitarios

- [ ] TASK-ADMIN-COUPON-088 Testar `listCouponsAction` com admin-like.
- [ ] TASK-ADMIN-COUPON-089 Testar `listCouponsAction` sem permissao.
- [ ] TASK-ADMIN-COUPON-090 Testar `createCouponAction` com input valido.
- [ ] TASK-ADMIN-COUPON-091 Testar `createCouponAction` com percentual invalido.
- [ ] TASK-ADMIN-COUPON-092 Testar `createCouponAction` com valor fixo invalido.
- [ ] TASK-ADMIN-COUPON-093 Testar `createCouponAction` com codigo vazio.
- [ ] TASK-ADMIN-COUPON-094 Testar `updateCouponAction` com input valido.
- [ ] TASK-ADMIN-COUPON-095 Testar `updateCouponAction` com id inexistente.
- [ ] TASK-ADMIN-COUPON-096 Testar parse de datas vazias como `null`.
- [ ] TASK-ADMIN-COUPON-097 Testar rejeicao de datas invalidas.
- [ ] TASK-ADMIN-COUPON-098 Testar field errors de schema.
- [ ] TASK-ADMIN-COUPON-099 Testar revalidate apos mutacao bem-sucedida.

## 12. Testes de Repository

- [ ] TASK-ADMIN-COUPON-100 Testar listagem fallback ordenada.
- [ ] TASK-ADMIN-COUPON-101 Testar criacao fallback com status `dev_fallback`.
- [ ] TASK-ADMIN-COUPON-102 Testar atualizacao fallback com status `dev_fallback`.
- [ ] TASK-ADMIN-COUPON-103 Testar bloqueio de fallback fora de dev/test.
- [ ] TASK-ADMIN-COUPON-104 Testar guardrail bloqueando criacao Drizzle.
- [ ] TASK-ADMIN-COUPON-105 Testar guardrail bloqueando atualizacao Drizzle.
- [ ] TASK-ADMIN-COUPON-106 Testar update Drizzle de id inexistente.

## 13. E2E

- [ ] TASK-ADMIN-COUPON-107 Validar que admin acessa `/admin/cupons`.
- [ ] TASK-ADMIN-COUPON-108 Validar que customer/guest nao acessa `/admin/cupons`.
- [ ] TASK-ADMIN-COUPON-109 Validar criacao de cupom valido em ambiente de teste.
- [ ] TASK-ADMIN-COUPON-110 Validar exibicao de erro para cupom invalido.
- [ ] TASK-ADMIN-COUPON-111 Validar edicao de cupom existente.
- [ ] TASK-ADMIN-COUPON-112 Validar que carrinho publico nao e alterado pela simples edicao admin.

## 14. Guardrails

- [ ] TASK-ADMIN-COUPON-113 Nao rodar migrations durante esta subunit documental.
- [ ] TASK-ADMIN-COUPON-114 Nao conectar banco de producao.
- [ ] TASK-ADMIN-COUPON-115 Nao copiar `.env`.
- [ ] TASK-ADMIN-COUPON-116 Nao expor secrets em docs, logs, fixtures ou mensagens.
- [ ] TASK-ADMIN-COUPON-117 Nao alterar regras de pagamento.
- [ ] TASK-ADMIN-COUPON-118 Nao alterar regras de estoque.
- [ ] TASK-ADMIN-COUPON-119 Nao alterar regras de pedido.
- [ ] TASK-ADMIN-COUPON-120 Nao alterar envio de email.
- [ ] TASK-ADMIN-COUPON-121 Nao modificar Laravel legado.

## 15. Validacoes Finais

- [ ] TASK-ADMIN-COUPON-122 Executar `pnpm lint` quando houver alteracao funcional.
- [ ] TASK-ADMIN-COUPON-123 Executar `pnpm typecheck` quando houver alteracao funcional.
- [ ] TASK-ADMIN-COUPON-124 Executar `pnpm test` cobrindo actions, schema e repository.
- [ ] TASK-ADMIN-COUPON-125 Executar `pnpm build` antes de concluir feature funcional.
- [ ] TASK-ADMIN-COUPON-126 Executar `pnpm test:e2e` para fluxo admin minimo.

## 16. Definition of Done

- [ ] TASK-ADMIN-COUPON-127 Listagem admin protegida e testada.
- [ ] TASK-ADMIN-COUPON-128 Criacao admin protegida, validada e testada.
- [ ] TASK-ADMIN-COUPON-129 Atualizacao admin protegida, validada e testada.
- [ ] TASK-ADMIN-COUPON-130 Fallback dev/test explicito e bloqueado fora de dev/test.
- [ ] TASK-ADMIN-COUPON-131 Guardrail de mutacao real respeitado.
- [ ] TASK-ADMIN-COUPON-132 UI admin representa estados principais sem vazar detalhes internos.
- [ ] TASK-ADMIN-COUPON-133 Nenhuma regra de carrinho, checkout, pagamento, estoque ou email foi alterada indevidamente.
