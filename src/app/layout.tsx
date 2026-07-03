import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, LogIn, Search, ShoppingBag, UserRound } from "lucide-react";
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
              <Image src="/brand/triade.png" alt="" width={220} height={122} priority />
              <span className="sr-only">Tríade Essenza Parfum</span>
            </Link>
            <form className="site-search" action="/produtos" role="search">
              <Search aria-hidden="true" size={18} />
              <label className="sr-only" htmlFor="site-search">
                Buscar produtos
              </label>
              <input id="site-search" name="q" type="search" placeholder="Buscar fragrância" />
              <button type="submit">Buscar</button>
            </form>
            <nav className="site-actions" aria-label="Navegação principal">
              <Link href="/admin">
                <LayoutDashboard aria-hidden="true" size={18} />
                Painel admin
              </Link>
              <Link href="/minha-conta">
                <UserRound aria-hidden="true" size={18} />
                Minha conta
              </Link>
              <Link href="/login">
                <LogIn aria-hidden="true" size={18} />
                Entrar
              </Link>
              <Link className="site-actions__cart" href="/carrinho">
                <ShoppingBag aria-hidden="true" size={18} />
                Carrinho
              </Link>
            </nav>
          </div>
          <nav className="site-category-nav" aria-label="Categorias">
            <div className="page-shell site-category-nav__content">
              <Link href="/produtos">Catálogo</Link>
              <Link href="/produtos">Masculinos</Link>
              <Link href="/produtos">Femininos</Link>
              <Link href="/produtos">Destaques</Link>
            </div>
          </nav>
        </header>
        {children}
        <footer className="site-footer">
          <div className="page-shell site-footer__content">
            <div>
              <strong>Tríade Essenza Parfum</strong>
              <p>Perfumes importados e inspirados na elegância árabe, com curadoria comercial e compra guiada.</p>
            </div>
            <nav className="site-footer__nav" aria-label="Links do rodapé">
              <Link href="/produtos">Catálogo</Link>
              <Link href="/carrinho">Carrinho</Link>
              <Link href="/admin">Painel admin</Link>
              <Link href="/login">Entrar</Link>
              <Link href="/minha-conta">Minha conta</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
