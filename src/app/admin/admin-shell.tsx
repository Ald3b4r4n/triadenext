"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgePercent,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  Users,
  X
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
        href: "/seguranca",
        label: "Segurança da conta",
        icon: ShieldCheck,
        exact: true
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key === "Tab") {
        const focusableElements = sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements?.[0];
        const lastElement = focusableElements?.[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileNavOpen]);

  return (
    <div className="admin-app-shell">
      <button
        aria-hidden={!mobileNavOpen}
        aria-label="Fechar menu administrativo"
        className="admin-sidebar-backdrop"
        data-open={mobileNavOpen ? "true" : "false"}
        onClick={() => {
          setMobileNavOpen(false);
          menuButtonRef.current?.focus();
        }}
        tabIndex={mobileNavOpen ? 0 : -1}
        type="button"
      />

      <aside
        aria-label="Menu administrativo"
        className="admin-sidebar"
        data-open={mobileNavOpen ? "true" : "false"}
        id="admin-navigation"
        ref={sidebarRef}
      >
        <div className="admin-sidebar__header">
          <Link
            className="admin-sidebar__brand"
            href="/admin"
            onClick={() => setMobileNavOpen(false)}
          >
            <Image
              src="/brand/triade-logo-horizontal-transparent.png"
              alt=""
              width={535}
              height={134}
              priority
            />
            <span>Painel administrativo</span>
          </Link>
          <button
            aria-label="Fechar menu administrativo"
            className="admin-sidebar__close"
            onClick={() => {
              setMobileNavOpen(false);
              menuButtonRef.current?.focus();
            }}
            ref={closeButtonRef}
            type="button"
          >
            <X aria-hidden="true" size={21} />
          </button>
        </div>

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
                    onClick={() => setMobileNavOpen(false)}
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
        <header className="admin-mobilebar">
          <button
            aria-controls="admin-navigation"
            aria-expanded={mobileNavOpen}
            aria-label="Abrir menu administrativo"
            className="admin-mobilebar__menu"
            onClick={() => setMobileNavOpen(true)}
            ref={menuButtonRef}
            type="button"
          >
            <Menu aria-hidden="true" size={22} />
          </button>
          <Link className="admin-mobilebar__brand" href="/admin">
            <Image
              src="/brand/triade-logo-horizontal-transparent.png"
              alt="Tríade Essenza Parfum"
              width={535}
              height={134}
              priority
            />
          </Link>
          <Link
            className="admin-mobilebar__avatar"
            href="/admin/usuarios"
            aria-label="Conta administrativa"
          >
            {getInitials(userName)}
          </Link>
        </header>

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
