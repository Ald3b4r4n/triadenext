# Legacy Impact: Fase 11

> Data: `2026-06-22`
> Escopo: QA visual, hardening frontend e preparacao segura de producao.

## Veredito

A Fase 11 nao alterou o Laravel legado e nao mudou regras de negocio de pagamento, estoque, cupom, frete, checkout, pedidos ou notificacoes. O impacto foi concentrado em apresentacao, copy segura, responsividade, testes smoke e documentacao operacional.

## Preservadas

| ID | Regra/contrato preservado | Evidencia |
|----|---------------------------|-----------|
| P001 | Admin permanece protegido por `requireAdminLike`. | Smoke admin bloqueado em `/admin`, `/admin/produtos`, `/admin/cupons`, `/admin/frete` e `/admin/pedidos`. |
| P002 | Checkout permanece autenticado e sem pedido anonimo. | E2E de checkout anonimo redireciona para login. |
| P003 | Pagamento real/mock nao muda regra de liquidacao. | Ajustes foram de copy/sanitizacao; settlement e adapters continuam sob contratos existentes. |
| P004 | Estoque, cupom, frete, pedido e notificacao mantem calculos/estados existentes. | Testes unitarios e E2E existentes continuaram passando. |
| P005 | Banco, schema e migrations nao foram alterados. | Sem mudancas em `drizzle/`, `drizzle.config.ts` ou schema de banco. |
| P006 | Producao continua como preparacao documental, sem operacao real. | Checklist e script local nao conectam provedores nem imprimem valores. |

## Modificadas

| ID | Componente SDD | Arquivos representativos | Mudanca |
|----|----------------|--------------------------|---------|
| M001 | Web App / Storefront | `src/app/layout.tsx`, `src/app/globals.css`, `src/components/storefront/storefront-home.tsx` | Footer simples, responsividade global, nav/header preservados e hero/home validaveis. |
| M002 | Catalogo/carrinho/checkout | `product-card.tsx`, `product-grid.tsx`, `cart-view.tsx`, `shipping-quote-panel.tsx`, `checkout/page.tsx` | CTAs, estados vazios, BRL, copy PT-BR e mensagens amigaveis. |
| M003 | Customer/auth | `login/page.tsx`, `cadastro/page.tsx`, `minha-conta/page.tsx`, `enderecos/page.tsx`, `pedidos/page.tsx` | Telas sem placeholder, proximas acoes claras e textos finais. |
| M004 | Admin | `admin/layout.tsx`, `admin/page.tsx`, tabelas admin, `admin/fretes/page.tsx`, `admin/documentos-fiscais/page.tsx` | Dashboard minimo, navegacao admin, empty states e mensagens de bloqueio sem texto tecnico. |
| M005 | Pagamento/notificacoes | `payment-element-form.tsx`, `payment-config.ts`, `payment-service.ts`, `notifications/errors.ts`, `notification-status.tsx` | Copy segura para mock/dev, labels de status e sanitizacao contra secrets/tokens/provider bruto. |
| M006 | Operacoes/env | `.env.example`, `docs/operations/env.md`, `docs/operations/production-checklist.md`, `scripts/ops/check-env-readiness.mjs` | Variaveis obrigatorias/opcionais, checklist seguro e script local que mostra apenas presenca/ausencia. |
| M007 | Testes | `src/tests/unit/*`, `src/tests/e2e/*`, `visual-responsive.spec.ts`, `env-readiness.test.ts` | Smoke visual, responsividade, ausencia de placeholder, admin protegido e env seguro. |
| M008 | Reversa Forward | `actions.md`, `progress.jsonl`, `qa-copy-audit.md` | Checkboxes, progresso e auditoria textual final registrados. |

## Removidas/Substituidas

| ID | Remocao | Resultado |
|----|---------|-----------|
| R001 | Copy visivel `Reconstrucao em andamento`. | Substituida por estados controlados ou telas reais simples. |
| R002 | Copy visivel `Placeholder funcional`. | Substituida por copy operacional segura. |
| R003 | Textos tecnicos visiveis como `DATABASE_URL ausente`, `dev/fixture`, secrets/tokens e provider bruto. | Mantidos apenas como nomes internos, docs operacionais sem valores ou assertivas de teste. |

## Sem alteracao operacional real

- Nenhuma migration real foi executada.
- Nenhuma conexao com banco real foi feita.
- Nenhum e-mail real foi enviado.
- Nenhum deploy foi executado.
- Nenhum push foi executado.
- Nenhum secret foi impresso ou versionado.
- Bling, NF-e, rotinas fiscais, WhatsApp e SMS continuaram fora do escopo.

