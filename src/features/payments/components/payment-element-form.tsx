"use client";

import { useMemo, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  confirmMockPaymentAction,
  getOrderPaymentStatusAction,
  startOrderPaymentAction
} from "../server/payment-actions";
import type { StartPaymentSuccess } from "../types";

export function PaymentElementForm({ orderId }: { orderId: string }) {
  const [started, setStarted] = useState<StartPaymentSuccess | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    const result = await startOrderPaymentAction(orderId);
    setBusy(false);
    if (result.status !== "success") {
      setMessage(toSafePaymentMessage(result.message));
      return;
    }
    setStarted(result);
    setMessage(toSafePaymentMessage(result.message));
  }

  if (!started) {
    return (
      <section className="placeholder-panel" data-testid="payment-start">
        <p className="muted">Pagamento seguro</p>
        <h2>Concluir pedido</h2>
        <p>O valor vem do resumo do pedido e não pode ser alterado pelo navegador.</p>
        <button className="primary-action" disabled={busy} onClick={start} type="button">
          {busy ? "Preparando pagamento..." : "Iniciar pagamento"}
        </button>
        {message ? <p role="status">{message}</p> : null}
      </section>
    );
  }

  if (started.mode === "mock") {
    return (
      <MockPaymentForm
        orderId={orderId}
        initialMessage={message}
      />
    );
  }

  return (
    <RealStripeElements
      orderId={orderId}
      payment={started}
    />
  );
}

function RealStripeElements({
  orderId,
  payment
}: {
  orderId: string;
  payment: StartPaymentSuccess;
}) {
  const stripePromise = useMemo(
    () => loadStripe(payment.publishableKey),
    [payment.publishableKey]
  );

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: payment.clientSecret,
        appearance: { theme: "stripe" }
      }}
    >
      <StripePaymentContent orderId={orderId} />
    </Elements>
  );
}

function StripePaymentContent({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    setBusy(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pedidos/${orderId}/pagamento`
      },
      redirect: "if_required"
    });
    setBusy(false);
    if (result.error) {
      setMessage(result.error.message ?? "Pagamento não foi concluído.");
      return;
    }
    const status = await getOrderPaymentStatusAction(orderId);
    setMessage(
      status.status === "success" && status.order.status === "pago"
        ? "Pagamento confirmado pelo servidor."
        : "Pagamento enviado. Aguardando confirmação segura do servidor."
    );
  }

  return (
    <form className="checkout-form" onSubmit={submit}>
      <h2>Pagamento seguro</h2>
      <PaymentElement />
      <button className="primary-action" disabled={!stripe || busy} type="submit">
        {busy ? "Processando..." : "Pagar pedido"}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  );
}

function MockPaymentForm({
  orderId,
  initialMessage
}: {
  orderId: string;
  initialMessage: string;
}) {
  const [message, setMessage] = useState(initialMessage);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    const result = await confirmMockPaymentAction(orderId);
    setBusy(false);
    setMessage(toSafePaymentMessage(result.message));
  }

  return (
    <section className="placeholder-panel" data-testid="payment-mock">
      <p className="muted">Modo de teste seguro</p>
      <h2>Nenhuma cobrança real será feita</h2>
      <p>
        Esta confirmação valida o fluxo local sem coletar dados de cartão e sem envio real.
      </p>
      <button className="primary-action" disabled={busy} onClick={confirm} type="button">
        {busy ? "Confirmando pagamento de teste..." : "Confirmar pagamento de teste"}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </section>
  );
}

function toSafePaymentMessage(message: string) {
  return message
    .replace(/PaymentIntent/gi, "pagamento")
    .replace(/Stripe mock dev\/test/gi, "modo de teste seguro")
    .replace(/Stripe/gi, "pagamento")
    .replace(/webhook/gi, "confirmação do servidor");
}
