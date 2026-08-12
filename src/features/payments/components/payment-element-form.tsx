"use client";

import { useMemo, useState } from "react";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckoutElements
} from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
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
    setMessage("");
    try {
      const result = await startOrderPaymentAction(orderId);
      if (result.status !== "success") {
        setMessage(toSafePaymentMessage(result.message));
        return;
      }
      setStarted(result);
      setMessage(toSafePaymentMessage(result.message));
    } catch {
      setMessage("Não foi possível iniciar o pagamento. Tente novamente em instantes.");
    } finally {
      setBusy(false);
    }
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
        {message ? <p className="form-message form-message--error" role="alert">{message}</p> : null}
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
    <CheckoutElementsProvider
      stripe={stripePromise}
      options={{
        clientSecret: payment.clientSecret,
        elementsOptions: { appearance: { theme: "stripe" } }
      }}
    >
      <StripePaymentContent orderId={orderId} />
    </CheckoutElementsProvider>
  );
}

function StripePaymentContent({ orderId }: { orderId: string }) {
  const checkoutState = useCheckoutElements();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checkoutState.type !== "success") {
      return;
    }
    setBusy(true);
    setMessage("Validando seus dados com segurança...");
    try {
      const result = await checkoutState.checkout.confirm({
        redirect: "if_required"
      });
      if (result.type === "error") {
        setBusy(false);
        setMessage(result.error.message ?? "Pagamento não foi concluído.");
        return;
      }
      setMessage("Pagamento enviado. Aguardando confirmação do servidor...");
      const confirmed = await waitForPaymentConfirmation(orderId);
      if (confirmed) {
        router.refresh();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setBusy(false);
      setMessage("Pagamento enviado. A confirmação pode levar alguns segundos; atualize a página para acompanhar.");
    } catch {
      setBusy(false);
      setMessage("Não foi possível concluir o pagamento. Confira os dados e tente novamente.");
    }
  }

  return (
    <form className="checkout-form" onSubmit={submit}>
      <h2>Pagamento seguro</h2>
      <PaymentElement />
      <button className="primary-action payment-submit" disabled={checkoutState.type !== "success" || busy} type="submit">
        {busy ? <><LoaderCircle className="payment-submit__spinner" aria-hidden="true" size={18} /> Processando pagamento</> : "Pagar pedido"}
      </button>
      {busy ? (
        <div className="payment-progress" role="status" aria-live="polite">
          <div className="payment-progress__track"><span /></div>
          <ol>
            <li className="is-complete"><Check aria-hidden="true" size={13} /> Dados protegidos</li>
            <li className="is-active"><LoaderCircle aria-hidden="true" size={13} /> Autorizando</li>
            <li>Confirmando pedido</li>
          </ol>
          <p>{message}</p>
        </div>
      ) : message ? <p role="status">{message}</p> : null}
    </form>
  );
}

async function waitForPaymentConfirmation(orderId: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const status = await getOrderPaymentStatusAction(orderId);
    if (status.status === "success" && status.order.status === "pago") {
      return true;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1_000));
  }
  return false;
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
