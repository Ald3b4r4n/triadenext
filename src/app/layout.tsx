import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Triade Essenza Parfum",
  description: "Reconstrucao Next.js da Triade Essenza Parfum"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="page-shell" style={{ paddingBottom: 0 }}>
          <Link href="/" aria-label="Triade Essenza Parfum">
            <strong>Triade Essenza Parfum</strong>
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
