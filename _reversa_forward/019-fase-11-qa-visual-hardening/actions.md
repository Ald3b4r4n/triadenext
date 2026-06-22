# Actions: Fase 11 - QA visual, hardening frontend e preparacao segura de producao

> Identificador: `019-fase-11-qa-visual-hardening`
> Data: `2026-06-22`
> Roadmap: `_reversa_forward/019-fase-11-qa-visual-hardening/roadmap.md`

## Resumo

| Metrica | Valor |
|---------|-------|
| Total de acoes | 49 |
| Paralelizaveis (`[//]`) | 25 |
| Maior cadeia de dependencia | 12 |
| Proxima etapa recomendada | `/reversa-audit` |

## Guardrails de execucao

- Trabalhar somente em `D:\Projetos\triade-essenza-next`.
- Nao tocar no legado Laravel `D:\Projetos\triadeessenzaparfum.com.br`.
- Nao copiar `.env`, credenciais, tokens ou valores reais de variaveis.
- Nao conectar banco real.
- Nao rodar migration real.
- Nao enviar e-mail real.
- Nao fazer deploy.
- Nao fazer push durante esta fase sem comando humano explicito.
- Nao alterar regras de pagamento, estoque, cupom, frete, checkout, pedidos ou notificacoes.
- Bling, NF-e, rotinas fiscais, WhatsApp, SMS e redesign premium permanecem fora do escopo.
- Se `next-env.d.ts` sujar durante validacoes futuras, restaurar antes de qualquer commit.

## Mapa dos blocos solicitados

| Bloco | IDs |
|-------|-----|
| 1. Auditoria visual e rotas | T001-T005 |
| 2. Storefront publico | T006-T012 |
| 3. Admin | T013-T018 |
| 4. Estados loading/vazio/erro | T019-T022 |
| 5. Responsividade | T023-T026 |
| 6. Textos PT-BR e remocao de placeholders | T027-T030 |
| 7. Checklist producao/env | T031-T035 |
| 8. Testes unitarios | T036-T039 |
| 9. E2E/smoke visual | T040-T044 |
| 10. Validacoes finais | T045-T049 |

## 1. Auditoria visual e rotas

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T001 | Confirmar checkpoint pre-coding: diretorio Next, ausencia do legado Laravel, status Git, branch e worktree esperado antes de qualquer edicao funcional. | - | - | `terminal/git` | 🟢 | [X] |
| [//] T002 | Inventariar rotas storefront, auth, customer e admin que entram no QA visual da Fase 11, usando as rotas reais do App Router. | T001 | [//] | `_reversa_forward/019-fase-11-qa-visual-hardening/qa-route-matrix.md` | 🟢 | [X] |
| [//] T003 | Fazer varredura textual inicial por placeholders e termos tecnicos expostos em `src/app`, `src/components` e `src/features`. | T001 | [//] | `_reversa_forward/019-fase-11-qa-visual-hardening/qa-copy-audit.md` | 🟢 | [X] |
| [//] T004 | Mapear componentes provaveis de UI afetados por header, footer, cards, formularios, tabelas e estados vazios. | T001 | [//] | `_reversa_forward/019-fase-11-qa-visual-hardening/qa-component-map.md` | 🟡 | [X] |
| T005 | Consolidar backlog visual priorizado por rota, separando must-fix de ressalvas aceitaveis para primeira producao. | T002, T003, T004 | - | `_reversa_forward/019-fase-11-qa-visual-hardening/qa-visual-report.md` | 🟢 | [X] |

## 2. Storefront publico

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T006 | Revisar o shell global para manter header/nav consistente e adicionar footer simples sem criar pagina institucional completa. | T005 | - | `src/app/layout.tsx` | 🟡 | [X] |
| T007 | Ajustar estilos globais do shell, footer e layout base para evitar sobreposicao e preservar leitura em telas pequenas. | T006 | - | `src/app/globals.css` | 🟡 | [X] |
| [//] T008 | Preservar a home publica corrigida, garantindo marca, hero, CTA, vitrine ou estado vazio aceitavel e ausencia de placeholder antigo. | T005 | [//] | `src/components/storefront/storefront-home.tsx` | 🟢 | [X] |
| [//] T009 | Endurecer catalogo e cards de produto com preco BRL, CTA claro, imagem/estado vazio e texto final em PT-BR. | T005 | [//] | `src/features/products/components/product-card.tsx` | 🟡 | [X] |
| T010 | Revisar pagina de produto para detalhe, indisponibilidade, CTA de carrinho e erro amigavel sem texto tecnico. | T009 | - | `src/app/(storefront)/produto/[slug]/page.tsx` | 🟡 | [X] |
| T011 | Revisar carrinho publico com itens, carrinho vazio, cupom, frete, totais e CTA para checkout sem alterar regras de calculo. | T009 | - | `src/features/cart/components/cart-view.tsx` | 🟢 | [X] |
| T012 | Revisar checkout e pagamento mock/test para clareza visual, proxima acao e ausencia de secrets ou linguagem tecnica indevida. | T011 | - | `src/app/(storefront)/checkout/page.tsx` | 🟢 | [X] |

## 3. Admin

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T013 | Revisar layout admin protegido para manter `requireAdminLike`, mensagem de bloqueio amigavel e navegacao minima. | T005 | - | `src/app/admin/layout.tsx` | 🟢 | [X] |
| [//] T014 | Substituir dashboard admin placeholder por estado operacional minimo sem abrir novas regras administrativas. | T013 | [//] | `src/app/admin/page.tsx` | 🟡 | [X] |
| [//] T015 | Revisar admin de produtos para tabela, estado vazio, CTAs e mensagens sem texto tecnico indevido. | T013 | [//] | `src/features/products/components/product-admin-table.tsx` | 🟢 | [X] |
| [//] T016 | Revisar admin de cupons para tabela, estado vazio, status e formularios legiveis em desktop. | T013 | [//] | `src/features/coupons/components/coupon-admin-table.tsx` | 🟢 | [X] |
| [//] T017 | Revisar admin de frete para consistencia entre `/admin/frete` e `/admin/fretes`, estado vazio e ausencia de promessa de provider real. | T013 | [//] | `src/features/shipping/components/shipping-rule-table.tsx` | 🟢 | [X] |
| T018 | Revisar admin de pedidos, pagamento e notificacoes para status somente leitura, estado vazio e nenhuma acao fora de escopo. | T013 | - | `src/app/admin/pedidos/page.tsx` | 🟢 | [X] |

## 4. Estados loading/vazio/erro

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T019 | Criar ou consolidar padrao visual reutilizavel para estados vazios/erro simples, sem linguagem de reconstrucao. | T006, T007 | - | `src/components/layout/placeholder-page.tsx` | 🟡 | [X] |
| [//] T020 | Ajustar estados vazios de catalogo, produto e carrinho com CTA para a proxima acao. | T019 | [//] | `src/features/products/components/product-grid.tsx` | 🟢 | [X] |
| [//] T021 | Ajustar mensagens de cupom, frete e checkout bloqueado para PT-BR amigavel sem expor provider, stack ou variavel. | T019 | [//] | `src/features/cart/components/cart-coupon-panel.tsx` | 🟢 | [X] |
| [//] T022 | Ajustar estados de pedidos, pagamento e notificacoes para leitura clara de status sem simular operacao real. | T019 | [//] | `src/features/orders/components/order-list.tsx` | 🟢 | [X] |

## 5. Responsividade

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T023 | Ajustar CSS responsivo global para header, footer, grids, formularios, paineis e tabelas sem overflow horizontal. | T007, T019 | - | `src/app/globals.css` | 🟢 | [X] |
| [//] T024 | Ajustar componentes de cards e vitrine para leitura em 360px, 430px, 768px e 1366px. | T023, T009 | [//] | `src/features/products/components/product-grid.tsx` | 🟢 | [X] |
| [//] T025 | Ajustar carrinho, cupom, frete e checkout para botoes clicaveis e formularios sem quebra em mobile/tablet. | T023, T011, T012 | [//] | `src/features/cart/components/cart-view.tsx` | 🟢 | [X] |
| [//] T026 | Ajustar tabelas e formularios admin para desktop 1366px e degradacao aceitavel em larguras menores quando acessadas. | T023, T015, T016, T017, T018 | [//] | `src/app/globals.css` | 🟢 | [X] |

## 6. Textos PT-BR e remocao de placeholders

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T027 | Remover ou substituir textos "Reconstrucao em andamento", "Placeholder funcional" e "Storefront" generico de rotas visiveis. | T019 | - | `src/components/layout/placeholder-page.tsx` | 🟢 | [X] |
| [//] T028 | Revisar textos de login, cadastro, minha conta, enderecos e pedidos para PT-BR final e proxima acao clara. | T027 | [//] | `src/app/(customer)/minha-conta/page.tsx` | 🟡 | [X] |
| [//] T029 | Revisar textos de mock/dev em pagamento e notificacoes para ficarem seguros e nao parecerem envio/cobranca real. | T027 | [//] | `src/features/payments/components/payment-element-form.tsx` | 🟢 | [X] |
| T030 | Executar segunda varredura textual e registrar excecoes aceitaveis em testes/codigo interno, sem expor ao usuario final. | T027, T028, T029 | - | `_reversa_forward/019-fase-11-qa-visual-hardening/qa-copy-audit.md` | 🟢 | [X] |

## 7. Checklist producao/env

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T031 | Revisar `.env.example` para placeholders vazios, variaveis obrigatorias/opcionais e ausencia de valores reais. | T001 | [//] | `.env.example` | 🟢 | [X] |
| [//] T032 | Criar ou atualizar checklist de producao seguro cobrindo env, secrets, build/test, migrations, Stripe, Neon, Blob e dominio/deploy. | T031 | [//] | `docs/operations/production-checklist.md` | 🟢 | [X] |
| [//] T033 | Atualizar docs operacionais existentes para reforcar Stripe test mode, Neon, migrations, Blob/upload e deploy futuro sem executar nada real. | T032 | [//] | `docs/operations/env.md` | 🟢 | [X] |
| T034 | Avaliar se script local de readiness de env e simples o bastante; se for, implementar sem imprimir valores e sem rede. | T031, T032 | - | `scripts/ops/check-env-readiness.mjs` | 🟢 | [X] |
| T035 | Se o script seguro for criado, documentar uso local e garantir que ele nao conecta banco, nao roda migration, nao envia e-mail e nao faz deploy. | T034 | - | `docs/operations/production-checklist.md` | 🟢 | [X] |

## 8. Testes unitarios

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| [//] T036 | Ampliar teste da home para confirmar marca, CTA, ausencia de placeholder antigo e estado vazio seguro. | T008 | [//] | `src/tests/unit/storefront-home.test.tsx` | 🟢 | [X] |
| [//] T037 | Adicionar ou ajustar testes de componentes para cards/listas/estados vazios sem texto tecnico e com BRL/PT-BR. | T020, T024 | [//] | `src/tests/unit/storefront-home.test.tsx` | 🟡 | [X] |
| [//] T038 | Cobrir sanitizacao de mensagens visiveis de pagamento/notificacao para impedir secrets, tokens e provider bruto. | T022, T029 | [//] | `src/tests/unit/notification-domain.test.ts` | 🟢 | [X] |
| T039 | Cobrir script de readiness de env, se criado, validando que ele reporta apenas presenca/ausencia e nunca valores. | T034 | - | `src/tests/unit/env-readiness.test.ts` | 🟢 | [X] |

## 9. E2E/smoke visual

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T040 | Ampliar smoke da home para header, footer, hero, CTA, vitrine/estado vazio e ausencia de placeholder antigo. | T006, T008, T036 | - | `src/tests/e2e/home.spec.ts` | 🟢 | [X] |
| T041 | Ampliar smoke storefront para navegacao home, catalogo, produto, carrinho e checkout em mock/dev sem banco real obrigatorio. | T010, T011, T012, T040 | - | `src/tests/e2e/storefront-products.spec.ts` | 🟢 | [X] |
| [//] T042 | Adicionar smoke auth/customer para login/cadastro/minha conta/pedidos sem placeholder tecnico e com admin bloqueado quando aplicavel. | T028 | [//] | `src/tests/e2e/auth-customer.spec.ts` | 🟢 | [X] |
| [//] T043 | Adicionar smoke admin para protecao, produtos, cupons, frete, pedidos, pagamento e notificacoes em desktop. | T014, T015, T016, T017, T018 | [//] | `src/tests/e2e/auth-admin.spec.ts` | 🟢 | [X] |
| T044 | Adicionar smoke responsivo em 360px, 430px, 768px e 1366px com checagem de overflow horizontal nas rotas principais. | T023, T024, T025, T026, T041 | - | `src/tests/e2e/visual-responsive.spec.ts` | 🟢 | [X] |

## 10. Validacoes finais

| ID | Descricao | Dependencias | Paralelismo | Arquivo alvo | Confianca | Status |
|----|-----------|--------------|-------------|--------------|-----------|--------|
| T045 | Conferir que nenhuma tarefa alterou schema, migrations, pagamento, estoque, cupom, frete, checkout, pedidos ou notificacoes fora do escopo visual. | T030, T035, T039, T044 | - | `_reversa_forward/019-fase-11-qa-visual-hardening/legacy-impact.md` | 🟢 | [X] |
| T046 | Consolidar evidencias de QA visual, responsividade, placeholders removidos, admin protegido e fluxo mock/dev em relatorio de regressao. | T045 | - | `_reversa_forward/019-fase-11-qa-visual-hardening/regression-watch.md` | 🟢 | [X] |
| T047 | Registrar resultados das validacoes locais padrao da fase sem exigir credenciais reais ou conexao real. | T046 | - | `_reversa_forward/019-fase-11-qa-visual-hardening/regression-watch.md` | 🟢 | [X] |
| T048 | Restaurar `next-env.d.ts` se ele tiver sido modificado automaticamente durante servidor/testes locais. | T047 | - | `next-env.d.ts` | 🟢 | [X] |
| T049 | Fazer revisao final de worktree e documentar que nao houve deploy, push, migration real, banco real, e-mail real ou exposicao de secrets. | T048 | - | `_reversa_forward/019-fase-11-qa-visual-hardening/progress.jsonl` | 🟢 | [X] |

## Notas de execucao

- O arquivo executavel do Reversa Forward e `actions.md`.
- `tasks.md` existe apenas como ponte para humanos que usam a nomenclatura SDD.
- Scripts locais de env so devem ser implementados se permanecerem simples, sem imprimir valores e sem rede.
- Se T034 for descartado por complexidade, T035 e T039 devem registrar "nao aplicavel" durante o coding, sem criar script.

## Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-22 | Versao inicial gerada por `/reversa-to-do` | reversa |
