# Architecture - Triade Essenza Next

Atualizado em: 2026-07-03
Agente: Architect
Nível: detalhado

## Visão Geral

🟢 **CONFIRMADO** A aplicação é um e-commerce Next.js App Router em TypeScript, com domínios organizados em `src/features`, persistência Drizzle/Postgres opcional, autenticação Better Auth, pagamentos Stripe, storage Vercel Blob e testes Vitest/Playwright.

🟢 **CONFIRMADO** O fluxo comercial atual cobre catálogo público, carrinho, cupom, frete manual, checkout autenticado, pedido pendente, PaymentIntent, webhook, settlement e notificações pós-pagamento.

🟢 **CONFIRMADO** A Fase 12 adicionou readiness operacional para ambiente real controlado: documentação de Neon, Vercel, Stripe test mode, Blob/upload, `.env.example`, checklists e scripts `ops:*` locais seguros.

🟢 **CONFIRMADO** A Fase 13 adicionou readiness de substituicao do legado: matriz de paridade Laravel x Next, gap register, inventario de dados legados, estrategia de dry-run, reconciliacao, checklist de go-live e rollback sem alterar o Laravel.

🟢 **CONFIRMADO** A Fase 14 transformou o dry-run planejado em trilha executavel local: contratos CSV/JSON, normalizadores, scanner de seguranca, relatorio de reconciliacao e script `ops:check-data-dry-run`, sem importacao real, banco real, upload real, migration real ou deploy.

🟢 **CONFIRMADO** A Fase 15 especializou a primeira execucao aprovada em `data/dry-run/input/primeira-execucao/`, com status `pending-input` quando os arquivos reais ainda nao existem, contratos `product_images.*`, `inventory.*` e `shipping.*`, aliases da Fase 14 preservados e divergencias com origem `dados`, `next`, `mapeamento` ou `humana`.

🟢 **CONFIRMADO** A Fase 16 adicionou importacao controlada para staging/dev remoto em `src/features/staging-import`, com preflight, bloqueio tecnico contra producao, dry-run gate, upsert seguro, reset protegido, relatorios e smoke pos-importacao sem deploy, migration real ou conexao com producao.

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
| Operational Readiness | Docs + scripts locais | Check-env, check-migrations, check-build, check-smoke, check-data-dry-run e staging-import sem secrets |
| Legacy Parity Readiness | Artefatos Reversa Forward + `src/features/data-dry-run` + `src/features/staging-import` | Paridade Laravel x Next, dry-run controlado, importacao staging, reconciliacao e decisao go/no-go |

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
- `src/features/staging-import`: preflight staging/dev remoto, bloqueio de producao, dry-run gate, upsert seguro, reset protegido, relatorios e smoke pos-importacao.
- `src/db`: schema Drizzle e cliente condicional.
- `src/lib`: env, runtime guardrails, dinheiro e slug.
- `scripts/ops`: verificacoes locais seguras de env, migrations, build, smoke e dry-run de dados.
- `docs/operations`: runbooks/checklists para Neon, Vercel, Stripe, Blob, migrations, env e go-live posterior.
- `_reversa_forward/021-fase-13-legacy-parity`: evidencias de paridade, lacunas, migracao controlada, rollback e watch items.
- `_reversa_forward/022-fase-14-data-dry-run`: contratos, checklist humano, guia operacional, validação, impacto e watch do dry-run controlado.
- `_reversa_forward/023-fase-15-approved-data-dry-run`: execucao aprovada `primeira-execucao`, relatorio `pending-input`, checklist humano e watch da classificacao de divergencias.
- `_reversa_forward/024-fase-16-staging-import`: prechecks, bloqueio de producao, import staging, reset protegido, relatorios, smoke e rollback/checklist humano.

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

| Dominio | Estado pos-Fase 15 | Classificacao |
| --- | --- | --- |
| Storefront/home/catalogo/produto | Next cobre a superficie principal; URLs legadas e privacidade exigem decisao | Parcial/decisao humana |
| Catalogo/dados reais | Schema/admin/storefront existem; dry-run aprovado aponta para `primeira-execucao`; importacao staging fica bloqueada enquanto entrada aprovada ou dry-run `go` nao existirem | Bloqueador ate dry-run real e staging import aprovados |
| Imagens | Produto-imagem e Blob existem; Fase 15 valida `product_images.*` por referencia, preserva alias `product-images.*` e nao copia binarios | Bloqueador se sem cobertura |
| Carrinho/cupom/frete manual/checkout/pedido/pagamento | Fluxo central substitui comportamento comercial | Substituido com smoke controlado |
| Cliente/admin | Next cobre minimo operacional; Laravel tem backoffice mais amplo | Parcial/decisao humana |
| Frete externo, fiscal/Bling/NF-e, analytics | Nao implementados funcionalmente no Next | Fora de escopo ou pos-go-live |

## Dry-run Controlado de Dados

| Camada | Artefato | Garantia |
| --- | --- | --- |
| Entrada | `data/dry-run/input/primeira-execucao/` | Pasta aprovada inicial; ausencia de arquivos reais gera `pending-input`; exemplos sinteticos continuam separados |
| Parser | `src/features/data-dry-run/input-contracts.ts` | CSV/JSON sem dependencia nova obrigatoria; nomes primarios Fase 15 e aliases Fase 14 sao aceitos |
| Segurança | `src/features/data-dry-run/safety.ts` | Bloqueia `.env`, secrets, tokens, URLs reais de banco e credenciais como `UNSAFE_INPUT` |
| Normalizacao | `src/features/data-dry-run/normalizers/*` | Categorias, produtos, imagens por referencia, inventario em memoria, cupons e frete minimo em modelo intermediario |
| Reconciliacao | `src/features/data-dry-run/reconciliation.ts` | Contagens, chaves, dinheiro, inventario, assets, cupons, frete, privacidade, origem de divergencia e flag `nextFixable` |
| Saida | `data/dry-run/output/` | Relatorios JSON/Markdown locais ignorados pelo Git, segmentados por execucao/status |
| Operacao | `pnpm ops:check-data-dry-run` | Nao conecta banco, nao importa dados, nao roda migration, nao faz upload e nao faz deploy |

## Importacao Staging Controlada

| Camada | Arquivo/artefato | Responsabilidade |
| --- | --- | --- |
| Ambiente | `src/features/staging-import/environment.ts` | Classifica alvo staging/dev remoto e impede producao |
| Guardrail | `src/features/staging-import/production-guard.ts` | Bloqueia qualquer tentativa contra producao antes de conexao |
| Preflight | `src/features/staging-import/preflight.ts` | Exige arquivos aprovados, dry-run aceitavel, aprovacao humana e backup quando necessario |
| Gate de dry-run | `src/features/staging-import/dry-run-gate.ts` | Reaproveita resultado go/no-go/pending-input para permitir ou bloquear import staging |
| Import plan | `src/features/staging-import/import-plan.ts` | Monta plano de upsert sem sobrescrita destrutiva por padrao |
| Persistencia staging | `src/features/staging-import/staging-db.ts` e `upsert-*.ts` | Executa upsert seguro somente em staging/dev remoto autorizado |
| Reset protegido | `src/features/staging-import/reset-guard.ts` e `reset-plan.ts` | Exige backup, flag explicita, aprovacao humana e alvo nao produtivo |
| Relatorios | `src/features/staging-import/report-*.ts` | Gera antes/depois, divergencias, rollback e checklist sem secrets |
| Smoke | `scripts/ops/check-staging-import-smoke.mjs` | Verifica URL staging autorizada; sem URL retorna skipped esperado |

Regras arquiteturais da Fase 16:

- 🟢 `pending-input` continua estado seguro e nao abre conexao remota.
- 🟢 `STAGING_DATABASE_URL` e exigida para execucao real, mas seu valor nunca deve ser impresso.
- 🟢 Reset/limpeza e opt-in destrutivo protegido, nao comportamento padrao.
- 🟢 Producao, deploy, migration real, upload real e alteracao do Laravel legado permanecem fora do fluxo.

## Staging Smoke e Identidade Visual Pos-Fase 17

| Camada | Arquivo/artefato | Responsabilidade |
| --- | --- | --- |
| Smoke staging | `src/features/staging-smoke/` | Preparar smoke real de staging/preview sem depender de credenciais locais |
| Script operacional | `pnpm ops:check-staging-smoke` | Retornar `pending-config` quando URL/env/webhook nao existem e bloquear producao/Stripe live |
| E2E staging | `src/tests/e2e/*staging*` | Manter checks remotos opt-in; ausencia de URL aprovada vira skipped/pending esperado |
| Storefront visual | `src/components/storefront/storefront-home.tsx` | Home publica com identidade Triade, hero premium e vitrine de perfumes |
| Layout publico | `src/app/layout.tsx` | Header/footer consistentes; admin visivel apenas para contas admin/manager logadas |
| Assets publicos | `public/brand/*` | Logo horizontal, hero e imagens de produtos sinteticas/premium versionadas |

Regras arquiteturais da Fase 17:

- 🟢 `pending-config` e estado operacional seguro para URL, envs ou webhook de teste ausentes.
- 🟢 `pending-input` continua estado seguro para arquivos aprovados ausentes.
- 🟢 Smoke real exige URL staging aprovada, configuracao externa e aprovacao humana; nao inventa URL.
- 🟢 Producao, Stripe live mode, deploy final, migration em producao e banco de producao continuam bloqueados.
- 🟢 Identidade visual nao altera regras de catalogo, carrinho, cupom, frete, checkout, pedido, pagamento ou notificacao.
- 🟢 Navegacao publica nao deve expor painel admin a usuarios comuns.

## Provider Readiness Gates Pós-Fase 18

| Camada | Arquivo/artefato | Responsabilidade |
| --- | --- | --- |
| Orquestração | `src/features/staging-environment/` | Consolidar readiness offline, estados operacionais, gates, smoke e decisão go/no-go |
| Readiness de providers | `provider-readiness.ts`, `vercel-readiness.ts`, `neon-readiness.ts`, `stripe-test-readiness.ts` | Validar somente presença/ausência, sem descobrir infraestrutura nem imprimir valores |
| Segurança | `production-guard.ts`, `human-approval.ts`, `execution-gates.ts` | Bloquear produção e Stripe live antes de qualquer efeito externo |
| Migration protegida | `pnpm ops:migrate-staging` | Permanecer em modo check por padrão; exigir alvo, flags, aprovações, revisão e snapshot para execução |
| Bootstrap protegido | `pnpm ops:bootstrap-admin-staging` | Permanecer em modo check por padrão; exigir staging, aprovação e master na allowlist |
| Readiness operacional | `pnpm ops:check-staging-environment` | Gerar resultado sanitizado e `no-go` seguro quando faltar configuração |
| Smoke e relatório | `smoke-orchestrator.ts`, `report.ts`, `go-no-go.ts` | Cobrir storefront, checkout, admin e notificações sem transformar skip em aprovação |

Regras arquiteturais da Fase 18:

- 🟢 `pending-config` e `pending-input` são estados seguros e sempre impedem decisão `go`.
- 🟢 Produção, Stripe live e execução remota sem aprovação são bloqueados antes do carregamento de drivers.
- 🟢 Relatórios registram nomes e estados, nunca URL, connection string, chave, token ou segredo.
- 🟢 Migration e bootstrap são wrappers opt-in; build, testes e deploy não os executam automaticamente.
- 🟢 Validações locais permanecem independentes de Vercel, Neon, Stripe ou URL externa.

## Diagnóstico Controlado de Staging Pós-Fase 19

| Camada | Arquivo/artefato | Responsabilidade |
| --- | --- | --- |
| Sequência diagnóstica | `_reversa_forward/027-fase-19-controlled-staging/interfaces/controlled-staging-diagnostic-sequence.md` | Ordenar os sete checks locais sem flags remotas ou destrutivas |
| Consolidação | `operational-status-matrix.md` | Normalizar `passed`, `pending-config`, `pending-input`, `blocked`, `skipped` e `failed` |
| Decisão operacional | `operational-go-no-go.md` | Produzir decisão `NO-GO` enquanto existir pendência obrigatória, bloqueio ou skip de smoke |
| Ações humanas | `human-staging-checklist.md` | Converter pendências em configuração externa, evidência e aprovação explícita |
| Segurança de saída | `scripts/ops/check-staging-import-smoke.mjs` | Confirmar alvo aprovado sem imprimir URL, host, caminho ou credencial |

Regras arquiteturais da Fase 19:

- 🟢 Os scripts operacionais podem ser invocados sem flags apenas quando o modo padrão estiver comprovadamente restrito a check ou precheck.
- 🟢 `ops:import-staging` deve encerrar no precheck antes de carregar banco quando alvo, input ou aprovação estiverem ausentes.
- 🟢 `ops:migrate-staging` e `ops:bootstrap-admin-staging` permanecem check-only no modo padrão.
- 🟢 Fixtures sintéticas validam somente o harness local e não aprovam input real nem importação staging.
- 🟢 Relatórios versionáveis contêm status, categoria e evidência sanitizada, nunca URL completa, connection string ou secret.
- 🟢 O diagnóstico atual é `NO-GO`: configuração externa e arquivos aprovados continuam pendentes.

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
- 🔴 Go-live real permanece bloqueado ate `primeira-execucao` receber arquivos reais/exportados aprovados e retornar reconciliacao `go` ou excecoes humanas formais.
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
- 🟢 Dry-run aprovado da Fase 15 preserva `pending-input` como estado seguro quando faltam arquivos reais e continua sem importacao real, upload real, migration real, banco real ou deploy.
- 🟢 Importacao staging da Fase 16 bloqueia producao, exige aprovacao humana e backup para operacoes destrutivas, nao imprime `DATABASE_URL` e nao executa deploy ou migration real.
- 🟢 Provider readiness da Fase 18 mantém Vercel, Neon, Stripe test, migration, bootstrap e smoke remoto atrás de gates explícitos e relatórios sanitizados.
- 🟢 O diagnóstico da Fase 19 confirmou os gates em modo local: nenhum provider, banco, migration, bootstrap, importação ou deploy foi acionado.
