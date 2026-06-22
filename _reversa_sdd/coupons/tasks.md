# Coupons, Tasks

> Checklist executavel da unit `coupons`.
> Escopo: dominio, validacao, calculo, persistencia, fallback seguro, administracao e integracao com carrinho/checkout.
> Fora de escopo: pagamento real, consumo antecipado de cupom, migrations reais, exposicao de secrets e qualquer escrita no Laravel legado.

---

## 1. Dominio e Contratos

- [ ] TASK-COUPON-001 Mapear os tipos publicos de cupom usados pelo dominio: percentual, valor fixo e frete gratis.
- [ ] TASK-COUPON-002 Garantir que todo cupom carregado para uso publico tenha identificador, codigo normalizado, tipo, valor, janela de validade, limite de uso, contador de uso e status operacional.
- [ ] TASK-COUPON-003 Separar claramente contratos de leitura publica, contratos administrativos e contratos internos de persistencia.

## 2. Normalizacao e Estado

- [ ] TASK-COUPON-004 Normalizar codigo de cupom com `trim`, uppercase e rejeicao de string vazia.
- [ ] TASK-COUPON-005 Mapear tipos legados/atuais para um enum canonico sem aceitar variantes ambiguas em runtime.
- [ ] TASK-COUPON-006 Considerar cupom ativo somente quando `isActive` for verdadeiro e o horario atual estiver dentro da janela de validade.
- [ ] TASK-COUPON-007 Classificar estados nao aplicaveis como inativo, agendado, expirado, esgotado ou invalido, sem vazar detalhes internos desnecessarios ao cliente.
- [ ] TASK-COUPON-008 Tratar `maxUses` nulo como uso ilimitado e `usedCount >= maxUses` como esgotado.

## 3. Validacao Publica

- [ ] TASK-COUPON-009 Retornar `coupon_not_found` quando o codigo nao existir ou nao estiver disponivel para uso publico.
- [ ] TASK-COUPON-010 Rejeitar validacao com subtotal menor ou igual a zero.
- [ ] TASK-COUPON-011 Respeitar subtotal minimo antes de calcular desconto.
- [ ] TASK-COUPON-012 Rejeitar cupom percentual fora da faixa aceita pelo dominio.
- [ ] TASK-COUPON-013 Rejeitar cupom de valor fixo com valor menor ou igual a zero.
- [ ] TASK-COUPON-014 Rejeitar cupom de frete gratis com configuracao numerica invalida.
- [ ] TASK-COUPON-015 Retornar mensagens seguras e estaveis para erros esperados de cupom.

## 4. Calculo de Desconto

- [ ] TASK-COUPON-016 Calcular desconto percentual a partir do subtotal de itens, com arredondamento deterministico em centavos.
- [ ] TASK-COUPON-017 Limitar desconto percentual ao subtotal para impedir total negativo.
- [ ] TASK-COUPON-018 Calcular desconto de valor fixo em centavos e limitar ao subtotal elegivel.
- [ ] TASK-COUPON-019 Representar cupom de frete gratis sem desconto direto de itens, delegando o beneficio de frete ao fluxo de carrinho/frete.
- [ ] TASK-COUPON-020 Produzir resultado de calculo com `isValid`, `discountAmount`, `message`, `coupon` e metadados suficientes para snapshot.
- [ ] TASK-COUPON-021 Garantir que o calculo seja puro e testavel, sem acesso direto a banco ou sessao.

## 5. Service

- [ ] TASK-COUPON-022 Implementar busca por codigo normalizado em service/repository existente.
- [ ] TASK-COUPON-023 Implementar busca por id com retorno nulo seguro quando o cupom nao existir.
- [ ] TASK-COUPON-024 Validar cupom para carrinho usando subtotal server-side e estado atual do cupom.
- [ ] TASK-COUPON-025 Calcular cupom aplicado a partir do snapshot do carrinho sem reabrir regra administrativa.
- [ ] TASK-COUPON-026 Expor operacoes administrativas de listar, criar e atualizar apenas via service protegido.
- [ ] TASK-COUPON-027 Impedir uso silencioso de fallback em ambiente de producao.

## 6. Repository Drizzle e Fallback

- [ ] TASK-COUPON-028 Selecionar repository Drizzle apenas quando houver conexao configurada e permitida.
- [ ] TASK-COUPON-029 Usar fallback explicito em dev/test quando nao houver `DATABASE_URL`.
- [ ] TASK-COUPON-030 Manter fixtures/fallback em memoria isolada, sem persistencia acidental e sem secrets.
- [ ] TASK-COUPON-031 No fallback, listar cupons em ordem previsivel para testes e desenvolvimento.
- [ ] TASK-COUPON-032 No fallback, criar e atualizar cupons com mensagens explicitas de ambiente de desenvolvimento.
- [ ] TASK-COUPON-033 No fallback, simular incremento de uso apenas quando chamado pelo fluxo de settlement/teste.
- [ ] TASK-COUPON-034 No Drizzle, buscar cupom por codigo normalizado com filtro consistente de unicidade.
- [ ] TASK-COUPON-035 No Drizzle, listar cupons administrativos com ordenacao estavel.
- [ ] TASK-COUPON-036 No Drizzle, proteger criacao/atualizacao com guardrail de mutacao real.
- [ ] TASK-COUPON-037 No Drizzle, tratar update de cupom inexistente sem excecao crua para a UI.
- [ ] TASK-COUPON-038 No Drizzle, incrementar uso de forma atomica durante settlement confirmado.

## 7. Admin

- [ ] TASK-COUPON-039 Exigir permissao admin-like para listar cupons no painel.
- [ ] TASK-COUPON-040 Exigir permissao admin-like para criar cupom.
- [ ] TASK-COUPON-041 Exigir permissao admin-like para atualizar cupom.
- [ ] TASK-COUPON-042 Validar codigo com tamanho minimo, tamanho maximo e caracteres previsiveis.
- [ ] TASK-COUPON-043 Validar combinacao entre tipo e valor do cupom.
- [ ] TASK-COUPON-044 Validar datas opcionais sem aceitar intervalos invertidos.
- [ ] TASK-COUPON-045 Validar `maxUses` e `minimumSubtotal` como inteiros nao negativos em centavos.
- [ ] TASK-COUPON-046 Revalidar rota administrativa de cupons apos criacao ou atualizacao bem-sucedida.
- [ ] TASK-COUPON-047 Redirecionar formulario administrativo apenas em sucesso confirmado.
- [ ] TASK-COUPON-048 Exibir erros de validacao administrativa sem stack trace, SQL ou dados sensiveis.

## 8. Integracao com Carrinho e Checkout

- [ ] TASK-COUPON-049 Aplicar cupom ao carrinho somente depois de recalcular subtotal server-side.
- [ ] TASK-COUPON-050 Remover ou invalidar cupom aplicado quando o carrinho deixar de atender aos criterios.
- [ ] TASK-COUPON-051 Preservar snapshot do cupom aplicado no pedido pendente criado pelo checkout.
- [ ] TASK-COUPON-052 Nao incrementar `usedCount` ao aplicar cupom no carrinho.
- [ ] TASK-COUPON-053 Nao incrementar `usedCount` ao criar pedido aguardando pagamento.
- [ ] TASK-COUPON-054 Incrementar `usedCount` somente depois de settlement financeiro confirmado.
- [ ] TASK-COUPON-055 Coordenar cupom de frete gratis com regra de frete sem zerar custos inelegiveis por engano.
- [ ] TASK-COUPON-056 Garantir que falha de cupom nao altere pagamento, estoque ou estado de pedido ja confirmado.

## 9. Testes Unitarios e de Integracao

- [ ] TASK-COUPON-057 Testar normalizacao de codigo.
- [ ] TASK-COUPON-058 Testar classificacao de cupom ativo, inativo, agendado, expirado e esgotado.
- [ ] TASK-COUPON-059 Testar subtotal minimo.
- [ ] TASK-COUPON-060 Testar desconto percentual com arredondamento e limite ao subtotal.
- [ ] TASK-COUPON-061 Testar desconto fixo limitado ao subtotal.
- [ ] TASK-COUPON-062 Testar cupom de frete gratis sem desconto direto de itens.
- [ ] TASK-COUPON-063 Testar retorno seguro para cupom inexistente.
- [ ] TASK-COUPON-064 Testar service sem banco em dev/test com fallback explicito.
- [ ] TASK-COUPON-065 Testar que fallback nao e aceito em producao.
- [ ] TASK-COUPON-066 Testar actions administrativas com usuario sem permissao.
- [ ] TASK-COUPON-067 Testar validacoes de formulario administrativo.
- [ ] TASK-COUPON-068 Testar incremento de uso somente no ponto de settlement.

## 10. E2E e Regressao

- [ ] TASK-COUPON-069 Validar que usuario consegue aplicar cupom publico valido no carrinho.
- [ ] TASK-COUPON-070 Validar que cupom invalido exibe mensagem amigavel.
- [ ] TASK-COUPON-071 Validar que subtotal abaixo do minimo bloqueia aplicacao.
- [ ] TASK-COUPON-072 Validar que checkout usa snapshot do cupom sem recalculo client-side.
- [ ] TASK-COUPON-073 Validar que painel admin de cupons nao abre para usuario sem permissao.
- [ ] TASK-COUPON-074 Validar que painel admin permite criar/editar cupom em ambiente seguro de teste.

## 11. Guardrails

- [ ] TASK-COUPON-075 Nao conectar banco real durante execucao documental do Reversa.
- [ ] TASK-COUPON-076 Nao rodar migrations como parte desta spec.
- [ ] TASK-COUPON-077 Nao enviar emails nem acionar pagamentos em testes de cupom.
- [ ] TASK-COUPON-078 Nao copiar `.env` nem registrar secrets em logs ou fixtures.
- [ ] TASK-COUPON-079 Nao alterar regras de Stripe, pedidos ou estoque fora dos pontos de integracao definidos.
- [ ] TASK-COUPON-080 Nao permitir total negativo por combinacao de cupom, frete e subtotal.
- [ ] TASK-COUPON-081 Nao consumir cupom em aplicacao de carrinho, somente em settlement confirmado.
- [ ] TASK-COUPON-082 Nao expor cupom draft, futuro, inativo ou esgotado em fluxos publicos.

## 12. Validacoes Finais

- [ ] TASK-COUPON-083 Executar `pnpm lint` quando houver alteracao funcional.
- [ ] TASK-COUPON-084 Executar `pnpm typecheck` quando houver alteracao funcional.
- [ ] TASK-COUPON-085 Executar `pnpm test` cobrindo dominio, service, repository e admin actions.
- [ ] TASK-COUPON-086 Executar `pnpm build` antes de concluir feature funcional.
- [ ] TASK-COUPON-087 Executar `pnpm test:e2e` para fluxo publico e administrativo minimo.
- [ ] TASK-COUPON-088 Atualizar regression-watch da feature forward que consumir esta spec.

## 13. Definition of Done

- [ ] TASK-COUPON-089 Cupom publico valido e calculado server-side.
- [ ] TASK-COUPON-090 Cupons invalidos falham de forma amigavel e segura.
- [ ] TASK-COUPON-091 Admin de cupons protegido por permissao.
- [ ] TASK-COUPON-092 Fallback dev/test explicito e bloqueado em producao.
- [ ] TASK-COUPON-093 Integrao com carrinho, checkout e settlement preserva invariantes financeiras.
- [ ] TASK-COUPON-094 Testes cobrem regras criticas e regressao do fluxo publico.
