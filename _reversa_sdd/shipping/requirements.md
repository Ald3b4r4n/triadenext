# Shipping

> Spec executavel da unit `shipping`.
> Foca no QUE o sistema deve garantir para cotacao de frete manual, CEP, regras por UF/faixa, fixtures dev/test, selecao de opcao e integracoes futuras.

## Visao Geral

A unit `shipping` gerencia cotacoes de frete usadas pelo carrinho e pelo checkout. O estado atual do sistema usa frete manual: regras internas por UF ou faixa de CEP geram opcoes de entrega, que sao persistidas como cotacao vinculada ao carrinho. Quando nao ha regras persistidas em ambiente de desenvolvimento/teste, fixtures explicitas podem ser usadas.

Correios, Jadlog e Melhor Envio sao tratados como providers futuros inativos. Esta unit deve preservar adapters e contratos para evolucao futura, mas nao deve fazer chamadas externas reais sem nova fase funcional, credenciais e guardrails especificos.

## Responsabilidades

- Normalizar CEP para 8 digitos.
- Validar CEP antes de cotar.
- Representar regras manuais de frete.
- Avaliar cobertura por UF e/ou faixa de CEP.
- Gerar opcoes de frete manual.
- Persistir cotacao vinculada a carrinho.
- Selecionar opcao de frete pertencente ao carrinho atual.
- Remover selecao de frete.
- Informar prazo, label, preco e source da cotacao.
- Usar fixtures dev/test quando nao houver regra manual persistida.
- Bloquear uso silencioso de providers externos reais.
- Preparar contratos para providers futuros.

## Fora de Escopo

- Chamar Correios real.
- Chamar Jadlog real.
- Chamar Melhor Envio real.
- Contratar etiqueta de envio.
- Rastrear encomenda real.
- Gerar NF-e ou integrar Bling.
- Alterar status operacional de pedido.
- Rodar migrations reais.
- Conectar banco de producao durante validacao documental.
- Expor credenciais de transportadoras.
- Alterar Laravel legado.

## Atores

| Ator | Descricao | Permissao esperada |
|------|-----------|--------------------|
| Guest | Visitante anonimo com carrinho ativo. | Pode cotar, selecionar e remover frete no proprio carrinho. |
| Customer | Usuario autenticado com carrinho ativo. | Pode cotar, selecionar e remover frete no proprio carrinho. |
| Admin/Manager | Usuario administrativo. | Pode futuramente gerenciar regras manuais quando tela/feature existir. |
| Sistema | Services/repositories. | Valida CEP, gera cotacao, persiste quote e protege integridade. |
| Provider externo | Correios/Jadlog/Melhor Envio futuros. | Inativo no estado atual. |

## Regras de Negocio

- 🟢 CEP deve ser normalizado para 8 digitos.
- 🟢 CEP invalido deve gerar `validation_error`.
- 🟢 Frete atual e manual, nao externo.
- 🟢 Regras manuais podem cobrir UF e/ou faixa de CEP.
- 🟢 Se houver regras manuais persistidas, elas devem prevalecer sobre fixtures.
- 🟢 Se nao houver regras manuais persistidas, dev/test pode usar `devShippingRules`.
- 🟢 Fixture/fallback deve ser explicito, nao silencioso.
- 🟢 Sem cobertura para CEP, retornar mensagem amigavel.
- 🟢 Cotacao deve salvar `cartId`, `cartHash`, `postalCode`, opcoes e `source`.
- 🟢 Cotacao expira em 30 minutos.
- 🟢 Primeira opcao pode ser selecionada automaticamente apos cotacao.
- 🟢 Selecao de frete deve pertencer ao carrinho atual.
- 🟢 Quote inexistente deve retornar erro seguro.
- 🟢 Quote de outro carrinho deve retornar `forbidden`.
- 🟢 Remover frete deve limpar selecao e recalcular carrinho.
- 🟢 Alteracao de item no carrinho deve limpar selecao de frete por obsolescencia de `cartHash`.
- 🟢 Cupom `free_shipping` pode zerar apenas frete manual elegivel no recalculo do carrinho.
- 🟢 Providers externos reais permanecem inativos ate fase dedicada.
- 🟡 `cartHash` da UI e do service precisam permanecer alinhados caso a validacao seja endurecida.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-SHIPPING-01 | Normalizar CEP. | Must | Entrada com mascara/pontuacao vira string de 8 digitos. |
| RF-SHIPPING-02 | Validar CEP. | Must | CEP incompleto ou invalido retorna `validation_error`. |
| RF-SHIPPING-03 | Cotar frete manual por CEP. | Must | CEP valido gera opcoes quando houver cobertura. |
| RF-SHIPPING-04 | Usar regras persistidas quando existirem. | Must | Regras manuais do repository prevalecem sobre fixtures. |
| RF-SHIPPING-05 | Usar fixtures dev/test quando nao houver regra. | Must | `devShippingRules` geram opcoes com source explicito. |
| RF-SHIPPING-06 | Rejeitar CEP sem cobertura. | Must | Retorna mensagem "Nao ha cobertura manual para este CEP." ou equivalente. |
| RF-SHIPPING-07 | Persistir cotacao. | Must | Quote salva cartId, cartHash, postalCode, opcoes, source e expiracao. |
| RF-SHIPPING-08 | Selecionar primeira opcao apos cotacao. | Should | Cotacao bem-sucedida seleciona opcao inicial e recalcula carrinho. |
| RF-SHIPPING-09 | Listar opcoes de frete. | Must | UI pode exibir label, prazo, preco, source e optionId. |
| RF-SHIPPING-10 | Selecionar opcao de quote existente. | Should | Opcao pertencente ao carrinho e persistida como selecao. |
| RF-SHIPPING-11 | Bloquear quote inexistente. | Must | Selecionar quote inexistente retorna `validation_error`. |
| RF-SHIPPING-12 | Bloquear quote de outro carrinho. | Must | Selecionar quote com cartId divergente retorna `forbidden`. |
| RF-SHIPPING-13 | Remover selecao de frete. | Should | Carrinho fica sem frete selecionado e totais sao recalculados. |
| RF-SHIPPING-14 | Expirar cotacao. | Should | Quote com mais de 30 minutos nao deve ser reutilizada como cotacao valida. |
| RF-SHIPPING-15 | Limpar frete quando itens mudarem. | Must | Alteracoes de item invalidam selecao de frete. |
| RF-SHIPPING-16 | Aplicar frete gratis elegivel. | Must | Cupom `free_shipping` zera frete manual elegivel sem alterar quote original. |
| RF-SHIPPING-17 | Preparar providers futuros. | Should | Contratos existem sem chamadas reais. |
| RF-SHIPPING-18 | Bloquear providers reais sem configuracao. | Must | Sem credenciais/fase dedicada, nenhuma API externa e chamada. |

## Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia esperada | Confianca |
|------|-----------|--------------------|-----------|
| Integridade | Quote pertence a um carrinho especifico. | `cartId` validado ao selecionar opcao. | 🟢 |
| Consistencia | Item alterado invalida frete selecionado. | Limpeza de shipping selection em mutacoes do carrinho. | 🟢 |
| Resiliencia | Fixtures dev/test substituem ausencia de regra persistida. | `devShippingRules`. | 🟢 |
| Seguranca | Provider externo real nao roda sem credencial/feature dedicada. | Adapters futuros inativos. | 🟢 |
| UX | Painel de frete exibe mensagens amigaveis. | `ShippingQuotePanel`. | 🟢 |
| Financeiro | Frete efetivo entra no total do carrinho e no snapshot do pedido. | Recalculo do carrinho/checkout. | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: cotar frete manual com CEP valido
  Dado carrinho ativo
  E CEP "01001-000"
  Quando usuario solicita cotacao
  Entao o sistema normaliza o CEP para "01001000"
  E gera opcoes de frete manual
  E persiste uma quote vinculada ao carrinho

Cenario: CEP invalido
  Dado carrinho ativo
  Quando usuario informa CEP "123"
  Entao o sistema retorna validation_error
  E nenhuma quote e persistida

Cenario: CEP sem cobertura
  Dado regras manuais sem cobertura para o CEP informado
  Quando usuario solicita cotacao
  Entao o sistema retorna mensagem amigavel de sem cobertura
  E nao seleciona frete

Cenario: selecionar quote de outro carrinho
  Dado quote vinculada ao carrinho A
  E usuario opera carrinho B
  Quando tenta selecionar opcao da quote do carrinho A
  Entao o sistema retorna forbidden
  E carrinho B nao e alterado

Cenario: remover frete
  Dado carrinho com frete selecionado
  Quando usuario remove frete
  Entao selecao de frete e limpa
  E totais sao recalculados

Cenario: provider externo inativo
  Dado ausencia de credenciais de Correios/Jadlog/Melhor Envio
  Quando usuario cota frete
  Entao nenhuma chamada externa real e feita
  E o sistema usa regra manual ou fallback permitido
```

## Contratos de Entrada

| Campo | Origem | Regra |
|-------|--------|-------|
| `postalCode` | Formulario publico de frete | Normalizar para 8 digitos e validar. |
| `quoteId` | Opcao selecionada | Deve existir e pertencer ao carrinho atual. |
| `optionId` | Opcao selecionada | Deve existir dentro da quote. |
| `cart actor` | Sessao/customer/guest token | Resolvido server-side. |
| `cartHash` | Carrinho atual | Usado para detectar obsolescencia da cotacao. |

## Contratos de Saida

### Cotacao

- `success`: quote criada, opcoes retornadas e frete inicial selecionado quando aplicavel.
- `validation_error`: CEP invalido, sem cobertura ou quote inconsistente.
- `blocked`: carrinho indisponivel ou ambiente bloqueado.
- `forbidden`: tentativa de usar quote de outro carrinho.

### Opcao de Frete

Cada opcao deve conter, no minimo:

- `id`;
- `label`;
- `amountCents`;
- `estimatedDays` ou prazo a confirmar;
- `source`;
- metadados seguros para exibicao.

## Rastreabilidade de Codigo

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/features/shipping/domain` | CEP, regras manuais, opcoes e validacao de cobertura. |
| `src/features/shipping/server/shipping-repository.ts` | Persistencia/listagem de regras, quotes e selecao. |
| `src/features/shipping/server/shipping-service.ts` | Orquestracao futura/adapters de frete. |
| `src/features/shipping/server/shipping-fixtures.ts` | `devShippingRules` para dev/test. |
| `src/features/shipping/components/shipping-quote-panel.tsx` | UI publica de cotacao/selecao/remocao. |
| `src/features/cart/server/cart-actions.ts` | Actions de cotar, selecionar e remover frete. |
| `src/features/cart/server/cart-service.ts` | Integracao de shipping com carrinho/recalculo. |
| `src/features/cart/types.ts` | Contratos de carrinho, quote e totals. |
| `src/db/schema.ts` | Tabelas de frete/regras/quotes quando persistidas. |

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CEP valido e cotacao manual | Must | Carrinho/checkout dependem de frete selecionavel. |
| Quote vinculada ao carrinho | Must | Evita uso cruzado de cotacoes. |
| Bloquear quote de outro carrinho | Must | Requisito de integridade e seguranca. |
| Fixture dev/test explicita | Must | Permite desenvolvimento sem provider/banco real. |
| Expiracao de quote | Should | Importante para consistencia, mas depende de politica operacional. |
| Providers externos futuros | Should | Necessario para maturidade, mas fora do estado funcional atual. |

## Riscos e Lacunas

- 🟡 Frete externo real ainda nao existe; operacao depende de regras manuais/fixtures.
- 🟡 Rastreamento e etiqueta nao existem.
- 🟡 `cartHash` precisa ser padronizado se virar bloqueio forte contra quote stale.
- 🟡 Expiracao de quote precisa estar alinhada com checkout e snapshot de pedido.
- 🔴 Usar provider externo real sem guardrails/credenciais validadas pode gerar custo, vazamento ou comportamento nao auditado.

## Guardrails

- Nao chamar APIs reais de transporte nesta unit documental.
- Nao armazenar credenciais de transporte em specs.
- Nao copiar `.env`.
- Nao rodar migrations.
- Nao conectar banco de producao.
- Nao alterar pagamento, pedido, estoque ou notificacao.
- Nao alterar Laravel legado.

## Definition of Done

- CEP normalizado e validado.
- Cotacao manual gera opcoes para CEP coberto.
- CEP sem cobertura falha com mensagem amigavel.
- Quote e vinculada ao carrinho e protegida contra uso cruzado.
- Remocao de frete recalcula carrinho.
- Fallback dev/test e explicito.
- Providers externos reais permanecem inativos ate fase propria.
