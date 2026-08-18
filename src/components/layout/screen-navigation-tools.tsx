"use client";

import { ArrowLeft, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function ScreenNavigationTools() {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setShowScrollTop(window.scrollY > 640);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  };

  return (
    <nav className="screen-navigation-tools" aria-label="Atalhos de navegação">
      <button type="button" onClick={goBack} aria-label="Voltar para a tela anterior">
        <ArrowLeft aria-hidden="true" size={20} />
      </button>
      <button
        className={showScrollTop ? "is-visible" : ""}
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Voltar ao topo"
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
      >
        <ArrowUp aria-hidden="true" size={20} />
      </button>
    </nav>
  );
}
