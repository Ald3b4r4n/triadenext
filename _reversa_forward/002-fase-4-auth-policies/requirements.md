# Requirements: Fase 4 - Autenticacao e policies reais de admin/customer

> Identificador: `002-fase-4-auth-policies`
> Data: `2026-06-08`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / PENDENTE

## 1. Objetivo

Criar autenticacao real, papeis de usuario, sessoes e policies server-side para proteger a area
administrativa, as acoes administrativas e a area do cliente da Tríade Essenza Next. A Fase 4
deve substituir o guardrail temporario de ambiente por autorizacao real, sem quebrar o fallback sem
banco, sem expor secrets e sem implementar checkout, pagamento, frete, cupom ou pedidos.

## 2. Contexto

| Fonte | Trecho relevante | Confidência |
|---|---|---|
| `_reversa_sdd/architecture.md#3-runtime-e-guardrails` | Runtime atual bloqueia preview/producao sem auth/policies reais e centraliza mensagens seguras. | 🟢 |
| `_reversa_sdd/architecture.md#8-admin` | Admin exibe aviso de painel sem auth real; auth/policies sao lacuna da Fase 4. | 🟢 |
| `_reversa_sdd/domain.md#8-admin-sem-auth-real` | Mutacao real hoje so e permitida em development/test; preview/producao bloqueiam. | 🟢 |
| `_reversa_sdd/permissions.md#guardrail-de-mutacao-admin` | Define comportamento atual por ambiente e banco real. | 🟢 |
| `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | `users`, `customer_profiles` e `addresses` ja existem no schema, mas auth real ainda nao foi ativada. | 🟢 |
| `_reversa_sdd/dependencies.md#integracoes-externas` | Neon, Vercel Blob e Stripe existem/preparados com guardrails; Stripe segue fora do escopo. | 🟢 |

Uma avaliacao tecnica externa orientou a decisao de provider, mas a escolha ja foi validada nesta fase e nao deve ser reaberta no requirements.

## 2.1. Decisoes ja validadas

- Better Auth e o provider inicial definido para a Fase 4.
- O login inicial usa e-mail e senha.
- Google OAuth fica preparado para o futuro, mas fora desta fase.
- As roles iniciais sao `customer`, `admin` e `manager`.
- `admin` e `manager` tem os mesmos poderes administrativos no MVP.
- O cadastro publico cria apenas `customer`.
- `admin` e `manager` nao podem ser criados publicamente.
- A area customer deve ficar protegida e estruturada nesta fase.
- Pedidos, checkout, pagamento e documentos fiscais reais ficam fora da Fase 4.
- O seed admin dev so pode rodar em desenvolvimento/local-dev.
- O seed admin dev exige `DATABASE_URL`, `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD`.
- Nao pode haver senha hardcoded.
- Nao pode haver bypass global de autenticacao.
- Producao e preview devem bloquear mutacoes admin se auth/policies reais nao estiverem ativas.

## 3. Escopo

- Definir provider de autenticacao do MVP.
- Definir modelo de sessao server-side.
- Definir roles iniciais `customer`, `admin` e `manager`.
- Definir policies server-side para admin/customer.
- Proteger rotas admin.
- Proteger server actions administrativas.
- Proteger area customer para acesso somente aos proprios recursos.
- Preparar login, cadastro e logout.
- Definir comportamento por ambiente local/dev, preview e producao.
- Definir testes unitarios/e2e de auth e policies.
- Definir documentacao operacional de auth.

## 4. Fora de escopo

- Implementar codigo nesta etapa de requirements.
- Copiar `.env` real do legado ou expor secrets.
- Rodar migrations contra banco real.
- Conectar banco de producao.
- Fazer deploy ou push.
- Implementar checkout, pagamento, frete, cupom ou pedidos.
- Implementar granularidade fina de permissoes por recurso alem de `customer`, `admin` e `manager`.
- Migrar dados reais de usuarios do Laravel legado.
- Exigir credenciais reais para build/test.

## 5. Requisitos funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|---|---|---|---|---|
| RF-01 | O sistema deve adotar o provider de autenticacao definido para o MVP, com login inicial por e-mail e senha. | Must | O plano tecnico documenta a decisao de provider, o adapter de banco e as implicacoes de schema antes de qualquer codigo. | 🟢 |
| RF-02 | O sistema deve autenticar usuarios reais antes de permitir acesso administrativo. | Must | Usuario anonimo acessando `/admin` e subrotas protegidas recebe redirecionamento ou bloqueio seguro. | 🟢 |
| RF-03 | O sistema deve reconhecer os roles `customer`, `admin` e `manager`. | Must | Sessao server-side expoe role validado por banco/provider sem depender de valor vindo do cliente. | 🟢 |
| RF-04 | `admin` e `manager` devem acessar a area administrativa conforme regra inicial simples. | Must | Usuario autenticado com role permitido acessa paginas admin protegidas. | 🟢 |
| RF-05 | `customer` nao deve acessar rotas admin. | Must | Usuario `customer` recebe bloqueio/redirect seguro ao acessar `/admin/**`. | 🟢 |
| RF-06 | Cliente deve acessar apenas recursos proprios. | Must | Consultas de conta, enderecos e pedidos futuros filtram por `session.user.id` no servidor. | 🟢 |
| RF-07 | Acoes administrativas devem exigir policy real antes de mutar dados reais. | Must | Acoes administrativas de produto e futuras mutacoes admin falham sem sessao admin/manager valida. | 🟢 |
| RF-08 | Preview/producao devem bloquear mutacao admin real sem auth/policies completas. | Must | Nenhuma mutation real em preview/producao depende somente de `NODE_ENV` ou aviso visual. | 🟢 |
| RF-09 | Login deve criar sessao segura e permitir retorno controlado para a rota pretendida. | Should | Usuario autenticado volta para a rota protegida solicitada quando permitido pela policy. | 🟢 |
| RF-10 | Logout deve invalidar sessao de forma server-side. | Must | Apos logout, rotas protegidas voltam a exigir autenticacao. | 🟡 |
| RF-11 | Cadastro publico deve criar usuario `customer` por padrao nesta fase, sem permitir criacao publica de `admin` ou `manager`. | Should | Novo usuario publico nao recebe `admin` ou `manager` por input do cliente. | 🟢 |
| RF-12 | O sistema deve registrar claramente placeholders de seguranca. | Must | Qualquer tela, rota ou action ainda sem protecao definitiva documenta pendencia e bloqueia mutacao real quando necessario. | 🟢 |

## 6. Requisitos nao funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|---|---|---|---|
| Segurança | Secrets, tokens e identificadores de conexao nunca devem aparecer em logs, erros, docs ou testes. | Guardrails de Fase 3 em `_reversa_sdd/inventory.md#guardrails-atuais`. | 🟢 |
| Segurança | Cookies/sessoes devem usar configuracao segura adequada a producao. | Requisito de auth real para substituir guardrail temporario. | 🟡 |
| Segurança | Policies devem ser avaliadas server-side, nunca apenas na UI. | `_reversa_sdd/permissions.md#lacunas-da-fase-4`. | 🟢 |
| Resiliencia | Build, lint, typecheck, testes e e2e devem rodar sem credenciais reais. | `_reversa_sdd/architecture.md#4-banco-e-drizzle`. | 🟢 |
| Compatibilidade | Fallback sem banco nao deve ser quebrado pela camada de auth. | `_reversa_sdd/domain.md#7-persistencia-e-fallback`. | 🟢 |
| Observabilidade | Falhas de auth/policy devem ser auditaveis sem imprimir secrets. | Necessario para operacao segura em preview/producao. | 🟡 |
| UX | Login/logout/cadastro devem usar mensagens claras sem revelar existencia sensivel de contas. | Requisito de seguranca de auth. | 🟡 |

## 7. Regras de negócio herdadas

1. **RN-01:** Produto publico continua exigindo `published`, `publishedAt <= now` e `stockQuantity > 0`; auth nao altera regra de vitrine publica. 🟢
   - Origem: `_reversa_sdd/domain.md#3-produto-publico`
   - Tipo: preservada
2. **RN-02:** Sem `DATABASE_URL`, fallback deve continuar explicito e nao fingir persistencia real. 🟢
   - Origem: `_reversa_sdd/domain.md#7-persistencia-e-fallback`
   - Tipo: preservada
3. **RN-03:** Sem auth/policies, mutacao real admin nao pode ocorrer em preview/producao. 🟢
   - Origem: `_reversa_sdd/permissions.md#guardrail-de-mutacao-admin`
   - Tipo: alterada pela Fase 4, substituindo guardrail temporario por policy real
4. **RN-04:** Cliente so acessa recursos proprios. 🟢
   - Origem: decisao herdada do brief da Fase 4 e lacunas em `_reversa_sdd/permissions.md#lacunas-da-fase-4`
   - Tipo: nova
5. **RN-05:** `admin` e `manager` acessam area administrativa por regra inicial simples. 🟢
   - Origem: decisao herdada do brief da Fase 4
   - Tipo: nova

## 8. Requisitos de segurança

- RS-01: Toda mutation admin real deve validar sessao e role server-side.
- RS-01: Toda acao administrativa real deve validar sessao e role server-side.
- RS-02: Rotas admin devem ser protegidas no servidor antes de renderizar dados sensiveis.
- RS-03: Area customer deve filtrar dados por usuario autenticado.
- RS-04: Preview/producao nao podem depender de aviso visual como controle de seguranca.
- RS-05: Tokens de sessao devem ser armazenados em mecanismo seguro e nao acessivel a JavaScript de cliente quando aplicavel.
- RS-06: Erros de login/policy nao devem revelar secrets, hash, token, `DATABASE_URL` ou detalhes internos.
- RS-07: Qualquer seed de usuario admin dev deve ser ficticio, local/dev only e bloqueado sem confirmacao/ambiente seguro.
- RS-08: O plano de implementacao deve registrar qualquer placeholder de seguranca como pendencia bloqueante para producao.

## 9. Requisitos de banco

- RB-01: A Fase 4 pode propor tabelas/colunas de auth, sessoes, contas, tokens e roles, mas migrations reais so podem ser aplicadas com validacao humana.
- RB-02: O schema existente `users.role` com valores `customer`, `admin`, `manager` deve ser considerado antes de criar tabelas novas.
- RB-03: O modelo deve preservar compatibilidade com Neon Postgres e Drizzle ORM.
- RB-04: Sem `DATABASE_URL`, build/test nao devem falhar por tentativa obrigatoria de conexao.
- RB-05: Scripts ou seeds de auth nao podem imprimir URL de banco ou credenciais.
- RB-06: Se o provider exigir tabelas proprias, o plano deve mapear delta de dados antes de gerar migration.

## 10. Requisitos de sessão/auth

- RA-01: A sessao server-side deve expor `userId`, `role` e estado autenticado de forma confiavel.
- RA-02: A sessao nao deve confiar em role enviado por formulario, query string, localStorage ou cookie legivel pelo cliente.
- RA-03: Login deve aceitar credenciais validas e retornar erro generico para falha.
- RA-04: Logout deve invalidar sessao no servidor e limpar estado de cliente.
- RA-05: Cadastro publico, se habilitado, deve criar `customer` por padrao.
- RA-06: Admin/manager iniciais devem ser criados por fluxo seguro e documentado, nao por cadastro publico.
- RA-07: Rotas de auth devem funcionar no aplicativo.

## 11. Requisitos de policies

- RP-01: A policy de admin deve aprovar apenas `admin` e `manager` no MVP.
- RP-02: A policy de propriedade do cliente deve aprovar apenas o proprio dono do recurso.
- RP-03: A policy de admin deve bloquear anonimos e customers antes de acoes administrativas.
- RP-04: A policy de cliente deve bloquear anonimos e acesso cruzado.
- RP-05: Policies devem retornar estados distinguiveis para `unauthenticated`, `forbidden` e `allowed`.
- RP-06: Granularidade fina de permissoes deve ficar preparada por contrato, mas nao precisa ser implementada no MVP.

## 12. Requisitos de rotas protegidas

- RR-01: `/admin` e `/admin/**` devem exigir `admin` ou `manager`.
- RR-02: `/minha-conta`, `/enderecos` e `/pedidos` devem exigir usuario autenticado quando forem funcionais.
- RR-03: `/login` e `/cadastro` devem redirecionar usuario ja autenticado quando apropriado.
- RR-04: Rotas placeholder devem ser explicitamente marcadas como nao funcionais ou protegidas antes de exibir dados reais.
- RR-05: Storefront publico de catalogo deve continuar acessivel sem login.

## 13. Requisitos de server actions protegidas

- RSA-01: Actions admin de produto devem exigir policy real antes de persistir com Drizzle.
- RSA-02: Actions admin devem continuar retornando mensagens seguras para fallback, bloqueio e erro de validacao.
- RSA-03: Actions customer futuras devem exigir dono do recurso.
- RSA-04: Actions nao podem aceitar `userId`/`role` confiavel vindo do cliente para autorizacao.
- RSA-05: Tests devem cobrir falhas por anonimo, customer em admin, admin valido e acesso cruzado customer.

## 13.1. Concorrencia, retentativa e timeout

- RC-01: Duas requisicoes simultaneas de cadastro com o mesmo e-mail nao podem criar duplicidade.
- RC-02: Duas tentativas simultaneas de mutacao protegida devem respeitar sessao e policy em cada chamada.
- RC-03: Policies devem ser avaliadas por requisicao, nunca reaproveitadas de estado inseguro do cliente.
- RC-04: Login e cadastro nao devem repetir automaticamente operacoes sensiveis sem controle.
- RC-05: Em falha transitória de banco ou auth, a UI pode orientar nova tentativa, mas nao deve criar duplicidade.
- RC-06: Server actions devem retornar erro controlado em falhas transitórias.
- RC-07: Timeout de auth, sessao ou banco deve ser tratado como falha segura.
- RC-08: Rotas protegidas devem bloquear acesso se a validacao de sessao falhar por timeout.
- RC-09: Actions protegidas nao devem modificar dados se a validacao de sessao ou policy nao completar com sucesso.
- RC-10: Erros de auth, sessao e policy podem ser registrados sem secrets.
- RC-11: Logs nao podem conter senha, token, cookie de sessao, DATABASE_URL ou segredo.

## 14. Requisitos de ambiente

| Ambiente | Requisito |
|---|---|
| Local/dev sem banco | Build/test devem funcionar; mutations reais nao devem fingir persistencia. |
| Local/dev com banco | Auth real pode permitir mutations admin se sessao admin/manager valida existir. |
| Test | Deve permitir cenarios controlados sem credenciais reais. |
| Preview | Deve bloquear mutations reais sem auth/policies reais e secrets configurados corretamente. |
| Producao | Deve exigir auth/policies reais; admin desprotegido e bloqueador de release. |

## 15. Critérios de aceite

- CA-01: Admin anonimo nao acessa `/admin/**`.
- CA-02: `customer` autenticado nao acessa `/admin/**`.
- CA-03: `admin` ou `manager` autenticado acessa admin.
- CA-04: Mutation admin real sem policy falha.
- CA-05: Cliente nao acessa dados de outro cliente.
- CA-06: Build/test nao exigem credenciais reais.
- CA-07: Fallback sem `DATABASE_URL` continua explicito.
- CA-08: Secrets e `DATABASE_URL` nao aparecem em logs, docs, erros ou testes.
- CA-09: Preview/producao nao permitem admin desprotegido.
- CA-10: Placeholders de seguranca ficam documentados e nao liberam mutacao real.
- CA-11: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e` permanecem validacoes obrigatorias da implementacao futura.

## 16. Cenários de teste

```gherkin
Cenario: anonimo tenta acessar admin
  Dado que nao existe sessao autenticada
  Quando o usuario acessa /admin/produtos
  Entao o sistema bloqueia ou redireciona para login sem renderizar dados administrativos

Cenario: customer tenta acessar admin
  Dado um usuario autenticado com role customer
  Quando ele acessa /admin/produtos
  Entao o sistema retorna acesso negado ou redirecionamento seguro

Cenario: admin acessa admin
  Dado um usuario autenticado com role admin
  Quando ele acessa /admin/produtos
  Entao a pagina administrativa e renderizada

Cenario: manager acessa admin
  Dado um usuario autenticado com role manager
  Quando ele acessa /admin/produtos
  Entao a pagina administrativa e renderizada conforme regra inicial simples

Cenario: mutation admin sem policy
  Dado que uma mutation administrativa recebe uma requisicao sem sessao admin/manager valida
  Quando a mutation tenta persistir em Drizzle
  Entao a mutation falha antes da persistencia real

Cenario: cliente acessa recurso proprio
  Dado um usuario customer autenticado
  Quando ele acessa sua propria area de conta
  Entao apenas dados vinculados ao proprio userId sao retornados

Cenario: cliente tenta acessar recurso de outro cliente
  Dado um usuario customer autenticado
  Quando ele solicita dados vinculados a outro userId
  Entao o sistema retorna acesso negado sem revelar dados do outro cliente

Cenario: producao sem auth completa
  Dado ambiente production ou preview
  Quando uma rota ou action admin ainda estiver sem policy real
  Entao a operacao real fica bloqueada e o placeholder de seguranca fica explicitamente registrado

Cenario: build sem credenciais reais
  Dado ausencia de DATABASE_URL e secrets reais
  Quando pnpm build e testes sao executados
  Entao o projeto nao tenta conectar banco real e nao imprime secrets

Cenario: logout com sessao ativa
  Dado um usuario autenticado com sessao ativa
  Quando ele solicita logout
  Entao a sessao deve ser invalidada
  E rotas protegidas devem bloquear novo acesso sem login

Cenario: acesso apos logout
  Dado que o usuario realizou logout
  Quando ele tenta acessar /admin/produtos ou /minha-conta
  Entao o sistema deve redirecionar ou bloquear
  E nao deve expor dados protegidos

Cenario: action protegida apos logout
  Dado que a sessao foi invalidada
  Quando uma action protegida e chamada
  Entao a action deve recusar execucao com erro controlado
  E nao deve modificar dados

Cenario: cadastro publico valido
  Dado que um visitante fornece dados validos
  Quando solicita cadastro
  Entao o sistema cria usuario com role customer
  E nao permite definir role administrativa

Cenario: cadastro publico com role administrativa no payload
  Dado que um visitante envia payload com role admin ou manager
  Quando solicita cadastro
  Entao o sistema deve rejeitar ou ignorar a role enviada
  E o usuario nunca deve ser criado como admin ou manager

Cenario: cadastro publico com e-mail duplicado
  Dado que ja existe usuario com o mesmo e-mail
  Quando um visitante tenta cadastrar esse e-mail
  Entao o sistema retorna erro controlado
  E nao duplica usuario

Cenario: cadastro publico com senha fraca
  Dado que o visitante envia senha fora da politica minima
  Quando solicita cadastro
  Entao o sistema rejeita o cadastro
  E retorna erro de validacao seguro
```

## 16.1. Edge cases obrigatorios

- EA-01: Usuario sem sessao acessando `/admin/**` deve ser redirecionado ou bloqueado de forma segura.
- EA-02: Usuario sem sessao acessando `/minha-conta/**` deve ser redirecionado ou bloqueado de forma segura.
- EA-03: Server actions protegidas devem recusar execucao sem sessao valida.
- EA-04: Sessao expirada deve ser tratada como nao autenticada.
- EA-05: UI deve exibir estado seguro quando a sessao estiver ausente ou expirada, sem revelar dados protegidos.
- EA-06: Acoes protegidas devem retornar erro controlado quando a sessao estiver ausente ou expirada.
- EA-07: `customer` tentando acessar admin deve ser bloqueado.
- EA-08: `customer` tentando executar acao administrativa deve ser bloqueado.
- EA-09: `admin` e `manager` podem acessar admin conforme a regra inicial do MVP.
- EA-10: Cadastro publico so pode criar `customer`.
- EA-11: Qualquer role enviada no payload publico deve ser ignorada ou rejeitada.
- EA-12: E-mail duplicado deve gerar erro controlado.
- EA-13: Senha fraca deve ser rejeitada conforme a politica definida no plano tecnico.
- EA-14: Erro de cadastro nao deve revelar informacao sensivel alem do necessario.
- EA-15: Credenciais invalidas devem retornar erro generico e controlado.
- EA-16: O login nao deve revelar se o e-mail existe, se essa regra de seguranca estiver adotada no plano tecnico.
- EA-17: A sessao criada deve respeitar o modelo do provider definido.
- EA-18: Logout deve invalidar a sessao.
- EA-19: Apos logout, rotas protegidas devem bloquear acesso ate novo login valido.
- EA-20: Actions protegidas devem falhar sem sessao.
- EA-21: Build e teste nao devem exigir credenciais reais.
- EA-22: Producao e preview nao podem usar bypass de auth.
- EA-23: Helpers e mocks de teste nao podem existir em runtime de producao.

## 17. Gaps e dúvidas resolvidas

- Nenhuma dúvida pendente após a clarificação desta sessão.

## 17.1. Esclarecimentos adicionais

### Sessao 2026-06-08

- **Q:** O que fazer quando a sessao estiver ausente ou expirada?
  **R:** Tratar como nao autenticada, bloquear ou redirecionar rotas protegidas e devolver erro controlado nas acoes protegidas.
- **Q:** O que fazer se o cadastro publico receber role no payload, e-mail duplicado ou senha fraca?
  **R:** Ignorar ou rejeitar qualquer role enviada, criar apenas `customer`, rejeitar e-mail duplicado com erro controlado e rejeitar senha fraca conforme a politica definida no plano tecnico.
- **Q:** O que fazer se o login receber credenciais invalidas?
  **R:** Retornar erro generico e controlado, sem expor se o e-mail existe quando a politica de seguranca optar por esse comportamento.
- **Q:** Como registrar os pontos apontados pela auditoria de qualidade?
  **R:** Manter a decisao de Better Auth, mas concentrar a implementacao concreta no plano tecnico, sem antecipar nomes de helpers, actions ou organizacao final de testes no requirements.

## 18. Glossário mínimo

| Termo | Definicao |
|---|---|
| Auth provider | Biblioteca/servico responsavel por login, sessao, contas e tokens. |
| Sessao | Estado autenticado server-side que identifica usuario e role. |
| Role | Papel de usuario: `customer`, `admin` ou `manager`. |
| Policy | Regra server-side que decide se uma acao ou rota pode prosseguir. |
| Admin-like | Usuario com role `admin` ou `manager` no MVP. |
| Owner | Usuario dono do recurso customer solicitado. |
| Fallback sem banco | Modo sem `DATABASE_URL`, com fixtures e sem persistencia real. |
| Mutation real | Operacao que grava em banco/servico real. |
| Placeholder de seguranca | Superficie ainda nao protegida definitivamente e marcada como pendencia/bloqueio. |

## 19. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|---|---|---|
| RF-02 a RF-08 | Must | Sem isso, admin permanece inseguro para preview/producao. |
| RF-09 a RF-11 | Should | Necessarios para experiencia completa, mas dependem das decisoes de auth/cadastro. |
| RF-12 | Must | Evita falsa seguranca. |
| RNF de build/test sem credenciais | Must | Preserva guardrails das fases anteriores. |
| Granularidade fina futura | Could | Pode ser preparada sem bloquear MVP. |

## 20. Esclarecimentos

### Sessão 2026-06-08

- **Q:** AUTH-001 - Qual provider e método inicial de login devem ser adotados?
  **R:** Better Auth como provider único do MVP, com login inicial por e-mail e senha. A arquitetura fica preparada para Google OAuth no futuro, mas OAuth não entra nesta fase.
- **Q:** SCOPE-002 - Qual o escopo MVP para roles, cadastro público e área customer?
  **R:** Usar `customer`, `admin` e `manager`; `admin` e `manager` têm os mesmos poderes administrativos no MVP; cadastro público de cliente entra nesta fase e cria apenas `customer`; a área customer fica protegida e estruturada, sem pedidos, checkout, pagamento ou documentos fiscais reais.
- **Q:** DEV-003 - Como deve funcionar o seed/admin dev e a ergonomia local de proteção?
  **R:** Permitir seed de admin apenas em desenvolvimento/local-dev, sem bypass global de autenticação, sem senha hardcoded, com variáveis explícitas e falha segura quando ausentes; produção e preview continuam bloqueando mutações admin sem auth/policies reais.

## 21. Lacunas

- Nenhuma lacuna restante na camada de clarificação desta fase.

## 22. Histórico de alterações

| Data | Alteração | Autor |
|---|---|---|
| 2026-06-08 | Versão inicial gerada por `/reversa-requirements` | reversa |
