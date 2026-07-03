import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StorefrontHome } from "@/components/storefront/storefront-home";
import { filterPublicProducts } from "@/features/products/domain";
import { devProducts } from "@/features/products/dev/fixtures";

describe("StorefrontHome", () => {
  it("renders the public brand, catalog CTA and a purchasable fixture", () => {
    const products = filterPublicProducts(devProducts, new Date("2026-06-11T12:00:00.000Z"));

    render(<StorefrontHome products={products} />);

    expect(screen.queryByText("Reconstrucao em andamento")).not.toBeInTheDocument();
    expect(screen.queryByText(/Placeholder funcional/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Storefront$/)).not.toBeInTheDocument();
    expect(screen.getByText("Tríade Essenza Parfum")).toBeInTheDocument();
    expect(screen.getByText("Perfumaria árabe contemporânea")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comprar agora" })).toHaveAttribute(
      "href",
      "/produtos"
    );
    expect(screen.getByText("Essenza Gold")).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*159,90/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute(
      "href",
      "/produto/essenza-gold"
    );
    expect(screen.queryByText("Amber Nuit")).not.toBeInTheDocument();
  });

  it("renders a safe empty state when no products are available", () => {
    render(<StorefrontHome products={[]} />);

    expect(screen.getByText("Nenhum produto disponível no momento.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para a home" })).toHaveAttribute("href", "/");
    expect(screen.queryByText(/stack|DATABASE_URL|secret/i)).not.toBeInTheDocument();
  });

  it("renders a safe catalog error without leaking implementation details", () => {
    render(<StorefrontHome products={[]} catalogUnavailable />);

    expect(screen.getByText("Catálogo temporariamente indisponível")).toBeInTheDocument();
    expect(screen.queryByText(/stack|DATABASE_URL|secret/i)).not.toBeInTheDocument();
  });
});
