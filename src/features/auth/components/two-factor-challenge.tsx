"use client";

import { FormEvent, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { authClient } from "../client/auth-client";
import { finalizeTwoFactorLoginAction } from "../server/actions";

type VerificationMode = "totp" | "backup";

export function TwoFactorChallenge({ returnTo }: { returnTo: string }) {
  const [mode, setMode] = useState<VerificationMode>("totp");
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const normalizedCode = code.replace(/\s+/g, "");
    const result = mode === "totp"
      ? await authClient.twoFactor.verifyTotp({ code: normalizedCode, trustDevice })
      : await authClient.twoFactor.verifyBackupCode({
          code: normalizedCode,
          trustDevice,
          disableSession: false
        });

    if (result.error) {
      setMessage(
        mode === "totp"
          ? "Código inválido ou expirado. Confira o aplicativo e tente novamente."
          : "Código de recuperação inválido ou já utilizado."
      );
      setPending(false);
      return;
    }

    await finalizeTwoFactorLoginAction();
    window.location.assign(returnTo);
  }

  return (
    <section className="security-card security-card--challenge">
      <div className="security-card__icon"><ShieldCheck aria-hidden="true" size={26} /></div>
      <p className="muted">Verificação em duas etapas</p>
      <h1>Confirme que é você</h1>
      <p>
        {mode === "totp"
          ? "Digite o código de 6 dígitos exibido no seu aplicativo autenticador."
          : "Use um dos códigos de recuperação salvos durante a configuração."}
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          <span>{mode === "totp" ? "Código do autenticador" : "Código de recuperação"}</span>
          <input
            autoComplete="one-time-code"
            inputMode={mode === "totp" ? "numeric" : "text"}
            maxLength={mode === "totp" ? 8 : 32}
            name="code"
            onChange={(event) => setCode(event.target.value)}
            placeholder={mode === "totp" ? "000 000" : "XXXX-XXXX"}
            required
            value={code}
          />
        </label>
        <label className="security-card__check">
          <input
            checked={trustDevice}
            onChange={(event) => setTrustDevice(event.target.checked)}
            type="checkbox"
          />
          <span>Confiar neste dispositivo por 30 dias</span>
        </label>
        {message ? <p className="form-message form-message--error" role="alert">{message}</p> : null}
        <button className="primary-action" disabled={pending || !code.trim()} type="submit">
          {pending ? "Verificando..." : "Verificar e entrar"}
        </button>
      </form>

      <button
        className="security-card__alternate"
        onClick={() => {
          setMode(mode === "totp" ? "backup" : "totp");
          setCode("");
          setMessage("");
        }}
        type="button"
      >
        {mode === "totp" ? "Usar código de recuperação" : "Usar aplicativo autenticador"}
      </button>
    </section>
  );
}
