# QA Component Map: Fase 11

> Data: `2026-06-22`

| Area | Arquivos principais | Tipo de hardening |
|------|---------------------|-------------------|
| Shell global | `src/app/layout.tsx`, `src/app/globals.css` | Header, footer, navegacao e responsividade. |
| Estado futuro/vazio | `src/components/layout/placeholder-page.tsx` | Remover linguagem de reconstrucao e tornar estados apresentaveis. |
| Home | `src/components/storefront/storefront-home.tsx` | Preservar hero/CTA e vitrine segura. |
| Produtos | `product-grid.tsx`, `product-card.tsx`, `product-image.tsx`, rota de detalhe | Cards, empty state, CTA e BRL. |
| Carrinho/frete/cupom | `cart-view.tsx`, `cart-coupon-panel.tsx`, `shipping-quote-panel.tsx` | Estados, mensagens, botoes e mobile. |
| Checkout/pagamento | `checkout/page.tsx`, `payment-element-form.tsx`, `order-summary.tsx` | Proxima acao, mock/test seguro e ausencia de secrets. |
| Auth/customer | `auth-form.tsx`, `minha-conta/page.tsx`, `enderecos/page.tsx`, `pedidos/page.tsx` | Textos finais, formularios e estados sem placeholder. |
| Admin | `admin/layout.tsx`, `admin/page.tsx`, tabelas admin, `admin/pedidos/page.tsx` | Admin protegido, tabelas legiveis e empty states. |
| Operacoes | `.env.example`, `docs/operations/*`, `scripts/ops/check-env-readiness.mjs` | Checklist seguro e verificacao local sem valores. |
| Testes | `src/tests/unit/*`, `src/tests/e2e/*` | Smoke visual, responsividade e guardrails. |
