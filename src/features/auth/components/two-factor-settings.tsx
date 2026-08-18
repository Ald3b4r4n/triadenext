"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, Copy, KeyRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authClient } from "../client/auth-client";

type SetupData = {
  totpURI: string;
  backupCodes: string[];
};

export function TwoFactorSettings({
  enabled,
  required,
  returnTo
}: {
  enabled: boolean;
  required: boolean;
  returnTo: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [setup, setSetup] = useState<SetupData | null>(null);
  const [qrCode, setQrCode] = useState("");
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!setup?.totpURI) return;
    QRCode.toDataURL(setup.totpURI, { width: 240, margin: 1, errorCorrectionLevel: "M" })
      .then(setQrCode)
      .catch(() => setMessage("Não foi possível gerar o QR Code. Use a chave manual."));
  }, [setup]);

  const manualKey = useMemo(() => {
    if (!setup?.totpURI) return "";
    try {
      return new URL(setup.totpURI).searchParams.get("secret") ?? "";
    } catch {
      return "";
    }
  }, [setup]);

  async function startSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const result = await authClient.twoFactor.enable({ password });

    if (result.error || !result.data) {
      setMessage("Senha incorreta ou configuração indisponível. Tente novamente.");
      setPending(false);
      return;
    }

    setSetup(result.data);
    setPassword("");
    setPending(false);
  }

  async function confirmSetup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const result = await authClient.twoFactor.verifyTotp({
      code: code.replace(/\D/g, ""),
      trustDevice: true
    });

    if (result.error) {
      setMessage("Código inválido ou expirado. Aguarde o próximo código e tente novamente.");
      setPending(false);
      return;
    }

    setComplete(true);
    setPending(false);
    router.refresh();
  }

  async function disableTwoFactor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (required) return;
    setPending(true);
    setMessage("");
    const result = await authClient.twoFactor.disable({ password });
    if (result.error) {
      setMessage("Não foi possível desativar. Confira a senha atual.");
      setPending(false);
      return;
    }
    setPassword("");
    setPending(false);
    router.refresh();
  }

  if (enabled && !setup) {
    return (
      <section className="security-card">
        <div className="security-status security-status--enabled">
          <CheckCircle2 aria-hidden="true" size={22} />
          <div><strong>Autenticação em duas etapas ativa</strong><span>Sua conta exige um código além da senha.</span></div>
        </div>
        {required ? (
          <div className="security-card__actions">
            <a className="primary-action" href={returnTo}>Continuar para o painel</a>
            <p>Por segurança, contas administrativas não podem desativar esta proteção.</p>
          </div>
        ) : (
          <form onSubmit={disableTwoFactor}>
            <label><span>Senha atual</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <button className="secondary-action" disabled={pending} type="submit">Desativar autenticação em duas etapas</button>
          </form>
        )}
        {message ? <p className="form-message form-message--error" role="alert">{message}</p> : null}
      </section>
    );
  }

  if (!setup) {
    return (
      <section className="security-card">
        <div className="security-card__heading">
          <ShieldCheck aria-hidden="true" size={27} />
          <div><h2>Proteja sua conta</h2><p>Compatível com Google Authenticator, Microsoft Authenticator, Authy e outros aplicativos TOTP.</p></div>
        </div>
        {required ? <p className="security-required">Esta proteção é obrigatória para acessar funções administrativas.</p> : null}
        <form onSubmit={startSetup}>
          <label><span>Confirme sua senha atual</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="primary-action" disabled={pending} type="submit">{pending ? "Preparando..." : "Configurar autenticador"}</button>
        </form>
        {message ? <p className="form-message form-message--error" role="alert">{message}</p> : null}
      </section>
    );
  }

  return (
    <section className="security-card">
      {!complete ? (
        <>
          <div className="security-card__heading"><KeyRound aria-hidden="true" size={27} /><div><h2>Conecte o aplicativo</h2><p>Escaneie o QR Code e confirme com o código gerado.</p></div></div>
          <div className="security-enrollment">
            {qrCode ? <Image alt="QR Code para configurar a autenticação em duas etapas" height={240} src={qrCode} unoptimized width={240} /> : <div className="security-qr-placeholder">Gerando QR Code...</div>}
            <div>
              <ol><li>Abra o aplicativo autenticador.</li><li>Adicione uma nova conta.</li><li>Escaneie o QR Code ao lado.</li></ol>
              {manualKey ? <div className="security-manual-key"><span>Chave manual</span><code>{manualKey}</code><button type="button" onClick={() => navigator.clipboard.writeText(manualKey)}><Copy aria-hidden="true" size={15} /> Copiar</button></div> : null}
            </div>
          </div>
          <form onSubmit={confirmSetup}>
            <label><span>Código de 6 dígitos</span><input autoComplete="one-time-code" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /></label>
            <button className="primary-action" disabled={pending || code.length !== 6} type="submit">{pending ? "Confirmando..." : "Confirmar e ativar"}</button>
          </form>
        </>
      ) : (
        <>
          <div className="security-card__heading"><CheckCircle2 aria-hidden="true" size={27} /><div><h2>Proteção ativada</h2><p>Guarde estes códigos de recuperação em um local seguro. Cada código funciona uma única vez.</p></div></div>
          <div className="security-backup-codes" aria-label="Códigos de recuperação">
            {setup.backupCodes.map((backupCode) => <code key={backupCode}>{backupCode}</code>)}
          </div>
          <div className="security-card__actions">
            <button className="secondary-action" type="button" onClick={() => navigator.clipboard.writeText(setup.backupCodes.join("\n"))}><Copy aria-hidden="true" size={16} /> Copiar códigos</button>
            <a className="primary-action" href={returnTo}>Concluir e continuar</a>
          </div>
        </>
      )}
      {message ? <p className="form-message form-message--error" role="alert">{message}</p> : null}
    </section>
  );
}
