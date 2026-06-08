# Requirements: Fase 5 - Carrinho e sessao de compra

> Identificador: `003-fase-5-carrinho`
> Data: `2026-06-08`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Objetivo

Preparar a implementação do carrinho de compras da Tríade Essenza Next, com suporte a visitante,
usuario autenticado, itens, subtotal em centavos, validação de disponibilidade/estoque e base para
checkout futuro. A fase deve preservar paridade com o legado sem implementar checkout, pagamento,
frete, cupom, pedido ou reserva definitiva de estoque.

## 2. Contexto

| Fonte | Trecho relevante | Confidência |
|---|---|---|
| `_reversa_sdd/domain.md#5-produto-publico` | Produto comprável depende de `published`, `publishedAt <= now` e `stockQuantity > 0`. | 🟢 |
| `_reversa_sdd/domain.md#10-regras-preservadas-para-regressao` | Preços ficam em centavos; fallback sem banco não pode fingir persistência. | 🟢 |
| `_reversa_sdd/architecture.md#4-auth-e-sessao` | Sessão server-side expõe `userId`, `email` e `role` de forma normalizada. | 🟢 |
| `_reversa_sdd/permissions.md#policies` | `requireOwner` está preparado para recursos próprios de cliente. | 🟢 |
| `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | `carts` e `cart_items` já existem no schema preparado, mas ainda não foram ativados. | 🟢 |
| `_reversa_sdd/state-machines.md#produto` | `draft`, `inactive`, futuro e sem estoque não são compráveis. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\cart\requirements.md` | Legado confirma carrinho de usuário ou guest token, status/currency, itens com snapshots e operações de listar/adicionar/atualizar/remover. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\cart\design.md` | Legado centraliza totalização em serviço de carrinho e muda `active` para `converted` quando checkout gera pedido. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\checkout\requirements.md` | Checkout legado bloqueia carrinho vazio, produto indisponível e estoque insuficiente. | 🟢 |
| `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration\database-plan.md` | Modelo alvo prevê `carts(userId, guestToken, status, currency)` e `cart_items(cartId, productId, productNameSnapshot, unitPriceSnapshot, quantity)`. | 🟢 |

## 3. Escopo

- Definir modelo funcional de carrinho ativo.
- Definir carrinho de visitante por identificador de sessão anônima.
- Definir carrinho de usuario autenticado associado a `session.userId`.
- Definir itens do carrinho com quantidade, snapshot de nome e snapshot de preço.
- Definir ações de adicionar produto, atualizar quantidade, remover item e limpar carrinho.
- Definir cálculo de subtotal em centavos.
- Definir validações de produto público/comprável e estoque.
- Definir comportamento de merge ao login.
- Definir proteção de ownership do carrinho.
- Definir comportamento em fallback sem `DATABASE_URL`.
- Definir UI mínima de carrinho.
- Definir testes unitários, e2e e documentação.

## 4. Fora de escopo

- Implementar código nesta etapa de requirements.
- Rodar migrations contra banco real.
- Conectar banco de produção.
- Fazer deploy ou push.
- Implementar checkout.
- Criar pedido.
- Implementar pagamento, Stripe ou webhooks.
- Implementar frete/cotação de frete.
- Implementar cupom/desconto.
- Baixar estoque ou criar reserva definitiva de estoque.
- Criar sincronização Bling, documentos fiscais, notificações de pedido ou analytics real.
- Migrar dados reais do Laravel.
- Expor `.env`, `DATABASE_URL`, cookies, tokens, senhas ou secrets.

## 5. Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|---|---|---|---|---|
| RF-01 | O sistema deve permitir visualizar carrinho vazio para visitante. | Must | A rota/página de carrinho renderiza estado vazio sem exigir login. | 🟢 |
| RF-02 | O sistema deve permitir visualizar carrinho vazio para usuario autenticado. | Must | Usuario autenticado acessa a mesma superfície de carrinho sem erro de ownership. | 🟢 |
| RF-03 | O sistema deve permitir adicionar produto publicado, vigente e com estoque positivo. | Must | Produto elegível entra no carrinho com quantidade inicial válida. | 🟢 |
| RF-04 | O sistema deve bloquear adição de produto `draft`, `inactive`, futuro ou sem estoque. | Must | A action retorna erro controlado e o carrinho não muda. | 🟢 |
| RF-05 | O sistema deve bloquear quantidade maior que estoque disponível. | Must | Adicionar/atualizar acima do estoque retorna erro e preserva estado anterior. | 🟢 |
| RF-06 | O sistema deve atualizar quantidade de item existente. | Must | Quantidade válida substitui ou ajusta o item conforme regra definida para a action. | 🟢 |
| RF-07 | O sistema deve remover item do carrinho. | Must | Item removido deixa de aparecer e subtotal é recalculado. | 🟢 |
| RF-08 | O sistema deve limpar todos os itens do carrinho ativo. | Must | Carrinho fica vazio e subtotal volta para 0. | 🟢 |
| RF-09 | O sistema deve calcular subtotal em centavos. | Must | Subtotal é soma de `unitPriceSnapshotCents * quantity` para itens válidos. | 🟢 |
| RF-10 | O sistema deve preservar snapshot de nome e preço do produto no item. | Should | Item guarda nome/preço no momento da adição ou atualização validada. | 🟢 |
| RF-11 | O sistema deve tratar visitante e usuario autenticado como donos diferentes de carrinho. | Must | Usuario não acessa nem modifica carrinho de outro usuario ou outro guest token. | 🟢 |
| RF-12 | O sistema deve mesclar carrinho visitante e carrinho autenticado no login somando quantidades por produto e limitando pelo estoque disponível. | Must | Login com carrinho visitante e carrinho autenticado existente produz um carrinho autenticado único, sem duplicidade e sem ultrapassar estoque. | 🟢 |
| RF-13 | O sistema deve manter checkout, cupom, frete e pedido como placeholders ou links inativos nesta fase. | Must | Nenhuma action cria pedido, calcula frete real, aplica cupom ou chama Stripe. | 🟢 |
| RF-14 | O sistema deve expor mensagens seguras para carrinho indisponível em fallback sem banco. | Must | Sem `DATABASE_URL`, UI/action informa limitação sem prometer persistência real. | 🟢 |
| RF-15 | O sistema deve manter storefront público sem login. | Must | Home, catálogo e página de produto continuam acessíveis anonimamente. | 🟢 |

## 6. Requisitos não funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|---|---|---|---|
| Segurança | Identificadores de carrinho anônimo devem usar cookie seguro/opaco e tabela `carts` por `guestToken`/`sessionId`, sem itens, preços ou dados sensíveis no cookie. | Decisão humana da clarificação da Fase 5. | 🟢 |
| Segurança | Erros de carrinho não podem expor token, cookie, `DATABASE_URL`, SQL, stack trace ou dados de outro usuario. | Guardrails de auth e fallback em `_reversa_sdd/permissions.md`. | 🟢 |
| Privacidade | Carrinho autenticado deve ser filtrado por `session.userId` no servidor. | `requireOwner` e ownership confirmados. | 🟢 |
| Confiabilidade | Falha de leitura de sessão deve cair em carrinho visitante somente quando houver identificador anônimo válido; caso contrário, deve bloquear de forma segura. | Estados de sessão em `_reversa_sdd/state-machines.md#authsession` e decisão humana da Fase 5. | 🟢 |
| Consistência | Cálculo monetário deve usar centavos inteiros, sem float para subtotal. | Regra RN-PRICE-001 confirmada. | 🟢 |
| Resiliência | Build/test não devem exigir banco real nem credenciais reais. | Guardrail preservado desde Fase 3. | 🟢 |
| UX | Estado vazio, erro de estoque e produto indisponível devem ser claros e acionáveis. | Necessário para carrinho público. | 🟡 |
| Observabilidade | Falhas de action podem ser registradas sem secrets e sem dados pessoais sensíveis. | Padrão de mensagens seguras da Fase 4. | 🟡 |

## 7. Regras de negócio herdadas

1. **RN-HER-01:** Produto público/comprável exige `status = published`. 🟢
   - Origem: `_reversa_sdd/domain.md#5-produto-publico`
   - Tipo: preservada
2. **RN-HER-02:** Produto público/comprável exige `publishedAt <= now`. 🟢
   - Origem: `_reversa_sdd/domain.md#5-produto-publico`
   - Tipo: preservada
3. **RN-HER-03:** Produto público/comprável exige `stockQuantity > 0`. 🟢
   - Origem: `_reversa_sdd/domain.md#5-produto-publico`
   - Tipo: preservada
4. **RN-HER-04:** Produto `draft`, `inactive`, futuro ou sem estoque não pode ser adicionado como comprável. 🟢
   - Origem: `_reversa_sdd/state-machines.md#produto`
   - Tipo: preservada
5. **RN-HER-05:** Preços do domínio ficam em centavos. 🟢
   - Origem: `_reversa_sdd/domain.md#10-regras-preservadas-para-regressao`
   - Tipo: preservada
6. **RN-HER-06:** Cliente só acessa recursos próprios. 🟢
   - Origem: `_reversa_sdd/permissions.md#policies`
   - Tipo: preservada
7. **RN-HER-07:** Carrinho não cria pedido nesta fase. 🟢
   - Origem: escopo solicitado e legado separa carrinho de checkout.
   - Tipo: preservada por fase
8. **RN-HER-08:** Carrinho não reserva estoque definitivamente nesta fase. 🟡
   - Origem: escopo solicitado; legado baixa estoque no pagamento confirmado, não no carrinho.
   - Tipo: preservada por fase
9. **RN-F5-01:** Carrinho anônimo usa cookie seguro/opaco `guestCartToken` e persistência em `carts` por `guestToken`/`sessionId` quando houver banco. 🟢
   - Origem: decisão humana da clarificação da Fase 5
   - Tipo: nova
10. **RN-F5-02:** Merge no login soma quantidades por produto, limita pelo estoque disponível e marca o carrinho anônimo como convertido/mesclado. 🟢
   - Origem: decisão humana da clarificação da Fase 5
   - Tipo: nova
11. **RN-F5-03:** Carrinho valida estoque nas ações, visualização/recalculo e futuro pré-checkout, mas não reserva estoque. 🟢
   - Origem: decisão humana da clarificação da Fase 5
   - Tipo: nova
12. **RN-F5-04:** Quantidade mínima por item é 1 e quantidade máxima é `stockQuantity`, sem limite comercial próprio nesta fase. 🟢
   - Origem: decisão humana da clarificação da Fase 5
   - Tipo: nova
13. **RN-F5-05:** Admin e manager podem usar carrinho como usuários autenticados normais, sem privilégios especiais de compra. 🟢
   - Origem: decisão humana da clarificação da Fase 5
   - Tipo: nova

## 8. Requisitos de segurança

- RS-01: Toda leitura/escrita de carrinho autenticado deve usar `session.userId` server-side.
- RS-02: Toda leitura/escrita de carrinho anônimo deve validar o identificador de sessão anônima definido para a fase.
- RS-03: Nenhuma action pode aceitar `userId`, role ou dono do carrinho vindo do cliente como fonte confiável.
- RS-04: Usuario autenticado não pode acessar carrinho de outro usuario.
- RS-05: Visitante não pode acessar carrinho de outro visitante.
- RS-06: Erro de ownership deve retornar mensagem genérica, sem indicar existência do carrinho de outro usuario.
- RS-07: O cookie `guestCartToken` deve armazenar somente identificador opaco do carrinho/sessão, sem itens, preços, userId, role ou dados sensíveis.
- RS-08: Logs e erros não podem expor cookies, guest token, sessão, `DATABASE_URL`, senha ou SQL sensível.
- RS-09: Server actions de carrinho devem validar produto e estoque no servidor em toda mutação.
- RS-10: `guestCartToken` deve ser tratado como identificador opaco, não como segredo reutilizável para autorização crítica.
- RS-11: LocalStorage não deve ser fonte primária de persistência do carrinho nesta fase.

## 9. Requisitos de banco

- RB-01: A Fase 5 deve mapear o uso das tabelas `carts` e `cart_items` já modeladas no schema atual.
- RB-02: `carts` deve manter `status` ao menos com `active`; `converted` fica preparado para checkout futuro.
- RB-03: `carts.userId` deve associar carrinho autenticado ao usuário dono.
- RB-04: `carts.guestToken`/`sessionId` deve associar carrinho visitante ao identificador opaco salvo no cookie seguro `guestCartToken`.
- RB-05: `cart_items.productId` deve referenciar produto existente.
- RB-06: `cart_items.productNameSnapshot` e `cart_items.unitPriceSnapshot` devem preservar snapshot no carrinho.
- RB-07: `quantity` deve ser inteiro positivo.
- RB-08: Subtotal não precisa ser persistido se puder ser derivado de itens; se persistido, deve ter regra clara de atualização.
- RB-09: Migration local pode ser gerada se o schema precisar de índices/constraints adicionais, mas nunca aplicada em banco real sem validação humana.
- RB-10: Sem `DATABASE_URL`, o sistema não deve criar falsa persistência de carrinho.
- RB-11: Carrinho autenticado deve ser vinculado a `userId` e persistir entre dispositivos quando houver banco real.
- RB-12: Deve haver apenas um carrinho ativo principal por usuário, salvo justificativa técnica posterior no plano.
- RB-13: Carrinhos convertidos, mesclados, abandonados ou expirados não devem ser tratados como carrinho ativo.

## 10. Requisitos de sessão/carrinho anônimo

- RSA-01: Visitante deve conseguir ver carrinho vazio.
- RSA-02: Visitante deve conseguir adicionar produto elegível ao carrinho conforme regras de estoque.
- RSA-03: Carrinho anônimo deve ter identificador próprio e não depender de login.
- RSA-04: O identificador anônimo deve ser um cookie seguro/opaco `guestCartToken`, associado a `carts.guestToken`/`sessionId` quando houver banco.
- RSA-05: Carrinho anônimo não deve conter dados pessoais.
- RSA-06: Carrinho anônimo deve poder ser descartado/limpo.
- RSA-07: O cookie não deve armazenar itens, preços, subtotais nem dados sensíveis.
- RSA-08: Os itens do carrinho anônimo devem ficar no banco quando `DATABASE_URL` existir.
- RSA-09: O carrinho anônimo deve respeitar expiração.
- RSA-10: LocalStorage fica fora da fonte primária de persistência; pode ser avaliado futuramente apenas para UX temporária.

## 11. Requisitos de carrinho autenticado

- RCA-01: Usuario autenticado deve ter carrinho ativo vinculado a `session.userId`.
- RCA-02: Carrinho autenticado deve respeitar ownership server-side.
- RCA-03: Usuario autenticado deve conseguir adicionar, atualizar, remover e limpar itens.
- RCA-04: Admin/manager não recebem privilégio especial no carrinho nesta fase.
- RCA-05: Admin/manager podem usar carrinho como usuários autenticados normais, sem ignorar estoque, disponibilidade ou regras de compra.
- RCA-06: Carrinho autenticado deve persistir entre dispositivos quando houver banco real.
- RCA-07: Sem banco real, persistência entre dispositivos não existe e deve ser documentada como indisponível no fallback.

## 12. Requisitos de merge de carrinho no login

- RML-01: Login com carrinho visitante ativo deve disparar uma regra explícita de reconciliação com o carrinho autenticado.
- RML-02: Merge deve revalidar disponibilidade e estoque de todos os itens.
- RML-03: Merge não pode ultrapassar estoque disponível.
- RML-04: Merge não pode duplicar o mesmo produto em duas linhas equivalentes.
- RML-05: Merge deve preservar snapshots de preço/nome conforme regra definida para conflito.
- RML-06: Se o mesmo produto existir nos dois carrinhos, o merge deve somar quantidades.
- RML-07: Se a soma ultrapassar o estoque disponível, a quantidade final deve ser limitada ao estoque e a action deve registrar/retornar aviso controlado.
- RML-08: Produtos indisponíveis, `draft`, `inactive`, futuros ou sem estoque devem ser removidos ou bloqueados durante o merge com aviso controlado.
- RML-09: O carrinho anônimo deve ser marcado como convertido/mesclado após merge bem-sucedido.
- RML-10: O merge deve ser idempotente quando possível para evitar duplicidade em retentativas.
- RML-11: A UX de escolha manual de merge fica fora do escopo desta fase.

## 13. Requisitos de ownership

- ROW-01: Carrinho autenticado pertence ao `session.userId`.
- ROW-02: Carrinho anônimo pertence ao identificador anônimo validado.
- ROW-03: Server actions devem resolver o carrinho atual a partir da sessão/identificador, não por id arbitrário vindo do cliente.
- ROW-04: Acesso cruzado deve retornar erro controlado e não revelar dados do carrinho alheio.
- ROW-05: `requireOwner` ou policy equivalente deve ser usada quando houver `userId` persistido.

## 14. Requisitos de estoque/disponibilidade

- RED-01: Produto `draft` não pode ser adicionado.
- RED-02: Produto `inactive` não pode ser adicionado.
- RED-03: Produto com `publishedAt` futuro não pode ser adicionado.
- RED-04: Produto sem `publishedAt` não pode ser adicionado.
- RED-05: Produto com `stockQuantity <= 0` não pode ser adicionado.
- RED-06: Quantidade solicitada deve ser maior que 0.
- RED-07: Quantidade total no carrinho para um produto não pode exceder `stockQuantity`.
- RED-08: Atualização de quantidade deve revalidar estoque atual.
- RED-09: Carrinho não deve reservar estoque definitivamente nesta fase.
- RED-10: Quantidade mínima por item deve ser 1.
- RED-11: Quantidade máxima por item deve ser exatamente `stockQuantity` no momento da validação.
- RED-12: Se o estoque mudar e a quantidade do carrinho ficar acima do disponível, o carrinho deve sinalizar ajuste necessário ou ajustar de forma controlada conforme plano técnico.
- RED-13: Carrinho deve apenas validar disponibilidade e estoque ao adicionar, atualizar quantidade, visualizar/recalcular e futuramente antes do checkout.
- RED-14: Estoque só deve ser baixado ou reservado em fase futura de pedido/pagamento.
- RED-15: Limite comercial próprio pode ser preparado como extensão futura, mas não implementado nesta fase.

## 15. Requisitos de cálculo de subtotal

- RCS-01: Subtotal deve ser calculado em centavos.
- RCS-02: Subtotal de item deve ser `unitPriceSnapshotCents * quantity`.
- RCS-03: Subtotal do carrinho deve ser soma dos subtotais dos itens.
- RCS-04: Subtotal vazio deve ser 0.
- RCS-05: Cupom, frete, desconto e total final ficam fora desta fase.
- RCS-06: UI deve deixar claro que subtotal não inclui frete, cupom ou checkout quando essa informação aparecer.

## 16. Requisitos de server actions

- RSACT-01: Deve existir action para adicionar produto ao carrinho.
- RSACT-02: Deve existir action para atualizar quantidade.
- RSACT-03: Deve existir action para remover item.
- RSACT-04: Deve existir action para limpar carrinho.
- RSACT-05: Toda action deve validar produto e estoque no servidor.
- RSACT-06: Toda action deve resolver ownership no servidor.
- RSACT-07: Toda action deve retornar estados seguros para sucesso, validação, indisponibilidade, estoque insuficiente, carrinho indisponível e fallback.
- RSACT-08: Nenhuma action deve criar pedido, iniciar checkout, chamar Stripe, calcular frete real ou aplicar cupom nesta fase.

## 17. Requisitos de UI

- RUI-01: Carrinho deve ter página ou superfície mínima acessível para visitante.
- RUI-02: Estado vazio deve informar que não há itens.
- RUI-03: Item de carrinho deve exibir nome, preço unitário, quantidade, subtotal do item e ação de remover.
- RUI-04: UI deve permitir atualizar quantidade dentro dos limites definidos.
- RUI-05: UI deve permitir limpar carrinho.
- RUI-06: UI deve exibir subtotal em moeda a partir de centavos.
- RUI-07: UI deve mostrar erro controlado para produto indisponível ou estoque insuficiente.
- RUI-08: Botão/CTA de checkout pode aparecer como desabilitado ou placeholder, sem criar fluxo real.

## 18. Requisitos de ambiente/fallback

- RAF-01: Em local/dev sem `DATABASE_URL`, build/test devem funcionar.
- RAF-02: Em local/dev sem `DATABASE_URL`, carrinho não deve prometer persistência real.
- RAF-03: Em local/dev com banco, carrinho real pode persistir se migrations locais forem aplicadas por decisão humana.
- RAF-04: Em test, deve ser possível cobrir carrinho sem credenciais reais.
- RAF-05: Em preview/produção, carrinho persistente deve exigir configuração completa e não pode cair em fixture silencioso.
- RAF-06: Sem `DATABASE_URL`, carrinho deve permitir visualização e interações controladas apenas em modo dev/fixture.
- RAF-07: Fallback sem banco deve exibir aviso ou sinalização técnica de que não há persistência real onde fizer sentido.
- RAF-08: Mutations em fallback podem retornar resultado controlado de dev/test, mas devem indicar que não foram persistidas.
- RAF-09: Em produção/preview sem banco, mutations de carrinho devem falhar de forma segura.
- RAF-10: E2E padrão deve conseguir rodar sem banco usando fallback controlado.
- RAF-11: Quando `DATABASE_URL` existir e operação real falhar, o erro não pode ser mascarado como fallback silencioso.

## 19. Critérios de aceite

- CA-01: Visitante consegue visualizar carrinho vazio.
- CA-02: Usuario autenticado consegue visualizar carrinho vazio.
- CA-03: Produto publicado, vigente e com estoque pode ser adicionado.
- CA-04: Produto `draft` não pode ser adicionado.
- CA-05: Produto `inactive` não pode ser adicionado.
- CA-06: Produto futuro não pode ser adicionado.
- CA-07: Produto sem estoque não pode ser adicionado.
- CA-08: Quantidade não pode exceder estoque disponível.
- CA-09: Item pode ter quantidade atualizada.
- CA-10: Item pode ser removido.
- CA-11: Carrinho pode ser limpo.
- CA-12: Carrinho calcula subtotal em centavos.
- CA-13: Carrinho de usuario autenticado respeita ownership.
- CA-14: Usuario não acessa carrinho de outro usuario.
- CA-15: Sem `DATABASE_URL`, comportamento é explícito e não finge persistência real.
- CA-16: Build/test não exigem banco real nem credenciais reais.
- CA-17: Checkout, pagamento, frete, cupom e pedido continuam fora de escopo.
- CA-18: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` são validações obrigatórias da implementação futura.

## 20. Cenários de teste

```gherkin
Cenario: visitante visualiza carrinho vazio
  Dado que nao existe carrinho ativo para o visitante
  Quando ele acessa a pagina de carrinho
  Entao o sistema mostra estado vazio
  E nao exige login

Cenario: adicionar produto elegivel
  Dado um produto published com publishedAt no passado e stockQuantity maior que 0
  Quando o visitante adiciona quantidade 1 ao carrinho
  Entao o item aparece no carrinho
  E o subtotal e calculado em centavos

Cenario: bloquear produto draft
  Dado um produto com status draft
  Quando o usuario tenta adicionar ao carrinho
  Entao a action retorna erro de produto indisponivel
  E o carrinho nao e alterado

Cenario: bloquear produto inactive
  Dado um produto com status inactive
  Quando o usuario tenta adicionar ao carrinho
  Entao a action retorna erro de produto indisponivel
  E o carrinho nao e alterado

Cenario: bloquear produto futuro
  Dado um produto published com publishedAt no futuro
  Quando o usuario tenta adicionar ao carrinho
  Entao a action retorna erro de produto indisponivel
  E o carrinho nao e alterado

Cenario: bloquear estoque insuficiente
  Dado um produto com stockQuantity igual a 2
  Quando o usuario tenta definir quantidade 3
  Entao a action retorna erro de estoque insuficiente
  E a quantidade anterior e preservada

Cenario: atualizar quantidade
  Dado um carrinho com item de quantidade 1
  Quando o usuario atualiza quantidade para 2 dentro do estoque
  Entao o carrinho exibe quantidade 2
  E recalcula subtotal

Cenario: remover item
  Dado um carrinho com um item
  Quando o usuario remove o item
  Entao o carrinho fica vazio
  E subtotal fica 0

Cenario: limpar carrinho
  Dado um carrinho com dois itens
  Quando o usuario limpa o carrinho
  Entao nenhum item permanece
  E subtotal fica 0

Cenario: usuario autenticado nao acessa carrinho de outro usuario
  Dado um carrinho persistido para userId A
  E uma sessao autenticada do userId B
  Quando B tenta modificar o carrinho de A
  Entao o sistema retorna acesso negado
  E nao revela itens de A

Cenario: login com carrinho visitante
  Dado um visitante com carrinho ativo
  E uma conta com ou sem carrinho ativo
  Quando o visitante faz login
  Entao o sistema aplica a regra de merge definida
  E revalida estoque e disponibilidade

Cenario: fallback sem banco
  Dado ausencia de DATABASE_URL
  Quando uma action de carrinho e chamada
  Entao o comportamento e explicito
  E nao promete persistencia real

Cenario: checkout fora de escopo
  Dado um carrinho com itens
  Quando o usuario tenta prosseguir para checkout nesta fase
  Entao nenhum pedido e criado
  E nenhum pagamento, frete real ou cupom e processado
```

## 21. Gaps e dúvidas

Nenhuma dúvida aberta após a sessão de clarificação de 2026-06-08. Checkout, pagamento, frete,
cupom, pedido, reserva/baixa de estoque e limites comerciais próprios permanecem fora de escopo
desta fase.

## 22. Glossário mínimo

| Termo | Definição |
|---|---|
| Carrinho | Agrupamento temporário de itens escolhidos antes do checkout. |
| Carrinho anônimo | Carrinho de visitante sem login, associado a identificador de sessão anônima. |
| Carrinho autenticado | Carrinho associado a `session.userId`. |
| Guest token | Identificador técnico de carrinho visitante, se essa estratégia for escolhida. |
| Item de carrinho | Linha com produto, snapshot de nome/preço e quantidade. |
| Snapshot de preço | Preço copiado para o item no momento da adição/atualização para subtotalização consistente. |
| Subtotal | Soma dos itens em centavos, sem frete, cupom, desconto ou total final. |
| Produto comprável | Produto público, vigente e com estoque positivo. |
| Merge de carrinho | Reconciliação entre carrinho visitante e carrinho autenticado no login. |
| Ownership | Regra que vincula recurso ao dono e impede acesso cruzado. |
| Fallback sem banco | Modo sem `DATABASE_URL`, que não pode fingir persistência real. |

## 23. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|---|---|---|
| RF-01 a RF-09 | Must | Sem essas funções, a Fase 5 não entrega carrinho utilizável. |
| RF-10 | Should | Snapshot preserva paridade com legado e prepara checkout. |
| RF-11 e ownership | Must | Evita vazamento entre usuarios e visitantes. |
| Merge no login | Must | Login já existe e precisa definir destino do carrinho visitante. |
| UI mínima | Must | Critérios de aceite exigem carrinho visível e manipulável. |
| Cupom, frete, checkout e pedido | Won't | Fora de escopo explícito desta fase. |

## 24. Esclarecimentos

### Sessão 2026-06-08

- **Q:** Qual estratégia deve ser usada para carrinho anônimo?
  **R:** Usar combinação de cookie seguro/opaco `guestCartToken` e tabela `carts` com `sessionId`/`guestToken`. O cookie não armazena itens, preços ou dados sensíveis; os itens ficam no banco quando `DATABASE_URL` existir. LocalStorage não é fonte primária nesta fase.
- **Q:** Qual regra de merge deve ser aplicada no login?
  **R:** Mesclar carrinho anônimo com carrinho autenticado somando quantidades por produto, limitando ao estoque disponível, removendo/bloqueando itens indisponíveis com aviso controlado e marcando o carrinho anônimo como convertido/mesclado.
- **Q:** O carrinho reserva estoque?
  **R:** Não. O carrinho apenas valida disponibilidade e estoque nas ações, visualização/recalculo e futuro pré-checkout. Reserva ou baixa de estoque fica para fase futura de pedido/pagamento.
- **Q:** Qual é a quantidade máxima por item?
  **R:** A quantidade mínima é 1 e a máxima é `stockQuantity` no momento da validação. Limite comercial próprio fica como extensão futura.
- **Q:** Admin/manager podem usar carrinho?
  **R:** Sim, como usuários autenticados normais, sem privilégios especiais, sem ignorar estoque e sem acesso a desconto, frete, checkout ou regra especial nesta fase.
- **Q:** Como deve funcionar fallback sem `DATABASE_URL`?
  **R:** Em dev/test, permitir visualização e interações controladas em modo fixture/dev com aviso de ausência de persistência real. Em preview/produção sem banco, mutations devem falhar de forma segura. Erro real com `DATABASE_URL` não pode virar fallback silencioso.
- **Q:** Carrinho autenticado persiste entre dispositivos?
  **R:** Sim, quando houver banco real, vinculado a `userId` e com apenas um carrinho ativo principal por usuário. Sem banco real, persistência entre dispositivos fica indisponível e documentada.

## 25. Histórico de alterações

| Data | Alteração | Autor |
|---|---|---|
| 2026-06-08 | Versão inicial gerada por `/reversa-requirements` | reversa |
