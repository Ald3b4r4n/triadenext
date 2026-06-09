# Interface Contract: Shipping Domain, Rules and Quote

> Data: `2026-06-09`
> Tipo: server-only domain module

## Tipos conceituais

```ts
type ShippingProvider = "manual" | "fixture" | "dev_fallback";

type ShippingDestination = {
  postalCode: string;
  country: "BR";
};

type ManualShippingRule = {
  id: string;
  name: string;
  state?: string;
  postalCodeStart?: string;
  postalCodeEnd?: string;
  priceCents: number;
  estimatedDays?: number;
  estimatedLabel?: string;
  priority: number;
  isActive: boolean;
};

type ShippingQuoteOption = {
  quoteToken: string;
  provider: ShippingProvider;
  ruleId?: string;
  name: string;
  priceCents: number;
  effectivePriceCents: number;
  estimatedDays?: number;
  estimatedLabel?: string;
  destinationPostalCode: string;
  expiresAt: string;
  isManual: true;
  isFallback: boolean;
  freeShippingApplied: boolean;
};
```

## Regras

- CEP deve ser normalizado antes de comparar faixas.
- Regra manual ativa pode aplicar por UF e/ou faixa de CEP.
- Valor da regra é sempre em centavos.
- Cotações expiram em 30 minutos.
- `effectivePriceCents` vira 0 somente quando `free_shipping` elegível se aplica a cotação manual válida.
- Sem cotação manual válida, `free_shipping` não cria opção artificial.
- Correios, Jadlog e Melhor Envio não pertencem ao runtime deste contrato na Fase 7.

## Erros controlados

- `shipping_postal_code_invalid`
- `shipping_cart_empty`
- `shipping_cart_unavailable`
- `shipping_no_manual_rule`
- `shipping_quote_expired`
- `shipping_quote_not_found`
- `shipping_quote_not_owner`
- `shipping_unavailable`

## Guardrails

- Não calcular frete no cliente.
- Não aceitar valor de frete do payload.
- Não chamar API externa real.
- Não prometer preço/prazo de transportadora.
- Não criar checkout, pedido, pagamento, reserva ou baixa de estoque.
