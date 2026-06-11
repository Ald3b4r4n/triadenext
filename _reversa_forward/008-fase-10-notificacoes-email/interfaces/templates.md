# Interface: Transactional Email Templates

> Feature: `008-fase-10-notificacoes-email`
> Tipo: contrato interno de template

## Template 1: cliente pedido pago

### Entrada

```ts
type CustomerOrderPaidTemplateInput = {
  orderNumber: string;
  orderId: string;
  status: "pago";
  totalCents: number;
  currency: "BRL";
  items: Array<{
    name: string;
    quantity: number;
    lineTotalCents: number;
  }>;
  shipping: {
    label?: string;
    provider?: string;
    estimatedDays?: number;
    amountCents: number;
  } | null;
  addressSummary: string;
};
```

### Conteudo permitido

- Numero/id do pedido.
- Status.
- Total.
- Itens resumidos.
- Frete resumido.
- Endereco snapshotado resumido.
- Mensagem de continuidade operacional da loja.

## Template 2: admin/gestores novo pedido pago

### Entrada

```ts
type AdminOrderPaidTemplateInput = CustomerOrderPaidTemplateInput & {
  customerName?: string;
  customerEmail?: string;
};
```

### Conteudo permitido

- Numero/id do pedido.
- Cliente resumido.
- Status.
- Total.
- Itens resumidos.
- Frete resumido.
- Endereco snapshotado resumido.
- Alerta operacional de novo pedido pago.

## Dados proibidos

- Dados de cartao.
- Secrets.
- Tokens.
- Payload Stripe bruto.
- Client secret.
- Webhook secret.
- Cookies/sessoes.
- `DATABASE_URL`.
- Informacoes fiscais sensiveis.
- Dados fora do snapshot seguro do pedido.
- Links com tokens sensiveis.

## Saida esperada

Cada template deve retornar:

```ts
type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};
```

O assunto deve ser claro e nao conter dados sensiveis.
