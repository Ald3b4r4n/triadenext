import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, Great_Vibes } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  LockKeyhole,
  Search,
  ShieldCheck,
  ShoppingBag,
  Truck,
  UserRound
} from "lucide-react";
import { getCurrentSession } from "@/features/auth/server/session";
import { logoutAction } from "@/features/auth/server/actions";
import { getActiveCartForRender } from "@/features/cart/server/cart-service";
import { CartCountBadge } from "@/features/cart/components/cart-count-badge";
import { AccountMenu } from "@/features/auth/components/account-menu";
import { ScreenNavigationTools } from "@/components/layout/screen-navigation-tools";
import "./globals.css";

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cinzel-decorative"
});

const signature = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-signature"
});

export const metadata: Metadata = {
  title: "Tríade Essenza Parfum",
  description:
    "Loja online de perfumes, fragrâncias marcantes e design sofisticado."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

// Sessão, estoque, carrinho e pedidos são dados de requisição. O build nunca deve consultar o banco.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${cinzelDecorative.variable} ${signature.variable}`}
    >
      <body>
        <header className="site-header">
          <div className="identity-topbar" aria-label="Diferenciais da loja">
            <div className="page-shell identity-topbar__content">
              <span>
                <Truck aria-hidden="true" size={13} />
                Envio para todo o Brasil
              </span>
              <span>
                <ShieldCheck aria-hidden="true" size={13} />
                Produtos 100% originais
              </span>
              <span>
                <LockKeyhole aria-hidden="true" size={13} />
                Compra segura
              </span>
            </div>
          </div>
          <div className="page-shell site-header__content">
            <Link
              className="site-brand"
              href="/"
              aria-label="Tríade Essenza Parfum"
            >
              <Image
                src="/brand/triade-logo-horizontal-transparent.png"
                alt=""
                width={535}
                height={134}
                priority
              />
              <span className="sr-only">Tríade Essenza Parfum</span>
            </Link>
            <nav className="site-category-nav" aria-label="Categorias">
              <Link href="/">Início</Link>
              <Link href="/quem-somos">Quem somos</Link>
              <Link href="/produtos">Masculinos</Link>
              <Link href="/produtos">Femininos</Link>
              <Link href="/produtos">Marcas Parceiras</Link>
              <Link href="/produtos">Kit&apos;s</Link>
              <Link href="/produtos">Promoções</Link>
            </nav>
            <nav className="site-actions" aria-label="Navegação principal">
              <Suspense fallback={null}>
                <HeaderAdminLink />
              </Suspense>
              <form className="site-search" action="/produtos" role="search">
                <label className="sr-only" htmlFor="site-search">
                  Buscar produtos
                </label>
                <input
                  id="site-search"
                  name="q"
                  type="search"
                  placeholder="Buscar"
                />
                <button type="submit" aria-label="Buscar">
                  <Search aria-hidden="true" size={18} />
                </button>
              </form>
              <Suspense fallback={<AccountLinkFallback />}>
                <HeaderAccount />
              </Suspense>
              <Suspense fallback={<CartLink count={0} />}>
                <HeaderCart />
              </Suspense>
            </nav>
          </div>
        </header>
        {children}
        <ScreenNavigationTools />
        <footer className="site-footer">
          <div className="page-shell site-footer__content">
            <div className="site-footer__column">
              <h2>Central de atendimento</h2>
              <p>
                <a href="mailto:suporte@triadeessenzaparfum.com.br">
                  suporte@triadeessenzaparfum.com.br
                </a>
              </p>
            </div>
            <nav className="site-footer__nav" aria-label="Menu do rodapé">
              <h2>Menu</h2>
              <Link href="/">Início</Link>
              <Link href="/quem-somos">Quem somos</Link>
              <Link href="/produtos">Catálogo</Link>
              <Link href="/carrinho">Carrinho</Link>
              <Suspense fallback={<Link href="/login">Entrar</Link>}>
                <FooterAccountLinks />
              </Suspense>
            </nav>
            <div className="site-footer__column">
              <h2>Pagamento</h2>
              <ul
                className="payment-list"
                aria-label="Formas de pagamento aceitas"
              >
                <li>Cartões de crédito</li>
                <li>Cartões de débito</li>
                <li>Pix</li>
                <li>Boleto</li>
              </ul>
            </div>
            <div className="site-footer__column site-footer__credit">
              <h2>Desenvolvimento</h2>
              <p>
                Desenvolvido por{" "}
                <a
                  href="https://www.arsoftwaredevelopment.com.br/"
                  rel="noreferrer"
                  target="_blank"
                >
                  AR Software Development
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

async function HeaderAdminLink() {
  const session = await getCurrentSession();
  return session.status === "authenticated" && (session.role === "admin" || session.role === "manager") ? (
    <Link className="site-action-text" href="/admin">Admin</Link>
  ) : null;
}

async function HeaderAccount() {
  const session = await getCurrentSession();
  if (session.status !== "authenticated") return <AccountLinkFallback />;

  return <AccountMenu email={session.email} name={session.name?.trim() || "Cliente"} />;
}

function AccountLinkFallback() {
  return <Link className="site-account-link" href="/login"><UserRound aria-hidden="true" size={18} /><span>Entrar</span></Link>;
}

async function HeaderCart() {
  const result = await getActiveCartForRender().catch(() => null);
  const count = result && (result.status === "success" || result.status === "fallback")
    ? result.cart.items.reduce((total, item) => total + item.quantity, 0)
    : 0;
  return <CartLink count={count} />;
}

function CartLink({ count }: { count: number }) {
  return (
    <Link
      className="site-action-icon site-actions__cart"
      href="/carrinho"
      aria-label={count > 0 ? `Carrinho com ${count} ${count === 1 ? "item" : "itens"}` : "Carrinho vazio"}
    >
      <ShoppingBag aria-hidden="true" size={18} />
      <CartCountBadge initialCount={count} />
    </Link>
  );
}

async function FooterAccountLinks() {
  const session = await getCurrentSession();
  return session.status === "authenticated" ? (
    <>
      <Link href="/minha-conta">Minha conta</Link>
      <form action={logoutAction}><button className="site-footer__auth-action" type="submit">Sair da conta</button></form>
    </>
  ) : (
    <><Link href="/login">Entrar</Link><Link href="/cadastro">Criar conta</Link></>
  );
}
