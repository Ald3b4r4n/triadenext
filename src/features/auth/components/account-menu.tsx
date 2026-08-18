"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { logoutAction } from "@/features/auth/server/actions";

export function AccountMenu({
  email,
  name
}: {
  email: string;
  name: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function closeWhenOutside(event: PointerEvent) {
      if (!detailsRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        detailsRef.current?.querySelector("summary")?.focus();
      }
    }

    document.addEventListener("pointerdown", closeWhenOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeWhenOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <details
      className="site-account-menu"
      onToggle={(event) => setOpen(event.currentTarget.open)}
      open={open}
      ref={detailsRef}
    >
      <summary
        aria-expanded={open}
        aria-label={`Abrir menu da conta, ${email}`}
      >
        <UserRound aria-hidden="true" size={18} />
      </summary>
      <div className="site-account-popover">
        <small>Conta conectada</small>
        <strong>{name}</strong>
        <span>{email}</span>
        <Link href="/minha-conta" onClick={() => setOpen(false)}>
          <UserRound aria-hidden="true" size={16} /> Minha conta
        </Link>
        <form action={logoutAction}>
          <button type="submit">
            <LogOut aria-hidden="true" size={17} /> Sair da conta
          </button>
        </form>
      </div>
    </details>
  );
}
