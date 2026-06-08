"use client";

import { useActionState } from "react";
import type { AuthActionState } from "../server/actions";

type AuthFormProps = {
  mode: "login" | "signup";
  action: (previousState: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  returnTo?: string;
};

const initialState: AuthActionState = {
  status: "idle",
  message: ""
};

export function AuthForm({ mode, action, returnTo }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const isSignup = mode === "signup";

  return (
    <form className="form-panel" action={formAction}>
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {isSignup ? (
        <label>
          Nome
          <input name="name" autoComplete="name" aria-invalid={Boolean(state.fields?.name)} />
          {state.fields?.name ? <span className="field-error">{state.fields.name}</span> : null}
        </label>
      ) : null}
      <label>
        E-mail
        <input
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(state.fields?.email)}
        />
        {state.fields?.email ? <span className="field-error">{state.fields.email}</span> : null}
      </label>
      <label>
        Senha
        <input
          name="password"
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          aria-invalid={Boolean(state.fields?.password)}
        />
        {state.fields?.password ? (
          <span className="field-error">{state.fields.password}</span>
        ) : null}
      </label>
      {state.message ? <p className="form-message form-message--error">{state.message}</p> : null}
      <button className="primary-action" type="submit" disabled={pending}>
        {isSignup ? "Criar conta" : "Entrar"}
      </button>
    </form>
  );
}
