# Parity: Storefront e Paginas Publicas

## Resumo

O Next substitui a experiencia publica central de venda: home, catalogo/lista de produtos, pagina de produto, carrinho e checkout. A paridade nao e 1:1 em URLs legadas e conteudo institucional; isso nao bloqueia o fluxo comercial, mas precisa entrar no checklist de SEO/conteudo antes do corte.

## Matriz

| Item | Laravel legado | Next atual | Status | Classificacao | Evidencia |
|------|----------------|------------|--------|---------------|-----------|
| Home | `routes/web.php` -> `/`, `HomeController` | `src/app/(storefront)/page.tsx` | `substituido` | nao bloqueador | Home publica corrigida e validada visualmente |
| Catalogo | `/catalogo`, `/catalogo/{category}` | `/produtos` | `parcial` | decisao humana | Rotas diferentes; comportamento de lista existe |
| Produto | `/perfumes/{slug}` | `/produto/[slug]` | `parcial` | decisao humana | Produto por slug existe; URL/SEO podem exigir redirect |
| Politica de privacidade | `/privacidade` | nao detectado em App Router | `ausente` | decisao humana | Pode ser exigencia legal/conteudo antes de go-live |
| Imagem publica | `/storage/product-images/{filename}` | Blob/upload/fallback Next | `parcial` | bloqueador de catalogo se imagem real faltar | Inventario de assets necessario |
| Header/nav/footer | Blade/components | Next hardening Fase 11 | `substituido` | nao bloqueador | Smoke visual e E2E existentes |

## Lacunas

| Lacuna | Severidade go-live | Decisao |
|--------|--------------------|---------|
| Redirecionamentos de URLs legadas `/catalogo`, `/perfumes/{slug}` | Media | Decidir antes do cutover para SEO e links existentes |
| Pagina de privacidade/institucional | Media | Validar obrigatoriedade legal/conteudo |
| Imagens reais do catalogo | Alta | Bloqueia catalogo vendavel se nao houver capa/fallback aprovado |

## Conclusao

Storefront e compravel no Next, mas o go-live publico exige reconciliar catalogo/imagens reais e decidir URLs/conteudo institucional.
