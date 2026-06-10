# Requirements: Fase 8 - Checkout sem Pagamento Real e Pedido Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`
> Pasta da extracao reversa: `_reversa_sdd/`
> SDD legado de referencia: `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\`
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Objetivo

Definir os requisitos da Fase 8 para permitir que um cliente autenticado inicie checkout a partir de um carrinho valido e gere um pedido `aguardando_pagamento`, sem capturar pagamento real, sem chamar Stripe, sem coletar dados de cartao e sem baixar ou reservar estoque definitivamente. A fase deve preservar snapshots de itens, precos, cupom, frete, cliente, endereco e total calculados no servidor, preparando a fase futura de pagamento sem implementa-la agora.

## 2. Contexto

| Fonte | Trecho relevante | Confidencia |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Carrinho` | Carrinho ativo contem itens, cupom aplicado, selecao de frete persistida, valor de frete e total parcial com frete. Alteracoes de itens invalidam frete. | 🟢 |
| `_reversa_sdd/architecture.md#Guardrails arquiteturais atuais` | Payloads de cliente nao sao fonte de verdade para totais, dono do carrinho ou valor de frete; checkout, pagamento, pedido, reserva e baixa ainda nao existem no Next. | 🟢 |
| `_reversa_sdd/domain.md#Carrinho` | Carrinho representa intencao de compra sem checkout real; produto, quantidade e totais sao validados no servidor. | 🟢 |
| `_reversa_sdd/domain.md#Cupons` | `free_shipping` zera somente frete manual calculado e elegivel, sem criar frete artificial. | 🟢 |
| `_reversa_sdd/domain.md#Frete manual` | CEP, regras manuais, quote, selecao e ownership da quote ja sao validados no dominio de frete. | 🟢 |
| `_reversa_sdd/data-dictionary.md#carts` | Carrinho possui cupom, CEP, quote/opcao de frete selecionada e valor de frete em centavos. | 🟢 |
| `_reversa_sdd/permissions.md#Matriz de acesso` | Cliente e visitante acessam apenas recursos proprios; admin/manager nao tem bypass de compra. | 🟢 |
| `_reversa_sdd/state-machines.md#Fluxos ainda inexistentes` | Checkout, pagamento, Stripe, pedido, reserva e baixa de estoque ainda nao existem no Next. | 🟢 |
| `_reversa_sdd/dependencies.md#Riscos de dependencia` | Ativar checkout/pagamento exige contrato novo entre carrinho, frete, cupom, pedido e pagamento. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\code-analysis.md#Checkout/pedidos` | Legado bloqueia carrinho vazio/produto indisponivel/estoque insuficiente, exige frete valido, cria pedido `aguardando_pagamento`, snapshots, expira em 60 minutos e marca carrinho `converted`. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\domain.md#Regras de negocio` | Pedido pendente expira em 60 minutos; pagamento confirmado e que baixa estoque fica em fluxo financeiro posterior. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\state-machines.md#Pedido` | Estados de pedido incluem `aguardando_pagamento`, `pago`, `em_separacao`, `enviado`, `concluido`, `cancelado`, `expirado`. | 🟢 |

## 3. Escopo

- Checkout somente para usuario autenticado.
- Visitante pode montar carrinho, aplicar cupom e cotar frete, mas deve fazer login/cadastro antes de criar pedido.
- Merge do carrinho anonimo para carrinho autenticado deve seguir a regra ja implementada no login.
- Criacao de pedido sempre vinculada a `userId`; pedido anonimo fica fora da Fase 8.
- Modelo conceitual de pedido e itens do pedido.
- Estado inicial de pedido `aguardando_pagamento`.
- Expiracao do pedido pendente em 60 minutos.
- Snapshot de itens, precos, cupom, frete, cliente, endereco e total.
- Validacao final server-side do carrinho antes do pedido.
- Dados minimos do cliente: nome completo, e-mail da conta autenticada e telefone/WhatsApp.
- Endereco completo de entrega como snapshot do pedido.
- Carrinho usado no pedido marcado como convertido/bloqueado para novas mutacoes.
- Area customer minima para listar pedidos pendentes.
- Admin minimo para visualizar pedidos pendentes.
- Fallback seguro sem `DATABASE_URL`.
- Testes unitarios, e2e e validacoes obrigatorias para futura implementacao.

## 4. Fora de Escopo

- Pedido anonimo.
- Captura de pagamento real.
- Chamada a Stripe.
- Criacao de PaymentIntent real.
- Coleta de dados de cartao.
- Envio de dados de pagamento para terceiros.
- Webhooks de pagamento.
- Baixa definitiva de estoque.
- Reserva definitiva de estoque.
- Consumo de `usedCount` de cupom na criacao do pedido pendente.
- CRUD completo de enderecos do cliente.
- CPF/CNPJ, salvo fase fiscal futura.
- Emissao fiscal.
- Integracao real com transportadoras.
- Admin avancado de pedidos.
- Marcar pedido como pago manualmente.
- Deploy.
- Aplicacao de migrations em banco real sem validacao humana explicita.

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de aceite | Confidencia |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O sistema deve oferecer inicio de checkout a partir do carrinho atual. | Must | CTA de checkout conduz usuario autenticado para revisao; visitante recebe instrucao/redirecionamento para login/cadastro. | 🟢 |
| RF-02 | O sistema deve bloquear checkout com carrinho vazio. | Must | Tentativa com zero itens retorna erro controlado e nao cria pedido. | 🟢 |
| RF-03 | O sistema deve validar disponibilidade, status publicavel, data de publicacao e estoque de cada produto antes do pedido. | Must | Produto `draft`, `inactive`, futuro, sem estoque ou com quantidade acima do estoque impede pedido. | 🟢 |
| RF-04 | O sistema deve exigir frete selecionado valido e nao expirado. | Must | Pedido nao e criado quando quote/opcao de frete estiver ausente, invalida, expirada ou nao pertencer ao carrinho. | 🟢 |
| RF-05 | O sistema deve validar cupom aplicado novamente no momento do pedido. | Must | Cupom invalido, expirado, inativo ou esgotado bloqueia a criacao do pedido. | 🟢 |
| RF-06 | O sistema deve recalcular subtotal, desconto, frete e total no servidor. | Must | Valores enviados pelo cliente sao ignorados para calculo financeiro. | 🟢 |
| RF-07 | O sistema deve criar pedido com status inicial `aguardando_pagamento`. | Must | Pedido nasce `aguardando_pagamento`, com `expiresAt = createdAt + 60 minutos`, sem cobranca real. | 🟢 |
| RF-08 | O sistema deve copiar snapshot dos itens do carrinho para itens do pedido. | Must | Cada item contem produto, SKU se houver, nome, quantidade, preco unitario e total da linha em centavos. | 🟢 |
| RF-09 | O sistema deve copiar snapshot financeiro do pedido. | Must | Pedido guarda subtotal, desconto, frete e total em centavos calculados server-side. | 🟢 |
| RF-10 | O sistema deve copiar snapshot de cupom aplicado, quando houver. | Must | Pedido registra codigo, tipo, valor e efeito efetivo do cupom; `usedCount` nao e incrementado. | 🟢 |
| RF-11 | O sistema deve copiar snapshot do frete selecionado. | Must | Pedido registra CEP, provider/source manual, label, prazo estimado, valor original e valor efetivo do frete. | 🟢 |
| RF-12 | O sistema deve exigir dados minimos do cliente. | Must | Pedido sem nome completo, e-mail da conta autenticada e telefone/WhatsApp e recusado. | 🟢 |
| RF-13 | O sistema deve exigir endereco completo de entrega. | Must | Pedido sem CEP, UF, cidade, bairro, logradouro e numero e recusado; complemento e opcional. | 🟢 |
| RF-14 | O sistema deve impedir pedido a partir de carrinho de outro usuario. | Must | Ownership e resolvido no servidor e tentativa cruzada e negada. | 🟢 |
| RF-15 | O sistema deve marcar o carrinho usado como convertido/bloqueado apos criar pedido. | Must | Carrinho convertido nao aceita novas mutacoes e novo carrinho ativo pode ser criado para compra futura. | 🟢 |
| RF-16 | O sistema deve proteger contra duplo clique/reenvio. | Must | Criacao de pedido e idempotente quando possivel ou impede duplicidade a partir do mesmo carrinho convertido. | 🟢 |
| RF-17 | O sistema deve exibir confirmacao de pedido pendente. | Must | Usuario ve numero/id, status `aguardando_pagamento`, total, data e expiracao. | 🟢 |
| RF-18 | O sistema deve preparar contrato para fase futura de pagamento sem implementa-la. | Should | Pedido tem campos suficientes para pagamento futuro, mas sem Stripe, PaymentIntent ou cartao. | 🟢 |
| RF-19 | Area customer deve listar pedidos pendentes em versao minima. | Must | Cliente autenticado ve somente seus pedidos, com id/numero, status, total, data e expiracao. | 🟢 |
| RF-20 | Admin minimo deve listar e mostrar detalhe basico de pedidos pendentes. | Must | Admin/manager ve pedidos pendentes sem editar valores, marcar pago, baixar estoque ou criar pagamento. | 🟢 |

## 6. Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia ou justificativa | Confidencia |
|------|-----------|----------------------------|-------------|
| Seguranca | O servidor deve ser fonte de verdade para ownership, disponibilidade, desconto, frete e total. | `_reversa_sdd/architecture.md#Guardrails arquiteturais atuais` | 🟢 |
| Privacidade | A Fase 8 nao deve coletar, armazenar ou transmitir dados de cartao. | Decisao humana da clarificacao | 🟢 |
| Integracao | Build, test e e2e nao devem exigir credenciais Stripe. | Pagamento real fora da fase | 🟢 |
| Persistencia | Pedido pendente nao deve simular persistencia real quando banco estiver indisponivel. | Decisao de fallback seguro | 🟢 |
| Confiabilidade | Criacao de pedido deve ser atomica no limite do repositorio usado. | Evita pedido sem itens, snapshots ou carrinho convertido | 🟢 |
| Idempotencia | Reenvio da criacao nao deve gerar pedidos duplicados a partir do mesmo carrinho convertido. | Decisao de bloqueio do carrinho pos-pedido | 🟢 |
| Testabilidade | Implementacao futura deve passar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`. | Padrao de validacao das Fases 5-7 | 🟢 |

## 7. Regras de Negocio Herdadas

1. **RN-01:** Produto compravel exige `published`, `publishedAt <= now` e `stockQuantity > 0`. 🟢
2. **RN-02:** Produto `draft`, `inactive`, futuro ou sem estoque nao e compravel. 🟢
3. **RN-03:** Quantidade do carrinho nao pode exceder estoque disponivel no momento da validacao. 🟢
4. **RN-04:** Carrinho nao reserva estoque. 🟢
5. **RN-05:** Carrinho autenticado pertence ao `userId`; carrinho anonimo pertence ao `guestCartToken`. 🟢
6. **RN-06:** Pedido da Fase 8 sempre pertence a `userId`; `guestCartToken` nao cria pedido final. 🟢
7. **RN-07:** Cliente acessa somente carrinho e pedidos proprios. 🟢
8. **RN-08:** Admin/manager nao tem bypass das regras de compra. 🟢
9. **RN-09:** Cupom valido pode aplicar desconto percentual, valor fixo ou frete gratis. 🟢
10. **RN-10:** `free_shipping` zera somente frete manual elegivel. 🟢
11. **RN-11:** Todos os valores financeiros ficam em centavos. 🟢
12. **RN-12:** Server-side recalcula subtotal, desconto, frete e total. 🟢
13. **RN-13:** Frete manual selecionado exige quote/opcao pertencente ao carrinho ativo. 🟢
14. **RN-14:** Pedido pendente nasce `aguardando_pagamento` e expira em 60 minutos. 🟢
15. **RN-15:** Pagamento confirmado, baixa de estoque e efeitos externos ficam para fase futura. 🟢

## 8. Requisitos de Seguranca

- RS-01: Payload cliente nao pode definir subtotal, desconto, frete, total, owner, estado do pedido ou estado de pagamento.
- RS-02: Criacao de pedido deve resolver o usuario autenticado no servidor.
- RS-03: Visitante nao pode criar pedido; deve autenticar antes do checkout final.
- RS-04: Criacao de pedido deve negar carrinho de outro usuario.
- RS-05: Criacao de pedido deve negar quote de frete de outro carrinho.
- RS-06: Criacao de pedido nao deve ler, registrar ou expor secrets, `DATABASE_URL`, cookies, tokens ou credenciais.
- RS-07: Checkout nao deve capturar cartao nem qualquer dado sensivel de pagamento.
- RS-08: Checkout nao deve chamar Stripe, transportadoras ou terceiros.
- RS-09: Falhas de banco em preview/producao devem falhar de forma segura e nao criar pedido falso.

## 9. Requisitos de Banco

- RB-01: Definir tabela/entidade de pedidos com `userId`, numero/id, status, snapshots financeiros, snapshots de cliente/endereco/frete/cupom e timestamps.
- RB-02: Definir tabela/entidade de itens do pedido com referencia ao pedido, produto, SKU se houver, nome snapshot, quantidade, preco unitario e total da linha em centavos.
- RB-03: Pedido deve ter `status = aguardando_pagamento`, `createdAt` e `expiresAt = createdAt + 60 minutos`.
- RB-04: Pagamento real nao deve ser criado; placeholder interno `pendente` so pode existir se o modelo exigir e sem provider externo.
- RB-05: Carrinho deve poder ser marcado como convertido/bloqueado apos criar pedido.
- RB-06: Gerar apenas migration local quando houver delta de schema.
- RB-07: Nao aplicar migration em banco real sem validacao humana explicita.
- RB-08: Fallback sem banco deve ser explicito, seguro e nao prometer persistencia real.

## 10. Requisitos de Pedido

- RP-01: Pedido deve nascer `aguardando_pagamento`.
- RP-02: Pedido deve expirar em 60 minutos.
- RP-03: Pedido deve conter snapshot financeiro completo calculado no servidor.
- RP-04: Pedido deve conter snapshot dos dados minimos do cliente.
- RP-05: Pedido deve conter snapshot do endereco completo de entrega.
- RP-06: Pedido deve conter snapshot do frete selecionado e do efeito de `free_shipping`, se houver.
- RP-07: Pedido deve conter snapshot do cupom aplicado, se houver.
- RP-08: Pedido pendente nao deve representar pagamento autorizado, pago ou capturado.
- RP-09: Pedido deve ser consultavel pelo cliente dono e por admin/manager em leitura basica.

## 11. Requisitos de Itens do Pedido

- RI-01: Cada item do pedido deve copiar produto, SKU se houver, nome, quantidade, preco unitario e total da linha no momento da criacao.
- RI-02: Item de pedido nao deve depender de preco atual do produto para exibir historico do pedido.
- RI-03: Produto indisponivel ou quantidade acima do estoque deve bloquear a criacao do pedido.
- RI-04: Itens devem preservar valores em centavos.

## 12. Requisitos de Checkout

- RC-01: Checkout deve iniciar somente a partir de carrinho valido.
- RC-02: Visitante pode iniciar intencao de checkout, mas deve autenticar antes da criacao do pedido.
- RC-03: Apos login, merge do carrinho anonimo deve seguir a regra existente antes de validar pedido.
- RC-04: Checkout deve passar por revisao de itens, cupom, frete, endereco e total antes da criacao do pedido.
- RC-05: Checkout deve criar pedido pendente somente por server action protegida.
- RC-06: Checkout deve exibir confirmacao de pedido pendente apos sucesso.
- RC-07: Checkout deve informar que pagamento real sera etapa futura.
- RC-08: Checkout nao deve exibir campo de cartao ou promessa de cobranca nesta fase.

## 13. Requisitos de Validacao Final do Carrinho

Ordem obrigatoria da criacao de pedido pendente:

1. Validar usuario autenticado.
2. Resolver carrinho ativo proprio.
3. Validar carrinho nao vazio.
4. Validar produtos publicos/compraveis.
5. Validar estoque disponivel.
6. Validar cupom ainda valido, se houver.
7. Validar frete selecionado ainda valido.
8. Validar endereco completo.
9. Recalcular subtotal, desconto, frete e total.
10. Criar snapshots do pedido.
11. Marcar carrinho como convertido/bloqueado.
12. Ignorar subtotal, desconto, frete e total vindos do cliente.

## 14. Requisitos de Cliente/Autenticacao

- RA-01: Checkout exige usuario autenticado para criar pedido pendente.
- RA-02: Visitante deve ser redirecionado ou instruido a fazer login/cadastro antes da criacao do pedido.
- RA-03: Carrinho anonimo nao vira pedido diretamente.
- RA-04: Pedido sempre deve pertencer a um `userId`.
- RA-05: `guestCartToken` serve apenas para carrinho anonimo e merge, nao para pedido final.
- RA-06: Admin/manager so participa como usuario de compra se estiver no proprio carrinho; papel administrativo nao permite burlar regras.

## 15. Requisitos de Endereco de Entrega

- RE-01: Endereco completo e obrigatorio no momento de criar pedido pendente.
- RE-02: Campos minimos: CEP, UF, cidade, bairro, logradouro e numero.
- RE-03: Complemento e opcional.
- RE-04: Destinatario/nome de entrega deve ser coletado quando diferente do cliente.
- RE-05: CEP isolado serve para cotacao, mas nao basta para criar pedido.
- RE-06: CEP do endereco deve ser coerente com CEP da cotacao selecionada ou a cotacao deve ser refeita.
- RE-07: Endereco deve ser salvo como snapshot no pedido.
- RE-08: Persistir endereco em catalogo/perfil do cliente fica fora da Fase 8, salvo reaproveitamento sem aumento de escopo.

## 16. Requisitos de Cupom no Pedido

- RCP-01: Cupom aplicado no carrinho deve ser revalidado antes do pedido.
- RCP-02: Pedido deve guardar snapshot do cupom e do efeito financeiro aplicado.
- RCP-03: `free_shipping` deve zerar somente frete manual elegivel.
- RCP-04: Cupom invalido, expirado, inativo ou esgotado bloqueia criacao do pedido.
- RCP-05: Criacao de pedido pendente nao incrementa `usedCount`.
- RCP-06: `usedCount` deve ser consumido apenas em fase futura de pagamento confirmado ou pedido efetivamente confirmado.

## 17. Requisitos de Frete no Pedido

- RFRT-01: Pedido exige frete selecionado valido.
- RFRT-02: Quote/opcao de frete deve pertencer ao carrinho ativo.
- RFRT-03: Quote expirada, removida ou invalidada deve bloquear pedido.
- RFRT-04: Pedido deve guardar snapshot de CEP, provider/source, label, prazo, valor original e valor efetivo.
- RFRT-05: Providers Correios, Jadlog e Melhor Envio continuam inativos.
- RFRT-06: Nenhuma API externa de frete deve ser chamada nesta fase.

## 18. Requisitos de Estoque

- RST-01: Estoque deve ser consultado no momento final antes do pedido.
- RST-02: Produto sem estoque ou quantidade acima do estoque deve bloquear pedido.
- RST-03: Fase 8 nao deve baixar estoque definitivamente.
- RST-04: Fase 8 nao deve reservar estoque definitivamente.
- RST-05: Campo/estado futuro de reserva pode ser apenas modelagem/documentacao, sem reserva real.
- RST-06: Baixa definitiva fica para fase futura de pagamento confirmado.

## 19. Requisitos de Pagamento Fora de Escopo

- RPG-01: Fase 8 nao deve chamar Stripe.
- RPG-02: Fase 8 nao deve criar PaymentIntent.
- RPG-03: Fase 8 nao deve capturar pagamento.
- RPG-04: Fase 8 nao deve coletar cartao.
- RPG-05: Fase 8 nao deve enviar dados de pagamento a terceiros.
- RPG-06: Pedido pendente deve preparar campos conceituais para fase futura de pagamento sem depender de credenciais Stripe.
- RPG-07: Entidade interna de pagamento so pode existir como `pendente` sem provider real se o modelo exigir; caso contrario, pagamento comeca na fase Stripe.

## 20. Requisitos de Server Actions

- RSA-01: Definir action para iniciar/revisar checkout a partir do carrinho.
- RSA-02: Definir action para criar pedido pendente a partir do carrinho validado.
- RSA-03: Actions devem resolver usuario autenticado, carrinho, cupom, frete e totais no servidor.
- RSA-04: Actions devem rejeitar payloads com valores financeiros, owner, estado do pedido ou provider como fonte confiavel.
- RSA-05: Actions devem retornar erros controlados para visitante nao autenticado, carrinho vazio, produto indisponivel, estoque insuficiente, cupom invalido, frete invalido, endereco incompleto e banco indisponivel.
- RSA-06: Action de criacao deve marcar o carrinho como convertido/bloqueado no mesmo fluxo logico da criacao do pedido.

## 21. Requisitos de UI

- RUI-01: Carrinho deve expor CTA para iniciar checkout quando validacoes basicas permitirem.
- RUI-02: Visitante que tenta checkout deve receber instrucao/redirecionamento para login/cadastro.
- RUI-03: Tela de checkout deve mostrar revisao de itens, cupom, frete, endereco e total.
- RUI-04: UI deve coletar ou confirmar nome completo, e-mail da conta autenticada, telefone/WhatsApp e endereco completo.
- RUI-05: UI nao deve coletar CPF/CNPJ nesta fase.
- RUI-06: UI nao deve exibir campos de cartao.
- RUI-07: Confirmacao deve exibir pedido `aguardando_pagamento`, total, data e expiracao.
- RUI-08: Erros de validacao devem ser claros e nao revelar detalhes sensiveis.

## 22. Requisitos de Area Customer/Admin

- RCA-01: Area customer deve listar pedidos pendentes em versao minima.
- RCA-02: Cliente autenticado ve somente pedidos proprios.
- RCA-03: Listagem minima deve mostrar numero/id do pedido, status, total, data e expiracao.
- RCA-04: Detalhe minimo do pedido pode entrar se o plano tecnico considerar seguro.
- RCA-05: Cliente nao pode acessar pedido de outro usuario.
- RCA-06: Cancelamento manual completo fica fora da Fase 8.
- RCA-07: Admin/manager podem listar pedidos pendentes.
- RCA-08: Admin/manager podem ver detalhe basico do pedido.
- RCA-09: Admin nao deve marcar pedido como pago manualmente.
- RCA-10: Admin nao deve acionar baixa de estoque.
- RCA-11: Admin nao deve criar pagamento.
- RCA-12: Admin nao deve editar valores financeiros do pedido.

## 23. Requisitos de Ambiente/Fallback

- RAF-01: Sem `DATABASE_URL`, checkout/criacao de pedido deve falhar de forma segura em preview/producao.
- RAF-02: Em dev/test pode haver fixture controlado para simular pedido pendente.
- RAF-03: Fixture/dev/test nao deve fingir persistencia real.
- RAF-04: Quando `DATABASE_URL` existir e operacao real falhar, nao deve cair em fallback silencioso.
- RAF-05: UI deve sinalizar comportamento fixture/dev quando aplicavel.
- RAF-06: Build/test/e2e nao devem exigir banco real nem credenciais Stripe.

## 24. Criterios de Aceite

```gherkin
Cenario: Visitante precisa autenticar antes de criar pedido
  Dado um visitante com carrinho valido
  Quando tenta criar pedido pendente
  Entao o sistema instrui ou redireciona para login/cadastro
  E nenhum pedido anonimo e criado

Cenario: Bloquear checkout com carrinho vazio
  Dado um usuario autenticado com carrinho sem itens
  Quando tenta criar pedido pendente
  Entao o sistema bloqueia a acao
  E nenhum pedido e criado

Cenario: Bloquear produto indisponivel
  Dado um carrinho com produto draft, inactive, futuro ou sem estoque
  Quando o cliente tenta criar pedido pendente
  Entao o sistema recusa o pedido
  E informa erro controlado

Cenario: Bloquear quantidade acima do estoque
  Dado um carrinho com quantidade maior que o estoque atual
  Quando o cliente tenta criar pedido pendente
  Entao o sistema recusa o pedido
  E nenhum snapshot de pedido e persistido

Cenario: Bloquear frete ausente ou invalido
  Dado um carrinho com itens validos
  E sem frete selecionado valido
  Quando o cliente tenta criar pedido pendente
  Entao o sistema recusa o pedido

Cenario: Bloquear cupom invalido
  Dado um carrinho com cupom expirado, inativo ou esgotado
  Quando o cliente tenta criar pedido pendente
  Entao o sistema nao cria pedido com beneficio indevido
  E nao incrementa usedCount

Cenario: Bloquear endereco incompleto
  Dado um carrinho valido com frete selecionado
  Quando o cliente tenta criar pedido sem endereco completo
  Entao o sistema recusa o pedido

Cenario: Criar pedido pendente com snapshots
  Dado um usuario autenticado com carrinho valido, cupom valido, frete selecionado, dados de cliente e endereco completo
  Quando confirma o checkout sem pagamento
  Entao o sistema cria um pedido aguardando_pagamento
  E define expiracao em 60 minutos
  E copia snapshots de itens, precos, desconto, frete, cliente, endereco e total
  E marca o carrinho como convertido/bloqueado
  E nao chama Stripe
  E nao coleta dados de cartao

Cenario: Impedir payload malicioso
  Dado um carrinho valido
  Quando o cliente envia payload alterando subtotal, desconto, frete ou total
  Entao o servidor ignora os valores enviados
  E calcula o pedido com dados server-side

Cenario: Bloquear carrinho de outro usuario
  Dado um usuario autenticado
  Quando ele tenta criar pedido a partir de carrinho de outro usuario
  Entao o sistema nega a operacao
  E nenhum pedido e criado

Cenario: Ambiente sem banco
  Dado ambiente preview/producao sem DATABASE_URL
  Quando uma criacao real de pedido e solicitada
  Entao o comportamento falha de forma segura
  E nao ha falsa persistencia

Cenario: Listar pedidos do cliente
  Dado um cliente autenticado com pedidos pendentes
  Quando acessa a area customer minima
  Entao ve somente seus proprios pedidos

Cenario: Admin visualiza pedidos sem acao financeira
  Dado um admin ou manager
  Quando acessa o admin minimo de pedidos
  Entao ve pedidos pendentes
  E nao consegue marcar como pago, baixar estoque ou editar valores
```

## 25. Cenarios de Teste

- Unitario: visitante nao cria pedido e recebe fluxo de autenticacao.
- Unitario: carrinho anonimo nao vira pedido diretamente.
- Unitario: valida carrinho vazio.
- Unitario: valida produto indisponivel.
- Unitario: valida quantidade acima do estoque.
- Unitario: valida cupom invalido/expirado/esgotado no momento do pedido.
- Unitario: valida que criacao de pedido pendente nao incrementa `usedCount`.
- Unitario: valida frete ausente, expirado ou de outro carrinho.
- Unitario: valida endereco completo obrigatorio.
- Unitario: valida calculo server-side de subtotal, desconto, frete e total.
- Unitario: valida `free_shipping` no snapshot do pedido.
- Unitario: valida que payload financeiro malicioso e ignorado.
- Unitario: valida que pedido pendente nao chama Stripe.
- Unitario: valida que pedido pendente nao baixa nem reserva estoque.
- Unitario: valida carrinho convertido/bloqueado apos pedido.
- Unitario: valida expiracao de 60 minutos.
- Unitario: valida fallback sem banco.
- Unitario: cliente nao acessa pedido alheio.
- Unitario: admin nao marca pedido como pago, nao baixa estoque e nao edita valores.
- E2E: cliente autenticado com carrinho valido revisa checkout e cria pedido pendente.
- E2E: visitante com carrinho valido e direcionado para login/cadastro.
- E2E: carrinho sem frete selecionado nao cria pedido.
- E2E: confirmacao exibe pedido `aguardando_pagamento` e ausencia de pagamento real.
- E2E: customer lista pedidos proprios pendentes.
- E2E: admin/manager visualiza pedidos pendentes sem acoes financeiras.
- E2E: build/test nao exigem banco real nem credenciais Stripe.

## 26. Gaps e Duvidas

Nenhuma duvida aberta apos a sessao de clarificacao de 2026-06-09. Decisoes registradas em `doubts.md` e na secao de esclarecimentos abaixo.

## 27. Glossario Minimo

- **Checkout sem pagamento real:** fluxo de revisao e criacao de pedido pendente sem cobranca.
- **Pedido pendente:** pedido criado em `aguardando_pagamento`, ainda sem pagamento autorizado, capturado ou confirmado.
- **Snapshot:** copia dos dados e valores no momento da criacao do pedido.
- **Subtotal:** soma dos itens antes de desconto e frete.
- **Desconto:** beneficio de cupom aplicado aos itens, em centavos.
- **Frete efetivo:** valor de frete considerado no total apos efeito de `free_shipping`, quando aplicavel.
- **Total:** valor final do pedido em centavos.
- **Ownership:** regra que vincula carrinho/pedido ao usuario dono.
- **Carrinho convertido:** carrinho que gerou pedido e nao aceita novas mutacoes.
- **Fallback:** comportamento controlado para dev/test sem banco real.

## 28. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-17 | Must | Sem esses itens o pedido pendente pode ser criado com dados invalidos, inseguros ou sem paridade minima. |
| RF-18 | Should | Prepara a fase futura sem acoplar pagamento agora. |
| RF-19 | Must | Area customer minima foi decidida para esta fase. |
| RF-20 | Must | Admin minimo de pedidos foi decidido para esta fase, limitado a visualizacao. |

## 29. Esclarecimentos

### Sessao 2026-06-09

- **Q:** Checkout exige login obrigatorio ou visitante pode criar pedido?
  **R:** Checkout exige usuario autenticado. Visitante pode montar carrinho, aplicar cupom e cotar frete, mas deve fazer login/cadastro antes de criar pedido.
- **Q:** Carrinho anonimo pode virar pedido sem conta?
  **R:** Nao. Pedido sempre pertence a `userId`; `guestCartToken` serve apenas para carrinho anonimo e merge.
- **Q:** Quais dados minimos do cliente sao obrigatorios?
  **R:** Nome completo, e-mail da conta autenticada e telefone/WhatsApp. CPF/CNPJ fica fora da fase.
- **Q:** Qual endereco e exigido?
  **R:** Endereco completo: CEP, UF, cidade, bairro, logradouro, numero, complemento opcional e destinatario se diferente do cliente.
- **Q:** Endereco deve persistir no perfil?
  **R:** Nao nesta fase. Deve ser snapshot no pedido; catalogo de enderecos fica para fase futura.
- **Q:** `usedCount` do cupom e consumido na criacao do pedido pendente?
  **R:** Nao. Deve ser consumido apenas em fase futura de pagamento confirmado ou pedido efetivamente confirmado.
- **Q:** Estoque e reservado ou baixado no pedido pendente?
  **R:** Nao. A Fase 8 valida estoque, mas nao baixa nem reserva definitivamente.
- **Q:** O que acontece com o carrinho apos o pedido?
  **R:** Carrinho usado e marcado como convertido/bloqueado; novo carrinho ativo pode ser criado para compras futuras.
- **Q:** Qual a expiracao do pedido pendente?
  **R:** 60 minutos: `expiresAt = createdAt + 60 minutos`.
- **Q:** Quais estados iniciais de pedido e pagamento?
  **R:** Pedido nasce `aguardando_pagamento`; nao ha pagamento real. Placeholder interno pendente so se o modelo exigir, sem provider externo.
- **Q:** Area customer entra na Fase 8?
  **R:** Sim, listagem minima de pedidos pendentes do proprio cliente.
- **Q:** Admin minimo de pedidos entra na Fase 8?
  **R:** Sim, visualizacao basica para admin/manager, sem marcar pago, baixar estoque, criar pagamento ou editar valores.
- **Q:** Como tratar fallback sem `DATABASE_URL`?
  **R:** Preview/producao falham de forma segura; dev/test podem usar fixture explicito sem prometer persistencia real.
- **Q:** Qual caminho correto do SDD legado?
  **R:** `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\`. A leitura confirmou regras de pedido pendente, snapshots, carrinho convertido, expiracao em 60 minutos e efeitos de pagamento fora desta fase.

## 30. Historico de Alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-09 | Versao inicial gerada por `/reversa-requirements` | reversa |
| 2026-06-09 | Duvidas resolvidas por `/reversa-clarify` com decisoes humanas | reversa |
