# Roadmap: Fase 14 - Controlled Data Dry-run and Reconciliation

> Identificador: `022-fase-14-data-dry-run`
> Data: `2026-07-02`
> Requirements: `_reversa_forward/022-fase-14-data-dry-run/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 14 transforma o plano documental de migração controlada em uma trilha técnica para dry-run local e reconciliável. A entrada será uma pasta controlada de arquivos CSV/JSON, preferencialmente `data/dry-run/input/`, com apenas exemplos seguros versionados e dados reais mantidos fora do Git. O processamento deve normalizar categorias, produtos, imagens por referência, preços, estoque, cupons ativos e frete mínimo para contratos compatíveis com o modelo Next, sem persistir em banco real, sem upload real e sem tocar no Laravel legado. A saída será um relatório de reconciliação e divergências que permita decisão humana sobre uma importação real futura.

## 2. Princípios aplicados

Não há `.reversa/principles.md` ativo neste projeto. Foram aplicados os guardrails confirmados nos artefatos Reversa.

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Guardrail de legado somente leitura | O plano trata o Laravel apenas como origem aprovada/manual e não exige comando com efeito colateral no legado. | respeita |
| Guardrail de secrets | Entradas, scripts e relatórios não podem copiar `.env`, imprimir secrets ou versionar dados sensíveis. | respeita |
| Guardrail de operação real | A fase não autoriza deploy, migration real, banco real, import real ou upload real. | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Usar arquivos locais controlados CSV/JSON como fonte inicial do dry-run. | Foi decidido em `/reversa-clarify` e evita conexão automática com banco real ou Laravel. | Conexão direta com banco real; export automático do Laravel; import direto no Next. | 🟢 |
| D-02 | Versionar apenas `.gitkeep` e exemplos sintéticos seguros em `data/dry-run/input/`. | Dados reais sensíveis não podem entrar no Git; exemplos permitem testar parser e documentação. | Versionar CSV real; deixar pasta sem contrato; usar `.env` para apontar fonte real. | 🟢 |
| D-03 | Definir contratos de arquivo por entidade Must. | A reconciliação precisa comparar categorias, produtos, imagens, preços, estoque, cupons e frete com chaves estáveis. | Arquivo único sem schema; leitura ad hoc de dumps; planilhas sem cabeçalho definido. | 🟢 |
| D-04 | Validar imagens por referência, sem copiar binários nem fazer upload. | O requisito exige prova de capa/fallback e ausentes sem storage real. | Upload para Blob; copiar pasta legada; baixar URLs reais durante o dry-run. | 🟢 |
| D-05 | Normalizar valores financeiros para centavos antes de reconciliar. | O modelo Next usa `*_cents` como fonte de cálculo e divergência financeira bloqueia go-live. | Comparar strings monetárias; arredondar no relatório; aceitar decimal sem centavos. | 🟢 |
| D-06 | Gerar relatório versionável sem dados pessoais crus e sem secrets. | A fase precisa ser auditável sem vazar credenciais ou dados sensíveis. | Log completo da entrada; relatório com `.env`; dump bruto como evidência. | 🟢 |
| D-07 | Classificar divergências em bloqueador, decisão humana, pós-go-live e fora de escopo. | A Fase 13 já usa essa taxonomia para go/no-go. | Severidade única; lista sem impacto; aprovação implícita por ausência de erro. | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Nenhuma premissa pendente de dúvida aberta. As decisões foram resolvidas em `/reversa-clarify`. | `## 9. Esclarecimentos` | n/a |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Operational Readiness | `_reversa_sdd/architecture.md#Containers` | componente-alterado | Acrescentar dry-run local seguro como verificação operacional sem efeito externo. |
| Legacy Parity Readiness | `_reversa_sdd/architecture.md#Containers` | componente-alterado | Evoluir de plano documental para contratos de entrada, normalização e reconciliação executáveis. |
| `scripts/ops` | `_reversa_sdd/architecture.md#Componentes-Internos` | componente-alterado | Planejar scripts dry-run seguros sem banco real, deploy, upload ou secrets. |
| `src/features/products` | `_reversa_sdd/code-analysis.md#products` | regra-alterada | Usar regras existentes de produto público, SKU, slug, preço em centavos, estoque e capa como alvo de normalização. |
| `src/features/coupons` | `_reversa_sdd/code-analysis.md#coupons` | regra-alterada | Reconciliar cupons ativos contra normalização de código, tipo, valor e vigência. |
| `src/features/shipping` | `_reversa_sdd/code-analysis.md#shipping` | regra-alterada | Reconciliar frete mínimo/configurações contra regras manuais por UF/faixa de CEP. |
| `src/features/uploads` | `_reversa_sdd/code-analysis.md#uploads` | contrato-alterado | Planejar validação por referência de imagens sem chamar Blob nem mover binários. |

## 6. Delta no modelo de dados

- Resumo das mudanças: não há mudança planejada de schema Drizzle, enum ou migration real. O delta é um modelo intermediário de arquivo e relatório para validar dados Must antes de qualquer importação futura.
- Detalhe completo em: `_reversa_forward/022-fase-14-data-dry-run/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Dry-run input files | arquivo | `_reversa_forward/022-fase-14-data-dry-run/interfaces/dry-run-input-files.md` |
| Reconciliation report | arquivo | `_reversa_forward/022-fase-14-data-dry-run/interfaces/reconciliation-report.md` |

## 8. Plano de migração

1. Criar estrutura segura `data/dry-run/input/` com `.gitkeep` e exemplos sintéticos quando necessário.
2. Definir schemas de entrada CSV/JSON para categorias, produtos, imagens, cupons e frete.
3. Implementar normalizadores locais para converter entrada em formato intermediário Next-compatible.
4. Validar referências de imagem sem copiar binários, sem baixar URLs reais obrigatoriamente e sem upload.
5. Gerar relatório de reconciliação com contagens, chaves, dinheiro, status, assets, severidade e decisão go/no-go.
6. Produzir checklist de aprovação humana para uma importação real futura.
7. Manter import real, migration real, banco real, deploy e upload real fora da Fase 14.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Dados reais sensíveis entrarem no Git | alto | médio | `.gitignore`/documentação para `data/dry-run/input/*`, exemplos sintéticos e relatório mascarado. |
| CSV/JSON manual ficar inconsistente | médio | alto | Schemas com cabeçalhos/campos obrigatórios e erros explícitos por linha/entidade. |
| Divergência financeira por decimal/centavos | alto | médio | Normalizar preço, cupom e frete para centavos antes de reconciliar. |
| Imagens parecerem válidas sem cobertura real | alto | médio | Validar referência, capa, fallback e ausência por produto publicado; não aprovar cobertura implícita. |
| Script acidentalmente conectar banco real | alto | baixo | Não usar `DATABASE_URL`; exigir entrada por arquivo; falhar fechado quando detectar modo real. |
| Relatório virar dump bruto | alto | médio | Restringir saída a contagens, chaves comerciais e amostras mascaradas. |
| Histórico de clientes/pedidos voltar ao escopo | médio | médio | Registrar como decisão humana posterior e manter fora dos contratos Must. |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] Contratos de arquivo e relatório documentados
- [ ] Scripts dry-run seguros planejados/implementados sem escrita real
- [ ] Relatório de reconciliação produzido sem dados sensíveis
- [ ] Checklist de aprovação humana para importação futura criado
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-plan` | reversa |
