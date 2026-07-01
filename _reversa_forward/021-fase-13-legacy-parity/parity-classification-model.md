# Parity Classification Model

## Status de paridade

| Status | Definicao | Exemplo |
|--------|-----------|---------|
| `substituido` | Next cobre o comportamento essencial do Laravel para go-live | Catalogo publico basico, carrinho, cupom e checkout pendente |
| `parcial` | Next cobre parte do dominio, mas ha diferencas operacionais | Admin pedidos sem relatorios/exportacoes amplas |
| `ausente` | Next nao possui equivalente funcional | Melhor Envio, Bling funcional, analytics completo |
| `fora-do-go-live` | Diferenca aceita como fora da Fase 13/go-live inicial | WhatsApp/SMS e redesign premium |
| `decisao-humana` | Requer escolha de negocio antes do corte | Pedidos historicos, NF-e no dia zero, frete externo |
| `bloqueador` | Impede venda segura, integridade financeira, privacidade, auth/admin ou catalogo vendavel | Catalogo real nao migrado/reconciliado |

## Criterios de bloqueador

Uma lacuna e bloqueadora quando afeta pelo menos um item:

- catalogo vendavel correto;
- preco, estoque, cupom, frete ou total financeiro;
- carrinho, checkout, pedido ou pagamento;
- auth, admin, privacidade ou acesso a dados de cliente;
- dados minimos reais para operar no dia zero;
- rollback/abort seguro.

## Criterios de nao bloqueador

Uma lacuna pode ser pos-go-live quando:

- nao impede venda;
- tem workaround manual claro;
- nao altera integridade financeira;
- nao expoe dados pessoais;
- nao depende de obrigacao legal/fiscal imediata;
- esta aceita no checklist final.

## Classificacao recomendada

Sempre registrar evidencia dos dois lados:

`Dominio | Laravel | Next | Status | Classificacao | Evidencia | Decisao/proxima acao`
