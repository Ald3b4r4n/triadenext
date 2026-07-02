# Fase 15 - Approved Data Dry-run Execution and Blocker Fixes

## Identificacao

- Feature ID: `023`
- Feature dir: `_reversa_forward/023-fase-15-approved-data-dry-run`
- Data: 2026-07-02
- Estagio: requirements
- Tipo: macrofase de migracao controlada

## Resumo

Executar o primeiro dry-run controlado com dados exportados e aprovados, usando a estrutura segura criada na Fase 14, para produzir uma reconciliacao real de catalogo, imagens, precos, estoque, cupons e frete minimo. A fase deve separar divergencias causadas por problemas do projeto Next de divergencias causadas por dados/exportacao, corrigindo somente bloqueadores de codigo do Next quando existirem e mantendo importacao real, upload real, banco real, migrations e deploy fora do escopo.

O resultado esperado e um pacote de evidencias sanitizado e rastreavel que permita decisao humana sobre a proxima etapa de importacao real futura.

## Contexto Reversa

| Fonte | Uso nesta fase |
| --- | --- |
| `_reversa_sdd/architecture.md` | Estado arquitetural do pipeline local de dry-run, entradas, saidas, normalizadores, reconciliacao e scripts seguros. |
| `_reversa_sdd/domain.md` | Regras de dominio para go-live, bloqueadores de catalogo real, guardrails contra efeitos reais e limites de versao. |
| `_reversa_sdd/inventory.md` | Inventario pos-Fase 14 com estrutura `data/dry-run/`, script `ops:check-data-dry-run`, exemplos sinteticos e divergencias conhecidas. |
| `_reversa_sdd/code-analysis.md` | Superficie tecnica do modulo `src/features/data-dry-run` e funcoes existentes de carga, normalizacao, reconciliacao e escrita de relatorio. |
| `_reversa_sdd/data-dictionary.md` | Contratos CSV/JSON esperados para categorias, produtos, imagens, cupons e frete. |
| `_reversa_sdd/migration/data_migration_plan.md` | Plano de migracao controlada, status pendente da fonte real aprovada e criterios de reconciliacao. |
| `_reversa_sdd/migration/cutover_plan.md` | Criterios no-go e evidencias necessarias antes de qualquer substituicao do legado. |
| `_reversa_sdd/adrs/009-dry-run-controlado-por-arquivos-locais.md` | Decisao de usar arquivos locais controlados, sem banco real e sem importacao automatica. |

## Objetivos

1. Registrar `data/dry-run/input/primeira-execucao/` como a pasta local aprovada para a primeira execucao real do dry-run.
2. Validar a presenca e o formato dos arquivos CSV/JSON exportados para produtos, categorias, imagens/referencias, precos, estoque, cupons e frete/configuracao minima.
3. Executar o dry-run controlado sem importacao real, sem banco real, sem upload real e sem alterar o Laravel legado.
4. Gerar relatorio de reconciliacao real com contagens, divergencias e classificacao de severidade.
5. Classificar cada divergencia como bloqueadora, nao bloqueadora ou decisao humana.
6. Corrigir bloqueadores somente quando forem problemas do Next, como contrato, parser, normalizador, reconciliacao, mensagens ou relatorio.
7. Separar problemas de dados/exportacao em registro proprio para correcao na fonte aprovada.
8. Atualizar checklist de aprovacao humana para uma importacao real futura.
9. Atualizar artefatos Reversa da execucao, sem introduzir codigo funcional fora da necessidade de corrigir bloqueadores do dry-run.

## Fora de Escopo

- Importar dados em banco real.
- Rodar migration real.
- Conectar banco real.
- Fazer upload real de imagens.
- Fazer deploy real.
- Alterar arquivos ou banco do Laravel legado.
- Copiar `.env` ou usar valores reais de secrets.
- Expor secrets em logs, relatorios, fixtures, documentacao ou terminal.
- Versionar dados reais sensiveis.
- Bling.
- NF-e.
- Rotinas fiscais.
- WhatsApp.
- SMS.
- Redesign.
- Clientes e pedidos historicos, salvo decisao humana explicita posterior.
- Push automatico.

## Regras de Negocio e Guardrails

- RN-01: A primeira fonte aprovada do dry-run deve usar a pasta local controlada `data/dry-run/input/primeira-execucao/`.
- RN-02: Arquivos reais ou sensiveis dentro de `data/dry-run/input/` devem permanecer ignorados pelo Git.
- RN-03: Somente exemplos sinteticos e relatorios explicitamente sanitizados podem ser versionados.
- RN-04: O dry-run deve continuar sem escrita em banco, sem migration, sem importacao real, sem upload de imagens, sem deploy e sem leitura obrigatoria de credenciais reais.
- RN-05: O Laravel legado e fonte somente leitura/analisavel; nenhum arquivo ou banco legado pode ser alterado.
- RN-06: Referencias de imagens devem ser validadas por URL, caminho local ou ambos, conforme vierem no export aprovado; binarios reais nao devem ser copiados nem enviados para storage.
- RN-07: Divergencias de catalogo, imagens, precos, estoque, cupons ativos e frete minimo devem ter severidade explicita e justificativa.
- RN-08: Produtos destinados ao go-live devem reconciliar categoria, preco, estoque, status/publicacao e imagem principal ou fallback aceito.
- RN-09: Cupons ativos e configuracao minima de frete devem reconciliar com regras suficientes para checkout de producao futura.
- RN-10: Bloqueadores causados por dados faltantes, inconsistentes ou export incorreto devem ser registrados para correcao na fonte, nao mascarados no Next.
- RN-11: Bloqueadores causados por lacuna do Next podem ser corrigidos nesta fase, desde que nao mudem regras de negocio de pagamento, estoque, cupons, frete, pedidos ou notificacoes.
- RN-12: Qualquer importacao real futura exige checklist de aprovacao humana, fonte aprovada, backup/rollback e comando explicitamente autorizado em fase posterior.
- RN-13: Se `next-env.d.ts` for alterado automaticamente, deve ser restaurado antes do fechamento da fase.
- RN-14: Enquanto os arquivos reais/exportados ainda nao estiverem disponiveis, a fase deve preparar a pasta aprovada, registrar a pendencia de entrada e gerar instrucoes claras sem inventar dados reais.
- RN-15: Exemplos sinteticos devem permanecer separados da pasta `data/dry-run/input/primeira-execucao/`.

## Requisitos Funcionais

- RF-01: Registrar `primeira-execucao` como nome da primeira execucao aprovada, com pasta esperada em `data/dry-run/input/primeira-execucao/`.
- RF-02: Preparar o fluxo para aceitar os arquivos `products.csv` ou `products.json`, `categories.csv` ou `categories.json`, `product_images.csv` ou `product_images.json`, `inventory.csv` ou `inventory.json`, `coupons.csv` ou `coupons.json` e `shipping.csv` ou `shipping.json`.
- RF-03: Rejeitar a execucao com erro amigavel quando a pasta estiver ausente, vazia, fora de `data/dry-run/input/` ou contiver caminho inseguro.
- RF-04: Quando os arquivos reais/exportados estiverem presentes, executar `pnpm ops:check-data-dry-run` apontando para a pasta aprovada, sem depender de credenciais reais e sem realizar efeitos externos.
- RF-05: Quando os arquivos reais/exportados nao estiverem presentes, nao inventar dados reais, nao copiar dados do Laravel, registrar a pendencia de entrada aprovada e gerar instrucoes dos arquivos esperados.
- RF-06: Gerar relatorio de reconciliacao real em local de saida seguro quando houver arquivos reais/exportados, mantendo arquivos brutos fora do versionamento.
- RF-07: Produzir um resumo sanitizado versionavel quando o relatorio nao contiver dados sensiveis, ou registrar que o relatorio bruto foi mantido localmente e ignorado pelo Git.
- RF-08: Classificar divergencias em bloqueadoras, nao bloqueadoras e decisao humana, com codigo, dominio, contagem afetada e recomendacao.
- RF-09: Identificar divergencias de catalogo real, imagens, precos, estoque, cupons ativos e frete minimo como candidatas a bloqueadoras de go-live.
- RF-10: Marcar divergencias de dados/exportacao como itens de correcao na fonte aprovada, sem alterar regras do Next para acomodar dados ruins.
- RF-11: Corrigir bloqueadores de codigo do Next quando o dry-run revelar falhas em contrato, parser, normalizador, reconciliacao, relatorio ou mensagem operacional.
- RF-12: Reexecutar o dry-run apos qualquer correcao de codigo do Next e comparar o resultado antes/depois.
- RF-13: Atualizar o checklist de aprovacao humana para importacao real futura com criterios de go/no-go baseados no relatorio real ou na pendencia de entrada aprovada.
- RF-14: Atualizar os artefatos Reversa da feature com execucao, divergencias, decisoes, impactos e watch items.
- RF-15: Manter clientes e pedidos historicos fora da execucao inicial, salvo se houver decisao humana explicita em nova fase.

## Requisitos Nao Funcionais

- RNF-01: Seguranca - o fluxo nao deve imprimir secrets, nao deve ler `.env` real e nao deve exigir credenciais reais.
- RNF-02: Privacidade - dados reais sensiveis nao devem ser versionados; evidencias versionaveis precisam ser sanitizadas.
- RNF-03: Rastreabilidade - cada execucao deve ter nome, horario, fonte aprovada, comando usado, resumo de resultado e status go/no-go.
- RNF-04: Reprodutibilidade - a mesma pasta aprovada deve permitir repetir o dry-run e obter relatorio comparavel.
- RNF-05: Ausencia de efeitos colaterais - o fluxo nao deve alterar banco, storage, Laravel legado, deploy ou servicos externos.
- RNF-06: Clareza operacional - erros e divergencias devem indicar acao recomendada para engenharia, dados ou decisao humana.
- RNF-07: Performance - a execucao deve ser suficiente para arquivos exportados reais de catalogo sem travar o fluxo local de QA.

## Criterios de Aceite

- CA-01: Existe `requirements.md` da Fase 15 com escopo, fora de escopo, guardrails e decisoes documentadas.
- CA-02: A fase usa `data/dry-run/input/primeira-execucao/` como pasta aprovada e impede execucoes inseguras.
- CA-03: O dry-run real gera relatorio de reconciliacao sem importacao real, sem banco real, sem upload real, sem migration e sem deploy.
- CA-04: Divergencias de produtos, categorias, imagens, precos, estoque, cupons e frete sao classificadas por severidade e origem.
- CA-05: Problemas do Next e problemas de dados/exportacao ficam separados.
- CA-06: Bloqueadores de codigo do Next, se existirem, sao corrigidos e validados por nova execucao.
- CA-07: Relatorios brutos com dados reais permanecem fora do Git; apenas resumo sanitizado pode ser versionado.
- CA-08: Checklist de aprovacao humana para importacao real futura fica atualizado.
- CA-09: Nenhuma alteracao e feita no Laravel legado.
- CA-10: Nenhum push e feito automaticamente.
- CA-11: Se os arquivos reais/exportados ainda nao estiverem presentes, a fase registra a pendencia e documenta quais arquivos devem ser colocados na pasta aprovada.

## Cenários BDD

```gherkin
Feature: Dry-run aprovado de dados reais/exportados

  Scenario: Arquivos reais ainda nao estao disponiveis
    Given que a pasta aprovada e data/dry-run/input/primeira-execucao/
    And os arquivos reais/exportados ainda nao estao disponiveis
    When o operador tenta iniciar o dry-run real
    Then nenhum dado real deve ser inventado
    And nenhum dado do Laravel deve ser copiado
    And a pendencia de entrada aprovada deve ser registrada
    And as instrucoes dos arquivos esperados devem ser apresentadas

  Scenario: Dry-run com arquivos aprovados e validos
    Given que data/dry-run/input/primeira-execucao/ contem CSV/JSON de catalogo, imagens, precos, estoque, cupons e frete
    When o operador executa o dry-run controlado
    Then um relatorio de reconciliacao deve ser gerado
    And nenhum dado deve ser importado em banco real
    And nenhum upload de imagem deve ser realizado

  Scenario: Divergencia causada por problema de dados
    Given que o export aprovado contem produto publicado sem preco valido
    When o dry-run classifica a divergencia
    Then a divergencia deve ser marcada como bloqueadora de dados/exportacao
    And o Next nao deve alterar regra de preco para aceitar o dado invalido

  Scenario: Divergencia causada por problema do Next
    Given que o export aprovado esta correto
    And o normalizador do Next interpreta incorretamente um campo aceito pelo contrato
    When o dry-run gera divergencia bloqueadora
    Then a correcao pode ser feita no codigo do Next
    And o dry-run deve ser reexecutado apos a correcao

  Scenario: Relatorio bruto contem dados sensiveis
    Given que a reconciliacao real contem identificadores ou valores sensiveis
    When a fase prepara evidencias versionaveis
    Then o relatorio bruto deve permanecer ignorado pelo Git
    And apenas um resumo sanitizado pode ser versionado
```

## Priorizacao MoSCoW

### Must

- Usar `data/dry-run/input/primeira-execucao/` como fonte/pasta aprovada da primeira execucao.
- Validar arquivos CSV/JSON reais/exportados.
- Registrar pendencia clara quando os arquivos reais/exportados ainda nao existirem.
- Rodar dry-run controlado sem efeitos reais.
- Gerar reconciliacao real.
- Classificar divergencias e bloqueadores.
- Corrigir bloqueadores do Next, se existirem.
- Separar problemas de dados/exportacao.
- Manter dados reais sensiveis fora do Git.
- Atualizar checklist de aprovacao humana.

### Should

- Gerar resumo sanitizado versionavel.
- Registrar comparativo antes/depois quando houver correcao de codigo.
- Atualizar regression-watch e impacto legado.
- Confirmar que `next-env.d.ts` permanece limpo.

### Could

- Adicionar exemplos sinteticos complementares se o export real revelar formato recorrente ainda nao coberto.
- Melhorar mensagens operacionais sem alterar regra de negocio.

### Won't

- Importar dados reais.
- Rodar migrations reais.
- Conectar banco real.
- Fazer upload real.
- Fazer deploy.
- Alterar Laravel legado.
- Incluir clientes e pedidos historicos.
- Integrar Bling, NF-e, WhatsApp ou SMS.

## Esclarecimentos

### Sessao 2026-07-02

- **Q:** Qual e o nome da pasta local aprovada para a primeira execucao em `data/dry-run/input/<nome-da-execucao>/` e os arquivos CSV/JSON exportados ja estao disponiveis nessa pasta?
  **R:** A primeira execucao aprovada sera `primeira-execucao`, com pasta esperada em `data/dry-run/input/primeira-execucao/`. Os arquivos reais/exportados ainda nao devem ser considerados disponiveis. A fase deve preparar o fluxo para rodar o dry-run quando os arquivos existirem e, se eles ainda nao existirem, registrar a pendencia sem inventar dados reais, sem copiar dados do Laravel e mantendo exemplos sinteticos separados. Os arquivos esperados sao `products.csv` ou `products.json`, `categories.csv` ou `categories.json`, `product_images.csv` ou `product_images.json`, `inventory.csv` ou `inventory.json`, `coupons.csv` ou `coupons.json` e `shipping.csv` ou `shipping.json`.

## Lacunas e Duvidas

- Nenhuma duvida bloqueadora pendente.

## Historico

- 2026-07-02: Requirements iniciais criados para a Fase 15 com uma duvida bloqueadora sobre a fonte aprovada do dry-run real.
- 2026-07-02: Duvida bloqueadora resolvida: primeira execucao aprovada definida como `primeira-execucao`; arquivos reais/exportados ainda nao considerados disponiveis.
