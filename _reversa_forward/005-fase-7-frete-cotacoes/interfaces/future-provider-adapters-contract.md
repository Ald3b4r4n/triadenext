# Interface Contract: Future Provider Adapters

> Data: `2026-06-09`
> Tipo: contrato futuro inativo

## Escopo

Este contrato documenta somente a fronteira futura para Correios, Jadlog e Melhor Envio. Na Fase 7, esses adapters:

- não rodam em runtime;
- não exigem credenciais;
- não geram cotação real;
- não prometem preço/prazo de transportadora;
- não participam do cálculo MVP.

## Shape futuro conceitual

```ts
type FutureShippingProvider = "correios" | "jadlog" | "melhor_envio";

type FutureProviderQuoteRequest = {
  destinationPostalCode: string;
  items: Array<{
    productId: string;
    quantity: number;
    weightGrams?: number;
    dimensions?: unknown;
  }>;
};

type FutureProviderQuoteResponse = {
  provider: FutureShippingProvider;
  serviceCode: string;
  carrier: string;
  serviceName: string;
  priceCents: number;
  estimatedDays?: number;
};
```

## Guardrails para fase futura

- Exigir decisão humana antes de ativar runtime real.
- Configurar credenciais fora do chat.
- Validar peso/dimensões antes de cotar.
- Diferenciar sandbox, fixture e produção.
- Registrar timeout, retry e falha segura.

## Guardrail da Fase 7

Qualquer chamada real a provider externo durante a Fase 7 é regressão.
