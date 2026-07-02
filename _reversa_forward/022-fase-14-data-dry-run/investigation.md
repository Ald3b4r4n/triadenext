# Investigation: Fase 14 - Controlled Data Dry-run and Reconciliation

> Data: `2026-07-02`
> Feature: `022-fase-14-data-dry-run`

## Fontes internas consultadas

| Fonte | Uso no plano |
|-------|--------------|
| `_reversa_sdd/architecture.md#Paridade-Legado-x-Next` | Identificar bloqueadores reais de go-live e containers afetados. |
| `_reversa_sdd/code-analysis.md#products` | Confirmar regras de produto público, SKU, slug, preço, estoque e imagem de capa. |
| `_reversa_sdd/code-analysis.md#coupons` | Confirmar normalização de cupom, tipos, vigência e limites. |
| `_reversa_sdd/code-analysis.md#shipping` | Confirmar frete manual por UF/faixa de CEP e CEP normalizado. |
| `_reversa_sdd/code-analysis.md#uploads` | Confirmar que upload real exige Blob token e não deve entrar nesta fase. |
| `_reversa_sdd/data-dictionary.md#Mapa-de-Migracao-Controlada-Pos-Fase-13` | Mapear entidades Must e destino Next. |
| `_reversa_sdd/migration/data_migration_plan.md#Classificacao-Pos-Fase-13` | Reusar classificação Must/decisão humana/fora de escopo. |
| `_reversa_sdd/migration/cutover_plan.md#No-go-Pos-Fase-13` | Definir critérios de bloqueio para go-live posterior. |
| `_reversa_forward/021-fase-13-legacy-parity/controlled-migration-plan.md` | Herdar formato intermediário e gates de segurança. |
| `_reversa_forward/021-fase-13-legacy-parity/dry-run-reconciliation.md` | Herdar dimensões de reconciliação: counts, keys, money, statuses, assets e privacy. |
| `_reversa_forward/021-fase-13-legacy-parity/divergence-report-model.md` | Herdar modelo de severidade e impacto go-live. |

## Alternativas avaliadas

| Alternativa | Decisão | Motivo |
|-------------|---------|--------|
| Leitura direta do banco legado | Descartada nesta fase | Exigiria aprovação adicional e aumentaria risco de conexão com banco real. |
| Dump sanitizado/local | Aceita como alternativa secundária | Pode ser seguro se já existir e se não exigir segredo ou banco real. |
| Export manual CSV/JSON | Escolhida | Atende ao requisito de fonte local controlada e reduz efeito colateral. |
| Upload de imagens para Blob | Descartado | Upload real está fora do escopo e exigiria token/provider real. |
| Validação de imagens por referência | Escolhida | Permite detectar ausentes/capa/fallback sem copiar binários. |
| Import para banco Next local | Adiado | A fase atual exige dry-run sem importação real automática; pode ser fase futura com aprovação. |
| Relatório bruto com linhas completas | Descartado | Pode expor dados sensíveis e torna o artefato impróprio para Git. |

## Padrões aplicáveis

- Entrada por arquivo com contrato explícito e erro determinístico por linha.
- Saída versionável sem dados pessoais crus.
- Normalização antes de comparação, especialmente dinheiro em centavos e códigos uppercase.
- Go/no-go separado de execução real.
- Falha fechada quando detectar env real, segredo ou tentativa de provider externo.

## Questões resolvidas

- A fonte inicial será arquivo local controlado em CSV/JSON.
- `data/dry-run/input/` aceita exemplos seguros ou `.gitkeep`, mas não dados reais sensíveis.
- Imagens serão validadas por referência.
- Clientes e pedidos históricos ficam fora do escopo Must inicial.

## Pontos de atenção para implementação

- Definir `.gitignore` de dados reais antes de criar exemplos.
- Separar contratos de entrada de relatórios de saída.
- Evitar dependência em pacote novo se parser simples CSV/JSON for suficiente.
- Reusar utilitários existentes de dinheiro/slug quando a implementação ocorrer.
- Nunca usar `.env` real para localizar fonte de dados.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-plan` | reversa |
