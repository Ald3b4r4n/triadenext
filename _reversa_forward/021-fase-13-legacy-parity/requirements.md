# Requirements: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`
> Data: `2026-07-01`
> Pasta da extracao reversa: `_reversa_sdd/`
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DUVIDA

## 1. Resumo executivo

A Fase 13 deve comparar o Laravel legado com o projeto Next atual para decidir, com evidencias, se o Next ja pode substituir o sistema antigo. A macrofase deve mapear lacunas reais de paridade, classificar bloqueadores de go-live, preparar migracao controlada de dados e gerar checklists de substituicao sem alterar o Laravel, sem importar dados reais automaticamente e sem executar deploy ou migration real.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confianca |
|-------|------------------|-----------|
| `_reversa_sdd/architecture.md#Visao-Geral` | O Next atual cobre catalogo publico, carrinho, cupom, frete manual, checkout autenticado, pedido pendente, Stripe/PaymentIntent, webhook, settlement e notificacoes pos-pagamento. | 🟢 |
| `_reversa_sdd/architecture.md#Dividas-Tecnicas` | Area do cliente completa, status operacionais de pedido, fiscal/Bling/NF-e, frete real, estoque auditavel e relatorios seguem como lacunas. | 🟢 |
| `_reversa_sdd/domain.md#Regras-de-Dominio` | Regras confirmadas incluem produto publico, carrinho terminal, cupom, frete manual, checkout autenticado, webhook como fonte financeira e notificacao pos-settlement. | 🟢 |
| `_reversa_sdd/domain.md#Lacunas` | Deploy real, migration real em producao e migracao de dados reais ainda nao foram executados nem aprovados. | 🟢 |
| `_reversa_sdd/inventory.md#Estado-pos-Fase-12` | A Fase 12 consolidou readiness de producao controlada com Neon, Vercel, Stripe test mode, Blob/upload, variaveis, scripts ops e checklists. | 🟢 |
| `_reversa_sdd/code-analysis.md#operations-readiness` | Scripts `ops:*` atuais sao locais e seguros; nao conectam banco real, nao executam migration real, nao chamam deploy e nao imprimem secrets. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Tabelas` | O schema Next possui entidades para usuarios, perfis, enderecos, categorias, produtos, imagens, carrinhos, cupons, frete, pedidos, pagamentos, notificacoes e fiscal_documents. | 🟢 |
| `_reversa_sdd/migration/data_migration_plan.md#Ordem-de-migracao` | Plano previo sugere migrar categorias, produtos, imagens, clientes, enderecos, cupons, pedidos, itens, pagamentos/status e dados fiscais/integracoes. | 🟡 |
| `_reversa_sdd/migration/cutover_plan.md#Pre-cutover` | Cutover requer dry-run, reconciliacao de contagens, validacao de checkout/pagamento sandbox, smoke final e rollback com legado intacto. | 🟡 |
| `_reversa_sdd/deployment.md#Guardrails-Operacionais` | Deploy e migration real dependem de aprovacao humana explicita; go-live ainda exige envs reais, backup, smoke controlado e decisao avancar/abortar. | 🟢 |

## 3. Personas e cenarios de uso

| Persona | Objetivo | Cenario-chave |
|---------|----------|---------------|
| Dono do negocio | Saber se o Next pode substituir o Laravel | Recebe matriz de paridade com bloqueadores, itens pos-go-live e riscos aceitos. |
| Operador/admin | Validar rotinas comerciais antes do corte | Confere catalogo, pedidos, cupons, frete, clientes e admin em relatorio de lacunas. |
| Desenvolvedor responsavel pela migracao | Planejar importacao controlada | Usa mapa de dados, dry-run e reconciliacao para evitar importacao cega. |
| QA/validador | Provar que o fluxo critico substitui o legado | Executa smoke de storefront, compra, pedido, pagamento teste e admin contra dados controlados. |

## 4. Regras de negocio novas ou alteradas

1. **RN-01:** A paridade deve ser avaliada por dominio funcional e nao por promessa generica de substituicao. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Dividas-Tecnicas`
   - Tipo: nova
2. **RN-02:** O Laravel legado deve ser tratado somente como fonte de leitura e analise; nenhum arquivo, dado ou configuracao do legado pode ser alterado. 🟢
   - Origem no legado: regra operacional do usuario e `_reversa_sdd/migration/data_migration_plan.md#Nao-fazer-nesta-etapa`
   - Tipo: nova
3. **RN-03:** Dados reais somente podem ser importados depois de aprovacao humana explicita; a fase deve priorizar inventario, mapeamento, dry-run e reconciliacao. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Readiness-Operacional`
   - Tipo: nova
4. **RN-04:** Lacunas devem ser classificadas como bloqueador de go-live, aceitavel para pos-go-live, fora de escopo ou decisao humana. 🟡
   - Origem no legado: `_reversa_sdd/domain.md#Lacunas`
   - Tipo: nova
5. **RN-05:** A migracao de catalogo deve preservar identificadores comerciais essenciais como slug, SKU, preco em centavos, estoque, status publico, categorias e imagem de capa. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Catalogo`
   - Tipo: nova
6. **RN-06:** Migracao de clientes, enderecos e pedidos historicos deve ser tratada como opcional controlada quando nao for bloqueadora do go-live. 🟡
   - Origem no legado: `_reversa_sdd/data-dictionary.md#customer_profiles`, `_reversa_sdd/data-dictionary.md#addresses`, `_reversa_sdd/data-dictionary.md#orders`
   - Tipo: nova
7. **RN-07:** Fiscal, Bling, NF-e, WhatsApp e SMS continuam fora desta fase, exceto para marcar lacunas e impacto de paridade. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Lacunas`
   - Tipo: preservada

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de aceite | Confianca |
|----|-----------|------------|--------------------|-----------|
| RF-01 | Inventariar superficies comparaveis entre Laravel legado e Next atual: paginas publicas, catalogo, produto, categorias, imagens, carrinho, cupons, frete, checkout, pedidos, clientes, admin e regras. | Must | Existe matriz por dominio com coluna "Laravel", "Next", "status de paridade", "evidencia" e "classificacao". | 🟢 |
| RF-02 | Classificar cada lacuna como bloqueador real, pos-go-live aceitavel, fora de escopo ou decisao humana. | Must | Toda linha sem paridade possui uma classificacao unica e justificativa. | 🟢 |
| RF-03 | Identificar o que o Next ja substitui do Laravel com base em fluxo funcional e nao apenas em existencia de rota/tabela. | Must | Relatorio lista capacidades substituidas e evidencia em SDD/codigo/teste. | 🟢 |
| RF-04 | Mapear dados migraveis por entidade: categorias, produtos, imagens, clientes, enderecos, cupons, fretes/configuracoes, pedidos, itens, pagamentos/status e administracao. | Must | Cada entidade possui origem esperada, destino Next, campos minimos, regra de transformacao e risco. | 🟢 |
| RF-05 | Definir estrategia de dry-run de migracao sem gravar em producao e sem conectar banco real por padrao. | Must | Plano descreve entrada, saida, ambiente isolado, validacoes e bloqueios de seguranca. | 🟢 |
| RF-06 | Definir validacoes de contagem e reconciliacao por dominio critico. | Must | Plano inclui contagem por entidade, checksums ou equivalentes, amostras de divergencia e criterio de divergencia zero para catalogo critico. | 🟡 |
| RF-07 | Produzir relatorio de divergencias entre legado e Next. | Must | Relatorio separa divergencias de dados, regra, UI/navegacao, admin, integracao externa e conteudo. | 🟢 |
| RF-08 | Produzir checklist de substituicao do Laravel por Next. | Must | Checklist contem pre-go-live, janela de corte, smoke final, rollback e decisao avancar/abortar. | 🟢 |
| RF-09 | Definir limites seguros para leitura do Laravel legado. | Must | Documento declara que a leitura nao copia `.env`, nao imprime secrets, nao altera arquivos e nao executa comandos destrutivos no legado. | 🟢 |
| RF-10 | Registrar lacunas explicitamente fora do go-live, incluindo Bling, NF-e, rotinas fiscais, WhatsApp, SMS e redesign premium. | Must | Relatorio final separa "fora de escopo por decisao" de "bloqueador real". | 🟢 |
| RF-11 | Identificar dependencia de midias/imagens e estrategia de correspondencia sem upload real automatico. | Should | Plano indica origem das imagens, destino esperado, fallback, validacao de capa e bloqueio para upload real sem aprovacao. | 🟡 |
| RF-12 | Preparar smoke de paridade sobre dados controlados. | Should | Cenarios cobrem home, catalogo, produto, carrinho, cupom, frete, checkout, pagamento teste, pedido, cliente e admin. | 🟡 |
| RF-13 | Registrar plano de rollback da migracao de dados. | Must | Plano indica como abortar importacao, preservar legado intacto e repetir dry-run sem efeitos externos. | 🟢 |

## 6. Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia ou justificativa | Confianca |
|------|-----------|----------------------------|-----------|
| Seguranca | Nenhum script ou documento pode imprimir valor de secret, URL real de banco, token de Blob, chave Stripe ou credencial do legado. | `_reversa_sdd/domain.md#Readiness-Operacional` e `_reversa_sdd/code-analysis.md#operations-readiness`. | 🟢 |
| Seguranca | Qualquer leitura do Laravel deve ser read-only e nao pode modificar arquivos, banco, cache, storage ou configuracao do legado. | Regra do usuario e `_reversa_sdd/migration/data_migration_plan.md#Nao-fazer-nesta-etapa`. | 🟢 |
| Privacidade | Dados pessoais de clientes devem ser tratados por contagem, amostragem mascarada ou fixture controlada ate haver aprovacao explicita para dados reais. | `_reversa_sdd/data-dictionary.md#users`, `#customer_profiles`, `#addresses`. | 🟡 |
| Integridade | Reconciliacao deve separar erro de mapeamento, ausencia aceitavel e divergencia bloqueadora. | `_reversa_sdd/migration/data_migration_plan.md#Estrategia`. | 🟡 |
| Observabilidade | Relatorios da fase devem ser versionaveis e reexecutaveis sem depender de estado externo secreto. | Padrao Reversa/SDD e Fase 12 de scripts seguros. | 🟢 |
| Operacao | Go-live e importacao real devem permanecer bloqueados por aprovacao humana explicita. | `_reversa_sdd/deployment.md#Guardrails-Operacionais`. | 🟢 |
| Reversibilidade | O legado deve permanecer intacto ate aceite pos-cutover, com rollback documentado. | `_reversa_sdd/migration/cutover_plan.md#Rollback`. | 🟡 |

## 7. Criterios de Aceitacao

```gherkin
Cenario: Matriz de paridade completa
  Dado o projeto Next pos-Fase 12 e o Laravel legado como fonte read-only
  Quando a Fase 13 auditar os dominios publicos, comerciais, cliente e admin
  Entao deve existir uma matriz com status de paridade, evidencia e classificacao para cada dominio

Cenario: Bloqueadores de go-live separados de itens pos-go-live
  Dado uma lacuna detectada entre Laravel e Next
  Quando a lacuna for classificada
  Entao ela deve ser marcada como bloqueador, pos-go-live aceitavel, fora de escopo ou decisao humana

Cenario: Plano de migracao controlada sem importacao real
  Dado dados legados de catalogo, clientes, cupons, frete e pedidos
  Quando a fase preparar a migracao
  Entao deve existir plano de dry-run, mapeamento de campos e reconciliacao sem gravacao em producao

Cenario: Dados sensiveis protegidos
  Dado que o Laravel legado pode conter secrets e dados pessoais
  Quando a auditoria produzir relatorios
  Entao os relatorios nao devem conter `.env`, valores de secrets, senhas, tokens, URLs reais de banco ou dados pessoais sem mascara

Cenario: Midias e imagens avaliadas sem upload real automatico
  Dado produtos legados com imagens
  Quando a fase mapear imagens
  Entao deve indicar origem, destino esperado, capa, divergencias e bloqueio de upload real sem aprovacao

Cenario: Operacao proibida permanece bloqueada
  Dado que deploy real, migration real e importacao real estao fora desta etapa
  Quando qualquer tarefa da Fase 13 for executada
  Entao nenhuma dessas operacoes deve ocorrer sem aprovacao humana explicita
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Sem inventario comparativo nao ha decisao de substituicao. |
| RF-02 | Must | Go-live precisa separar bloqueador de diferenca aceitavel. |
| RF-03 | Must | Substituicao deve ser provada por comportamento. |
| RF-04 | Must | Migracao final depende de mapa de entidades e campos. |
| RF-05 | Must | Dry-run evita importacao cega e protege producao. |
| RF-06 | Must | Reconciliacao e a prova minima de integridade. |
| RF-07 | Must | Divergencias precisam virar backlog/decisao, nao memoria solta. |
| RF-08 | Must | Checklist de substituicao e necessario antes do corte. |
| RF-09 | Must | O Laravel legado nao pode ser alterado. |
| RF-10 | Must | Fora de escopo precisa ficar explicito para nao bloquear falsamente. |
| RF-11 | Should | Imagens podem bloquear catalogo vendavel, mas upload real fica sob aprovacao. |
| RF-12 | Should | Smoke de paridade fortalece a decisao, mas pode ser ajustado pelo plano. |
| RF-13 | Must | Rollback e condicao para migracao controlada. |

## 9. Esclarecimentos

> Nenhuma sessao de duvidas registrada ainda. Rode `/reversa-clarify` somente se surgir uma duvida pendente.

## 10. Lacunas

- Nenhuma duvida bloqueadora foi registrada nesta versao inicial.
- A fase deve descobrir, durante a auditoria read-only, quais dados historicos sao realmente necessarios para go-live e quais podem ficar para pos-go-live.
- A fase deve manter toda decisao sensivel como ponto de aprovacao humana antes de qualquer importacao real, migration real, conexao com banco real ou deploy.

## 11. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-07-01 | Versao inicial gerada por `/reversa-requirements` | reversa |
