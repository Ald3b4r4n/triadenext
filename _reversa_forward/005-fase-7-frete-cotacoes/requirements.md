# Requirements: Fase 7 — Frete e Cotações no Carrinho

> Identificador: `005-fase-7-frete-cotacoes`
> Data: `2026-06-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Projeto atual: `D:\Projetos\triade-essenza-next`
> Projeto legado consultado apenas em leitura: `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo executivo

A Fase 7 deve preparar cotação e seleção de frete no carrinho da Tríade Essenza Next, para visitantes e clientes autenticados, sem criar checkout, pagamento, Stripe, pedido, reserva ou baixa de estoque. A feature deve permitir informar destino mínimo, obter opções de frete em modo seguro, selecionar uma opção no carrinho, persistir a seleção quando houver banco real e atualizar o total parcial com frete. O desenho deve preservar ownership server-side, fallback explícito sem credenciais e paridade conceitual com o legado, onde frete integra o cálculo do carrinho antes do checkout.

## 2. Contexto

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#9-carrinho-e-sessao-de-compra` | Carrinho atual é server-only, usa guest token opaco ou `session.userId`, não aceita owner do cliente e mantém checkout/frete/pedido fora do escopo até Fase 6. | 🟢 |
| `_reversa_sdd/architecture.md#10-cupons-e-descontos-no-carrinho` | Carrinho já expõe cupom, desconto e `partialTotalCents`; `free_shipping` está modelado, mas não aplica frete real. | 🟢 |
| `_reversa_sdd/domain.md#8-carrinho` | Subtotal vem de snapshots em centavos, produto comprável exige publicado/vigente/estoque, e ownership é resolvido no servidor. | 🟢 |
| `_reversa_sdd/domain.md#10-cupons-e-descontos` | Desconto nunca excede subtotal, total parcial atual é `subtotalCents - discountCents`, e cupom é revalidado ao recalcular carrinho. | 🟢 |
| `_reversa_sdd/data-dictionary.md#addresses` | Tabela `addresses` já está preparada com `postal_code`, cidade, estado, país e marcador de endereço padrão de entrega. | 🟢 |
| `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | Schema já modela `shipping_rules`, mas frete real ainda não foi ativado. | 🟢 |
| `_reversa_sdd/permissions.md#carrinho` | Acesso cruzado a carrinho deve ser bloqueado; admin/manager não têm bypass de estoque ou ownership no carrinho. | 🟢 |
| `_reversa_sdd/state-machines.md#cupom-no-carrinho` | Estado `prepared/free_shipping` retorna mensagem controlada e não calcula nem zera frete real na Fase 6. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\cart\requirements.md` | Legado calcula subtotal, desconto, frete e total no carrinho. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\shipping\requirements.md` | Legado possui providers manual, Correios, Jadlog e Melhor Envio; checkout exige cotação selecionada válida, não expirada e coerente com carrinho/CEP. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\data-dictionary.md` | Legado possui `shipping_options` e `shipping_quotes` com provider, carrier, service, preço, prazo, CEP de origem/destino, expiração, metadata e flag de seleção. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\gaps.md` | Escopo real dos provedores de frete exigia decisão; para a Fase 7, a decisão humana fixa MVP manual, com Correios, Jadlog e Melhor Envio apenas preparados. | 🟢 |

## 3. Escopo

- Cotação de frete no carrinho usando destino mínimo informado pelo usuário.
- Normalização e validação de CEP/destino para cotação.
- Modelo conceitual de cotação de frete com provider, carrier, service, preço, prazo, expiração e origem explícita.
- Modelo conceitual de opção de frete selecionável no carrinho.
- Persistência server-side da opção selecionada quando houver banco real.
- Fallback controlado em desenvolvimento/teste sem `DATABASE_URL` ou sem credenciais externas.
- Cálculo de `shippingAmountCents` e `partialTotalWithShippingCents = subtotalCents - discountCents + shippingAmountCents`.
- Invalidação ou recálculo de frete quando itens, destino ou cupom mudarem.
- Integração segura com cupom `free_shipping`, aplicando benefício real apenas sobre frete manual calculado nesta fase.
- UI mínima em `/carrinho` para informar CEP, listar opções, selecionar frete e exibir subtotal, desconto, frete e total parcial com frete.
- Admin básico de regras manuais de frete como fundação mínima protegida por admin/manager.
- Testes unitários, integração/server actions, e2e e documentação da futura implementação.

## 4. Fora de escopo

- Checkout real.
- Pagamento, Stripe ou captura de pagamento.
- Criação de pedido.
- Reserva ou baixa definitiva de estoque.
- Consumo de cupom ou incremento de `usedCount`.
- Emissão fiscal, Bling, etiqueta de envio, rastreio ou webhook de transportadora.
- Chamada a API externa real; Correios, Jadlog e Melhor Envio ficam apenas preparados e inativos nesta fase.
- Migração contra banco real sem validação humana explícita.
- Deploy ou push.
- Leitura, cópia ou exposição de `.env`, `DATABASE_URL`, cookies, tokens, chaves de transportadora ou credenciais.
- Reescrita do Laravel legado.

## 5. Regras de negócio herdadas

1. **RN-HER-01:** Carrinho calcula subtotal em centavos a partir dos itens válidos. 🟢
   - Fonte: `_reversa_sdd/domain.md#8-carrinho`
2. **RN-HER-02:** Cupom calcula desconto em centavos e desconto não pode exceder subtotal. 🟢
   - Fonte: `_reversa_sdd/domain.md#10-cupons-e-descontos`
3. **RN-HER-03:** Total parcial atual é `subtotalCents - discountCents`. 🟢
   - Fonte: `_reversa_sdd/domain.md#10-cupons-e-descontos`
4. **RN-HER-04:** Produto indisponível, `draft`, `inactive`, futuro, sem estoque ou acima do estoque não pode compor carrinho comprável. 🟢
   - Fonte: `_reversa_sdd/domain.md#8-carrinho`
5. **RN-HER-05:** Carrinho anônimo usa `guestCartToken` opaco; carrinho autenticado usa `session.userId`. 🟢
   - Fonte: `_reversa_sdd/permissions.md#carrinho`
6. **RN-HER-06:** Cliente, visitante, admin e manager só podem operar o carrinho resolvido pelo próprio token/sessão. 🟢
   - Fonte: `_reversa_sdd/permissions.md#carrinho`
7. **RN-HER-07:** `free_shipping` foi modelado na Fase 6, mas não aplicava frete real. 🟢
   - Fonte: `_reversa_sdd/state-machines.md#cupom-no-carrinho`
8. **RN-HER-08:** Checkout, pagamento, pedido, reserva e baixa de estoque permanecem fora do domínio implementado. 🟢
   - Fonte: `_reversa_sdd/domain.md#11-checkout-fora-de-escopo`

## 6. Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O carrinho deve permitir informar CEP ou destino mínimo para cotação de frete. | Must | Usuário informa destino, o servidor valida e retorna sucesso ou erro controlado. | 🟢 |
| RF-02 | O sistema deve normalizar o CEP antes de cotar, armazenar ou comparar cotações. | Must | CEP com máscara e sem máscara gera a mesma forma canônica aceita. | 🟡 |
| RF-03 | O sistema deve rejeitar destino inválido, vazio ou incompleto para o modo de cotação escolhido. | Must | Entrada inválida não gera opção de frete nem altera seleção existente. | 🟢 |
| RF-04 | O sistema deve calcular cotação apenas no servidor. | Must | Payload cliente não define preço, prazo, provider confiável, owner, cartId ou total. | 🟢 |
| RF-05 | O sistema deve retornar uma lista de opções de frete permitidas pela fase. | Must | Cada opção possui identificador opaco, provider, carrier/service, preço em centavos, prazo textual ou numérico e origem explícita. | 🟡 |
| RF-06 | O usuário deve selecionar uma opção de frete no carrinho resolvido server-side. | Must | Seleção válida atualiza o carrinho e a view exibe frete escolhido. | 🟢 |
| RF-07 | O sistema deve persistir a opção selecionada no carrinho quando `DATABASE_URL` estiver disponível. | Must | Reabrir o carrinho autenticado mantém seleção válida enquanto ela não expirar nem for invalidada. | 🟡 |
| RF-08 | O sistema deve ter comportamento explícito sem `DATABASE_URL`. | Must | Dev/test indicam fixture/mock sem persistência real; preview/prod falham seguro para mutações reais. | 🟢 |
| RF-09 | O sistema deve preparar adapters de provedores externos sem chamar APIs reais nesta fase. | Must | Melhor Envio, Jadlog e Correios ficam desacoplados, documentados e inativos em runtime. | 🟢 |
| RF-10 | O sistema deve implementar frete manual como provedor MVP. | Must | Regra manual por UF e/ou faixa de CEP gera opção marcada como manual, com valor em centavos e prazo estimado. | 🟢 |
| RF-11 | O sistema deve recalcular o total parcial com frete. | Must | `partialTotalWithShippingCents = subtotalCents - discountCents + shippingAmountCents`. | 🟢 |
| RF-12 | O sistema deve invalidar ou recalcular frete quando itens do carrinho mudarem. | Must | Add/update/remove/clear item remove ou atualiza seleção de frete conforme regra definida. | 🟢 |
| RF-13 | O sistema deve invalidar ou recalcular frete quando CEP/destino mudar. | Must | Alterar destino impede manter cotação de CEP anterior. | 🟢 |
| RF-14 | O sistema deve revalidar frete quando cupom mudar. | Must | Aplicar/remover cupom recalcula total e trata `free_shipping` como benefício restrito ao frete manual calculado. | 🟢 |
| RF-15 | O sistema deve aplicar cupom `free_shipping` somente sobre frete manual calculado na Fase 7. | Must | Cupom elegível zera apenas `shippingAmountCents` do frete manual, mantém subtotal/desconto monetário e não cria pedido. | 🟢 |
| RF-16 | A UI do carrinho deve exibir subtotal, desconto, frete e total parcial com frete. | Must | Valores exibidos vêm da view server-side e são formatados em BRL. | 🟢 |
| RF-17 | A UI do carrinho deve comunicar claramente modo fallback/mock. | Must | Usuário não interpreta fixture como preço/prazo real de transportadora. | 🟢 |
| RF-18 | Admin básico de regras manuais deve existir como fundação mínima. | Must | Admin/manager conseguem listar, criar e editar regra manual mínima, protegido por `requireAdminLike`. | 🟢 |
| RF-19 | O sistema deve documentar adapters futuros de Correios, Jadlog e Melhor Envio como inativos na Fase 7. | Must | Documentação explica que adapters externos não rodam em runtime, não exigem credenciais e não geram cotação real nesta fase. | 🟢 |
| RF-20 | O sistema deve manter checkout desabilitado/fora de fluxo. | Must | Selecionar frete não cria checkout, pedido, pagamento, Stripe, reserva ou baixa de estoque. | 🟢 |

## 7. Requisitos não funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Frete deve ser calculado e selecionado server-side, sem confiar em valores enviados pelo cliente. | Mesmo padrão de carrinho/cupom em `_reversa_sdd/permissions.md#carrinho` e `_reversa_sdd/permissions.md#cupons`. | 🟢 |
| Privacidade | CEP/endereço de cotação não deve ser gravado em cookie nem exposto em logs sensíveis. | Cookie de carrinho atual guarda apenas token opaco. | 🟢 |
| Resiliência | A ausência de credenciais externas não bloqueia a fase; a feature usa regra manual ou fixture explícita conforme ambiente. | Guardrail de fallback em `_reversa_sdd/domain.md#7-persistencia-e-fallback`. | 🟢 |
| Desempenho | Cotação deve evitar chamadas externas repetidas para o mesmo carrinho/destino enquanto a cotação estiver válida. | Legado usa `shipping_quotes` com `expires_at` e `cart_hash`. | 🟡 |
| Consistência | Valores monetários devem permanecer em centavos no domínio. | Preço, subtotal e desconto já usam centavos. | 🟢 |
| Observabilidade | Erros de provider devem ser classificados sem expor payloads, tokens ou secrets. | Runtime atual centraliza mensagens seguras. | 🟢 |
| UX | Interface deve diferenciar frete real, regra manual e fixture/mock. | Regra obrigatória para não fingir cotação real em fallback. | 🟢 |

## 8. Requisitos de segurança

- RS-01: Server actions de frete não devem aceitar `cartId`, `userId`, owner, role, subtotal, desconto, frete, total, provider confiável ou prazo confiável vindos do cliente.
- RS-02: Seleção de frete deve validar que a cotação pertence ao carrinho resolvido por `guestCartToken` ou `session.userId`.
- RS-03: Usuário autenticado não deve selecionar frete de carrinho de outro usuário.
- RS-04: Visitante não deve selecionar frete de outro `guestCartToken`.
- RS-05: Admin/manager usando carrinho não devem ganhar bypass de ownership, estoque, destino ou preço.
- RS-06: Tokens de Melhor Envio, Jadlog, Correios, cookies, `DATABASE_URL` e quaisquer credenciais não devem aparecer em UI, logs, erros ou documentação com valores reais.
- RS-07: Provider externo real não deve ser chamado nesta fase; adapters de Correios, Jadlog e Melhor Envio ficam preparados e inativos.
- RS-08: Fixture/mock deve ser marcado como `mock`, `fixture` ou `dev_fallback`, sem prazo/preço prometido como real.
- RS-09: Falha em regra manual ou fallback deve retornar erro controlado e não substituir operação real com banco por fixture silenciosa.

## 9. Requisitos de banco

- RB-01: A implementação da Fase 7 deve avaliar extensão de `carts` para guardar destino mínimo, cotação selecionada ou referência a cotação, sem criar pedido.
- RB-02: A implementação da Fase 7 deve avaliar ativação ou criação de tabela de cotações de frete com `cartId`, `quoteToken`, `cartHash`, provider manual/fallback, price/shipping amount em centavos, prazo, CEP de origem/destino, `quotedAt`, `expiresAt`, metadata segura e flag/estado de seleção.
- RB-03: A implementação futura deve ativar ou ajustar `shipping_rules` para regras manuais do MVP.
- RB-04: Cotações devem ser vinculadas ao carrinho e invalidadas por alteração de itens, destino, cupom ou expiração.
- RB-05: Cotações não devem criar `orders`, `order_items`, `payment_intents`, `payment_events`, `shipping_labels`, `order_shipping_quotes` ou qualquer snapshot de pedido nesta fase.
- RB-06: Migrations devem ser apenas locais até validação humana explícita para banco real.
- RB-07: Sem `DATABASE_URL`, não deve haver promessa de persistência real de destino, cotação ou seleção.

## 10. Requisitos de endereço/CEP

- RE-01: A cotação deve aceitar CEP brasileiro como destino mínimo suficiente nesta fase.
- RE-02: CEP deve ser normalizado antes de comparação e persistência.
- RE-03: CEP inválido deve bloquear cotação com mensagem controlada.
- RE-04: Endereço completo fica fora do escopo da Fase 7 e deve ser tratado em fase futura de checkout/endereço.
- RE-05: Endereço salvo de customer fica reservado para reaproveitamento em fase futura; a Fase 7 não cria CRUD de endereços completos.
- RE-06: País padrão deve ser tratado explicitamente como Brasil quando a cotação for nacional.
- RE-07: Mudança de CEP/destino deve invalidar seleção anterior.

## 11. Requisitos de cotação de frete

- RC-01: Cotação deve partir do carrinho resolvido no servidor.
- RC-02: Carrinho vazio não deve gerar cotação comprável.
- RC-03: Carrinho com produto indisponível ou quantidade inválida não deve gerar cotação comprável.
- RC-04: Cotação da Fase 7 deve conter origem do cálculo limitada a `manual`, `mock`, `fixture` ou `dev_fallback`.
- RC-05: Cotação deve conter preço em centavos, moeda, prazo estimado e validade.
- RC-06: Correios, Jadlog e Melhor Envio ficam apenas como adapters futuros inativos, sem chamada real, sem credenciais e sem participação no cálculo MVP.
- RC-07: Timeout ou erro de transportadora externa fica fora do runtime da Fase 7; falhas de regra manual/fallback devem retornar erro controlado.
- RC-08: Cotação deve permitir múltiplas opções quando o provider/regra retornar múltiplos serviços.
- RC-09: Cotação expirada não deve ser selecionável.
- RC-10: Cotação deve ser recalculada ou invalidada quando `cartHash` ou equivalente mudar.

## 12. Requisitos de opção de frete

- ROF-01: Opção de frete deve ter identificador opaco, não derivável de preço enviado pelo cliente.
- ROF-02: Opção deve expor nome exibível, provider, carrier/service quando aplicável, preço em centavos, prazo e indicador de fallback/mock.
- ROF-03: Opção indisponível, expirada ou de outro carrinho não deve ser selecionável.
- ROF-04: Opção de preço zero só pode existir por regra explícita ou cupom `free_shipping` aprovado, nunca por ausência de cálculo.
- ROF-05: Opção manual deve ser claramente distinguida de transportadora real.

## 13. Requisitos de seleção no carrinho

- RSC-01: Seleção de frete deve ocorrer por server action.
- RSC-02: Seleção deve validar ownership do carrinho.
- RSC-03: Seleção deve persistir no carrinho quando houver banco real e a cotação ainda for válida.
- RSC-04: Seleção deve ser removida quando carrinho for limpo.
- RSC-05: Seleção deve ser invalidada quando quantidade ou itens mudarem de forma que altere peso, subtotal, disponibilidade ou `cartHash`.
- RSC-06: Seleção deve ser invalidada quando CEP/destino mudar.
- RSC-07: Seleção deve ser reavaliada quando cupom for aplicado/removido.
- RSC-08: Seleção de frete não deve avançar o usuário para checkout real.

## 14. Requisitos de cálculo

- RCL-01: `subtotalCents` continua sendo soma dos itens do carrinho.
- RCL-02: `discountCents` continua vindo do cupom e nunca excede `subtotalCents`.
- RCL-03: `partialTotalCents = subtotalCents - discountCents` deve permanecer disponível para compatibilidade.
- RCL-04: `shippingAmountCents` deve vir da cotação selecionada válida ou ser `0` quando não houver frete selecionado.
- RCL-05: `partialTotalWithShippingCents = subtotalCents - discountCents + shippingAmountCents`.
- RCL-06: Total parcial com frete não deve ser tratado como pedido, checkout ou valor capturado.
- RCL-07: Frete não deve ficar negativo.
- RCL-08: Cupom `free_shipping` zera somente o frete manual calculado e elegível, preservando desconto monetário em `discountCents`.
- RCL-09: Cupom `free_shipping` não zera frete de transportadora externa, não promete frete grátis real e não cria frete artificial sem cotação manual válida.

## 15. Requisitos de cupom `free_shipping`

- RFS-01: `free_shipping` aplica benefício real somente sobre frete manual calculado e elegível na Fase 7.
- RFS-02: O benefício ocorre depois da cotação manual válida e antes de exibir total parcial com frete.
- RFS-03: Com `free_shipping` elegível, `shippingAmountCents` exibido deve ser `0`, mas a cotação manual original deve permanecer auditável no domínio para não perder o valor cotado.
- RFS-04: `free_shipping` não deve consumir `usedCount` no carrinho nesta fase.
- RFS-05: `free_shipping` não deve criar pedido, checkout, pagamento ou reserva.
- RFS-06: `free_shipping` não deve ser aceito para burlar destino, ownership ou expiração da cotação.

## 16. Requisitos de ownership

- ROW-01: Carrinho anônimo deve resolver owner exclusivamente por `guestCartToken` opaco.
- ROW-02: Carrinho autenticado deve resolver owner por `session.userId`.
- ROW-03: Cotação deve estar associada ao mesmo carrinho resolvido no servidor.
- ROW-04: Seleção deve falhar se a cotação não pertence ao carrinho atual.
- ROW-05: Merge de carrinho no login deve invalidar ou recalcular frete, porque itens e owner podem mudar.
- ROW-06: Admin/manager não podem ver, cotar ou selecionar frete de carrinho alheio por payload.

## 17. Requisitos de server actions

- RSA-01: Criar action para cotar frete do carrinho atual.
- RSA-02: Criar action para selecionar opção de frete do carrinho atual.
- RSA-03: Criar action para remover seleção de frete do carrinho atual.
- RSA-04: Atualizar action de obter carrinho para retornar destino, opções válidas, frete selecionado, `shippingAmountCents` e `partialTotalWithShippingCents`.
- RSA-05: Actions de add/update/remove/clear item devem invalidar ou recalcular frete conforme regra definida.
- RSA-06: Actions de aplicar/remover cupom devem recalcular total com frete e tratar `free_shipping`.
- RSA-07: Actions devem retornar erros controlados sem secrets.
- RSA-08: Actions não devem chamar checkout, Stripe, pedido, reserva ou baixa de estoque.

## 18. Requisitos de UI

- RUI-01: `/carrinho` deve exibir campo de CEP/destino para cotação.
- RUI-02: UI deve mostrar loading/erro/sucesso de cotação.
- RUI-03: UI deve listar opções de frete com nome, prazo, preço e indicador de fallback/mock quando aplicável.
- RUI-04: UI deve permitir selecionar uma opção de frete e ver a opção selecionada.
- RUI-05: UI deve exibir subtotal, desconto, frete e total parcial com frete.
- RUI-06: UI deve indicar que checkout/pedido/pagamento continuam indisponíveis nesta fase.
- RUI-07: UI não deve permitir editar preço de frete client-side.
- RUI-08: UI deve comunicar quando a seleção foi invalidada por mudança de itens, destino ou cupom.

## 19. Requisitos de admin de frete

- RAF-01: Admin básico de regras manuais entra na Fase 7 como fundação mínima do MVP.
- RAF-02: `/admin/frete` ou superfície equivalente deve exigir `requireAdminLike`.
- RAF-03: Customer e visitante não podem acessar admin de frete.
- RAF-04: Regra manual deve conter nome, faixa/critério definido, preço em centavos, prazo, ativo/inativo e prioridade quando necessário.
- RAF-05: Admin de frete não deve configurar credenciais externas via UI nesta fase.
- RAF-06: Sem banco/auth prontos, admin de frete deve bloquear de forma segura.

## 20. Requisitos de provedores externos e fallback

- RPF-01: Melhor Envio, Jadlog e Correios devem ser tratados como adapters futuros preparados e inativos, nunca como chamadas reais na Fase 7.
- RPF-02: Chamada real a Correios, Jadlog ou Melhor Envio fica fora da Fase 7, mesmo que adapters sejam preparados.
- RPF-03: Sem credenciais externas, dev/test usam regra manual e/ou fixture/mock explícito; nenhuma credencial externa é requisito da fase.
- RPF-04: Preview/prod não tentam provider real externo; sem banco, mutações reais de frete falham de forma segura.
- RPF-05: Fixture/mock não deve prometer prazo/preço real de transportadora.
- RPF-06: Erro real de transportadora externa pertence a fase futura e não deve existir no runtime da Fase 7.
- RPF-07: Documentação deve separar adapters futuros inativos, regra manual e mock/fallback.

## 21. Requisitos de ambiente

- RA-01: A feature deve funcionar em lint/typecheck/test/build/e2e sem `DATABASE_URL` real.
- RA-02: A feature não deve exigir credenciais externas para build/test.
- RA-03: Variáveis de ambiente novas devem ser opcionais e validadas com indicadores seguros.
- RA-04: `.env.example` pode listar nomes de variáveis necessárias, mas nunca valores reais.
- RA-05: Migrations locais podem ser geradas no futuro, mas não aplicadas em banco real sem validação humana.
- RA-06: Nenhum deploy ou push faz parte da Fase 7 requirements.

## 22. Critérios de aceite

- CA-01: Carrinho permite informar CEP ou destino mínimo para cotação.
- CA-02: Sistema retorna opções de frete no modo permitido pela fase.
- CA-03: Cotação não expõe segredo nem chama Correios, Jadlog ou Melhor Envio em runtime nesta fase.
- CA-04: Payload/client-side não força valor de frete.
- CA-05: Usuário não seleciona frete em carrinho de outro usuário ou outro guest token.
- CA-06: Frete selecionado atualiza `shippingAmountCents` e `partialTotalWithShippingCents`.
- CA-07: Alteração de itens invalida ou recalcula frete conforme regra definida.
- CA-08: Alteração de endereço/CEP invalida cotação anterior.
- CA-09: Alteração de cupom recalcula total com frete e trata `free_shipping` como benefício restrito ao frete manual calculado.
- CA-10: Sem `DATABASE_URL`, comportamento é explícito e não finge persistência real.
- CA-11: Sem credenciais externas, comportamento é fixture/mock explícito ou falha segura conforme ambiente.
- CA-12: Checkout, pagamento, Stripe, pedido, reserva e baixa de estoque continuam fora de escopo.
- CA-13: Admin/customer/visitante não burlam ownership.
- CA-14: lint/typecheck/test/build/e2e são validações obrigatórias da futura implementação.
- CA-15: Documentação final explica fallback, provedores, regra manual, frete grátis e guardrails.

## 23. Cenários de teste

```gherkin
Cenário: Cotar frete com CEP válido
  Dado um carrinho ativo com itens compráveis
  Quando o usuário informa um CEP válido
  Então o servidor retorna opções de frete permitidas pela fase
  E nenhuma credencial é exposta

Cenário: Rejeitar CEP inválido
  Dado um carrinho ativo
  Quando o usuário informa um CEP inválido
  Então o sistema mostra erro controlado
  E nenhuma opção de frete é selecionada

Cenário: Selecionar frete no próprio carrinho
  Dado um carrinho ativo com cotação válida
  Quando o usuário seleciona uma opção de frete
  Então o carrinho passa a exibir o frete selecionado
  E o total parcial com frete soma subtotal menos desconto mais frete

Cenário: Bloquear seleção de frete de outro carrinho
  Dado uma cotação vinculada a outro usuário ou guest token
  Quando o usuário tenta selecioná-la por payload
  Então a ação retorna erro de acesso controlado
  E o carrinho atual permanece sem alteração

Cenário: Impedir frete forçado pelo cliente
  Dado um carrinho ativo
  Quando o cliente envia payload com preço de frete manual
  Então o servidor ignora ou rejeita o valor enviado
  E recalcula frete a partir da cotação server-side

Cenário: Invalidar frete ao alterar item
  Dado um carrinho com frete selecionado
  Quando o usuário altera quantidade ou remove item
  Então a seleção de frete é invalidada ou recalculada
  E a UI informa que o frete precisa ser atualizado quando aplicável

Cenário: Invalidar frete ao alterar CEP
  Dado um carrinho com frete selecionado para um CEP
  Quando o usuário informa outro CEP
  Então a cotação anterior deixa de ser selecionável
  E novas opções são calculadas ou solicitadas

Cenário: Aplicar cupom de frete grátis sobre frete manual
  Dado um carrinho com cotação válida e cupom free_shipping elegível
  Quando o usuário aplica o cupom
  Então o frete elegível é zerado no total parcial com frete
  E nenhum pedido ou pagamento é criado

Cenário: Não criar frete artificial com free_shipping
  Dado um carrinho sem opção de frete manual calculada
  Quando o usuário aplica cupom free_shipping
  Então o sistema não cria frete artificial
  E informa que o benefício depende de frete manual calculado

Cenário: Fallback sem banco
  Dado ambiente development sem DATABASE_URL
  Quando o usuário cota frete
  Então o sistema usa fixture/mock explícito ou retorna indisponível conforme decisão
  E não promete persistência real

Cenário: Ambiente sem credencial externa
  Dado Correios, Jadlog e Melhor Envio sem credenciais configuradas
  Quando o usuário solicita cotação de frete na Fase 7
  Então o sistema usa regra manual ou fixture/mock explícito permitido
  E não chama API externa real nem promete preço/prazo de transportadora

Cenário: Escopo proibido
  Dado um carrinho com frete selecionado
  Quando o usuário conclui a interação da Fase 7
  Então nenhum checkout, pagamento, Stripe, pedido, reserva ou baixa de estoque é criado
```

## 24. Esclarecimentos

### Sessão 2026-06-09

- **Q:** Quais provedores entram no MVP da Fase 7?
  **R:** O MVP usa frete por regras manuais. Correios, Jadlog e Melhor Envio ficam apenas preparados/documentados por arquitetura/adapters inativos, sem dependência operacional.
- **Q:** A Fase 7 deve chamar API externa real?
  **R:** Não. A fase usa apenas regra manual persistida e/ou fixture/mock controlado. Nenhum runtime deve chamar Correios, Jadlog ou Melhor Envio, e build/test/e2e não exigem credenciais externas.
- **Q:** CEP é suficiente ou endereço completo será necessário?
  **R:** CEP é suficiente para cotação nesta fase. Endereço completo fica para checkout/endereço futuro, salvo reaproveitamento seguro posterior.
- **Q:** Como o frete manual será calculado?
  **R:** O cálculo manual usa UF e/ou faixa de CEP, com valor fixo em centavos por regra e prazo estimado textual ou em dias. Subtotal, quantidade, peso e dimensões ficam como extensões futuras.
- **Q:** Peso e dimensões dos produtos entram no cálculo da Fase 7?
  **R:** Não. Nenhum produto deve ser bloqueado por ausência de peso ou dimensão nesta fase. Integrações futuras com transportadoras devem revisar esses dados.
- **Q:** Admin básico de regras manuais entra na Fase 7?
  **R:** Sim. Admin/manager autenticado pode listar, criar e editar regra manual mínima. Customer e visitante são bloqueados.
- **Q:** O cupom `free_shipping` passa a aplicar benefício real?
  **R:** Sim, mas somente sobre frete manual calculado pela Fase 7. O cupom pode zerar o frete manual elegível, não chama API externa, não promete frete grátis de transportadora real e não cria frete artificial.
- **Q:** Qual é a validade da cotação?
  **R:** Cotação manual tem validade padrão de 30 minutos. Mudança de carrinho, CEP ou cupom invalida ou recalcula frete conforme regra do plano técnico; alteração de regra manual no admin afeta cotações futuras.
- **Q:** A seleção de frete persiste no carrinho?
  **R:** Sim, quando houver banco real. Carrinho autenticado persiste por `userId`; carrinho anônimo persiste vinculado ao `guestCartToken`. Sem banco real, persistência é apenas fallback/dev explícito.
- **Q:** Como funciona fallback sem `DATABASE_URL` e sem credenciais externas?
  **R:** Sem `DATABASE_URL`, frete funciona apenas por fixture/mock controlado em development/test. Preview/produção sem banco falham seguro para mutações reais. Como a fase não chama APIs externas, ausência de credenciais externas não bloqueia build/test/e2e. Erro real com banco não cai em fallback silencioso.

## 25. Gaps e dúvidas

Nenhuma dúvida aberta após a sessão de clarificação de 2026-06-09. As decisões humanas resolveram provedor MVP, ausência de APIs externas reais, destino por CEP, cálculo manual por UF/faixa de CEP, peso/dimensões fora do cálculo, admin básico, `free_shipping` sobre frete manual, validade de 30 minutos, persistência no carrinho e fallback seguro.

## 26. Glossário mínimo

| Termo | Definição |
|-------|-----------|
| CEP | Código de Endereçamento Postal usado como destino mínimo para cotação nacional. |
| Cotação de frete | Resultado calculado no servidor com uma ou mais opções de entrega para um carrinho e destino. |
| Opção de frete | Alternativa selecionável de entrega com provider, serviço, preço, prazo e validade. |
| Provider | Origem técnica da cotação na Fase 7: regra manual, fixture/mock ou dev fallback. Correios, Jadlog e Melhor Envio são adapters futuros inativos. |
| Regra manual | Regra administrativa local que calcula frete sem chamar transportadora externa real. |
| Fixture/mock | Resultado controlado de desenvolvimento/teste que não representa cotação real de transportadora. |
| `shippingAmountCents` | Valor do frete selecionado em centavos. |
| Total parcial com frete | `subtotalCents - discountCents + shippingAmountCents`, ainda sem checkout, pedido ou pagamento. |
| `free_shipping` | Tipo de cupom preparado na Fase 6 que, na Fase 7, zera apenas frete manual calculado e elegível. |
| `cartHash` | Assinatura ou representação server-side do estado relevante do carrinho usada para invalidar cotações antigas. |
| Ownership | Regra de que apenas o dono resolvido por sessão/cookie opaco pode operar seu carrinho e frete. |

## 27. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| Cotação por destino mínimo | Must | Sem destino não há frete no carrinho. |
| Seleção server-side de opção | Must | Evita frete forçado pelo cliente. |
| Total parcial com frete | Must | Objetivo central da fase. |
| Ownership de cotação/seleção | Must | Preserva segurança herdada do carrinho. |
| Fallback explícito | Must | Build/test e dev precisam funcionar sem credenciais reais. |
| Adapters externos preparados | Must | Preserva direção de paridade com legado sem chamar API real automaticamente. |
| Admin regra manual | Must | Fundação mínima de regras manuais faz parte do MVP. |
| Chamada real a transportadora | Won't | Correios, Jadlog e Melhor Envio ficam fora do runtime da Fase 7. |
| Checkout/pagamento/pedido | Won't | Fora de escopo obrigatório da fase. |

## 28. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-09 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-06-09 | Dúvidas resolvidas por `/reversa-clarify` | reversa |
