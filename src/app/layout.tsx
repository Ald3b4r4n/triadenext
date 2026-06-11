import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tríade Essenza Parfum",
  description: "Perfumaria árabe contemporânea, fragrâncias marcantes e design sofisticado."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <div className="page-shell site-header__content">
            <Link className="site-brand" href="/" aria-label="Tríade Essenza Parfum">
              <span>Tríade</span>
              <strong>Essenza Parfum</strong>
            </Link>
            <nav className="site-nav" aria-label="Navegação principal">
              <Link href="/produtos">Produtos</Link>
              <Link href="/carrinho">Carrinho</Link>
              <Link href="/login">Entrar</Link>
              <Link className="site-nav__account" href="/minha-conta">
                Minha conta
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
