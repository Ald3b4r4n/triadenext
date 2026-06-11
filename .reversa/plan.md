# Plano de Exploração — triade-essenza-next

> Criado pelo Reversa em 2026-06-07
> Marque cada tarefa com ✅ quando concluída.
> Você pode editar este plano antes de iniciar: adicione, remova ou reordene tarefas conforme necessário.

---

## Fase 1: Reconhecimento 🔍

- [x] **Scout** — Mapeamento de estrutura de pastas e tecnologias ✅
- [x] **Scout** — Análise de dependências e gerenciadores de pacotes ✅
- [x] **Scout** — Identificação de entry points, CI/CD e configurações ✅

## Decisão de organização das specs 🗂️

> Entre o Scout e o Arqueólogo, o Reversa pergunta como você quer organizar as specs (por módulo, caso de uso, endpoint, híbrida, por features ou customizada). A escolha fica persistida em `.reversa/config.toml` na seção `[specs]` e não será reperguntada em execuções futuras. Para reapresentar o menu, remova manualmente a seção.

## Fase 2: Escavação 🏗️

> O Reversa preenche esta seção com os módulos reais após o Scout concluir o reconhecimento.

- [x] **Archaeologist** — Análise do módulo `auth` ✅
- [x] **Archaeologist** — Análise do módulo `products` ✅
- [x] **Archaeologist** — Análise do módulo `cart` ✅
- [x] **Archaeologist** — Análise do módulo `coupons` ✅
- [x] **Archaeologist** — Análise do módulo `shipping` ✅
- [x] **Archaeologist** — Análise do módulo `checkout` ✅
- [x] **Archaeologist** — Análise do módulo `orders` ✅
- [x] **Archaeologist** — Análise do módulo `payments` ✅
- [x] **Archaeologist** — Análise do módulo `notifications` ✅
- [x] **Archaeologist** — Análise do módulo `uploads` ✅
- [x] **Archaeologist** — Análise do módulo `db` ✅
- [x] **Archaeologist** — Análise do módulo `lib` ✅

## Fase 3: Interpretação 🧠

- [x] **Detetive** — Arqueologia Git e ADRs retroativos ✅
- [x] **Detetive** — Regras de negócio implícitas e máquinas de estado ✅
- [x] **Detetive** — Matriz de permissões (RBAC/ACL) ✅
- [x] **Arquiteto** — Diagramas C4 (Contexto, Containers, Componentes) ✅
- [x] **Arquiteto** — ERD completo e integrações externas ✅
- [x] **Arquiteto** — Spec Impact Matrix ✅

## Fase 4: Geração 📝

- [ ] **Redator** — Specs SDD por componente
  - [x] `auth/requirements.md` ✅
  - [x] `auth/design.md` ✅
  - [x] `auth/tasks.md` ✅
  - [x] `auth/login-cadastro-sessao/requirements.md` ✅
  - [x] `auth/login-cadastro-sessao/design.md` ✅
  - [x] `auth/login-cadastro-sessao/tasks.md` ✅
  - [x] `auth/policies-admin-customer-owner/requirements.md` ✅
  - [x] `auth/policies-admin-customer-owner/design.md` ✅
  - [x] `auth/policies-admin-customer-owner/tasks.md` ✅
  - [x] `products/requirements.md` ✅
  - [x] `products/design.md` ✅
  - [x] `products/tasks.md` ✅
  - [x] `products/catalogo-publico/requirements.md` ✅
  - [x] `products/catalogo-publico/design.md` ✅
  - [x] `products/catalogo-publico/tasks.md` ✅
  - [x] `products/admin-produtos-imagens/requirements.md` ✅
  - [x] `products/admin-produtos-imagens/design.md` ✅
  - [x] `products/admin-produtos-imagens/tasks.md` ✅
  - [x] `cart/requirements.md` ✅
  - [x] `cart/design.md` ✅
- [ ] **Redator** — OpenAPI (se aplicável)
- [ ] **Redator** — User Stories (se aplicável)
- [ ] **Redator** — Code/Spec Matrix

## Fase 5: Revisão ✅

- [ ] **Revisor** — Revisão cruzada de specs
- [ ] **Revisor** — Resolução de lacunas com o usuário
- [ ] **Revisor** — Relatório de confiança final

---

## Agentes Independentes

> Execute estes agentes quando os recursos estiverem disponíveis — podem rodar em qualquer fase.

- [ ] **Visor** — Análise de interface via screenshots
- [ ] **Data Master** — Análise completa do banco de dados
- [ ] **Design System** — Extração de tokens de design
- [ ] **Tracer** — Análise dinâmica (requer sistema acessível)

---

## Próximo passo

Após o Time de Descoberta concluir e o `_reversa_sdd/` estar populado, você pode disparar um dos fluxos seguintes:

- `/reversa-migrate`: orquestrador do **Time de Migração** (Paradigm Advisor → Curator → Strategist → Designer → Screen Translator → Inspector). Gera as specs do sistema novo. Saída em `_reversa_sdd/migration/` e `_reversa_sdd/screens/`.
- `/reversa-reconstructor`: gera plano bottom-up para reimplementar o software a partir das specs do legado (uma tarefa por sessão).
