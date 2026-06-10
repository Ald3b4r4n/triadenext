# Requirements Audit

> Identificador da feature: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`
> Documento auditado: `_reversa_forward/006-fase-8-checkout-pendente/requirements.md`
> Artefato de clarificacao: `_reversa_forward/006-fase-8-checkout-pendente/doubts.md`
> Tipo: auditoria textual e operacional de requirements

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de itens | 24 |
| Aprovados | 24 |
| Reprovados | 0 |
| Veredito | Aprovado |

## Verificacoes explicitas solicitadas

| Item | Resultado |
|------|-----------|
| `requirements.md` contem `[DOUBT]` | Nao |
| `requirements.md` contem `[DÚVIDA]` | Nao |
| Caminho real do SDD legado existe | Sim: `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\` |
| Variante sem barra antes de `_reversa_sdd` existe | Nao |
| `requirements.md` autoriza pedido anonimo | Nao |
| `requirements.md` autoriza pagamento real | Nao |
| `requirements.md` autoriza chamada Stripe | Nao |
| `requirements.md` autoriza PaymentIntent real | Nao |
| `requirements.md` autoriza coleta de cartao | Nao |
| `requirements.md` autoriza captura de pagamento | Nao |
| `requirements.md` autoriza baixa/reserva definitiva de estoque | Nao |
| `requirements.md` autoriza consumo de `usedCount` nesta fase | Nao |
| `requirements.md` permite payload cliente forcar valores financeiros | Nao |
| `requirements.md` permite cliente acessar pedido de outro usuario | Nao |
| `requirements.md` permite admin marcar pedido como pago manualmente | Nao |
| Checkout pago, Stripe e pedido pago ficam para fase futura | Sim |
| `doubts.md` registra decisoes de clarificacao | Sim |
| `doubts.md` registra correcao do caminho do SDD legado | Sim |
| `doubts.md` registra que nao restam duvidas abertas | Sim |

Observacao: o texto do pedido desta execucao citou `D:\Projetos\triadeessenzaparfum.com.br_reversa_sdd\`, mas a checagem em disco confirmou que o caminho existente e usado nos artefatos e `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\`.

## Itens por categoria

### Clareza

- [X] Q-001 | Clareza | O objetivo define claramente quem pode criar pedido, qual estado nasce e quais capacidades ficam fora da fase.
- [X] Q-002 | Clareza | As secoes usam termos consistentes: carrinho, pedido pendente, snapshot, frete selecionado, `usedCount`, `aguardando_pagamento` e carrinho convertido.
- [X] Q-003 | Clareza | As decisoes de autenticacao, pedido anonimo e endereco completo nao dependem de interpretacao externa.

### Completude

- [X] Q-004 | Completude | O documento cobre objetivo, contexto, escopo, fora de escopo, requisitos funcionais, nao funcionais, seguranca, banco, pedido, itens, checkout, validacao, cliente, endereco, cupom, frete, estoque, pagamento, actions, UI, customer/admin, fallback, aceite, testes, glossario e historico.
- [X] Q-005 | Completude | Todos os requisitos funcionais possuem prioridade, criterio de aceite e confianca.
- [X] Q-006 | Completude | A clarificacao removeu as lacunas sobre login, pedido anonimo, endereco, cupom, estoque, carrinho convertido, expiracao, customer/admin e fallback.

### Consistencia

- [X] Q-007 | Consistencia | O escopo e o fora de escopo nao se contradizem: a Fase 8 cria pedido pendente, mas nao pagamento real, Stripe, PaymentIntent, cartao, baixa/reserva definitiva ou pedido anonimo.
- [X] Q-008 | Consistencia | A area customer e o admin minimo estao coerentes com as restricoes de ownership e com a proibicao de acoes financeiras/estoque.
- [X] Q-009 | Consistencia | O estado inicial `aguardando_pagamento` e a expiracao de 60 minutos aparecem em requisitos, regras herdadas, criterios de aceite e esclarecimentos.
- [X] Q-010 | Consistencia | O caminho do SDD legado registrado no requirements e no doubts aponta para o diretorio que existe em disco.

### Cobertura

- [X] Q-011 | Cobertura | Ha criterios de aceite negativos para carrinho vazio, produto indisponivel, estoque insuficiente, frete ausente/invalido, cupom invalido, endereco incompleto, payload malicioso, carrinho alheio e ambiente sem banco.
- [X] Q-012 | Cobertura | Ha criterio de aceite positivo para criar pedido `aguardando_pagamento` com snapshots e carrinho convertido/bloqueado.
- [X] Q-013 | Cobertura | Login obrigatorio, ausencia de pedido anonimo, customer minimo e admin minimo possuem requisitos e cenarios.
- [X] Q-014 | Cobertura | Validacao final server-side esta em ordem numerada e cobre usuario, carrinho, itens, estoque, cupom, frete, endereco, totais, snapshots e conversao.

### EdgeCases

- [X] Q-015 | EdgeCases | O documento trata duplo clique/reenvio por idempotencia ou bloqueio do carrinho convertido.
- [X] Q-016 | EdgeCases | O documento trata preview/producao sem `DATABASE_URL` como falha segura e dev/test como fixture explicita.
- [X] Q-017 | EdgeCases | O documento trata endereco incompleto e divergencia de CEP entre endereco e cotacao.
- [X] Q-018 | EdgeCases | O documento trata cupom expirado, inativo ou esgotado e impede consumo de `usedCount` nesta fase.

### Jargao

- [X] Q-019 | Jargao | O glossario minimo define os termos principais que poderiam gerar interpretacao divergente.
- [X] Q-020 | Jargao | Siglas e termos tecnicos relevantes aparecem com contexto suficiente para planejamento posterior.

### SolucaoImplicita

- [X] Q-021 | SolucaoImplicita | O requirements descreve comportamento esperado e contratos de dominio sem impor detalhes de implementacao alem dos limites ja definidos pelo projeto.
- [X] Q-022 | SolucaoImplicita | Referencias a server actions, migrations locais e fixture/dev estao no nivel de contrato esperado pelo Reversa Forward, sem implementar codigo.

### Principios e Guardrails

- [X] Q-023 | Principios | O documento preserva guardrails das fases anteriores: sem migrations reais, sem banco real, sem secrets, sem deploy, sem Stripe real e sem alteracao no Laravel legado.
- [X] Q-024 | Principios | O documento preserva a regra de servidor como fonte de verdade para ownership, disponibilidade, cupom, frete e totais.

## Itens reprovados, detalhe

Nenhum item reprovado.

## Riscos residuais para o plano

- O plano tecnico deve decidir se cria ou nao uma entidade interna de pagamento `pendente`; o requirements permite apenas se o modelo exigir e sem provider externo.
- O plano tecnico deve manter o caminho do SDD legado como `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\`, pois a variante sem barra nao existe nesta maquina.
- O plano tecnico deve garantir que qualquer fixture dev/test fique marcada como fixture e nao se confunda com persistencia real.

## Veredito

**Aprovado**

O `requirements.md` esta claro, completo, testavel e coerente com o estado atual do projeto Next, com as decisoes de clarificacao e com as referencias Reversa do legado existentes em disco. O documento esta apto para avancar para `/reversa-plan`.

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-09 | Auditoria gerada por `/reversa-quality` | reversa |
