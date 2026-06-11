# Migration Brief - Tríade Essenza Parfum

## Contexto

O legado é um e-commerce Laravel monolítico com storefront, autenticação, área do cliente, admin, cupons, frete, checkout, pagamentos, pedidos, notificações, operações fiscais e integrações comerciais. O novo projeto é um Next.js App Router com TypeScript, Drizzle, Neon/Postgres, Stripe, Tailwind e testes Vitest/Playwright.

## Objetivo de migração

Reconstruir a experiência pública, administrativa e operacional em uma arquitetura moderna, preservando regras comerciais críticas e removendo acoplamentos específicos do Laravel quando não forem regra de negócio.

## Escopo preservado

- Catálogo público e produtos publicados/compráveis.
- Carrinho, cupom, frete, checkout, pagamento e pedidos.
- Notificações transacionais.
- Área do cliente, endereços, pedidos e dados cadastrais.
- Admin para catálogo, cupons, frete, pedidos, clientes, relatórios, fiscal e integrações.
- Integrações logísticas, fiscais e comerciais.
- Auditoria, permissões e rastreabilidade operacional.

## Restrições

- Não copiar credenciais.
- Não conectar banco de produção durante planejamento.
- Não rodar migrations reais sem janela explícita.
- Não enviar e-mail real em validações.
- Não tratar mecanismos Laravel como regra de negócio.

## Stack alvo assumida

- Next.js App Router com Server Components, Server Actions e Route Handlers.
- TypeScript, Zod e camada de domínio explícita.
- Drizzle ORM e Neon/Postgres.
- Stripe para pagamentos e webhooks.
- Vercel Blob ou storage equivalente para mídia.
- Vitest e Playwright.
- Tailwind com design tokens próprios da marca.
