"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  FileText,
  Home,
  LayoutDashboard,
  Package,
  Search,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Users
} from "lucide-react";

type AdminShellProps = {
  children: ReactNode;
  userEmail: string;
  userRole: "admin" | "manager" | "customer";
};

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

type AdminNavSection = {
  label: string;
  items: AdminNavItem[];
};

const navSections: AdminNavSection[] = [
  {
    label: "Painel",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true
      }
    ]
  },
  {
    label: "Operações",
    items: [
      {
        href: "/admin/pedidos",
        label: "Pedidos",
        icon: ShoppingBag
      }
    ]
  },
  {
    label: "Catálogo",
    items: [
      {
        href: "/admin/produtos",
        label: "Produtos",
        icon: Package
      },
      {
        href: "/admin/categorias",
        label: "Categorias",
        icon: Tags
      }
    ]
  },
  {
    label: "Comercial",
    items: [
      {
        href: "/admin/cupons",
        label: "Cupons",
        icon: BadgePercent
      },
      {
        href: "/admin/frete",
        label: "Frete",
        icon: Truck
      }
    ]
  },
  {
    label: "Sistema",
    items: [
      {
        href: "/admin/usuarios",
        label: "Usuários e permissões",
        icon: Users
      },
      {
        href: "/admin/documentos-fiscais",
        label: "Notas fiscais",
        icon: FileText
      },
      {
        href: "/",
        label: "Ver loja",
        icon: Store,
        exact: true
      }
    ]
  }
];

export function AdminShell({ children, userEmail, userRole }: AdminShellProps) {
  const pathname = usePathname();
  const userName = formatUserName(userEmail);

  return (
    <div className="admin-app-shell">
      <aside className="admin-sidebar" aria-label="Menu administrativo">
        <Link className="admin-sidebar__brand" href="/admin">
          <Image
            src="/brand/triade-logo-horizontal-transparent.png"
            alt=""
            width={535}
            height={134}
            priority
          />
          <span>Painel administrativo</span>
        </Link>

        <nav
          className="admin-sidebar__nav"
          aria-label="Funções administrativas"
        >
          {navSections.map((section) => (
            <div className="admin-sidebar__section" key={section.label}>
              <p>{section.label}</p>
              {section.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className="admin-sidebar__link"
                    href={item.href}
                    key={`${section.label}-${item.label}`}
                  >
                    <item.icon aria-hidden="true" size={17} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__user">
          <span>{getInitials(userName)}</span>
          <div>
            <strong>{userName}</strong>
            <small>{userRole === "admin" ? "Admin" : "Gestor"}</small>
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <form className="admin-search" action="/admin/produtos" role="search">
            <label className="sr-only" htmlFor="admin-search">
              Buscar no admin
            </label>
            <Search aria-hidden="true" size={18} />
            <input
              id="admin-search"
              name="q"
              type="search"
              placeholder="Buscar..."
            />
          </form>

          <div className="admin-topbar__actions">
            <Link className="admin-topbar__new" href="/admin/produtos/novo">
              Novo produto
            </Link>
            <Link className="admin-topbar__icon" href="/" aria-label="Ver loja">
              <Home aria-hidden="true" size={17} />
            </Link>
            <Link
              className="admin-topbar__icon"
              href="/admin/pedidos"
              aria-label="Pedidos"
            >
              <ShoppingBag aria-hidden="true" size={17} />
            </Link>
            <Link
              className="admin-topbar__avatar"
              href="/admin/usuarios"
              aria-label="Conta administrativa"
            >
              {getInitials(userName)}
            </Link>
          </div>
        </header>

        <div className="admin-workspace__content">{children}</div>
      </div>
    </div>
  );
}

function formatUserName(email: string) {
  const [prefix] = email.split("@");
  const name = prefix
    .split(/[._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return name || "Admin";
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "AR";
}
