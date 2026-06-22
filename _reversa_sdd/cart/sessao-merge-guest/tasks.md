# Cart / Sessao e Merge Guest, Tasks

> Checklist executavel da subunidade `cart/sessao-merge-guest`. As tarefas cobrem token guest, resolucao de ator, fallback seguro e merge do carrinho anonimo para usuario autenticado.

## 1. Token Guest

- [ ] TASK-CART-SESSION-001 Validar nome do cookie guest.
  - Confirmar constante `guestCartCookieName = "guestCartToken"`.
  - Confirmar que leitura, escrita e remocao usam o mesmo nome.

- [ ] TASK-CART-SESSION-002 Validar tempo de vida do cookie.
  - Confirmar `guestCartMaxAgeSeconds = 60 * 60 * 24 * 30`.
  - Registrar que o token anonimo dura 30 dias.

- [ ] TASK-CART-SESSION-003 Validar leitura de token ausente.
  - `readGuestCartTokenValue(undefined)` deve retornar `null`.
  - String vazia deve retornar `null`.

- [ ] TASK-CART-SESSION-004 Validar tamanho minimo e maximo do token.
  - Token menor que 16 caracteres deve retornar `null`.
  - Token maior que 128 caracteres deve retornar `null`.
  - Token dentro do intervalo deve prosseguir para regex.

- [ ] TASK-CART-SESSION-005 Validar caracteres permitidos.
  - Aceitar letras, numeros, `_` e `-`.
  - Rejeitar espacos, pontos, barras, sinais de igual e outros caracteres fora de base64url.

- [ ] TASK-CART-SESSION-006 Validar criacao criptografica do token.
  - `createGuestCartToken` deve usar `randomBytes(32)`.
  - Saida deve ser `base64url`.
  - Saida deve passar em `readGuestCartTokenValue`.

## 2. Cookie Seguro

- [ ] TASK-CART-SESSION-007 Validar opcoes comuns do cookie.
  - `httpOnly: true`.
  - `sameSite: "lax"`.
  - `path: "/"`.
  - `maxAge` igual a 30 dias.

- [ ] TASK-CART-SESSION-008 Validar flag secure por ambiente.
  - Em `production`, `secure` deve ser true.
  - Em `preview`, `secure` deve ser true.
  - Em `development` e `test`, `secure` pode ser false.

- [ ] TASK-CART-SESSION-009 Validar expiracao do cookie.
  - `expireGuestCartToken` deve chamar `cookieStore.delete("guestCartToken")`.
  - Expiracao nao deve depender de cliente JavaScript.

## 3. Resolucao de Ator

- [ ] TASK-CART-SESSION-010 Validar leitura inicial de contexto.
  - `resolveCartActor` deve ler `getRuntimeMode()`.
  - Deve ler `cookies()`.
  - Deve ler `getCurrentSession()`.

- [ ] TASK-CART-SESSION-011 Validar bloqueio de preview/producao sem banco.
  - Sem banco em `preview`, retornar `unavailable`.
  - Sem banco em `production`, retornar `unavailable`.
  - Nao criar token guest nesse caso.

- [ ] TASK-CART-SESSION-012 Validar criacao de token em mutacao guest.
  - Com `createGuestToken: true`, visitante sem sessao e sem token deve receber token novo.
  - Cookie deve ser gravado com opcoes seguras.
  - Ator final deve ser `guest`.

- [ ] TASK-CART-SESSION-013 Validar prioridade da sessao autenticada.
  - Com sessao autenticada, retornar `authenticated`.
  - Incluir `userId`.
  - Incluir `role`.
  - Preservar `guestToken` opcional quando cookie valido existir.

- [ ] TASK-CART-SESSION-014 Validar visitante com cookie valido.
  - Sem sessao autenticada e com cookie valido, retornar `guest`.
  - Usar o token lido do cookie.

- [ ] TASK-CART-SESSION-015 Validar fallback dev/test.
  - Sem banco em `development`, retornar guest `dev-fallback-guest`.
  - Sem banco em `test`, retornar guest `dev-fallback-guest`.
  - Nao gravar cookie apenas por leitura.

- [ ] TASK-CART-SESSION-016 Validar guest vazio com banco.
  - Sem cookie e com banco disponivel, retornar guest `empty-guest`.
  - Esse ator deve representar leitura vazia, nao carrinho persistido real.

## 4. Token para Merge

- [ ] TASK-CART-SESSION-017 Validar obtencao de token para merge.
  - `getGuestCartTokenForMerge` deve ler o cookie atual.
  - Deve reutilizar `readGuestCartTokenValue`.
  - Deve retornar token valido ou `null`.

- [ ] TASK-CART-SESSION-018 Validar que token invalido nao entra no merge.
  - Cookie curto deve virar `null`.
  - Cookie com caracteres invalidos deve virar `null`.
  - Merge com `null` deve cair no fluxo sem guest.

## 5. Merge Sem Guest ou Guest Vazio

- [ ] TASK-CART-MERGE-001 Validar merge sem token guest.
  - `mergeGuestCartIntoUser({ userId, guestToken: null })` deve retornar `getActiveCart()`.
  - Nao deve criar ator guest.
  - Nao deve converter carrinho inexistente.

- [ ] TASK-CART-MERGE-002 Validar guest sem carrinho.
  - Buscar carrinho guest ativo.
  - Se `guestCart.id === null`, garantir carrinho autenticado ativo.
  - Retornar carrinho autenticado recalculado.

- [ ] TASK-CART-MERGE-003 Validar guest sem itens.
  - Se carrinho guest tem id mas `items.length === 0`, garantir carrinho autenticado ativo.
  - Retornar carrinho autenticado recalculado.
  - Nao adicionar itens.

## 6. Merge de Itens

- [ ] TASK-CART-MERGE-004 Validar criacao dos atores internos.
  - Guest actor deve ser `{ kind: "guest", guestToken }`.
  - User actor deve ser `{ kind: "authenticated", userId, role: "customer" }`.

- [ ] TASK-CART-MERGE-005 Validar garantia de carrinho autenticado.
  - Antes de migrar itens, chamar `getOrCreateActiveCart(userActor)`.
  - Migracao deve ocorrer para o carrinho do usuario.

- [ ] TASK-CART-MERGE-006 Validar rejeicao de produto inexistente.
  - Buscar produto pelo `item.productId`.
  - Se produto nao existir, nao migrar item.
  - Adicionar aviso `Item indisponivel removido do merge: ...`.

- [ ] TASK-CART-MERGE-007 Validar rejeicao de produto nao compravel.
  - Usar `isProductAvailableForPurchase(product)`.
  - Produto draft, futuro, inactive ou sem estoque nao deve migrar.
  - Adicionar aviso de indisponibilidade.

- [ ] TASK-CART-MERGE-008 Validar calculo de quantidade existente.
  - Carregar carrinho atual do usuario a cada item.
  - Localizar item existente pelo mesmo `productId`.
  - Calcular `existingQuantity`.

- [ ] TASK-CART-MERGE-009 Validar limite por estoque restante.
  - Calcular `stockQuantity - existingQuantity`.
  - Calcular `allowedQuantity = min(item.quantity, max(restante, 0))`.
  - Nunca migrar quantidade menor que zero.

- [ ] TASK-CART-MERGE-010 Validar estoque indisponivel.
  - Se `allowedQuantity <= 0`, nao migrar item.
  - Adicionar aviso `Estoque indisponivel para {produto}.`.

- [ ] TASK-CART-MERGE-011 Validar reducao de quantidade.
  - Se `allowedQuantity < item.quantity`, migrar apenas `allowedQuantity`.
  - Adicionar aviso `Quantidade de {produto} limitada ao estoque disponivel.`.

- [ ] TASK-CART-MERGE-012 Validar snapshot no carrinho autenticado.
  - Ao adicionar ao carrinho do usuario, usar `product.id`.
  - Usar `product.name`.
  - Usar `product.priceCents`.
  - Usar `allowedQuantity`.

## 7. Conversao e Cupom

- [ ] TASK-CART-MERGE-013 Validar conversao do carrinho guest.
  - Se `guestCart.id !== null`, chamar `markCartConverted(guestCart.id)`.
  - Carrinho convertido nao deve voltar como ativo no repositorio.

- [ ] TASK-CART-MERGE-014 Validar captura de cupom guest.
  - Capturar `guestCouponId` antes da migracao.
  - Preservar valor para etapa de transferencia.

- [ ] TASK-CART-MERGE-015 Validar transferencia condicional de cupom.
  - Carregar carrinho autenticado final.
  - Se `guestCouponId` existe e `merged.appliedCouponId === null`, aplicar cupom guest.
  - Se usuario ja tem cupom, nao sobrescrever.

- [ ] TASK-CART-MERGE-016 Validar recalculo final.
  - Chamar `recalculateCartForActor(userActor, merged)`.
  - Retornar `toResult` com carrinho recalculado.
  - Incluir warnings acumulados em `messages`.

## 8. Fallback e Ambientes

- [ ] TASK-CART-SESSION-019 Validar comportamento sem banco em dev/test.
  - Carrinho deve continuar operavel via fallback.
  - Token `dev-fallback-guest` deve ser tratado como guest.
  - Nenhuma conexao real deve ser aberta.

- [ ] TASK-CART-SESSION-020 Validar fail-safe em preview/producao.
  - Sem banco, qualquer fluxo de carrinho deve retornar unavailable.
  - Nao gravar cookie novo.
  - Nao usar fallback em memoria.

## 9. Testes

- [ ] TASK-CART-SESSION-021 Cobrir unit tests de token.
  - Token ausente.
  - Token curto.
  - Token longo.
  - Token com caracteres invalidos.
  - Token gerado valido.

- [ ] TASK-CART-SESSION-022 Cobrir unit tests de resolveCartActor.
  - Guest com cookie.
  - Guest criando token.
  - Authenticated com guest token preservado.
  - Dev/test fallback.
  - Preview/producao unavailable.

- [ ] TASK-CART-MERGE-017 Cobrir merge sem token.
  - Deve retornar carrinho ativo do usuario.
  - Nao deve tentar buscar guest cart.

- [ ] TASK-CART-MERGE-018 Cobrir merge de guest vazio.
  - Deve garantir carrinho autenticado.
  - Nao deve marcar item migrado.

- [ ] TASK-CART-MERGE-019 Cobrir merge de item valido.
  - Item guest deve aparecer no carrinho autenticado.
  - Carrinho guest deve virar converted.

- [ ] TASK-CART-MERGE-020 Cobrir merge com produto indisponivel.
  - Item nao migra.
  - Warning aparece em mensagens.

- [ ] TASK-CART-MERGE-021 Cobrir merge com estoque parcial.
  - Migrar somente estoque restante.
  - Warning de quantidade limitada aparece.

- [ ] TASK-CART-MERGE-022 Cobrir cupom guest.
  - Transferir cupom quando usuario nao tem cupom.
  - Nao sobrescrever cupom existente do usuario.

## 10. Validacoes Recomendadas

- [ ] TASK-CART-SESSION-023 Rodar `pnpm lint`.
- [ ] TASK-CART-SESSION-024 Rodar `pnpm typecheck`.
- [ ] TASK-CART-SESSION-025 Rodar `pnpm test`.
- [ ] TASK-CART-SESSION-026 Rodar testes E2E de login/carrinho quando houver cobertura de merge.
- [ ] TASK-CART-SESSION-027 Rodar `pnpm build` se houver mudanca funcional.

## 11. Guardrails

- [ ] TASK-CART-SESSION-028 Nao expor token guest para JavaScript cliente.
- [ ] TASK-CART-SESSION-029 Nao usar fallback em memoria em preview/producao.
- [ ] TASK-CART-SESSION-030 Nao mesclar produto indisponivel.
- [ ] TASK-CART-SESSION-031 Nao exceder estoque ao migrar item guest.
- [ ] TASK-CART-SESSION-032 Nao sobrescrever cupom existente do usuario.
- [ ] TASK-CART-SESSION-033 Nao tratar carrinho como reserva de estoque.
- [ ] TASK-CART-SESSION-034 Nao conectar banco real em testes de fallback.

## 12. Definition of Done

- [ ] Token guest tem validacao e criacao documentadas.
- [ ] Resolucao de ator cobre guest, authenticated, fallback e unavailable.
- [ ] Merge guest preserva itens possiveis, respeita estoque e retorna warnings.
- [ ] Conversao do carrinho guest esta coberta por tarefa.
- [ ] Transferencia de cupom guest esta coberta por tarefa.
- [ ] Trio `requirements.md`, `design.md`, `tasks.md` da subunidade esta completo.
