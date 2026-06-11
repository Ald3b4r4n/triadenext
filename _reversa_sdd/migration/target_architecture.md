# Target Architecture

## Camadas

- `src/app`: rotas App Router, layouts, páginas e route handlers.
- `src/components`: componentes compartilhados de UI.
- `src/server`: actions, services, repositories, auth, integrações e regras server-only.
- `src/db`: schema Drizzle, queries base e migrations.
- `tests`: unit, integration e e2e.

## Domínios alvo

- Storefront.
- Catálogo.
- Carrinho.
- Cupons.
- Frete.
- Checkout.
- Pagamentos.
- Pedidos.
- Notificações.
- Cliente.
- Admin.
- Fiscal/Bling.
- Estoque.
- Relatórios.
- Auditoria.

## Contratos arquiteturais

- Leitura pública deve usar filtros públicos centralizados.
- Mutação deve passar por server action ou route handler validado.
- Integração externa não pode ser chamada direto de componente React.
- Webhook deve ser route handler com idempotência.
- Operação sensível deve ter autorização explícita.
- Testes nunca devem chamar provider real.
