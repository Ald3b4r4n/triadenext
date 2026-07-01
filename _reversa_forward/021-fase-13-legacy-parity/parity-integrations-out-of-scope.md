# Parity: Integracoes e Itens Fora do Escopo

## Integracoes legadas detectadas

| Integracao/domino | Laravel legado | Next atual | Status | Classificacao |
|-------------------|----------------|------------|--------|---------------|
| Stripe | checkout session + webhook | PaymentIntent + Payment Element + webhook | `substituido` | nao bloqueador |
| Melhor Envio | webhook e prepare shipment | providers futuros inativos | `ausente` | decisao humana |
| Correios/Jadlog | providers/servicos indicados | futuro inativo | `ausente` | decisao humana |
| Bling | OAuth, sync produto/pedido e NF-e | schema/roadmap, sem fluxo funcional | `ausente` | fora de escopo/decisao humana |
| NF-e | controllers/webhook/campos seguros | fiscal_documents parcial | `ausente` | fora de escopo/decisao humana |
| WhatsApp | nao exigido nesta fase | ausente | `fora-do-go-live` | fora de escopo |
| SMS | nao exigido nesta fase | ausente | `fora-do-go-live` | fora de escopo |
| E-mail real | emails legado | provider seguro/mock no Next | `parcial` | decisao humana para producao |
| Analytics/relatorios | actions/views/admin | ausente completo | `ausente` | pos-go-live |

## Regra de go-live

Estas lacunas nao viram implementacao nesta fase. Elas devem ser usadas para decisao de negocio:

- Se fiscal/Bling/NF-e for obrigatorio no dia zero, go-live deve aguardar nova fase aprovada.
- Se frete externo/rastreamento for obrigatorio no dia zero, go-live deve aguardar provider real ou operacao manual aceita.
- WhatsApp/SMS permanecem fora de escopo.

## Conclusao

As integracoes externas nao bloqueiam tecnicamente a Fase 13, mas podem bloquear o go-live por decisao humana.
