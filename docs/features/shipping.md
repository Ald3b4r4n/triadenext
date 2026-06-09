# Frete manual e cotacoes

Fase 7 adiciona cotacao de frete manual no carrinho.

## Escopo

- CEP brasileiro normalizado para oito digitos.
- Regras manuais por UF ou faixa de CEP.
- Cotacoes vinculadas ao carrinho e expiracao padrao de 30 minutos.
- Selecao de opcao validada no servidor contra o carrinho atual.
- Fallback dev/test com fixtures, sem credenciais externas.
- Cupom `free_shipping` zera apenas frete manual ja calculado.

## Fora de escopo

- Checkout, pagamento, pedido, reserva ou baixa de estoque.
- Correios, Jadlog, Melhor Envio ou qualquer API real de transportadora.
- Endereco completo, peso, dimensoes, contratos, SLA e relatorios.

## Admin

`/admin/frete` lista regras manuais quando `requireAdminLike` permite acesso. Sem banco/auth real,
a area permanece bloqueada pela policy existente.
