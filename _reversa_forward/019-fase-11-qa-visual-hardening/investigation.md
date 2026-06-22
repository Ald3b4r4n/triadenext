# Investigation: Fase 11 - QA visual, hardening frontend e preparacao segura de producao

> Identificador: `019-fase-11-qa-visual-hardening`
> Data: `2026-06-22`

## Pergunta tecnica central

Como transformar a loja ja reconstruida em uma experiencia visualmente testavel e proxima de primeira producao, sem reabrir regras de negocio, sem usar credenciais reais e sem executar deploy, migration real ou integracoes externas fora de escopo?

## Contexto confirmado

| Fonte | Evidencia | Impacto |
|-------|-----------|---------|
| `_reversa_sdd/architecture.md#Visão Geral` | App Router com dominios em `src/features`, Drizzle opcional, Stripe, Blob e testes Vitest/Playwright. | QA deve cobrir UI, rotas e testes existentes, sem redesenhar a arquitetura. |
| `_reversa_sdd/architecture.md#Fluxo Comercial Principal` | Fluxo cobre catalogo, carrinho, cupom, frete, checkout, PaymentIntent, webhook, settlement e notificacoes. | Fase 11 valida experiencia ponta a ponta em mock/dev, sem mudar fluxo comercial. |
| `_reversa_sdd/architecture.md#Dívidas Técnicas` | Area do cliente e alguns placeholders administrativos/customer permanecem como lacunas. | Hardening deve priorizar textos finais, estados vazios e navegacao dessas areas. |
| `_reversa_sdd/domain.md#Guardrails de Ambiente` | Sem `DATABASE_URL`, fallback seguro; secrets nao devem aparecer em artefatos ou mensagens. | Scripts/checklists devem evitar valores, conexoes reais e secrets. |
| `_reversa_sdd/inventory.md#Entry points` | Rotas principais incluem storefront, auth, customer, admin, upload e webhook. | Matriz de QA deve ser orientada por rotas reais. |
| `_reversa_sdd/dependencies.md#Tooling e testes` | Projeto usa Vitest, Testing Library e Playwright. | Smoke visual e responsivo deve aproveitar ferramentas existentes. |
| `_reversa_sdd/permissions.md#Policies` | Admin-like exige auth/banco/papel e customer le apenas recursos proprios. | QA nao pode abrir bypass de permissao. |

## Superficie observada no codigo atual

| Area | Evidencia local | Leitura para o plano |
|------|-----------------|----------------------|
| Home corrigida | `src/components/storefront/storefront-home.tsx` mostra marca, hero, CTA e estado vazio de catalogo. | Deve ser preservada e coberta contra regressao de placeholder. |
| Shell global | `src/app/layout.tsx` contem header/nav, mas nao footer. | Footer simples e consistencia de navegacao sao candidatos a ajuste no coding. |
| Placeholder generico | `src/components/layout/placeholder-page.tsx` ainda renderiza "Reconstrucao em andamento" e "Placeholder funcional". | Deve ser removido/substituido para UI final ou isolado fora de rotas visiveis. |
| Customer placeholder | `/minha-conta` e `/enderecos` usam `PlaceholderPage`. | Precisam de estado minimo apresentavel, mesmo que perfil/endereco completo continue fora. |
| Admin placeholder | `/admin`, `/admin/fretes` e `/admin/documentos-fiscais` usam `PlaceholderPage`. | Admin deve ter dashboard minimo; fiscal permanece fora de escopo com mensagem futura controlada. |
| Estados em paineis | `cart-view`, `order-list`, `order-summary`, `coupon-admin-table`, `shipping-rule-table` usam `placeholder-panel`. | Nem todo painel e problema; o texto e o estado visual precisam ser finais e amigaveis. |
| Texto tecnico em UI/testes | Buscas indicam aparicoes de `DATABASE_URL ausente`, mock/dev e tokens em fluxos controlados. | Coding deve separar mensagem operacional interna de texto visivel para usuario final. |
| Rotas/testes existentes | `src/tests/e2e/*.spec.ts` ja cobre home, auth, carrinho, checkout, cupons, frete, pedidos, pagamento e notificacoes. | Fase 11 deve ampliar smoke visual e responsivo, nao criar suite paralela desnecessaria. |

## Alternativas avaliadas

### A1 - QA manual apenas, sem ampliar testes

- Vantagem: rapido para sentir a loja visualmente.
- Problema: regressao da home/placeholder pode voltar sem sinal automatico.
- Decisao: descartada como unica abordagem; manual segue como complemento documentado.

### A2 - Apenas E2E automatizado, sem hardening visual manual

- Vantagem: repetivel.
- Problema: testes podem passar com UX ruim, texto tecnico exposto ou layout pouco vendavel.
- Decisao: descartada como unica abordagem; precisa de inspeccao visual humana.

### A3 - Redesign premium/design system completo

- Vantagem: salto estetico maior.
- Problema: fora do escopo, aumenta risco e atrasa primeira producao.
- Decisao: descartada.

### A4 - Hardening incremental por rotas + smoke visual responsivo

- Vantagem: reduz risco, mira lacunas reais, usa stack existente e cria protecao contra regressao.
- Problema: exige disciplina para nao tocar regras de negocio.
- Decisao: escolhida.

## Padroes aplicaveis

- **QA matrix por rota:** cada rota recebe criterio de marca, nav, CTA, estado, responsividade e ausencia de texto tecnico.
- **Progressive hardening:** primeiro shell/global, depois storefront, customer, admin e por fim testes/checklist.
- **Safe operational checklist:** preparacao de producao documenta nomes e passos sem executar provider real.
- **Visual smoke E2E:** Playwright valida presenca/ausencia, navegacao e overflow em breakpoints.
- **Copy audit:** busca textual por termos proibidos ou tecnicos antes da validacao final.

## Pontos de integracao provaveis

| Caminho | Tipo de intervencao futura |
|---------|----------------------------|
| `src/app/layout.tsx` | Header/nav/footer e metadados basicos. |
| `src/app/globals.css` | Responsividade, grids, tabelas, formularios e estados visuais. |
| `src/components/layout/placeholder-page.tsx` | Remover linguagem de reconstrucao ou substituir por estado final. |
| `src/components/storefront/storefront-home.tsx` | Preservar hero/CTA e melhorar estados sem texto tecnico, se necessario. |
| `src/app/(storefront)/*` | Revisar home, produtos, produto, carrinho e checkout. |
| `src/app/(auth)/*` | Revisar login/cadastro. |
| `src/app/(customer)/*` | Revisar minha conta, enderecos, pedidos e pagamento. |
| `src/app/admin/*` | Revisar dashboard, produtos, cupons, frete, pedidos e notificacoes/status. |
| `src/tests/e2e/*.spec.ts` | Ampliar smoke visual, admin protegido, fluxo mock/dev e responsividade. |
| `src/tests/unit/*.test.tsx` | Cobrir home/componentes/estados vazios quando o risco justificar. |
| `.env.example` e `docs/operations/*.md` | Checklist de producao seguro, se o coding optar por atualizar docs existentes. |
| `scripts/ops/*` ou nome equivalente | Script opcional de presenca/ausencia de env, somente se simples e seguro. |

## Restricoes de seguranca e operacao

- Nao ler, copiar ou versionar `.env`.
- Nao imprimir valores de variaveis.
- Nao conectar em Neon real.
- Nao rodar migration real.
- Nao chamar Stripe real como criterio obrigatorio.
- Nao enviar e-mail real.
- Nao executar deploy.
- Nao implementar Bling, NF-e, rotinas fiscais, WhatsApp ou SMS.
- Nao relaxar auth/admin para facilitar QA.

## Resultado da investigacao

O plano mais seguro e tratar a Fase 11 como uma fase de produto: matriz de QA visual, correcao de linguagem/estados/layout, smoke responsivo e checklist operacional. A implementacao futura pode tocar `src/`, testes, `.env.example`, docs e talvez um script local, mas deve preservar regras de dominio e nao criar nenhum contrato externo novo.
