# Shipping / Cotacao Publica no Carrinho

> Spec executavel da subunidade `shipping/cotacao-publica-carrinho`.
> Foca no QUE o usuario publico deve conseguir fazer ao cotar, selecionar e remover frete manual dentro do carrinho.

## Visao Geral

A cotacao publica de frete no carrinho permite que visitantes e clientes informem CEP, recebam opcoes de frete manual, selecionem uma opcao elegivel e vejam o total do carrinho recalculado. O fluxo deve ser server-side, seguro para guest, resiliente sem provider externo e consistente com cupom de frete gratis.

Esta subunidade e a ponte entre o dominio `shipping` e a superficie publica `/carrinho`. Ela nao administra regras de frete, nao chama transportadoras reais e nao altera pedido/pagamento. Seu objetivo e garantir que o carrinho possua frete valido antes do checkout.

## Responsabilidades

- Renderizar painel publico de frete no carrinho.
- Aceitar CEP com ou sem mascara.
- Normalizar CEP para 8 digitos.
- Rejeitar CEP invalido com mensagem amigavel.
- Resolver carrinho ativo de guest ou customer.
- Cadastrar guest token quando necessario.
- Buscar regras manuais persistidas quando houver banco configurado.
- Usar fixtures dev/test explicitas quando nao houver regra persistida.
- Gerar opcoes de frete manual para CEP coberto.
- Persistir quote vinculada ao carrinho atual.
- Selecionar automaticamente a primeira opcao quando aplicavel.
- Permitir selecionar outra opcao da mesma quote.
- Permitir remover selecao de frete.
- Recalcular subtotal, desconto, frete e total.
- Exibir estados vazio, pending, sucesso e erro.
- Bloquear uso de quote inexistente, expirada ou pertencente a outro carrinho.

## Fora de Escopo

- Tela administrativa de regras manuais.
- Criar, editar ou excluir regra manual.
- Chamar Correios real.
- Chamar Jadlog real.
- Chamar Melhor Envio real.
- Comprar etiqueta de envio.
- Rastrear entrega.
- Alterar pedido ja criado.
- Alterar pagamento.
- Alterar estoque.
- Rodar migrations.
- Conectar banco de producao.
- Copiar `.env`.
- Modificar Laravel legado.

## Atores

| Ator | Descricao | Permissao esperada |
|------|-----------|--------------------|
| Guest | Visitante anonimo com carrinho criado por token. | Pode cotar, selecionar e remover frete do proprio carrinho. |
| Customer | Usuario autenticado com carrinho ativo. | Pode cotar, selecionar e remover frete do proprio carrinho. |
| Sistema | Server actions, services e repositories. | Valida CEP, gera quote, persiste selecao e recalcula totais. |
| Admin | Usuario administrativo. | Fora desta subunidade; administra regras em outra tela. |
| Provider externo | Correios/Jadlog/Melhor Envio futuros. | Inativo nesta subunidade. |

## Regras de Negocio

- 🟢 Cotacao deve ocorrer apenas via server action.
- 🟢 Guest pode cotar frete sem login, desde que possua carrinho ativo.
- 🟢 Action pode criar guest token quando necessario.
- 🟢 CEP deve ser normalizado removendo pontuacao.
- 🟢 CEP normalizado deve conter exatamente 8 digitos.
- 🟢 CEP invalido deve retornar `validation_error`.
- 🟢 Regras manuais persistidas ativas prevalecem sobre fixtures.
- 🟢 Regras inativas nao devem gerar opcoes.
- 🟢 Se nao houver regra persistida, fixtures dev/test podem ser usadas de forma explicita.
- 🟢 Sem cobertura para o CEP, retornar mensagem amigavel.
- 🟢 Quote deve ser vinculada ao `cartId` atual.
- 🟢 Quote deve registrar `postalCode`, `cartHash`, opcoes, source e expiracao.
- 🟢 Quote deve expirar em janela operacional definida, atualmente 30 minutos.
- 🟢 Primeira opcao pode ser selecionada automaticamente apos cotacao bem-sucedida.
- 🟢 Usuario pode selecionar outra opcao desde que ela exista na quote.
- 🟢 Quote inexistente deve retornar `validation_error`.
- 🟢 Quote pertencente a outro carrinho deve retornar `forbidden`.
- 🟢 Quote expirada deve exigir nova cotacao.
- 🟢 Remover frete deve limpar selecao e recalcular carrinho.
- 🟢 Alterar item ou quantidade deve invalidar frete selecionado em camada de carrinho.
- 🟢 Cupom `free_shipping` pode zerar o valor efetivo do frete manual elegivel.
- 🟢 Quote original nao deve ser modificada por cupom de frete gratis.
- 🟢 Nenhuma chamada externa real deve ser feita.
- 🟡 `cartHash` precisa permanecer padronizado entre cotacao, mutacoes de item e selecao.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-SHIPPING-PUB-01 | Renderizar painel de frete no carrinho. | Must | `/carrinho` exibe campo de CEP, CTA de cotacao e estado atual de frete. |
| RF-SHIPPING-PUB-02 | Aceitar CEP mascarado. | Must | Entrada `01001-000` e normalizada para `01001000`. |
| RF-SHIPPING-PUB-03 | Rejeitar CEP invalido. | Must | CEP curto, vazio ou nao numerico retorna `validation_error` sem criar quote. |
| RF-SHIPPING-PUB-04 | Resolver carrinho ativo. | Must | Guest/customer cota frete apenas para o proprio carrinho. |
| RF-SHIPPING-PUB-05 | Criar guest token quando necessario. | Must | Visitante sem token pode iniciar cotacao de carrinho com seguranca. |
| RF-SHIPPING-PUB-06 | Buscar regras persistidas ativas. | Must | Quando existem regras manuais ativas, elas geram opcoes. |
| RF-SHIPPING-PUB-07 | Ignorar regras inativas. | Must | Regra inativa nao aparece em nenhuma opcao publica. |
| RF-SHIPPING-PUB-08 | Usar fallback dev/test explicito. | Must | Sem regra persistida em dev/test, `devShippingRules` gera opcoes com source `fixture`. |
| RF-SHIPPING-PUB-09 | Rejeitar CEP sem cobertura. | Must | Sem regra elegivel, UI mostra mensagem amigavel de ausencia de cobertura. |
| RF-SHIPPING-PUB-10 | Persistir quote. | Must | Quote salva `cartId`, `cartHash`, `postalCode`, opcoes, source e `expiresAt`. |
| RF-SHIPPING-PUB-11 | Selecionar primeira opcao apos cotacao. | Should | Cotacao bem-sucedida deixa o carrinho com frete selecionado quando ha opcoes. |
| RF-SHIPPING-PUB-12 | Exibir opcoes de frete. | Must | Cada opcao mostra label, prazo, preco e source seguro quando relevante. |
| RF-SHIPPING-PUB-13 | Selecionar opcao existente. | Should | Opcao existente na quote atual pode ser marcada como selecionada. |
| RF-SHIPPING-PUB-14 | Bloquear quote inexistente. | Must | Selecionar quote inexistente retorna `validation_error`. |
| RF-SHIPPING-PUB-15 | Bloquear quote de outro carrinho. | Must | Selecionar quote com `cartId` divergente retorna `forbidden`. |
| RF-SHIPPING-PUB-16 | Bloquear quote expirada. | Should | Quote com `expiresAt` vencido exige nova cotacao. |
| RF-SHIPPING-PUB-17 | Remover frete. | Should | Botao de remocao limpa selecao e recalcula totais. |
| RF-SHIPPING-PUB-18 | Recalcular totais apos frete. | Must | Carrinho mostra frete e total com frete apos cotacao/selecao/remocao. |
| RF-SHIPPING-PUB-19 | Aplicar frete gratis elegivel. | Must | Cupom `free_shipping` zera valor efetivo do frete manual sem alterar quote. |
| RF-SHIPPING-PUB-20 | Atualizar UI apos action. | Should | Sucesso chama refresh/revalidacao para mostrar total atualizado. |
| RF-SHIPPING-PUB-21 | Exibir estado vazio. | Must | Sem cotacao, painel informa que cotacao ainda nao foi realizada. |
| RF-SHIPPING-PUB-22 | Exibir pending. | Should | Durante cotacao/selecao/remocao, CTA fica em estado de carregamento. |
| RF-SHIPPING-PUB-23 | Exibir erro seguro. | Must | Erros nao vazam stack trace, SQL, segredo ou provider interno. |
| RF-SHIPPING-PUB-24 | Nao chamar provider externo. | Must | Nenhuma chamada real a Correios/Jadlog/Melhor Envio ocorre neste fluxo. |

## Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia esperada | Confianca |
|------|-----------|--------------------|-----------|
| Seguranca | Quote pertence apenas ao carrinho atual. | Validacao `quote.cartId === cart.id` na selecao. | 🟢 |
| Integridade | Frete selecionado entra no recalculo server-side. | `recalculateCartView` usa opcao selecionada. | 🟢 |
| Resiliencia | Dev/test funciona sem provider externo. | `devShippingRules` com source explicito. | 🟢 |
| Privacidade | Mensagens de erro nao expõem detalhes internos. | Action retorna codigos e mensagens amigaveis. | 🟢 |
| UX | Painel mostra estados claros. | Sem cotacao, pending, opcoes, erro e remocao. | 🟢 |
| Acessibilidade | Campo de CEP e botoes sao operaveis por teclado. | Labels, botoes nativos e regioes de status. | 🟡 |
| Performance | Cotacao manual nao deve bloquear a pagina inteira. | Pending local e refresh apos sucesso. | 🟡 |

## Criterios de Aceitacao

```gherkin
Cenario: visitante cota frete com CEP valido
  Dado visitante com carrinho ativo
  Quando informa CEP "01001-000"
  E solicita cotacao
  Entao o sistema normaliza o CEP para "01001000"
  E gera opcoes de frete manual
  E persiste quote vinculada ao carrinho
  E recalcula o total com frete

Cenario: CEP invalido
  Dado carrinho ativo
  Quando usuario informa CEP "123"
  Entao action retorna validation_error
  E nenhuma quote e persistida
  E UI mostra mensagem amigavel

Cenario: CEP sem cobertura
  Dado regras manuais sem cobertura para o CEP informado
  Quando usuario solicita cotacao
  Entao sistema retorna mensagem de ausencia de cobertura
  E carrinho permanece sem frete selecionado

Cenario: fallback dev/test
  Dado ambiente dev/test sem regras persistidas
  Quando usuario cota CEP coberto por fixture
  Entao sistema usa devShippingRules
  E quote recebe source fixture
  E nenhuma API externa e chamada

Cenario: selecionar outra opcao da mesma quote
  Dado carrinho com quote valida e multiplas opcoes
  Quando usuario seleciona uma opcao existente
  Entao opcao e gravada como frete selecionado
  E carrinho e recalculado

Cenario: bloquear quote de outro carrinho
  Dado quote vinculada ao carrinho A
  E usuario opera carrinho B
  Quando tenta selecionar opcao da quote do carrinho A
  Entao action retorna forbidden
  E carrinho B nao e alterado

Cenario: remover frete
  Dado carrinho com frete selecionado
  Quando usuario remove frete
  Entao selecao e limpa
  E totais sao recalculados sem frete
```

## Contratos de Entrada

| Campo | Origem | Regra |
|-------|--------|-------|
| `postalCode` | Campo publico do carrinho | Obrigatorio para cotacao; normalizar para 8 digitos. |
| `quoteId` | Opcao renderizada na UI | Obrigatorio para selecao/remocao quando aplicavel. |
| `optionId` | Opcao renderizada na UI | Deve existir dentro da quote selecionada. |
| `guest token` | Cookie/sessao | Criado quando necessario para visitante. |
| `customer id` | Sessao autenticada | Usado para resolver carrinho do customer. |

## Contratos de Saida

| Resultado | Quando ocorre | UI esperada |
|-----------|---------------|-------------|
| `success` | CEP valido e opcoes geradas. | Mostrar opcoes, frete selecionado e total recalculado. |
| `validation_error` | CEP invalido, quote inexistente, optionId invalido ou sem cobertura. | Mostrar mensagem amigavel no painel. |
| `forbidden` | Quote pertence a outro carrinho. | Mostrar erro seguro e manter carrinho intacto. |
| `blocked` | Carrinho indisponivel ou ambiente bloqueado. | Mostrar indisponibilidade sem stack trace. |

## Rastreabilidade de Codigo

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/features/shipping/components/shipping-quote-panel.tsx` | UI publica de CEP, opcoes, selecao e remocao. |
| `src/features/cart/server/cart-actions.ts` | Server actions de cotar, selecionar e remover frete. |
| `src/features/cart/server/cart-service.ts` | Resolucao de carrinho, quote, selecao e recalculo. |
| `src/features/shipping/domain` | Normalizacao, validacao e geracao de opcoes. |
| `src/features/shipping/server/shipping-repository.ts` | Regras manuais, quotes e selecao persistida. |
| `src/features/shipping/server/shipping-fixtures.ts` | Fallback dev/test de frete manual. |
| `src/features/cart/components/cart-view.tsx` | Integra painel de frete ao resumo do carrinho. |
| `src/features/cart/types.ts` | Contratos de carrinho, totals e shipping selection. |

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CEP valido e quote vinculada ao carrinho | Must | Checkout depende de frete confiavel. |
| Bloquear quote de outro carrinho | Must | Integridade e seguranca. |
| Fallback dev/test explicito | Must | Permite desenvolvimento sem provider/banco real. |
| Recalculo server-side | Must | Evita total manipulado no cliente. |
| Selecionar/remover opcao | Should | Melhora UX e controle do usuario. |
| Expiracao forte de quote | Should | Importante para consistencia temporal, mas depende de politica operacional. |
| Source visivel de fixture | Could | Ajuda dev/test, mas nao deve poluir UX de producao. |

## Lacunas e Riscos

- 🟡 Padronizacao de `cartHash` precisa ser mantida se a validacao anti-stale for endurecida.
- 🟡 Frete manual depende da qualidade das regras cadastradas.
- 🟡 Fixture deve permanecer claramente limitada a dev/test.
- 🟡 Quote expirada precisa de comportamento coerente entre UI, service e checkout.
- 🔴 Usar quote de outro carrinho sem bloqueio permitiria manipulacao de frete.
- 🔴 Chamar provider externo real sem fase dedicada pode gerar custo e vazamento de segredo.

## Guardrails

- Nao chamar APIs reais de frete.
- Nao expor credenciais.
- Nao copiar `.env`.
- Nao conectar banco de producao.
- Nao rodar migrations.
- Nao alterar pagamento, pedido, estoque ou cupom.
- Nao alterar Laravel legado.
- Nao confiar em total calculado no cliente.

## Definition of Done

- Painel publico de frete aparece no carrinho.
- CEP valido gera quote manual ou fixture dev/test explicita.
- CEP invalido ou sem cobertura retorna erro amigavel.
- Quote fica vinculada ao carrinho correto.
- Quote de outro carrinho e bloqueada.
- Frete selecionado recalcula totais server-side.
- Remocao de frete recalcula carrinho.
- Cupom de frete gratis zera apenas valor efetivo elegivel.
- Nenhuma API externa real e chamada.
