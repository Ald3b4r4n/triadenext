# Shipping / Admin Frete Manual

> Spec executavel da subunit `shipping/admin-frete-manual`.
> Foca no QUE a administracao de regras manuais de frete deve garantir para criar, listar, atualizar e proteger configuracoes de cobertura/preco.

## Visao Geral

A subunit `admin-frete-manual` cobre a administracao de regras manuais de frete. Essas regras alimentam o fluxo publico de cotacao por CEP, permitindo configurar cobertura por UF, faixa de CEP, preco, prazo e status ativo/inativo.

Como regras de frete impactam diretamente o total comercial do carrinho e o snapshot de checkout, toda mutacao administrativa deve exigir permissao admin-like, validação server-side e guardrails de mutacao real. Esta subunit nao chama providers externos reais e nao contrata etiquetas.

## Escopo

- Listar regras manuais de frete no painel administrativo.
- Criar regra manual de frete.
- Atualizar regra manual de frete.
- Ativar/desativar regra manual.
- Validar UF, faixa de CEP, preco, prazo e label.
- Garantir permissao admin-like.
- Aplicar guardrail de mutacao real.
- Revalidar superficies administrativas/publicas afetadas apos mutacao.
- Retornar erros seguros e mensagens amigaveis.

## Fora de Escopo

- Cotar frete publico diretamente nesta tela.
- Selecionar frete para carrinho.
- Alterar quote ja emitida.
- Alterar pedido ou snapshot ja criado.
- Chamar Correios, Jadlog ou Melhor Envio reais.
- Contratar etiqueta.
- Gerar rastreamento.
- Rodar migrations reais.
- Conectar banco de producao durante validacao documental.
- Expor credenciais.
- Alterar Laravel legado.

## Atores

| Ator | Descricao | Permissao esperada |
|------|-----------|--------------------|
| Admin | Usuario administrativo amplo. | Pode listar, criar e atualizar regras manuais. |
| Manager | Usuario operacional admin-like. | Pode listar, criar e atualizar regras quando policy permitir. |
| Customer | Usuario comprador. | Nao pode acessar admin de frete. |
| Guest | Visitante anonimo. | Nao pode acessar admin de frete. |
| Sistema | Actions/services/repositories. | Valida, protege e persiste regras. |

## Regras de Negocio

- 🟢 Listagem administrativa de regras de frete exige `requireAdminLike`.
- 🟢 Criacao de regra manual exige `requireAdminLike`.
- 🟢 Atualizacao de regra manual exige `requireAdminLike`.
- 🟢 Mutacao real deve passar por `assertCanMutateRealData`.
- 🟢 Usuario sem admin-like recebe `forbidden` ou `blocked`.
- 🟢 Label da regra deve ser obrigatorio e legivel.
- 🟢 Preco de frete deve ser inteiro positivo em centavos.
- 🟢 Prazo estimado deve ser inteiro positivo ou nulo.
- 🟢 UF, quando informada, deve ser uma sigla valida de 2 letras.
- 🟢 Faixa de CEP deve usar CEP normalizado com 8 digitos.
- 🟢 Quando inicio e fim da faixa forem informados, inicio nao pode ser maior que fim.
- 🟢 Regra pode ser ativa ou inativa.
- 🟢 Regra inativa nao deve gerar opcao de frete publico.
- 🟢 Alterar regra manual nao deve alterar quotes ja emitidas ou snapshots de pedido.
- 🟢 Alterar regra manual afeta apenas cotacoes futuras.
- 🟢 Revalidacao de paths administrativos/publicos deve ocorrer apos mutacao bem-sucedida.
- 🟡 Duplicidade/sobreposicao de faixas pode ser permitida inicialmente, mas deve ser visivel como risco operacional.
- 🟡 Se multiplas regras cobrirem o mesmo CEP, todas podem gerar opcoes ou o sistema deve ordenar de forma previsivel.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-ADMIN-SHIPPING-01 | Proteger listagem por admin-like. | Must | Customer/guest nao recebem lista administrativa. |
| RF-ADMIN-SHIPPING-02 | Proteger criacao por admin-like. | Must | Usuario sem permissao nao cria regra. |
| RF-ADMIN-SHIPPING-03 | Proteger atualizacao por admin-like. | Must | Usuario sem permissao nao altera regra. |
| RF-ADMIN-SHIPPING-04 | Listar regras manuais. | Must | Admin-like ve regras com label, UF/faixa, preco, prazo e status. |
| RF-ADMIN-SHIPPING-05 | Criar regra manual valida. | Must | Input valido cria regra e revalida superficies afetadas. |
| RF-ADMIN-SHIPPING-06 | Atualizar regra existente. | Must | Input valido atualiza regra e revalida superficies afetadas. |
| RF-ADMIN-SHIPPING-07 | Bloquear update de regra inexistente. | Must | Id inexistente retorna erro seguro. |
| RF-ADMIN-SHIPPING-08 | Validar label. | Must | Label vazio ou longo demais falha antes do repository. |
| RF-ADMIN-SHIPPING-09 | Validar UF. | Should | UF informada deve ser sigla valida. |
| RF-ADMIN-SHIPPING-10 | Validar faixa de CEP. | Must | CEPs informados devem normalizar para 8 digitos. |
| RF-ADMIN-SHIPPING-11 | Validar ordem de faixa. | Must | CEP inicial maior que final retorna validation_error. |
| RF-ADMIN-SHIPPING-12 | Validar preco. | Must | `amountCents` precisa ser inteiro positivo. |
| RF-ADMIN-SHIPPING-13 | Validar prazo. | Should | Prazo informado deve ser inteiro positivo. |
| RF-ADMIN-SHIPPING-14 | Ativar/desativar regra. | Must | `isActive` controla elegibilidade para cotacao publica. |
| RF-ADMIN-SHIPPING-15 | Revalidar apos mutacao. | Must | Rotas admin e carrinho/produtos relevantes sao revalidadas quando necessario. |
| RF-ADMIN-SHIPPING-16 | Preservar quotes antigas. | Must | Criar/editar regra nao muta quotes ja emitidas. |
| RF-ADMIN-SHIPPING-17 | Nao chamar provider externo. | Must | Nenhuma API real e acionada pela tela admin manual. |
| RF-ADMIN-SHIPPING-18 | Retornar erros seguros. | Must | Erros nao exibem SQL, secrets, stack trace ou DSN. |

## Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia esperada | Confianca |
|------|-----------|--------------------|-----------|
| Seguranca | Admin de frete exige `requireAdminLike`. | Policies administrativas. | 🟢 |
| Integridade | Mutacao real passa por guardrail. | `assertCanMutateRealData`. | 🟢 |
| Financeiro | Preco e centavos inteiros positivos. | Schema/admin input. | 🟢 |
| Consistencia | Regras alteradas afetam cotacoes futuras, nao quotes antigas. | Separacao regra vs quote. | 🟢 |
| UX | Erros administrativos sao legiveis e por campo. | `validation_error`/field errors. | 🟢 |
| Operacional | Sobreposicao de faixas deve ser visivel ou ordenada. | Listagem/ordem previsivel. | 🟡 |

## Criterios de Aceitacao

```gherkin
Cenario: admin lista regras manuais
  Dado usuario com permissao admin-like
  Quando acessa admin de frete manual
  Entao ve regras com label, cobertura, preco, prazo e status

Cenario: customer tenta acessar admin de frete
  Dado usuario sem permissao admin-like
  Quando chama listagem administrativa
  Entao recebe forbidden ou blocked
  E nenhuma regra administrativa e exposta

Cenario: admin cria regra por faixa de CEP
  Dado usuario admin-like
  E label "SP Capital"
  E faixa "01000000" a "05999999"
  E preco R$ 25,00
  Quando salva a regra
  Entao regra e persistida
  E cotacoes futuras podem usar essa cobertura

Cenario: admin informa faixa invertida
  Dado usuario admin-like
  E CEP inicial "99999999"
  E CEP final "01000000"
  Quando envia formulario
  Entao o sistema retorna validation_error
  E nenhuma regra e persistida

Cenario: regra inativa
  Dado regra manual inativa
  Quando usuario publico cota CEP coberto por ela
  Entao a regra nao gera opcao de frete

Cenario: editar regra nao altera quote antiga
  Dado quote ja emitida com preco antigo
  Quando admin altera regra manual
  Entao a quote antiga permanece intacta
  E apenas cotacoes futuras usam novo valor
```

## Contrato de Entrada Administrativa

| Campo | Tipo | Obrigatorio | Regra |
|-------|------|-------------|-------|
| `label` | string | Sim | Nome legivel da regra. |
| `uf` | string/null | Nao | Sigla UF com 2 letras quando informada. |
| `postalCodeStart` | string/null | Condicional | CEP normalizado de 8 digitos quando informado. |
| `postalCodeEnd` | string/null | Condicional | CEP normalizado de 8 digitos quando informado. |
| `amountCents` | integer | Sim | Valor positivo em centavos. |
| `estimatedDays` | integer/null | Nao | Prazo positivo ou nulo. |
| `isActive` | boolean | Nao | Define elegibilidade da regra. |

## Contrato de Saida

### Listagem

- `success`: lista de regras manuais.
- `forbidden`: usuario sem permissao.
- `blocked`: auth/ambiente/guardrail impede acesso.

### Criacao/Atualizacao

- `success`: regra criada/atualizada.
- `validation_error`: input invalido.
- `forbidden`: usuario sem permissao.
- `blocked`: guardrail ou ambiente impede mutacao real.
- `not_found`: regra inexistente em update, se o contrato separar esse caso.

## Rastreabilidade de Codigo

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/features/shipping/server/shipping-repository.ts` | Persistencia/listagem de regras manuais. |
| `src/features/shipping/server/shipping-service.ts` | Orquestracao administrativa/futura. |
| `src/features/shipping/domain` | Validacao de CEP/faixa e geracao de opcoes. |
| `src/features/auth/server/policies.ts` | `requireAdminLike`. |
| `src/lib/runtime-mode.ts` | Guardrail de mutacao real. |
| `src/db/schema.ts` | Tabela de regras manuais de frete. |
| `next/cache` | Revalidacao de rotas apos mutacao. |

## Riscos e Lacunas

- 🟡 Faixas sobrepostas podem gerar multiplas opcoes ou confusao operacional.
- 🟡 UF e faixa podem divergir se nao houver derivacao geografica confiavel.
- 🟡 Admin visual de frete pode ainda nao existir completo; esta spec define contrato esperado.
- 🟡 Alteracoes de regra nao atualizam carrinhos com quote antiga; isso e desejavel para snapshot, mas exige clareza de UX.
- 🔴 Criar regra ampla demais pode causar prejuizo comercial em cotacoes futuras.

## Guardrails

- Nao chamar provider externo real.
- Nao alterar quotes antigas.
- Nao alterar pedidos existentes.
- Nao alterar pagamentos.
- Nao rodar migrations.
- Nao conectar banco de producao.
- Nao expor secrets.
- Nao modificar Laravel legado.

## Definition of Done

- Admin-like consegue listar regras manuais.
- Admin-like consegue criar regra valida.
- Admin-like consegue atualizar regra valida.
- Usuario sem permissao e bloqueado.
- Schema rejeita cobertura/preco/prazo invalidos.
- Mutacao real respeita guardrails.
- Regras inativas nao geram frete publico.
- Quotes antigas permanecem imutaveis.
