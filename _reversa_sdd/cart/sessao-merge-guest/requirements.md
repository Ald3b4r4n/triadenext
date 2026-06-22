# Cart / Sessao e Merge Guest

> Spec executavel da subunidade `cart/sessao-merge-guest`. Foca no QUE o sistema deve garantir ao identificar carrinho anonimo, autenticar usuario e mesclar itens do visitante no carrinho do cliente.

## Visao Geral

A sessao de carrinho usa um token anonimo em cookie para visitantes e a sessao autenticada para clientes. Quando o visitante faz login, o carrinho anonimo pode ser mesclado ao carrinho do usuario, preservando itens elegiveis, respeitando estoque atual, transferindo cupom quando seguro e marcando o carrinho anonimo como convertido.

## Responsabilidades

- Ler e validar cookie de carrinho anonimo.
- Criar token anonimo quando uma mutacao precisa de carrinho guest.
- Resolver ator do carrinho como `guest`, `authenticated` ou `unavailable`.
- Preservar token guest junto do ator autenticado para permitir merge.
- Usar fallback seguro em dev/test sem banco real.
- Bloquear uso de fallback em preview/producao sem banco.
- Expor utilitario para obter token guest antes/depois do login.
- Expirar cookie guest quando necessario.
- Mesclar carrinho guest no carrinho autenticado.
- Validar produtos e estoque durante merge.
- Marcar carrinho guest como convertido apos merge.
- Transferir cupom guest somente quando carrinho autenticado nao possui cupom.
- Retornar mensagens de aviso quando itens forem ignorados ou reduzidos.

## Regras de Negocio

- 🟢 Cookie de carrinho guest se chama `guestCartToken`.
- 🟢 Token guest valido tem entre 16 e 128 caracteres.
- 🟢 Token guest deve conter apenas letras, numeros, `_` e `-`.
- 🟢 Token guest criado deve usar entropia criptografica (`randomBytes(32).toString("base64url")`).
- 🟢 Cookie guest deve ser `httpOnly`, `sameSite=lax`, `path=/` e `maxAge` de 30 dias.
- 🟢 Cookie guest deve ser `secure` em `production` e `preview`.
- 🟢 Em preview/producao sem banco, o ator deve ser `unavailable`.
- 🟢 Mutacoes que criam carrinho guest podem gerar token quando visitante nao tem cookie.
- 🟢 Sessao autenticada tem precedencia sobre token guest na resolucao do ator.
- 🟢 Ator autenticado deve carregar `userId`, `role` e token guest opcional.
- 🟢 Sem cookie e sem banco em dev/test, ator guest usa token `dev-fallback-guest`.
- 🟢 Sem cookie em ambiente com banco, ator guest usa token `empty-guest` para leitura vazia.
- 🟢 Merge sem token guest retorna carrinho ativo do usuario.
- 🟢 Merge deve buscar carrinho guest por token e carrinho autenticado por userId.
- 🟢 Itens indisponiveis do carrinho guest nao devem migrar.
- 🟢 Quantidade migrada nao pode exceder estoque restante depois dos itens ja existentes no carrinho do usuario.
- 🟢 Se estoque restante for zero, item guest nao migra e gera aviso.
- 🟢 Se estoque restante for menor que quantidade guest, migrar quantidade reduzida e gerar aviso.
- 🟢 Apos merge, carrinho guest deve ser marcado como `converted`.
- 🟢 Cupom guest deve ser transferido apenas se carrinho autenticado nao possuir cupom.
- 🟡 O cookie guest nao e expirado dentro de `mergeGuestCartIntoUser`; existe utilitario separado `expireGuestCartToken`.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-CART-SESSION-01 | Ler token guest do cookie. | Must | Valor ausente, curto, longo ou com caractere invalido retorna `null`. |
| RF-CART-SESSION-02 | Criar token guest seguro. | Must | Token gerado usa 32 bytes aleatorios em base64url e passa na validacao. |
| RF-CART-SESSION-03 | Gravar cookie guest. | Must | Cookie criado usa `httpOnly`, `sameSite=lax`, `path=/`, `maxAge=30 dias` e `secure` em preview/producao. |
| RF-CART-SESSION-04 | Resolver ator authenticated. | Must | Sessao autenticada retorna ator `authenticated` com `userId`, `role` e guest token opcional. |
| RF-CART-SESSION-05 | Resolver ator guest com cookie. | Must | Visitante com token valido retorna ator `guest` com o token lido. |
| RF-CART-SESSION-06 | Criar guest token em mutacao. | Must | Mutacao com `createGuestToken` para visitante sem cookie gera token e seta cookie. |
| RF-CART-SESSION-07 | Resolver fallback dev/test. | Must | Sem banco em dev/test retorna guest `dev-fallback-guest`. |
| RF-CART-SESSION-08 | Bloquear preview/producao inseguro. | Must | Sem banco em preview/producao retorna ator `unavailable`. |
| RF-CART-SESSION-09 | Obter token para merge. | Must | `getGuestCartTokenForMerge` retorna token valido ou `null`. |
| RF-CART-SESSION-10 | Expirar token guest. | Should | `expireGuestCartToken` remove cookie `guestCartToken`. |
| RF-CART-MERGE-01 | Mesclar carrinho guest no usuario. | Must | Itens elegiveis do guest sao adicionados ao carrinho autenticado. |
| RF-CART-MERGE-02 | Retornar carrinho do usuario sem token guest. | Must | Se `guestToken` for `null`, retornar `getActiveCart()`. |
| RF-CART-MERGE-03 | Ignorar guest vazio. | Must | Guest sem carrinho ou sem itens apenas garante carrinho autenticado ativo. |
| RF-CART-MERGE-04 | Ignorar produto indisponivel. | Must | Produto inexistente ou nao compravel nao migra e gera aviso. |
| RF-CART-MERGE-05 | Respeitar estoque no merge. | Must | Quantidade migrada e limitada por `stockQuantity - existingQuantity`. |
| RF-CART-MERGE-06 | Avisar reducao por estoque. | Must | Se migrar menos que a quantidade guest, mensagens incluem aviso. |
| RF-CART-MERGE-07 | Marcar guest como convertido. | Must | Carrinho guest com id e marcado como `converted` apos tentativa de merge. |
| RF-CART-MERGE-08 | Transferir cupom quando seguro. | Should | Cupom guest migra somente se carrinho do usuario nao tem cupom. |
| RF-CART-MERGE-09 | Recalcular carrinho final. | Must | Resultado final e recalculado e inclui mensagens de aviso. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Cookie guest e httpOnly e secure em preview/producao. | `cart-session.ts` | 🟢 |
| Integridade | Merge revalida produto e estoque antes de migrar. | `cart-service.ts` | 🟢 |
| Resiliencia | Ambiente sem banco em producao/preview retorna unavailable. | `cart-session.ts` | 🟢 |
| Compatibilidade | Dev/test sem banco usa token fallback estavel. | `cart-session.ts`, `cart-repository.ts` | 🟢 |
| Usabilidade | Merge preserva itens possiveis e avisa perdas/reducoes. | `cart-service.ts` | 🟢 |
| Privacidade | Token guest nao e exposto a JavaScript por ser httpOnly. | `guestCartCookieOptions` | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: visitante sem cookie adiciona produto
  Dado visitante sem sessao autenticada
  E sem cookie guest valido
  Quando executa mutacao com createGuestToken
  Entao um token guest seguro e criado
  E cookie guestCartToken e gravado com httpOnly e sameSite lax

Cenario: usuario autenticado com token guest
  Dado sessao autenticada valida
  E cookie guestCartToken valido
  Quando resolve ator do carrinho
  Entao retorna ator authenticated
  E inclui userId, role e guestToken opcional

Cenario: ambiente preview sem banco
  Dado APP_ENV preview
  E DATABASE_URL ausente
  Quando resolve ator do carrinho
  Entao retorna ator unavailable

Cenario: merge de item guest disponivel
  Dado carrinho guest com produto publicado e estoque suficiente
  E usuario autenticado sem esse item
  Quando merge e executado
  Entao item e adicionado ao carrinho do usuario
  E carrinho guest e marcado como converted

Cenario: merge respeita estoque existente
  Dado usuario ja possui 2 unidades de um produto
  E estoque atual do produto e 3
  E carrinho guest possui 4 unidades
  Quando merge e executado
  Entao apenas 1 unidade migra
  E uma mensagem de reducao por estoque e retornada

Cenario: cupom guest nao sobrescreve cupom do usuario
  Dado carrinho guest tem cupom A
  E carrinho do usuario tem cupom B
  Quando merge e executado
  Entao carrinho do usuario permanece com cupom B
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Resolver ator guest/auth/unavailable | Must | Base de isolamento do carrinho. |
| Criar e validar token guest seguro | Must | Necessario para visitante comprar sem login inicial. |
| Bloquear preview/producao sem banco | Must | Evita falsa persistencia e comportamento perigoso. |
| Merge com estoque e produto atual | Must | Preserva jornada sem violar integridade comercial. |
| Marcar guest convertido | Must | Evita reutilizacao indevida do carrinho anonimo. |
| Transferir cupom guest quando usuario nao tem cupom | Should | Preserva intencao do visitante, mas nao deve sobrescrever escolha autenticada. |
| Expirar cookie automaticamente no merge | Could | Utilitario existe, mas merge atual nao faz expiracao direta. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/features/cart/server/cart-session.ts` | `resolveCartActor` | 🟢 |
| `src/features/cart/server/cart-session.ts` | `getGuestCartTokenForMerge` | 🟢 |
| `src/features/cart/server/cart-session.ts` | `expireGuestCartToken` | 🟢 |
| `src/features/cart/server/cart-session.ts` | `createGuestCartToken` | 🟢 |
| `src/features/cart/server/cart-session.ts` | `readGuestCartTokenValue` | 🟢 |
| `src/features/cart/server/cart-service.ts` | `mergeGuestCartIntoUser` | 🟢 |
| `src/features/cart/server/cart-repository.ts` | `getActiveCart`, `getOrCreateActiveCart`, `markCartConverted` | 🟢 |
| `src/features/products/domain/product-publication.ts` | `isProductAvailableForPurchase` | 🟢 |

## Lacunas e Riscos

- 🟡 `mergeGuestCartIntoUser` nao expira diretamente o cookie guest; a expiracao depende de chamada externa.
- 🟡 Em merge parcial, mensagens de aviso precisam ser exibidas pela superficie que recebe o resultado.
- 🟡 O papel do usuario no `userActor` interno do merge e fixado como `customer`, mesmo que a sessao real tenha outro papel.
- 🟡 Carrinho guest convertido depende do repositorio bloquear uso futuro como ativo.
- 🔴 Sem reserva de estoque no carrinho, o merge ainda pode sofrer corrida ate checkout/settlement.
