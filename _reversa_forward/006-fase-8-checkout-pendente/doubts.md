# Doubts: Fase 8 - Checkout sem Pagamento Real e Pedido Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`
> Origem: `/reversa-clarify`
> Requirements: `_reversa_forward/006-fase-8-checkout-pendente/requirements.md`

## Resumo

Todas as duvidas abertas no `requirements.md` inicial foram resolvidas por decisao humana nesta sessao. Nenhuma decisao autoriza Stripe, pagamento real, coleta de cartao, deploy, push, migration real, leitura de secrets, alteracao no Laravel legado, baixa definitiva de estoque ou consumo de `usedCount` na criacao do pedido pendente.

## Caminho do SDD legado

- Caminho correto usado para leitura: `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\`
- Confirmado em disco nesta sessao.
- Caminho sem a barra antes de `_reversa_sdd` nao existe nesta maquina.
- Leitura feita somente em artefatos Reversa do legado; nenhum arquivo do Laravel legado foi modificado.

## Decisoes aplicadas

| ID | Tema | Decisao |
|----|------|---------|
| Q01 | Login no checkout | Checkout exige usuario autenticado para criar pedido pendente. |
| Q02 | Pedido anonimo | Carrinho anonimo nao vira pedido diretamente; pedido sempre pertence a `userId`. |
| Q03 | Dados minimos do cliente | Exigir nome completo, e-mail da conta autenticada e telefone/WhatsApp. |
| Q04 | CPF/CNPJ | Fora da Fase 8; extensao fiscal futura. |
| Q05 | Endereco minimo | Exigir CEP, UF, cidade, bairro, logradouro e numero; complemento opcional; destinatario se diferente do cliente. |
| Q06 | Persistencia de endereco | Salvar endereco como snapshot no pedido; CRUD/catalogo de enderecos fica para fase futura. |
| Q07 | `usedCount` de cupom | Nao consumir na criacao do pedido pendente; consumir somente em fase futura de pagamento confirmado ou pedido efetivamente confirmado. |
| Q08 | Estoque | Validar estoque no checkout; nao baixar nem reservar definitivamente nesta fase. |
| Q09 | Carrinho apos pedido | Marcar carrinho usado como convertido/bloqueado; nao reutilizar para novas compras. |
| Q10 | Duplicidade | Criacao deve ser idempotente quando possivel ou protegida contra duplo clique/reenvio. |
| Q11 | Expiracao | Pedido `aguardando_pagamento` expira em 60 minutos. |
| Q12 | Estado inicial | Pedido nasce `aguardando_pagamento`; pagamento real ausente. |
| Q13 | Placeholder de pagamento | Permitido apenas se o modelo exigir, como interno `pendente` e sem provider real. |
| Q14 | Area customer | Entra na Fase 8 como listagem minima de pedidos pendentes proprios. |
| Q15 | Admin pedidos | Entra na Fase 8 como visualizacao basica para admin/manager. |
| Q16 | Restricoes admin | Admin nao marca pedido como pago, nao baixa estoque, nao cria pagamento e nao edita valores financeiros. |
| Q17 | Fallback sem banco | Preview/producao sem `DATABASE_URL` falham seguro; dev/test podem usar fixture explicito. |
| Q18 | Ordem de validacao | Usuario, carrinho, itens, estoque, cupom, frete, endereco, totais, snapshots e conversao do carrinho devem ser resolvidos no servidor. |

## Evidencias do legado lidas

- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\code-analysis.md`: `CreatePendingOrderAction` cria pedido `aguardando_pagamento`, snapshots, expiracao de 60 minutos, pagamento inicial pendente e marca carrinho `converted`.
- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\domain.md`: checkout exige carrinho com itens, produtos publicados, estoque suficiente e frete selecionado valido; pedido pendente expira em 60 minutos; pagamento confirmado baixa estoque.
- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\state-machines.md`: estados de pedido incluem `aguardando_pagamento`, `pago`, `cancelado` e `expirado`.
- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\data-dictionary.md`: pedidos e itens preservam snapshots; pagamentos e Stripe existem no legado mas ficam fora da Fase 8.
- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\customer\requirements.md`: cliente autenticado acessa pedidos proprios.
- `D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\admin\requirements.md`: admin gerencia pedidos no legado; na Fase 8 Next o escopo e somente visualizacao minima.

## Duvidas remanescentes

Nenhuma.

## Proxima etapa

Com as duvidas resolvidas, a proxima etapa esperada e:

```text
/reversa-quality
```
