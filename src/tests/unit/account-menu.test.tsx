import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountMenu } from "@/features/auth/components/account-menu";

vi.mock("@/features/auth/server/actions", () => ({
  logoutAction: vi.fn()
}));

describe("menu da conta", () => {
  it("fecha quando o cliente clica fora", async () => {
    render(<AccountMenu email="cliente@example.com" name="Cliente" />);

    const summary = screen.getByLabelText("Abrir menu da conta, cliente@example.com");
    const details = summary.closest("details");

    fireEvent.click(summary);
    await waitFor(() => expect(summary).toHaveAttribute("aria-expanded", "true"));

    fireEvent.pointerDown(document.body);
    await waitFor(() => expect(details).not.toHaveAttribute("open"));
  });

  it("fecha com Esc e devolve o foco ao botão da conta", async () => {
    render(<AccountMenu email="cliente@example.com" name="Cliente" />);

    const summary = screen.getByLabelText("Abrir menu da conta, cliente@example.com");
    const details = summary.closest("details");

    fireEvent.click(summary);
    await waitFor(() => expect(summary).toHaveAttribute("aria-expanded", "true"));
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(details).not.toHaveAttribute("open"));
    expect(summary).toHaveFocus();
  });
});
