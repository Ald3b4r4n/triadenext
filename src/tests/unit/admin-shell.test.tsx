import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminShell } from "@/app/admin/admin-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/pedidos",
  useRouter: () => ({
    refresh: vi.fn(),
    replace: vi.fn()
  })
}));

describe("shell administrativo responsivo", () => {
  it("abre e fecha o menu móvel sem perder o conteúdo administrativo", async () => {
    render(
      <AdminShell userEmail="gestor@example.com" userRole="manager">
        <p>Conteúdo protegido</p>
      </AdminShell>
    );

    const openButton = screen.getByRole("button", {
      name: "Abrir menu administrativo"
    });
    const navigation = screen.getByLabelText("Menu administrativo");

    expect(screen.getByText("Conteúdo protegido")).toBeInTheDocument();
    expect(openButton).toHaveAttribute("aria-expanded", "false");
    expect(navigation).toHaveAttribute("data-open", "false");

    fireEvent.click(openButton);

    await waitFor(() => {
      expect(openButton).toHaveAttribute("aria-expanded", "true");
      expect(navigation).toHaveAttribute("data-open", "true");
      expect(document.body.style.overflow).toBe("hidden");
    });

    fireEvent.keyDown(window, { key: "Escape" });

    await waitFor(() => {
      expect(openButton).toHaveAttribute("aria-expanded", "false");
      expect(navigation).toHaveAttribute("data-open", "false");
      expect(document.body.style.overflow).toBe("");
      expect(openButton).toHaveFocus();
    });
  });

  it("fecha o drawer quando uma função administrativa é selecionada", async () => {
    render(
      <AdminShell userEmail="admin@example.com" userRole="admin">
        <p>Área administrativa</p>
      </AdminShell>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Abrir menu administrativo" })
    );
    fireEvent.click(screen.getAllByRole("link", { name: "Produtos" })[0]);

    await waitFor(() => {
      expect(screen.getByLabelText("Menu administrativo")).toHaveAttribute(
        "data-open",
        "false"
      );
    });
  });

  it("mantém a autorização administrativa ao visitar a loja na mesma sessão", () => {
    render(
      <AdminShell userEmail="admin@example.com" userRole="admin">
        <p>Área administrativa</p>
      </AdminShell>
    );

    expect(screen.getAllByRole("link", { name: "Ver loja" })[0]).toHaveAttribute(
      "href",
      "/"
    );
  });
});
