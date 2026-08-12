"use client";

import { useEffect, useState } from "react";

export const cartCountEventName = "triade:cart-count";

export function CartCountBadge({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const updateCount = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number; delta?: number }>).detail;
      if (typeof detail?.count === "number") {
        setCount(Math.max(0, detail.count));
      } else if (typeof detail?.delta === "number") {
        setCount((current) => Math.max(0, current + detail.delta!));
      }
    };

    window.addEventListener(cartCountEventName, updateCount);
    return () => window.removeEventListener(cartCountEventName, updateCount);
  }, []);

  return count > 0 ? <span>{count > 99 ? "99+" : count}</span> : null;
}

export function announceCartCount(detail: { count?: number; delta?: number }) {
  window.dispatchEvent(new CustomEvent(cartCountEventName, { detail }));
}
