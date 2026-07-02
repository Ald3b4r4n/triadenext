# Architecture - Triade Essenza Next

Atualizado em: 2026-07-02
Agente: Architect
Nível: detalhado

## Visão Geral

🟢 **CONFIRMADO** A aplicação é um e-commerce Next.js App Router em TypeScript, com domínios organizados em `src/features`, persistência Drizzle/Postgres opcional, autenticação Better Auth, pagamentos Stripe, storage Vercel Blob e testes Vitest/Playwright.

🟢 **CONFIRMADO** O fluxo comercial atual cobre catálogo público, carrinho, cupom, frete manual, checkout autenticado, pedido pendente, PaymentIntent, webhook, settlement e notificações pós-pagamento.

🟢 **CONFIRMADO** A Fase 12 adicionou readiness operacional para ambiente real controlado: documentação de Neon, Vercel, Stripe test mode, Blob/upload, `.env.example`, checklists e scripts `ops:*` locais seguros.

🟢 **CONFIRMADO** A Fase 13 adicionou readiness de substituicao do legado: matriz de paridade Laravel x Next, gap register, inventario de dados legados, estrategia de dry-run, reconciliacao, checklist de go-live e rollback sem alterar o Laravel.

🟢 **CONFIRMADO** A Fase 14 transformou o dry-run planejado em trilha executavel local: contratos CSV/JSON, normalizadores, scanner de seguranca, relatorio de reconciliacao e script `ops:check-data-dry-run`, sem importacao real, banco real, upload real, migration real ou deploy.

🟡 **INFERIDO** A arquitetura alvo segue fatias verticais por domínio, com Server Components/pages para leitura, Server Actions para mutação, Route Handlers para APIs/webhooks e repositories isolando Drizzle/fallback.

## Containers

| Container | Tecnologia | Responsabilidade |
| --- | --- | --- |
| Web App | Next.js App Router | Storefront, customer, admin, server actions e route handlers |
| Domain Modules | TypeScript em `src/features` | Regras, services, repositories, schemas e adapters |
| Database | Postgres/Neon via Drizzle | Dados relacionais, snapshots, pagamentos e outbox |
| Blob Storage | Vercel Blob | Imagens de produto e documentos futuros |
| Stripe | Stripe API/Webhooks | PaymentIntent, Payment Element e eventos financeiros |
| Email Provider | Mock/unavailable hoje; Resend/SMTP futuro | Entrega transacional |
| Operational Readiness | Docs + scripts locais | Check-env, check-migrations, check-build, check-smoke e check-data-dry-run sem secrets |
| Legacy Parity Readiness | Artefatos Reversa Forward + `src/features/data-dry-run` | Paridade Laravel x Next, dry-run controlado, reconciliacao e decisao go/no-go |

## Componentes Internos

- `src/app`: roteamento e superfícies públicas/customer/admin/API.
- `src/features/auth`: Better Auth, sessão e RBAC.
- `src/features/products`: catálogo, admin, imagens, estoque básico.
- `src/features/cart`: carrinho guest/customer, cupom e frete selecionado.
- `src/features/coupons`: validação e administração de descontos.
- `src/features/shipping`: frete manual e contratos futuros de provider.
- `src/features/checkout`: validação final e criação do pedido.
- `src/features/orders`: snapshots, leitura e marcação paga.
- `src/features/payments`: PaymentIntent, webhook e settlement.
- `src/features/notifications`: outbox e e-mail pós-pagamento.
- `src/features/uploads`: upload de imagem para Blob.
- `src/features/data-dry-run`: leitura de CSV/JSON locais, normalizacao em memoria, scanner de seguranca e relatorio de reconciliacao.
- `src/db`: schema Drizzle e cliente condicional.
- `src/lib`: env, runtime guardrails, dinheiro e slug.
- `scripts/ops`: verificacoes locais seguras de env, migrations, build, smoke e dry-run de dados.
- `docs/operations`: runbooks/checklists para Neon, Vercel, Stripe, Blob, migrations, env e go-live posterior.
- `_reversa_forward/021-fase-13-legacy-parity`: evidencias de paridade, lacunas, migracao controlada, rollback e watch items.
- `_reversa_forward/022-fase-14-data-dry-run`: contratos, checklist humano, guia operacional, validação, impacto e watch do dry-run controlado.

## Fluxo Comercial Principal

1. Storefront lista somente produtos públicos.
2. Cliente/visitante adiciona item ao carrinho.
3. Carrinho recalcula estoque, cupom e frete.
4. Customer autenticado cria pedido pendente com snapshots.
5. Customer inicia PaymentIntent do próprio pedido.
6. Stripe/Mock retorna evento webhook.
7. Settlement valida valor/moeda/metadata, baixa estoque, consome cupom e marca pedido como pago.
8. Notificação pós-pagamento roda fora da transação financeira.

## Integrações Externas

| Integração | Direção | Estado | Guardrail |
| --- | --- | --- | --- |
| Stripe API | Outbound | Real quando configurado; mock dev/test | Sem segredo, falha segura |
| Stripe Webhook | Inbound | Implementado | Assinatura/eventId/idempotência |
| Vercel Blob | Outbound | Service implementado; rota API ainda placeholder | Exige token e admin-like |
| E-mail | Outbound | Mock/unavailable | Sem envio real obrigatório |
| Neon | Deployment target | Readiness documental | Sem conexao real nesta re-extracao |
| Vercel | Deployment target | Readiness documental | Sem deploy real nesta re-extracao |
| Correios/Jadlog/Melhor Envio | Outbound futuro | Inativo | Sem chamada HTTP atual |
| Bling/NF-e | Outbound futuro | Ausente funcionalmente | Planejado em Reversa Forward |

## Paridade Legado x Next

| Dominio | Estado pos-Fase 14 | Classificacao |
| --- | --- | --- |
| Storefront/home/catalogo/produto | Next cobre a superficie principal; URLs legadas e privacidade exigem decisao | Parcial/decisao humana |
| Catalogo/dados reais | Schema/admin/storefront existem; dry-run seguro por arquivo existe; dados reais ainda precisam fonte aprovada e reconciliacao | Bloqueador ate dry-run real aprovado |
| Imagens | Produto-imagem e Blob existem; Fase 14 valida referencias/capa/fallback sem copiar binarios | Bloqueador se sem cobertura |
| Carrinho/cupom/frete manual/checkout/pedido/pagamento | Fluxo central substitui comportamento comercial | Substituido com smoke controlado |
| Cliente/admin | Next cobre minimo operacional; Laravel tem backoffice mais amplo | Parcial/decisao humana |
| Frete externo, fiscal/Bling/NF-e, analytics | Nao implementados funcionalmente no Next | Fora de escopo ou pos-go-live |

## Dry-run Controlado de Dados

| Camada | Artefato | Garantia |
| --- | --- | --- |
| Entrada | `data/dry-run/input/` | Apenas arquivos locais dentro da pasta permitida; exemplos sinteticos versionados; dados reais ignorados pelo Git |
| Parser | `src/features/data-dry-run/input-contracts.ts` | CSV/JSON sem dependencia nova obrigatoria, com cabecalhos/campos previstos por entidade |
| Segurança | `src/features/data-dry-run/safety.ts` | Bloqueia `.env`, secrets, tokens, URLs reais de banco e credenciais como `UNSAFE_INPUT` |
| Normalizacao | `src/features/data-dry-run/normalizers/*` | Categorias, produtos, imagens por referencia, cupons e frete minimo em modelo intermediario |
| Reconciliacao | `src/features/data-dry-run/reconciliation.ts` | Contagens, chaves, dinheiro, assets, cupons, frete, privacidade e divergencias |
| Saida | `data/dry-run/output/` | Relatorios JSON/Markdown locais ignorados pelo Git |
| Operacao | `pnpm ops:check-data-dry-run` | Nao conecta banco, nao importa dados, nao roda migration, nao faz upload e nao faz deploy |

## Dados

Os agregados críticos são:

- `Catalog`: `products`, `product_images`, `categories`, `product_categories`.
- `Cart`: `carts`, `cart_items`, `coupons`, `shipping_quotes`.
- `Order`: `orders`, `order_items`, `order_events`.
- `Payment`: `payment_intents`, `payment_events`.
- `Notification`: `notification_deliveries`.
- `Customer/Auth`: `users`, `sessions`, `accounts`, `customer_profiles`, `addresses`.

## Dívidas Técnicas

- 🔴 Área do cliente completa ainda não está implementada.
- 🔴 Status operacionais de pedido e fulfillment existem no schema, mas não têm fluxo completo.
- 🔴 Fiscal/Bling/NF-e ainda é schema/roadmap, não feature funcional.
- 🔴 Frete real e rastreamento ainda não existem.
- 🔴 Estoque não tem movimentos auditáveis.
- 🔴 Go-live real permanece bloqueado ate dry-run/reconciliacao de dados Must com fonte real aprovada e decisoes humanas de corte.
- 🟡 Go-live real ainda depende de aprovacao humana, envs reais nos providers, backup e smoke manual controlado.
- 🟡 Dependências em `latest` exigem lockfile como fonte efetiva.

## Guardrails

- 🟢 Sem `DATABASE_URL`, fallback explícito e seguro.
- 🟢 Mutação real exige auth pronto e ambiente permitido.
- 🟢 Pagamento só é confirmado por webhook assinado/idempotente.
- 🟢 Notificação falha sem reverter settlement.
- 🟢 Secrets são tratados por env e não devem aparecer em docs/logs.
- 🟢 Scripts `ops:*` reportam apenas presenca/ausencia e nao imprimem valores.
- 🟢 Readiness de migrations e build nao executa banco, deploy ou providers externos.
- 🟢 Paridade legado x Next e documental; nao executa importacao real, migration real, banco real, deploy ou escrita no Laravel.
- 🟢 Dry-run controlado da Fase 14 processa arquivos locais em memoria e nao executa importacao real, upload real, migration real, banco real ou deploy.
