# Requirements: Fase 11 - QA visual, hardening frontend e preparação de produção

> Identificador: `019-fase-11-qa-visual-hardening`
> Data: `2026-06-22`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A Fase 11 entrega uma rodada curta de QA visual, hardening frontend e preparação operacional para tornar a loja Tríade Essenza Parfum testável por humanos em cenário próximo de produção. A fase cobre storefront, admin e fluxo comercial completo em modo seguro, sem deploy real, sem credenciais reais e sem alterar regras de negócio de pagamento, estoque, cupom, frete ou pedidos. Também não inclui integrações fiscais ou canais externos de comunicação, como Bling, NF-e, rotinas fiscais, WhatsApp ou SMS. O objetivo é alcançar uma aparência limpa, coerente e vendável, sem redesign premium agora, removendo atritos visuais, textos técnicos expostos, placeholders residuais e lacunas de navegação/responsividade antes de uma etapa futura de deploy real.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Visão Geral` | A aplicação é um e-commerce Next.js App Router com fluxo comercial atual cobrindo catálogo, carrinho, cupom, frete, checkout, PaymentIntent, webhook, settlement e notificações pós-pagamento. | 🟢 |
| `_reversa_sdd/architecture.md#Componentes Internos` | O sistema organiza superfícies públicas, customer, admin e APIs em `src/app`, com domínios verticais em `src/features`. | 🟢 |
| `_reversa_sdd/architecture.md#Dívidas Técnicas` | Existem lacunas na área do cliente, operação pós-pagamento, frete real, fiscal e alguns placeholders administrativos/customer. | 🟢 |
| `_reversa_sdd/domain.md#Regras de Domínio` | As regras de catálogo, carrinho, cupom, frete, checkout, pedido, pagamento, settlement e notificações já estão estabelecidas e não devem ser alteradas nesta fase. | 🟢 |
| `_reversa_sdd/domain.md#Guardrails de Ambiente` | O projeto opera com fallback explícito sem `DATABASE_URL`, bloqueia mutação real fora de ambiente permitido e não deve gravar secrets em artefatos ou mensagens. | 🟢 |
| `_reversa_sdd/inventory.md#Entry points` | As rotas principais incluem home, produtos, produto, carrinho, checkout, login, cadastro, área customer, admin e webhooks. | 🟢 |
| `_reversa_sdd/inventory.md#Testes` | O projeto já usa Vitest e Playwright para unitários, integração e E2E. | 🟢 |
| `_reversa_sdd/code-analysis.md#Visão Geral` | A implementação atual já possui storefront, auth, catálogo, carrinho, cupons, frete manual, checkout autenticado, pedidos pendentes, pagamento Stripe/Mock e notificações pós-pagamento. | 🟢 |
| `_reversa_sdd/code-analysis.md#uploads` | Upload tem service real, mas a rota de upload ainda é placeholder seguro. | 🟡 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Visitante | Avaliar a loja e navegar por produtos sem autenticação. | Entra pela home, abre catálogo, vê produto, adiciona ao carrinho e entende próximos passos. |
| Cliente | Comprar em fluxo seguro e compreensível. | Cadastra ou loga, aplica cupom, calcula frete, cria pedido e paga em modo mock/test sem confusão visual. |
| Admin/Manager | Validar operação mínima sem expor ações indevidas. | Acessa admin protegido, visualiza produtos, cupons, frete, pedidos, pagamento e notificações em telas coerentes. |
| QA/Operador de produção | Confirmar que o sistema está pronto para teste controlado. | Executa checklist visual, E2E smoke e checklist operacional sem credenciais reais ou deploy. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A Fase 11 não pode alterar regras financeiras, de estoque, cupom, frete, checkout, pedido, pagamento, settlement ou notificação já documentadas. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Regras de Domínio`
   - Tipo: nova
2. **RN-02:** Nenhum texto de reconstrução, placeholder técnico ou detalhe de infraestrutura deve aparecer para visitante, cliente ou admin fora de mensagens operacionais controladas. 🟡
   - Origem no legado: `_reversa_sdd/architecture.md#Dívidas Técnicas`, `_reversa_sdd/code-analysis.md#uploads`
   - Tipo: nova
3. **RN-03:** QA visual deve cobrir os fluxos públicos, customer e admin com dados seguros de fixture, mock ou dev/test, sem exigir banco real, credenciais reais, envio real de e-mail ou deploy. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Guardrails de Ambiente`
   - Tipo: nova
4. **RN-04:** A preparação de produção deve gerar checklist e validações locais, mas não executar deploy, migration real, configuração de domínio ou uso de secrets reais. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Guardrails`
   - Tipo: nova
5. **RN-05:** O nível visual mínimo aceitável para primeira produção é uma loja limpa, coerente e vendável, sem redesign premium. O mínimo inclui home sem placeholder, header consistente, footer simples, cards de produto apresentáveis, botões/CTAs claros, textos finais em PT-BR, estados vazio/loading/erro amigáveis, páginas principais sem texto técnico, layout sem quebra visual grave e fluxo de compra compreensível para cliente comum. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Dívidas Técnicas`
   - Tipo: nova
6. **RN-06:** A Fase 11 não exige identidade visual definitiva, animações, landing page premium, institucional completo ou design system completo. 🟢
   - Origem no legado: decisão de esclarecimento da Fase 11
   - Tipo: nova
7. **RN-07:** A Fase 11 não inclui integração Bling, NF-e, rotinas fiscais, WhatsApp ou SMS. Esses temas permanecem fora do escopo porque a fase é somente QA visual, hardening frontend e preparação/checklist seguro de produção. 🟢
   - Origem no legado: decisão de esclarecimento da Fase 11
   - Tipo: nova
8. **RN-08:** Scripts locais de verificação de produção são permitidos apenas se forem simples, seguros, não imprimirem valores de variáveis e não exigirem conexão real com banco, deploy, migration, e-mail real ou credenciais reais. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Guardrails de Ambiente`
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Executar QA visual do storefront cobrindo home, produtos, página de produto, carrinho, checkout, pagamento, pedidos, login/cadastro e minha conta. | Must | Cada rota alvo tem veredito registrado como aprovado, aprovado com ressalvas ou bloqueado, com evidência textual ou screenshot local quando aplicável. | 🟢 |
| RF-02 | Executar QA visual do admin cobrindo produtos, cupons, frete, pedidos, status de pagamento e notificações. | Must | Cada superfície admin protegida é verificada quanto a acesso, layout, mensagens e ausência de controles fora de escopo. | 🟢 |
| RF-03 | Garantir header e navegação consistentes nas superfícies públicas e autenticadas relevantes. | Must | Usuário consegue navegar entre home, catálogo, carrinho, login/minha conta e retornar sem links quebrados ou labels ambíguas. | 🟡 |
| RF-04 | Adicionar ou ajustar footer básico quando ausente. | Should | A loja apresenta footer simples com marca, links essenciais e informação institucional mínima, sem criar página institucional completa. | 🟢 |
| RF-05 | Validar responsividade em mobile de 360px a 430px, tablet 768px e desktop 1366px. | Must | Home, catálogo, produto, carrinho, checkout, pagamento, pedidos e login/cadastro não apresentam overflow horizontal, sobreposição, corte de texto, CTA inacessível ou formulário quebrado nos breakpoints obrigatórios; admin fica minimamente navegável em desktop. | 🟢 |
| RF-06 | Padronizar estados loading, vazio e erro nas telas principais. | Must | Estados vazios e erros são compreensíveis para usuário final, em PT-BR, sem stack trace, nome de variável, provider interno ou instrução técnica indevida. | 🟢 |
| RF-07 | Remover ou mascarar textos técnicos expostos ao usuário final. | Must | Termos como reconstrução, placeholder funcional, rota em modo interno, stack, secret, token, provider bruto ou DATABASE_URL não aparecem na UI final para usuário comum. | 🟢 |
| RF-08 | Confirmar CTAs claros nos fluxos principais. | Must | Produtos têm CTA de detalhe/carrinho, carrinho tem CTA para continuar compra, checkout tem CTA de criar pedido, pagamento tem CTA de pagar/retornar, e estados bloqueados explicam a ação seguinte. | 🟡 |
| RF-09 | Confirmar formatação BRL e textos em PT-BR nas telas visíveis. | Must | Preços, totais, frete, descontos e mensagens operacionais aparecem em BRL/PT-BR consistente. | 🟢 |
| RF-10 | Validar fluxo feliz completo em mock/dev. | Must | Visitante navega, cliente cadastra/loga, adiciona produto, aplica cupom, calcula frete, cria pedido, paga via mock/test, pedido muda status, notificação mock/outbox é criada e admin visualiza. | 🟢 |
| RF-11 | Ampliar E2E smoke visual para impedir regressões críticas de navegação e placeholder da home. | Must | Suite automatizada falha se home voltar a placeholder, navegação principal quebrar, admin deixar de proteger acesso ou fluxo feliz mock/dev quebrar. | 🟢 |
| RF-12 | Registrar checklist documental de preparação de produção. | Must | Documento lista variáveis obrigatórias/opcionais, secrets não versionados, build/test sem credenciais reais, migrations, Stripe test mode, Neon, Blob/upload e domínio/deploy sem executar deploy. | 🟢 |
| RF-13 | Conferir `.env.example` contra o checklist operacional. | Should | `.env.example` contém placeholders seguros para variáveis necessárias, sem valores reais e sem tornar build/test dependentes de credenciais reais. | 🟢 |
| RF-14 | Validar critérios responsivos mínimos nos breakpoints obrigatórios. | Should | Em 360px a 430px, 768px e 1366px, não há overflow horizontal, header permanece navegável, cards ficam legíveis, carrinho/checkout são usáveis, botões são clicáveis e formulários não quebram. | 🟢 |
| RF-15 | Criar scripts locais seguros de verificação somente se forem simples. | Could | Scripts opcionais podem confirmar presença/ausência de variáveis sem imprimir valores e sem conexão real obrigatória; se não forem simples, ficam fora da Fase 11. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | A fase não deve usar, copiar, registrar ou exigir secrets reais. | `_reversa_sdd/domain.md#Guardrails de Ambiente` | 🟢 |
| Segurança | Admin deve permanecer protegido por policies; QA não pode abrir acesso administrativo para facilitar teste. | `_reversa_sdd/code-analysis.md#auth` | 🟢 |
| Confiabilidade | Testes e smoke devem rodar em modo mock/dev sem banco real, e-mail real ou provider externo obrigatório. | `_reversa_sdd/domain.md#Guardrails de Ambiente` | 🟢 |
| UX | Textos visíveis devem ser amigáveis, em PT-BR e orientados à próxima ação do usuário. | Derivado do objetivo da Fase 11 e das lacunas de placeholder. | 🟡 |
| Responsividade | Telas principais não devem ter overflow horizontal, sobreposição, conteúdo inacessível ou CTA escondido em mobile 360px a 430px, tablet 768px e desktop 1366px. | Decisão de esclarecimento da Fase 11. | 🟢 |
| Observabilidade | Resultado do QA deve deixar trilha documental suficiente para retomar correções e validações. | `_reversa_sdd/inventory.md#Testes` e padrão Reversa Forward existente. | 🟡 |
| Performance | Smoke visual deve evitar esperas arbitrárias longas e validar estado carregado de forma determinística. | Uso atual de Playwright em `_reversa_sdd/inventory.md#Testes`. | 🟡 |
| Acessibilidade | Navegação, labels e CTAs principais devem ser compreensíveis por nome visível ou acessível. | Derivado do hardening frontend e da necessidade de loja testável. | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: storefront não apresenta placeholder antigo
  Dado que a home pública está carregada em ambiente dev/test
  Quando o visitante visualiza a primeira dobra e navegação principal
  Então a página mostra a marca Tríade Essenza Parfum
  E não mostra texto de reconstrução, storefront genérico ou placeholder funcional

Cenário: visitante conclui navegação pública básica
  Dado que há ao menos um produto público em fixture ou seed seguro
  Quando o visitante abre home, catálogo, detalhe de produto e carrinho
  Então todas as rotas carregam com header consistente, CTA claro e sem erro técnico exposto

Cenário: cliente conclui fluxo feliz mock/dev
  Dado que o ambiente usa dados seguros e pagamento mock/test
  Quando o cliente autentica, adiciona produto, aplica cupom, calcula frete, cria pedido e paga
  Então o pedido muda para status pago conforme fluxo existente
  E a outbox de notificação mock/skipped fica observável sem envio real

Cenário: admin visualiza operação mínima
  Dado que o usuário admin/manager está autenticado em ambiente permitido
  Quando acessa produtos, cupons, frete, pedidos, pagamento e notificações
  Então as telas carregam com layout coerente, mensagens amigáveis e sem controles fora do escopo da fase

Cenário: visitante ou customer tenta acessar admin
  Dado que o usuário não tem papel admin-like
  Quando tenta acessar superfície administrativa
  Então o acesso continua bloqueado por policy e nenhuma mutação administrativa é executada

Cenário: preparação de produção é documental e segura
  Dado que a fase está em QA/hardening
  Quando o checklist de produção é preenchido
  Então variáveis obrigatórias e opcionais são listadas com placeholders seguros
  E checklist de Stripe test mode, Neon, migrations, Blob/upload e domínio/deploy fica registrado
  E nenhum deploy, migration real, domínio real, e-mail real ou credencial real é usado

Cenário: responsividade básica é validada
  Dado que os breakpoints obrigatórios são mobile 360px a 430px, tablet 768px e desktop 1366px
  Quando as telas principais são abertas nesses tamanhos
  Então não há overflow horizontal
  E header, cards, botões, carrinho, checkout e formulários permanecem legíveis e acionáveis

Cenário: script local opcional não expõe secrets
  Dado que a fase decide criar script local simples de verificação de ambiente
  Quando o script é executado localmente
  Então ele informa apenas presença ou ausência de variáveis
  E não imprime valores, não conecta em banco, não roda migration, não envia e-mail e não faz deploy
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Storefront é a superfície primária da loja e precisa ser validável por humano. |
| RF-02 | Must | Admin precisa ser minimamente verificável para operação e suporte ao fluxo comercial. |
| RF-03 | Must | Navegação quebrada impede teste de produção e mascara problemas de fluxo. |
| RF-04 | Should | Footer simples é parte do mínimo vendável; institucional completo está fora de escopo. |
| RF-05 | Must | Os breakpoints 360px a 430px, 768px e 1366px cobrem a validação mínima de mobile, tablet e desktop. |
| RF-06 | Must | Estados loading/vazio/erro ruins geram falso negativo em QA e experiência confusa. |
| RF-07 | Must | Texto técnico ou placeholder exposto compromete prontidão de produção. |
| RF-08 | Must | CTAs guiam o fluxo feliz e reduzem ambiguidade nos testes. |
| RF-09 | Must | BRL/PT-BR consistente é requisito básico para loja brasileira. |
| RF-10 | Must | Fluxo completo mock/dev prova integração sem usar recursos reais. |
| RF-11 | Must | E2E smoke protege contra regressões já observadas na home. |
| RF-12 | Must | Checklist operacional evita deploy prematuro e exposição de secrets. |
| RF-13 | Should | `.env.example` ajuda produção futura, mas deve respeitar ausência de credenciais reais. |
| RF-14 | Should | Critérios responsivos objetivos reduzem subjetividade do QA visual. |
| RF-15 | Could | Scripts locais simples podem ajudar, mas devem permanecer seguros e opcionais. |

## 9. Esclarecimentos

### Sessão 2026-06-22

- **Q:** Qual é o nível visual mínimo aceitável para a primeira produção?
  **R:** A primeira produção precisa ter aparência limpa, coerente e vendável, mas sem redesign premium agora. O mínimo inclui home sem placeholder, header consistente, footer simples, cards de produto apresentáveis, botões/CTAs claros, textos finais em PT-BR, estados vazio/loading/erro amigáveis, páginas principais sem texto técnico, layout sem quebra visual grave e fluxo de compra compreensível para cliente comum. Não exige identidade visual definitiva, animações, landing page premium, institucional completo ou design system completo.
- **Q:** Quais breakpoints móveis e tablet são obrigatórios para aprovação da Fase 11?
  **R:** QA obrigatório em mobile de 360px a 430px, tablet 768px e desktop 1366px. Critérios: sem overflow horizontal, header navegável, cards legíveis, carrinho/checkout usáveis, botões clicáveis, formulários sem quebra e admin minimamente navegável no desktop.
- **Q:** O checklist de produção deve ser apenas documental nesta fase ou pode incluir scripts locais de verificação?
  **R:** O checklist documental é obrigatório. Scripts locais seguros são opcionais apenas se forem simples, sem credenciais reais, sem impressão de valores, sem conexão real obrigatória, sem migration real, sem envio real de e-mail e sem deploy.
- **Q:** Bling/NF-e, rotinas fiscais, WhatsApp e SMS entram na Fase 11?
  **R:** Não. A Fase 11 é somente QA visual, hardening frontend e preparação/checklist seguro de produção. Integração Bling, NF-e, rotinas fiscais, WhatsApp e SMS permanecem fora do escopo.

## 10. Lacunas

Nenhuma lacuna pendente após a sessão de esclarecimento de 2026-06-22.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-22 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-06-22 | Dúvidas resolvidas por `/reversa-clarify` | reversa |
| 2026-06-22 | Ressalva Q-007 resolvida por `/reversa-clarify` | reversa |
