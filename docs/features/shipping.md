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

- Checkout, pagamento, pedido, reserva ou baixa de estoque eram fora de escopo da Fase 7.
- Correios, Jadlog, Melhor Envio ou qualquer API real de transportadora.
- Endereco completo, peso, dimensoes, contratos, SLA e relatorios.

## Admin

`/admin/frete` lista regras manuais quando `requireAdminLike` permite acesso. Sem banco/auth real,
a area permanece bloqueada pela policy existente.

## Fase 8 — Frete no checkout

O checkout pendente exige frete selecionado valido e nao expirado. A quote precisa pertencer ao
carrinho ativo e o CEP do endereco deve ser coerente com o CEP cotado. O pedido guarda snapshot de
CEP, origem manual/fixture, label, prazo, valor original e valor efetivo. Nenhum provider externo e
chamado.
