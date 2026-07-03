# Requirements: Fase 16 - Approved Staging Import

> Identificador: `024-fase-16-staging-import`
> Data: `2026-07-02`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo executivo

A Fase 16 prepara a primeira importacao controlada de dados aprovados em ambiente remoto nao produtivo, preferencialmente Neon dev/staging separado. A fase deve sair do dry-run local da Fase 15 e validar importacao, rollback, relatorios e smoke em ambiente real controlado, sem go-live, sem producao e sem alterar o Laravel legado. Se o ambiente remoto ainda nao existir, a fase deve preparar scripts, documentacao e checklist, mas bloquear a execucao real da importacao. O resultado esperado e um fluxo seguro para importar catalogo, imagens por referencia, estoque, frete e cupons em staging/dev remoto, provar consistencia com o dry-run e registrar decisao humana para a proxima fase.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Visão-Geral` | O projeto ja tem readiness operacional, paridade legado x Next, dry-run local e Fase 15 com `primeira-execucao` e `pending-input`. | 🟢 |
| `_reversa_sdd/architecture.md#Dry-run-Controlado-de-Dados` | A entrada aprovada e `data/dry-run/input/primeira-execucao/`; relatorios ficam em `data/dry-run/output/`; o dry-run nao conecta banco, nao importa dados, nao roda migration, nao faz upload e nao faz deploy. | 🟢 |
| `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada` | Importacao real, migration real, conexao com banco real, upload real e deploy real exigem aprovacao humana explicita; o Laravel permanece base de rollback ate aceite formal pos-cutover. | 🟢 |
| `_reversa_sdd/domain.md#Dry-run-Controlado-de-Dados` | Catalogo real, imagens, precos, estoque, cupons ativos e frete minimo exigem dry-run/reconciliacao aprovados antes de avancar. | 🟢 |
| `_reversa_sdd/inventory.md#Estado-pos-Fase-15` | A Fase 15 preparou `primeira-execucao`, contratos `product_images.*`, `inventory.*` e `shipping.*`, inventario em memoria e divergencias por origem, sem importacao real. | 🟢 |
| `_reversa_sdd/code-analysis.md#data-dry-run` | O modulo `data-dry-run` descobre arquivos, valida CSV/JSON, bloqueia entradas inseguras, normaliza dados e gera relatorios sem persistencia. | 🟢 |
| `_reversa_sdd/migration/data_migration_plan.md#Estado-Pos-Fase-15` | A execucao com fonte real aprovada ainda precisa ocorrer antes de qualquer importacao real futura. | 🟢 |
| `_reversa_sdd/deployment.md#Guardrails-Operacionais` | Deploy e migration real permanecem dependentes de aprovacao humana explicita; scripts `ops:*` nao imprimem secrets. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Operador tecnico | Executar importacao controlada em ambiente remoto nao produtivo sem expor secrets. | Recebe arquivos aprovados, confirma ambiente staging/dev remoto, executa prechecks, importa e gera relatorios antes/depois. |
| Responsavel de negocio | Aprovar ou rejeitar avancar para fase posterior com base em dados importados. | Revisa relatorio de produtos, imagens, estoque, frete, cupons e divergencias remanescentes. |
| Desenvolvedor Next | Corrigir apenas problemas do Next identificados pela importacao controlada. | Distingue erro de dados/export, mapeamento ou codigo e nao altera regra de negocio sem nova aprovacao. |
| Administrador QA | Validar smoke pos-importacao em storefront, checkout teste, admin, pedidos e outbox. | Confirma que staging/dev remoto esta navegavel e coerente sem acionar go-live. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A importacao da Fase 16 so pode atingir ambiente remoto nao produtivo: preferencialmente Neon dev/staging separado, staging, preview ou dev remoto. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Readiness-Operacional`
   - Tipo: nova
2. **RN-02:** Producao, dominio real e go-live permanecem fora do escopo da Fase 16. 🟢
   - Origem no legado: `_reversa_sdd/deployment.md#Guardrails-Operacionais`
   - Tipo: nova
3. **RN-03:** Antes de importar, o fluxo deve exigir arquivos aprovados presentes em `data/dry-run/input/primeira-execucao/`, dry-run anterior em `go` ou sem bloqueio critico, migrations revisadas, conexao remota autorizada, snapshot/backup definido e rollback documentado. 🟢
   - Origem no legado: `_reversa_sdd/migration/data_migration_plan.md#Estratégia`
   - Tipo: nova
4. **RN-04:** O comando de importacao controlada deve exigir flag explicita de ambiente e confirmacao humana; producao deve ser bloqueada por padrao. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada`
   - Tipo: nova
5. **RN-05:** O fluxo nao deve imprimir `DATABASE_URL`, tokens, secrets ou valores de variaveis sensiveis em logs, relatorios ou erros. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Guardrails-de-Ambiente`
   - Tipo: nova
6. **RN-06:** A escrita padrao deve ser upsert seguro em staging/dev remoto, sem apagar dados por padrao e sem sobrescrever dados fora das chaves aprovadas. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada`
   - Tipo: nova
7. **RN-07:** Divergencias pos-importacao devem manter a classificacao por origem `dados`, `next`, `mapeamento` ou `humana`. 🟢
   - Origem no legado: `_reversa_sdd/migration/data_migration_plan.md#Origem-das-Divergencias-Pos-Fase-15`
   - Tipo: nova
8. **RN-08:** Imagens devem ser validadas por referencia ou por estrategia de storage aprovada; upload real para storage produtivo continua proibido. 🟢
   - Origem no legado: `_reversa_sdd/architecture.md#Dry-run-Controlado-de-Dados`
   - Tipo: nova
9. **RN-09:** Reset ou limpeza de staging so pode ocorrer com snapshot/backup confirmado, flag explicita, aprovacao humana explicita e ambiente confirmado como nao producao. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada`
   - Tipo: nova
10. **RN-10:** Se os arquivos aprovados ou o ambiente Neon dev/staging nao estiverem prontos, a fase deve registrar `pending-input` ou pendencia operacional e nao tentar importar. 🟢
    - Origem no legado: `_reversa_sdd/domain.md#Dry-run-Controlado-de-Dados`
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Definir contrato de ambiente alvo para Neon dev/staging separado, staging, preview ou dev remoto, bloqueando qualquer alvo de producao. | Must | Qualquer execucao com ambiente `production`, URL/domino produtivo ou flag produtiva deve abortar antes de conectar. Se Neon staging/dev ainda nao existir, a execucao real fica bloqueada e a fase gera checklist/documentacao. | 🟢 |
| RF-02 | Validar pre-condicoes antes da importacao controlada. | Must | O fluxo so avanca quando arquivos aprovados existem em `data/dry-run/input/primeira-execucao/`, dry-run anterior esta `go` ou sem bloqueio critico, migrations foram revisadas, conexao remota foi autorizada, backup/snapshot foi declarado e rollback esta documentado. | 🟢 |
| RF-03 | Criar ou revisar comando seguro de importacao staging-only. | Must | O comando exige flag explicita, confirmacao humana, modo nao produtivo e nao imprime valores sensiveis. | 🟡 |
| RF-04 | Gerar relatorio pre-importacao. | Must | O relatorio lista ambiente, timestamp, commit, arquivos aprovados, resultado do dry-run, plano de escrita, snapshot/backup declarado e rollback, sem secrets. | 🟢 |
| RF-05 | Executar importacao controlada apenas para dados aprovados. | Must | Produtos, categorias, imagens por referencia, inventario/estoque, frete minimo e cupons aplicaveis sao processados conforme contratos da Fase 15. | 🟡 |
| RF-06 | Proteger dados existentes contra apagamento ou sobrescrita nao aprovada. | Must | O modo padrao e upsert seguro. Sem snapshot/backup confirmado, flag explicita, aprovacao humana e ambiente nao produtivo, qualquer limpeza/reset deve abortar. | 🟢 |
| RF-07 | Gerar relatorio pos-importacao antes/depois. | Must | O relatorio compara contagens e chaves por produto, categoria, imagem, estoque, frete e cupom, destacando divergencias restantes. | 🟢 |
| RF-08 | Classificar divergencias pos-importacao por origem. | Must | Cada divergencia deve sair como `dados`, `next`, `mapeamento` ou `humana`, com severidade e acao recomendada. | 🟢 |
| RF-09 | Executar smoke pos-importacao em ambiente nao produtivo. | Should | Smoke cobre home, catalogo, produto, carrinho, checkout em modo teste, admin, pedidos e notificacoes/outbox sem acionar producao. | 🟡 |
| RF-10 | Criar checklist humano para aprovacao da proxima fase. | Must | O checklist separa aprovado, aprovado com excecoes, no-go e rollback, e registra que producao/go-live ficam fora da Fase 16. | 🟢 |
| RF-11 | Registrar pendencia quando arquivos ou ambiente remoto nao estiverem prontos. | Must | O fluxo deve encerrar como `pending-input` ou pendencia operacional documentada, sem criar dados falsos, sem falha operacional indevida e sem conectar producao. | 🟢 |
| RF-12 | Manter Laravel legado somente leitura. | Must | Nenhum comando da Fase 16 pode escrever, limpar cache, rodar artisan destrutivo, copiar `.env` ou alterar arquivos do legado. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Nenhum log, erro, relatorio ou console pode imprimir `DATABASE_URL`, tokens, secrets, chaves Stripe, credenciais Blob ou valores sensiveis. | `_reversa_sdd/domain.md#Guardrails-de-Ambiente` | 🟢 |
| Segurança | O fluxo deve bloquear producao por padrao e exigir alvo nao produtivo explicito. | `_reversa_sdd/deployment.md#Guardrails-Operacionais` | 🟢 |
| Integridade | O modo padrao de escrita e upsert seguro; operacoes destrutivas em staging/dev remoto exigem snapshot/backup confirmado, flag explicita, aprovacao humana e ambiente nao produtivo. | `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada` | 🟢 |
| Observabilidade | Relatorios antes/depois devem conter contagens, divergencias, decisao go/no-go da importacao e plano de rollback sem dados sensiveis crus. | `_reversa_sdd/migration/data_migration_plan.md#Estratégia` | 🟢 |
| Reprodutibilidade | A mesma entrada aprovada deve produzir importacao e relatorios comparaveis, salvo timestamps e IDs gerados pelo ambiente remoto. | `_reversa_sdd/code-analysis.md#data-dry-run` | 🟡 |
| Desempenho | A importacao deve processar catalogo inicial em tempo operacional aceitavel e abortar de forma segura em timeout configurado. | Derivado do limite operacional de dry-run de ate 60 segundos para catalogo inicial. | 🟡 |
| Privacidade | Relatorios versionaveis devem ser sanitizados; relatorios brutos com dados reais devem ficar fora do Git. | `_reversa_sdd/architecture.md#Dry-run-Controlado-de-Dados` | 🟢 |
| Testabilidade | Lint, typecheck, testes, build, e2e e checks operacionais seguros devem continuar sem exigir credenciais reais. | `_reversa_sdd/inventory.md#Estado-pos-Fase-15` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Bloquear produção por padrão
  Dado um comando de importação controlada
  Quando o operador informar ambiente de produção ou omitir o alvo não produtivo
  Então o comando deve abortar antes de conectar
  E não deve imprimir valores de variáveis sensíveis

Cenário: Pré-condições incompletas geram pendência
  Dado que os arquivos aprovados ou o snapshot remoto ainda não estão disponíveis
  Quando o operador iniciar a preparação da importação
  Então o sistema deve gerar status pending-input ou relatório de pendência
  E não deve importar, migrar, apagar, sobrescrever ou conectar produção

Cenário: Importação controlada em staging/dev remoto
  Dado arquivos aprovados presentes em `data/dry-run/input/primeira-execucao/`
  E dry-run anterior em go ou sem bloqueio crítico
  E ambiente remoto não produtivo explicitamente autorizado
  E snapshot/backup e rollback documentados
  Quando o operador confirmar a importação controlada
  Então produtos, categorias, imagens por referência, estoque, frete e cupons devem ser importados por upsert seguro conforme contratos aprovados
  E um relatório antes/depois deve ser gerado sem secrets

Cenário: Neon staging/dev ainda não existe
  Dado que nenhum Neon dev/staging separado foi criado ou aprovado
  Quando o operador iniciar a Fase 16
  Então a fase deve preparar scripts, documentação e checklist
  E bloquear a execução real da importação até aprovação humana do ambiente remoto

Cenário: Reset de staging exige autorização reforçada
  Dado um ambiente staging/dev remoto não produtivo
  Quando o operador solicitar limpeza ou reset antes da importação
  Então a ação só pode continuar com snapshot/backup confirmado, flag explícita e aprovação humana explícita
  E qualquer sinal de produção deve abortar a operação

Cenário: Divergência pos-importação
  Dado uma importação controlada concluída em staging/dev remoto
  Quando a reconciliação detectar diferença de contagem, chave, preço, estoque, imagem, frete ou cupom
  Então a divergência deve ser classificada como dados, next, mapeamento ou humana
  E o relatório deve indicar se bloqueia a próxima fase

Cenário: Smoke pos-importação
  Dado um ambiente não produtivo importado
  Quando o smoke for executado
  Então home, catálogo, produto, carrinho, checkout em modo teste, admin, pedidos e outbox devem ser verificados
  E nenhuma ação de go-live, domínio real, produção ou envio real deve ocorrer

Cenário: Rollback documentado
  Dado uma importação controlada que falhou ou recebeu no-go humano
  Quando o operador acionar o plano de rollback
  Então o relatório deve indicar snapshot/backup, passos manuais de reversão e estado final esperado
  E o Laravel legado deve permanecer intacto
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Bloquear producao e condição central da fase. |
| RF-02 | Must | Sem pre-condicoes, importacao controlada vira risco operacional. |
| RF-03 | Must | O comando seguro e o mecanismo que impede execucao acidental. |
| RF-04 | Must | Relatorio pre-importacao permite auditoria e aprovacao humana. |
| RF-05 | Must | Importar dados aprovados em ambiente nao produtivo e o objetivo da fase. |
| RF-06 | Must | Define upsert seguro como padrao e protege staging/dev remoto contra perda de dados acidental. |
| RF-07 | Must | Reconciliacao antes/depois decide avancar ou corrigir. |
| RF-08 | Must | Origem da divergencia evita corrigir codigo quando o problema e de dados/export. |
| RF-09 | Should | Smoke pos-importacao e necessario para confianca, mas pode variar conforme URL/ambiente disponivel. |
| RF-10 | Must | A proxima fase depende de decisao humana registrada. |
| RF-11 | Must | Ausencia de entrada aprovada nao pode virar dado inventado nem importacao parcial. |
| RF-12 | Must | Laravel legado continua somente leitura e rollback operacional. |
| RNF Segurança | Must | Sem segredos e sem producao acidental. |
| RNF Observabilidade | Should | Relatorios orientam correcao, rollback e aprovacao. |

## 9. Esclarecimentos

### Sessão 2026-07-02

- **Q:** Qual ambiente remoto nao produtivo sera o primeiro alvo?
  **R:** O primeiro alvo sera ambiente remoto de staging/dev, preferencialmente Neon dev/staging separado. Producao esta proibida. Se Neon staging/dev ainda nao existir, a fase prepara scripts, documentacao e checklist, mas bloqueia execucao real ate o ambiente ser criado e aprovado.
- **Q:** Os arquivos aprovados ja estao disponiveis e qual condicao do dry-run libera a importacao?
  **R:** A importacao so pode executar se os arquivos aprovados existirem em `data/dry-run/input/primeira-execucao/` e se o dry-run anterior retornar `go` ou sem bloqueios criticos. Se os arquivos nao existirem, a fase gera `pending-input` e relatorio de pendencia, sem tentar importar.
- **Q:** O modo inicial sera append/upsert conservador ou sera permitido limpar/resetar staging?
  **R:** O modo padrao sera upsert seguro em staging, sem apagar dados por padrao. Limpeza/reset so pode ocorrer com snapshot/backup confirmado, flag explicita, aprovacao humana explicita e ambiente confirmado como nao producao.

## 10. Lacunas

- Nenhuma lacuna bloqueadora restante apos a sessão de esclarecimento de 2026-07-02.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-02 | Dúvidas bloqueadoras resolvidas por `/reversa-clarify` | reversa |
