# Roadmap: Fase 11 - QA visual, hardening frontend e preparacao segura de producao

> Identificador: `019-fase-11-qa-visual-hardening`
> Data: `2026-06-22`
> Requirements: `_reversa_forward/019-fase-11-qa-visual-hardening/requirements.md`
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 11 e um delta de produto e operacao sobre o e-commerce ja reconstruido. Ela nao muda regras de negocio, modelos financeiros, estoque, cupom, frete, checkout, pagamento, pedido ou notificacao; a entrega esperada e tornar as superficies existentes visualmente testaveis, compreensiveis e proximas de uma primeira producao controlada.

O caminho tecnico recomendado e combinar auditoria visual guiada por rotas reais, hardening incremental dos componentes de UI existentes, ampliacao de smoke E2E com Playwright nos breakpoints obrigatorios e checklist operacional seguro. A fase deve tratar placeholders e textos tecnicos como divida de UX, preservar guardrails de ambiente e registrar producao como preparacao documental, sem deploy, migration real, banco real ou credenciais reais.

## 2. Principios aplicados

| Principio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| n/a | Nenhum `.reversa/principles.md` foi encontrado nesta sessao; nao ha conflito registrado. | respeita |

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confianca |
|----|---------|---------------|--------------------------|-----------|
| D-01 | Tratar a fase como hardening frontend/QA, nao como feature de dominio. | Requirements e SDD indicam que os fluxos de catalogo, carrinho, cupom, frete, checkout, pagamento e notificacoes ja existem e nao devem ter regra alterada. | Reabrir regras de negocio; redesign premium; reescrever fluxo comercial. | 🟢 |
| D-02 | Criar uma matriz de QA por rota real do App Router. | `_reversa_sdd/inventory.md#Entry points` lista home, produtos, produto, carrinho, checkout, auth, customer e admin. | QA generico por impressao visual; validar apenas a home. | 🟢 |
| D-03 | Consolidar header/nav/footer e estados loading/vazio/erro por componentes existentes ou pequenos componentes compartilhados. | O projeto ja tem `src/app/layout.tsx`, `src/app/admin/layout.tsx`, `src/components/storefront/storefront-home.tsx` e componentes de dominio em `src/features`. | Criar design system completo; duplicar markup em cada pagina; landing page premium. | 🟡 |
| D-04 | Remover placeholders/textos tecnicos da UI final mantendo mensagens operacionais seguras quando necessarias. | `_reversa_sdd/architecture.md#Dívidas Técnicas` registra placeholders administrativos/customer e os requirements exigem PT-BR final. | Ocultar todos os estados de erro; manter mensagens como "DATABASE_URL ausente" para usuario final. | 🟢 |
| D-05 | Validar responsividade com Playwright nos tamanhos 360px, 430px, 768px e 1366px. | Decisao humana da Fase 11 exige mobile 360px a 430px, tablet 768px e desktop 1366px. | Validar so desktop; usar apenas resize manual sem teste repetivel. | 🟢 |
| D-06 | Ampliar smoke E2E sem depender de banco real, credenciais reais ou envio real. | `_reversa_sdd/domain.md#Guardrails de Ambiente` permite fallback/mock explicito em dev/test. | E2E com Stripe real; seed real obrigatorio; teste que exige email real. | 🟢 |
| D-07 | Revisar `.env.example` e docs/checklists de producao sem copiar `.env` nem imprimir secrets. | Requirements tornam checklist documental obrigatorio e scripts seguros opcionais. | Validar credenciais reais; imprimir valores; conectar Neon/Stripe/Blob para "provar" producao. | 🟢 |
| D-08 | Manter admin protegido e minimamente navegavel, principalmente em desktop. | `_reversa_sdd/permissions.md#Policies` exige `requireAdminLike` para superficies administrativas. | Relaxar auth para QA; criar bypass admin; ampliar matriz granular de permissoes. | 🟢 |
| D-09 | Nao criar contratos externos novos nesta fase. | A fase valida UI, testes e checklist; Bling/NF-e/rotinas fiscais/WhatsApp/SMS seguem fora. | Criar adapter fiscal; integrar canal externo; alterar webhook/Stripe. | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` secao) | Risco se errada |
|----------|----------------------------------|-----------------|
| Nao ha marcador de duvida residual; as decisoes de nivel visual, breakpoints e checklist seguro ja foram incorporadas. | `requirements.md#9-esclarecimentos` | Baixo. O plano precisaria ser refeito apenas se o escopo humano mudar. |

## 5. Delta arquitetural

| Componente | Arquivo de origem no SDD | Tipo de mudanca | Resumo |
|------------|--------------------------|-----------------|--------|
| Web App / App Router | `_reversa_sdd/architecture.md#Componentes Internos` | regra-alterada | Rotas publicas, customer e admin passam por matriz de QA visual e hardening sem alterar dominio. |
| Storefront | `_reversa_sdd/inventory.md#Entry points` | regra-alterada | Home, catalogo, produto, carrinho e checkout devem ter header/nav, CTA, estados e responsividade validados. |
| Customer | `_reversa_sdd/architecture.md#Dívidas Técnicas` | regra-alterada | Minha conta, pedidos, enderecos e pagamento precisam deixar de parecer reconstrucao tecnica, respeitando lacunas reais. |
| Admin | `_reversa_sdd/permissions.md#Policies` | regra-alterada | Admin continua protegido e recebe revisao visual minima para produtos, cupons, frete, pedidos, pagamento e notificacoes. |
| Testes | `_reversa_sdd/dependencies.md#Tooling e testes` | contrato-alterado | Playwright/Vitest passam a cobrir smoke visual, ausencia de placeholder, navegacao principal, admin protegido e fluxo mock/dev. |
| Operacoes/env | `_reversa_sdd/domain.md#Guardrails de Ambiente` | contrato-alterado | Checklist de producao e possivel script local verificam presenca/ausencia de variaveis sem secrets, rede, migration ou deploy. |

## 6. Rotas a revisar

| Area | Rotas alvo | Objetivo de QA/hardening |
|------|------------|--------------------------|
| Storefront | `/`, `/produtos`, `/produto/[slug]`, `/carrinho`, `/checkout` | Marca visivel, navegacao, cards, CTAs, BRL, estados vazio/erro/loading e fluxo compreensivel. |
| Auth | `/login`, `/cadastro` | Forms legiveis, mensagens amigaveis, `returnTo` seguro e links para fluxo de compra. |
| Customer | `/minha-conta`, `/enderecos`, `/pedidos`, `/pedidos/[id]/pagamento` | Remover sensacao de placeholder, orientar proximas acoes e manter ownership/policies. |
| Admin | `/admin`, `/admin/produtos`, `/admin/cupons`, `/admin/frete`, `/admin/fretes`, `/admin/pedidos` | Layout desktop usavel, tabelas legiveis, estados vazios amigaveis e admin protegido. |
| Fora de escopo operacional | `/admin/documentos-fiscais` | Nao implementar fiscal; se exibida, manter mensagem clara de indisponibilidade futura sem prometer Fase 11. |

## 7. Componentes provaveis a ajustar

| Caminho | Impacto previsto |
|---------|------------------|
| `src/app/layout.tsx` | Consolidar header/nav e adicionar footer simples, se ausente. |
| `src/app/globals.css` | Ajustes responsivos, estados visuais, grid, tabelas, formularios e prevencao de overflow horizontal. |
| `src/components/layout/placeholder-page.tsx` | Remover ou substituir textos de reconstrucao para paginas que ainda usem o componente. |
| `src/components/storefront/storefront-home.tsx` | Preservar home corrigida e reforcar estado vazio/erro sem texto tecnico. |
| `src/features/products/components/product-card.tsx` e `product-grid.tsx` | Cards apresentaveis, CTA claro, imagem/estado vazio e BRL consistente. |
| `src/features/cart/components/cart-view.tsx` e `cart-coupon-panel.tsx` | Estados vazio/loading/erro, cupom, totais, frete e CTA para checkout. |
| `src/features/shipping/components/shipping-quote-panel.tsx` | Mensagens de CEP/frete em PT-BR e controles usaveis em mobile. |
| `src/features/auth/components/auth-form.tsx` | Erros amigaveis e layout responsivo de login/cadastro. |
| `src/features/orders/components/order-list.tsx` e `order-summary.tsx` | Pedidos vazios, status, pagamento e totais sem placeholder tecnico. |
| `src/features/payments/components/payment-element-form.tsx` | Distinguir mock/dev como ambiente de teste sem expor secrets ou confundir usuario final. |
| `src/features/notifications/components/notification-status.tsx` | Status admin legivel sem envio real e sem canal externo fora de escopo. |
| `src/features/products/components/product-admin-table.tsx`, `src/features/coupons/components/coupon-admin-table.tsx`, `src/features/shipping/components/shipping-rule-table.tsx` | Tabelas admin com estados vazios, responsividade desktop e mensagens nao tecnicas. |

## 8. Estrategia de estados vazio/loading/erro

1. Definir linguagem PT-BR orientada a proxima acao para cada area: catalogo vazio, carrinho vazio, cupom invalido, frete sem cobertura, checkout bloqueado, pedido ausente, admin sem dados e notificacao sem destinatario.
2. Evitar stack trace, nome bruto de variavel, provider interno, token, secret, `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, `STRIPE_SECRET_KEY`, `SMTP_PASSWORD` ou termo similar em UI final.
3. Diferenciar mensagens de QA/dev permitidas em testes de mensagens para usuario final. Quando o modo mock/test precisar aparecer, usar texto claro como "modo de teste" e nunca credencial.
4. Preferir estados vazios visuais e acionaveis, com CTA para catalogo, carrinho, login, pedido ou admin conforme contexto.

## 9. Estrategia de responsividade

1. Validar mobile em 360px e 430px como extremos do intervalo exigido.
2. Validar tablet em 768px.
3. Validar desktop em 1366px.
4. Criticos: sem overflow horizontal, header navegavel, cards legiveis, botao clicavel, formulario sem quebra, tabelas admin usaveis em desktop e checkout/carrinho sem conteudo sobreposto.
5. Playwright deve capturar pelo menos checks automatizados de `document.documentElement.scrollWidth <= window.innerWidth` nas rotas principais.

## 10. Testes necessarios

| Tipo | Alvo | Cobertura esperada |
|------|------|--------------------|
| Unit/React | Home, ProductGrid/ProductCard, estados vazios relevantes | Home sem placeholder, estados vazios sem texto tecnico, BRL/PT-BR e CTAs principais. |
| Unit/domain existente | Dinheiro, mensagens sanitizadas, providers mock/unavailable | Garantir que hardening visual nao quebre sanitizacao e formatacao. |
| E2E smoke storefront | `/`, `/produtos`, produto, `/carrinho`, `/checkout` | Navegacao principal, ausencia de placeholder, CTA, responsividade basica. |
| E2E auth/customer | `/login`, `/cadastro`, `/minha-conta`, `/pedidos`, pagamento | Admin/customer protegidos, fluxo compreensivel e mock/dev seguro. |
| E2E admin | `/admin`, produtos, cupons, frete, pedidos, notificacoes | Admin bloqueado para usuario sem papel e minimamente navegavel para admin fixture/mock quando viavel. |
| E2E fluxo feliz | Compra mock/dev ponta a ponta | Visitante navega, cliente loga/cadastra, adiciona produto, cupom, frete, pedido, pagamento mock, pedido pago, outbox mock/admin. |
| E2E responsivo | Breakpoints 360, 430, 768 e 1366 | Sem overflow horizontal e sem elementos essenciais inacessiveis. |

## 11. Checklist de producao

| Item | Resultado esperado |
|------|--------------------|
| `.env.example` | Variaveis obrigatorias/opcionais listadas com placeholders vazios e sem valor real. |
| Secrets | Nenhum secret versionado, logado, exibido em docs ou UI. |
| Build/test | `pnpm build`, `pnpm test` e `pnpm test:e2e` nao exigem credenciais reais. |
| Migrations | Checklist informa gerar/aplicar somente em etapa operacional futura, com aprovacao humana. |
| Stripe | Test mode documentado; webhook/keys reais fora da Fase 11. |
| Neon | Provisionamento e `DATABASE_URL` real ficam checklist futuro, sem conexao real agora. |
| Blob/upload | Token real ausente deve bloquear upload real de forma segura; checklist descreve validacao futura. |
| Dominio/deploy | Checklist de dominio/Vercel/deploy sem executar deploy. |
| Fiscal/canais | Bling, NF-e, rotinas fiscais, WhatsApp e SMS explicitamente fora. |

## 12. Scripts locais seguros

Um script local e util apenas se for simples e sem risco. A proposta para o coding futuro e avaliar um script como `scripts/ops/check-env-readiness.mjs` ou nome equivalente, opcionalmente exposto em `package.json`, que:

- le somente nomes esperados de variaveis;
- imprime apenas `presente`, `ausente` ou `opcional`;
- nunca imprime valores;
- nao conecta em Neon, Stripe, Blob, SMTP ou qualquer provider externo;
- nao roda migration;
- nao envia e-mail;
- nao faz deploy;
- retorna codigo diferente de zero apenas para ausencia de variavel obrigatoria em modo explicitamente escolhido.

Se esse script exigir complexidade, ele deve ser descartado e substituido por checklist documental.

## 13. Delta no modelo de dados

- Resumo das mudancas: nao ha mudanca planejada de schema, tabela, indice, migration ou relacionamento. A Fase 11 pode ajustar `.env.example`, docs operacionais e testes, mas nao deve alterar `drizzle/`, `drizzle.config.ts` ou `src/db/schema.ts`.
- Detalhe completo em: `_reversa_forward/019-fase-11-qa-visual-hardening/data-delta.md`

## 14. Delta de contratos externos

Nao ha contrato externo novo ou alterado nesta fase. Webhook Stripe, Stripe API, Blob, e-mail, Neon e auth permanecem com os contratos ja existentes. O diretorio `interfaces/` foi omitido de proposito.

## 15. Plano de migracao

1. Nao gerar migration de banco para a Fase 11.
2. Nao aplicar migration real.
3. Nao conectar em banco real para QA visual.
4. Revisar apenas documentacao/checklists de migration para producao futura.
5. Se `next-env.d.ts` sujar durante validacoes futuras, restaurar antes de qualquer commit.

## 16. Sequencia objetiva de implementacao recomendada

1. Fazer varredura visual e textual das rotas alvo, registrando placeholders, textos tecnicos, quebras responsivas e estados ausentes.
2. Corrigir shell global: header/nav consistente e footer simples.
3. Corrigir storefront: home preservada, catalogo, produto, cards, carrinho, cupom/frete, checkout e pagamento mock/dev.
4. Corrigir auth/customer: login, cadastro, minha conta, enderecos, pedidos e pagamento com mensagens finais.
5. Corrigir admin: dashboard minimo, produtos, cupons, frete, pedidos, status pagamento/notificacoes e estados vazios.
6. Padronizar estados vazio/loading/erro e textos PT-BR.
7. Ajustar responsividade nos breakpoints obrigatorios.
8. Revisar `.env.example` e criar checklist seguro de producao.
9. Avaliar script local seguro de env; implementar somente se simples.
10. Ampliar unit/E2E smoke e rodar validacoes.
11. Gerar `legacy-impact.md` e `regression-watch.md` durante `/reversa-coding`.

## 17. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| Hardening visual alterar regra de negocio sem querer | alto | medio | Manter alteracoes em UI/test/docs e cobrir fluxo mock/dev com testes de regressao. |
| Placeholder tecnico permanecer em rota customer/admin | medio | alto | Varredura textual por `Placeholder`, `Reconstrucao`, `DATABASE_URL`, `secret`, `token` e validacao visual. |
| Responsividade quebrar checkout/carrinho em mobile | alto | medio | Playwright com 360px/430px e checks de overflow horizontal. |
| Admin ser liberado para facilitar QA | alto | baixo | Teste E2E de admin protegido e preservacao de `requireAdminLike`. |
| Checklist de producao virar deploy disfarçado | alto | medio | Registrar explicitamente que deploy, migration real, banco real e credenciais reais ficam fora. |
| Script de env expor valores | alto | baixo | Script opcional deve imprimir somente presenca/ausencia; se houver duvida, nao criar script. |
| Escopo crescer para fiscal/canais externos | medio | medio | Repetir fora de escopo em docs, QA e criteria de pronto. |

## 18. Criterio de pronto

- [ ] `actions.md` gerado por `/reversa-to-do` e todas as acoes fechadas no coding futuro.
- [ ] Home continua sem "Reconstrucao em andamento", "Storefront" generico e "Placeholder funcional".
- [ ] Storefront, auth, customer e admin principais passam por QA visual documentado.
- [ ] Header/nav consistente e footer simples existem nas superficies relevantes.
- [ ] Estados vazio/loading/erro sao amigaveis, em PT-BR e sem texto tecnico indevido.
- [ ] Breakpoints 360px, 430px, 768px e 1366px passam sem overflow horizontal grave.
- [ ] Fluxo feliz mock/dev passa sem banco real, credencial real, email real, migration real ou deploy.
- [ ] Admin permanece protegido por policies.
- [ ] `.env.example` e checklist de producao estao revisados sem secrets.
- [ ] Bling, NF-e, rotinas fiscais, WhatsApp, SMS, deploy real e migration real continuam fora.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` passam ou ficam com falha documentada e justificada.
- [ ] `legacy-impact.md` e `regression-watch.md` gerados no coding futuro.

## 19. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-22 | Versao inicial gerada por `/reversa-plan` | reversa |
