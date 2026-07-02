# Requirements: Fase 14 - Controlled Data Dry-run and Reconciliation

> Identificador: `022-fase-14-data-dry-run`
> Data: `2026-07-02`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A Fase 14 prepara a execução segura de um dry-run controlado de dados legados, sem importação real em produção e sem alteração no Laravel legado. A fase deve provar, por relatórios reconciliáveis, se o Next está pronto para receber catálogo real, imagens, preços, estoque, cupons ativos e frete mínimo. O resultado esperado é um conjunto de requisitos para fonte aprovada, extração somente leitura, normalização, scripts seguros, reconciliação, plano de correção e checklist de aprovação humana para uma importação real futura.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Paridade-Legado-x-Next` | O Next cobre o fluxo comercial central, mas catálogo/dados reais, imagens, preços, estoque, cupons ativos e frete mínimo ainda bloqueiam go-live até dry-run e reconciliação. | 🟢 |
| `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada` | Laravel legado deve seguir somente leitura; importação real, migration real, banco real, upload real e deploy real exigem aprovação humana explícita. | 🟢 |
| `_reversa_sdd/inventory.md#Estado-pos-Fase-13` | A Fase 13 registrou bloqueadores de go-live real e decisões humanas pendentes sem executar alteração funcional ou importação real. | 🟢 |
| `_reversa_sdd/code-analysis.md#products` | O catálogo Next já possui regras de produto público, SKU, slug, preço em centavos, estoque e imagens ordenadas com capa. | 🟢 |
| `_reversa_sdd/code-analysis.md#coupons` | Cupons usam código normalizado, vigência, limite de uso, subtotal mínimo e tipos percentage/fixed/free shipping. | 🟢 |
| `_reversa_sdd/code-analysis.md#shipping` | O frete atual é manual, com CEP normalizado, regras por UF/faixa de CEP e cotação expirada em 30 minutos. | 🟢 |
| `_reversa_sdd/data-dictionary.md#Mapa-de-Migracao-Controlada-Pos-Fase-13` | Categorias, produtos, imagens, cupons ativos e frete mínimo são entidades Must ou Must se ativos, com reconciliação esperada. | 🟢 |
| `_reversa_sdd/migration/data_migration_plan.md#Classificacao-Pos-Fase-13` | A ordem e obrigatoriedade inicial de migração priorizam categorias, produtos, imagens, cupons ativos e frete mínimo. | 🟢 |
| `_reversa_sdd/migration/cutover_plan.md#No-go-Pos-Fase-13` | Catálogo real sem reconciliação, produto publicado sem preço/estoque/SKU/slug/imagem e divergência financeira não explicada impedem avanço. | 🟢 |
| `_reversa_sdd/adrs/008-legacy-parity-e-migracao-controlada.md#Decisao` | Go-live real fica bloqueado até dry-run/reconciliação aprovados dos dados Must; Laravel segue base de rollback. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Responsável técnico da migração | Preparar dry-run seguro e repetível sem tocar em produção | Executa validações locais sobre dados exportados/aprovados e gera relatório de divergências. |
| Responsável de negócio | Decidir se dados de catálogo, cupons e frete estão prontos para go-live | Lê o relatório consolidado e aprova ou bloqueia a próxima etapa. |
| Operador de catálogo | Identificar produtos, imagens, preços ou estoque que exigem correção antes do corte | Usa divergências por entidade para corrigir origem, mapeamento ou cadastro futuro. |
| Operador de logística/comercial | Validar cobertura mínima de frete e campanhas de cupom ativas | Confere regras de UF/CEP, prazos, valores e cupons ativos sem executar venda real. |
| Auditor do Reversa | Confirmar que o Laravel permaneceu somente leitura e que não houve import real | Verifica guardrails, evidências e checklist de aprovação humana. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O dry-run só pode usar fonte de dados explicitamente aprovada por humano e registrada no artefato da fase. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada`
   - Tipo: nova
2. **RN-02:** O Laravel legado é fonte somente leitura; a Fase 14 não pode alterar arquivos, banco, storage ou configuração do legado. 🟢
   - Origem no legado: `_reversa_sdd/adrs/008-legacy-parity-e-migracao-controlada.md#Decisao`
   - Tipo: nova
3. **RN-03:** Scripts e relatórios de dry-run não podem importar dados reais automaticamente no Next, em produção ou em qualquer banco remoto. 🟢
   - Origem no legado: `_reversa_sdd/migration/data_migration_plan.md#Nao-fazer-nesta-etapa`
   - Tipo: nova
4. **RN-04:** Catálogo real, imagens, preços, estoque, cupons ativos e frete mínimo são o conjunto Must de dados para decisão de go-live. 🟢
   - Origem no legado: `_reversa_sdd/data-dictionary.md#Delta-Fase-13`
   - Tipo: nova
5. **RN-05:** Divergência financeira não explicada em preço, desconto, frete ou total deve bloquear aprovação para importação real futura. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada`
   - Tipo: nova
6. **RN-06:** Relatórios versionáveis devem mascarar ou omitir dados pessoais e nunca imprimir secrets, URLs reais de banco ou valores de `.env`. 🟢
   - Origem no legado: `_reversa_sdd/migration/data_migration_plan.md#Estrategia`
   - Tipo: nova
7. **RN-07:** Imagem de produto publicada precisa ter capa correspondente ou fallback aprovado antes de ser considerada reconciliada. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#Catalogo`
   - Tipo: nova
8. **RN-08:** Clientes e pedidos históricos permanecem como decisão humana separada e não bloqueiam a Fase 14 inicial, salvo se forem incluídos por aprovação explícita em fase posterior. 🟡
   - Origem no legado: `_reversa_sdd/domain.md#Paridade-e-Migracao-Controlada`
   - Tipo: nova
9. **RN-09:** A fonte aprovada inicial do dry-run deve ser um conjunto de arquivos locais controlados, preferencialmente CSV/JSON, armazenado fora do Git quando contiver dados reais ou sensíveis. 🟢
   - Origem no legado: decisão humana registrada em `/reversa-clarify` em 2026-07-02
   - Tipo: nova
10. **RN-10:** Imagens devem ser validadas por referência no dry-run inicial; a fase não deve copiar binários reais automaticamente, fazer upload real ou popular storage de produção. 🟢
   - Origem no legado: decisão humana registrada em `/reversa-clarify` em 2026-07-02
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Registrar a fonte aprovada do dry-run como arquivos exportados locais e controlados, preferencialmente CSV/JSON, com tipo, escopo, data de referência, responsável pela aprovação e restrições de uso. | Must | O requirements ou artefato posterior prioriza export manual CSV/JSON, aceita dump sanitizado/local se existir, permite banco local clonado apenas com aprovação posterior e bloqueia conexão automática com banco real. | 🟢 |
| RF-02 | Definir estratégia de extração somente leitura do legado ou de arquivo exportado, proibindo escrita no Laravel, banco real e storage real. | Must | O plano descreve entrada permitida, comandos proibidos e evidência de que nenhuma escrita no legado é necessária. | 🟢 |
| RF-03 | Definir contrato intermediário de dados para categorias, produtos, imagens, preços, estoque, cupons ativos e frete mínimo. | Must | Cada entidade Must tem campos mínimos, chave de reconciliação e regra de normalização documentados. | 🟢 |
| RF-04 | Preparar validação de normalização para o modelo Next sem persistir dados em produção. | Must | A validação aceita dados de entrada aprovados, gera saída/relatório e não executa insert/update/delete remoto. | 🟢 |
| RF-05 | Preparar scripts dry-run seguros que rodem sobre uma pasta local controlada, por exemplo `data/dry-run/input/`, e falhem de forma explícita quando houver risco de import real. | Must | Scripts não exigem credencial real, não imprimem secrets, têm modo dry-run obrigatório por padrão e a pasta de entrada versiona no máximo exemplos seguros ou `.gitkeep`, nunca dados reais sensíveis. | 🟢 |
| RF-06 | Gerar relatório de reconciliação para contagens de produtos, categorias, imagens, preços, estoque, cupons e frete/configurações. | Must | O relatório mostra contagens por entidade, diferenças, severidade e próxima ação sem dados pessoais crus. | 🟢 |
| RF-07 | Detectar divergências bloqueadoras de go-live em SKU/slug, preço em centavos, estoque, status publicado, capa/fallback, cupom ativo e cobertura mínima de frete. | Must | Divergências críticas aparecem como bloqueadoras e impedem aprovação humana para import real futura. | 🟢 |
| RF-08 | Produzir plano de correção antes do go-live para cada divergência bloqueadora encontrada. | Must | Cada divergência bloqueadora tem dono lógico, causa provável, ação recomendada e critério de revalidação. | 🟢 |
| RF-09 | Preparar checklist de aprovação humana para importação real futura, separado de deploy, migration real e go-live. | Must | Checklist exige aceite explícito da fonte, relatório limpo ou exceções aceitas, backup/rollback e janela futura. | 🟢 |
| RF-10 | Confirmar que clientes, endereços e pedidos históricos ficam fora do dry-run Must inicial, salvo decisão humana posterior. | Should | Documento da fase registra que o escopo inicial cobre produtos, categorias, imagens, preços, estoque, cupons e frete mínimo/configurações necessárias, tratando histórico como decisão humana futura. | 🟢 |
| RF-11 | Validar origem e correspondência de imagens por produto por referência, usando caminhos/URLs exportados do legado, pasta local somente leitura se aprovada, relatório de ausentes/inválidas e plano futuro para Blob/storage. | Must | Relatório inclui contagem por produto, status da capa/fallback, referências inválidas ou ausentes e confirma que não houve cópia automática de binários nem upload real. | 🟢 |
| RF-12 | Registrar evidências de segurança da execução: sem `.env`, sem secrets, sem banco real, sem migration real, sem deploy, sem push automático e sem alteração no Laravel. | Must | Validação final da fase lista esses guardrails como preservados ou bloqueia a conclusão. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | O dry-run não pode ler, copiar, imprimir ou versionar `.env`, secrets, credenciais ou URLs reais de banco. | Guardrails de ambiente e plano de migração pós-Fase 13. | 🟢 |
| Segurança | Qualquer conexão com banco real ou leitura controlada do legado exige aprovação humana explícita antes da execução. | ADR 008 e regras de domínio de migração controlada. | 🟢 |
| Privacidade | Relatórios versionáveis devem usar contagens, chaves comerciais e amostras mascaradas, sem dados pessoais crus. | Estratégia do plano de migração de dados. | 🟢 |
| Reprodutibilidade | A execução deve ser repetível sobre a mesma fonte aprovada e gerar diferenças comparáveis entre rodadas. | Necessidade de reconciliação aprovada antes do go-live. | 🟡 |
| Observabilidade | Cada divergência deve carregar entidade, chave de negócio, severidade, impacto no go-live e próxima ação. | Modelo de divergência da Fase 13. | 🟢 |
| Operação | Scripts seguros devem falhar fechados quando a fonte não estiver aprovada ou quando detectarem modo real sem aprovação. | Guardrail contra import real automática. | 🟡 |
| Compatibilidade | A normalização deve respeitar os contratos atuais do Next para catálogo, cupons, frete e imagens. | Code analysis de `products`, `coupons`, `shipping` e data dictionary. | 🟢 |
| Armazenamento local | A pasta `data/dry-run/input/` deve aceitar apenas arquivos locais controlados; dados reais sensíveis não devem ser versionados. | Decisão humana da Fase 14. | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Registrar fonte aprovada antes do dry-run
  Dado que a Fase 14 prepara dados reais ou legados
  Quando arquivos exportados locais em CSV/JSON forem definidos como fonte inicial
  Então a execução do dry-run deve usar essa pasta controlada como entrada
  E deve bloquear conexão automática com banco real ou importação em produção

Cenário: Executar validação segura sem importação real
  Dado uma fonte aprovada em arquivo local ou dump sanitizado/local
  Quando o dry-run processar categorias, produtos, imagens, preços, estoque, cupons e frete
  Então deve gerar relatório de reconciliação
  E não deve executar insert, update, delete, migration real, deploy ou upload real

Cenário: Detectar divergência financeira bloqueadora
  Dado um produto ou cupom com valor divergente entre origem e destino normalizado
  Quando a reconciliação comparar valores em centavos
  Então a divergência deve ser classificada como bloqueadora
  E deve impedir aprovação para importação real futura até correção ou exceção formal

Cenário: Validar imagens do catálogo
  Dado produtos publicados na fonte aprovada
  Quando a reconciliação comparar caminhos, URLs, capa e fallback
  Então cada produto publicado deve ter referência de imagem válida ou fallback aprovado
  E produtos sem cobertura visual devem aparecer como divergência bloqueadora
  E nenhum binário real deve ser copiado ou enviado para storage de produção

Cenário: Preservar Laravel legado somente leitura
  Dado que o Laravel legado é fonte de análise
  Quando a Fase 14 for executada
  Então nenhum arquivo, banco, storage ou configuração do legado deve ser alterado
  E a validação final deve registrar essa garantia

Cenário: Bloquear relatório inseguro
  Dado que dados exportados possam conter informação sensível
  Quando o relatório versionável for gerado
  Então ele não deve conter `.env`, secrets, URL real de banco ou dados pessoais crus
  E deve usar contagens, chaves comerciais e amostras mascaradas quando necessário
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Sem fonte aprovada não existe dry-run controlado. |
| RF-02 | Must | Read-only no legado é guardrail central da fase. |
| RF-03 | Must | O contrato intermediário é necessário para normalização e reconciliação. |
| RF-04 | Must | A fase precisa validar prontidão sem persistir em produção. |
| RF-05 | Must | Scripts inseguros poderiam virar import real acidental. |
| RF-06 | Must | A reconciliação é a prova objetiva de avanço. |
| RF-07 | Must | Divergências bloqueadoras são o principal resultado decisório. |
| RF-08 | Must | Go-live não avança sem plano de correção para bloqueadores. |
| RF-09 | Must | Import real futura exige aceite humano explícito. |
| RF-10 | Should | Histórico de clientes/pedidos precisa estar claro, mas não bloqueia o conjunto Must inicial. |
| RF-11 | Must | Catálogo vendável exige imagem, capa ou fallback aprovado. |
| RF-12 | Must | A fase deve provar ausência de efeitos reais e ausência de secrets. |

## 9. Esclarecimentos

### Sessão 2026-07-02

- **Q:** Qual será a fonte aprovada do dry-run inicial?
  **R:** O dry-run inicial deve usar arquivos exportados locais e controlados, preferencialmente CSV/JSON, gerados a partir de fonte aprovada manualmente. A ordem de preferência é export manual do legado para CSV/JSON, dump sanitizado/local se existir e leitura de banco local clonado somente se aprovada depois. Nesta fase não haverá conexão automática com banco real nem importação de dados reais em produção. O script deve aceitar arquivos locais em uma pasta controlada, como `data/dry-run/input/`, com exemplos seguros ou `.gitkeep`, mas sem versionar dados reais sensíveis.
- **Q:** Qual será a origem validável das imagens no dry-run?
  **R:** O dry-run inicial deve validar imagens por referência, sem migrar binários automaticamente. A ordem de preferência é caminhos/URLs exportados do legado, pasta local de imagens legadas somente leitura se aprovada, relatório de imagens ausentes/inválidas e plano futuro para Blob/storage. Nesta fase não haverá cópia automática de imagens reais para storage de produção nem upload real.
- **Q:** Clientes e pedidos históricos entram no go-live inicial?
  **R:** Não. Clientes e pedidos históricos ficam fora do go-live inicial salvo decisão humana posterior. A Fase 14 foca em produtos, categorias, imagens, preços, estoque, cupons e frete mínimo/configurações necessárias.

## 10. Lacunas

- Nenhuma lacuna bloqueadora pendente após `/reversa-clarify` de 2026-07-02.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-07-02 | Dúvidas de fonte do dry-run, imagens e histórico resolvidas por `/reversa-clarify` | reversa |
