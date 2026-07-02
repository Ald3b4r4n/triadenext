# Roadmap: Fase 15 - Approved Data Dry-run Execution and Blocker Fixes

> Identificador: `023-fase-15-approved-data-dry-run`
> Data: `2026-07-02`
> Requirements: `_reversa_forward/023-fase-15-approved-data-dry-run/requirements.md`
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 15 e um delta operacional sobre a Fase 14. O pipeline seguro de dry-run ja existe em `src/features/data-dry-run` e o comando `pnpm ops:check-data-dry-run` ja processa arquivos locais sem banco, importacao, upload, migration ou deploy. Esta fase deve especializar esse fluxo para a primeira execucao aprovada em `data/dry-run/input/primeira-execucao/`.

O plano tem dois caminhos: se os arquivos aprovados estiverem ausentes, a feature registra pendencia e instrui quais CSV/JSON devem ser preparados; se estiverem presentes, executa o dry-run controlado, gera reconciliacao, classifica divergencias e corrige somente bloqueadores que sejam problema do Next. Problemas de dados/exportacao permanecem como pendencia da fonte aprovada.

## 2. Principios aplicados

Nao ha arquivo `.reversa/principles.md` no projeto. Sem principios formais carregados para esta etapa.

| Principio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Guardrails Reversa da feature | Preserva Laravel legado somente leitura, sem `.env`, secrets, banco real, importacao real, upload real, migration, deploy ou push. | respeita |

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confidencia |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Usar `data/dry-run/input/primeira-execucao/` como pasta aprovada da primeira execucao. | Decisao registrada no clarify e alinhada ao guardrail de entradas dentro de `data/dry-run/input/`. | Usar `examples`; ler direto do Laravel; usar dump/banco local automaticamente. | 🟢 |
| D-02 | Manter a pasta real e seus arquivos ignorados pelo Git. | `.gitignore` ja ignora `data/dry-run/input/*`, exceto `.gitkeep` e exemplos sinteticos. | Versionar CSV/JSON reais; copiar arquivos para docs; commitar relatorio bruto. | 🟢 |
| D-03 | Tratar ausencia dos arquivos reais como estado operacional esperado, nao como motivo para inventar dados. | Requirements determina que os arquivos ainda nao devem ser considerados disponiveis. | Criar dados reais fakeados; copiar dados do Laravel; executar examples como se fossem primeira execucao. | 🟢 |
| D-04 | Expandir/validar contrato de arquivos para os nomes da Fase 15 sem quebrar compatibilidade com aliases da Fase 14. | O contrato atual aceita `product-images.*` e `shipping-rules.*`; a Fase 15 espera `product_images.*`, `shipping.*` e `inventory.*`. | Obrigar renome manual sem compatibilidade; ignorar inventory; mudar exemplos sem documentar aliases. | 🟡 |
| D-05 | Separar divergencia por origem: `next`, `dados/exportacao` ou `decisao-humana`. | O objetivo da fase e corrigir somente bloqueadores do Next e devolver problemas de fonte/exportacao para correcao externa. | Corrigir tudo no Next; transformar todo erro em warning; bloquear sem diagnostico acionavel. | 🟢 |
| D-06 | Gerar evidencia sanitizada versionavel apenas quando nao houver dado sensivel. | Regras da Fase 15 permitem apenas exemplos sinteticos e relatorios sanitizados. | Versionar relatorio bruto; nao registrar nenhuma evidencia; imprimir valores sensiveis no terminal. | 🟢 |
| D-07 | Nao introduzir importer real nesta fase. | Importacao real futura exige aprovacao humana, backup/rollback e etapa propria. | Criar script de importacao junto com dry-run; conectar Neon; rodar migrations. | 🟢 |

## 4. Premissas

Nao ha marcadores `[DÚVIDA]` pendentes no `requirements.md`.

| Premissa | Origem (`requirements.md` secao) | Risco se errada |
|----------|----------------------------------|-----------------|
| Arquivos reais/exportados podem nao existir no inicio da implementacao. | Esclarecimentos | O resultado da fase pode ser um pacote de pendencia operacional em vez de reconciliacao real. |
| `primeira-execucao` e o nome aprovado da primeira pasta. | Esclarecimentos | Uma mudanca de nome exigiria atualizar comandos, docs e testes de smoke. |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudanca | Resumo |
|------------|------------------------------|-----------------|--------|
| `data/dry-run/input/primeira-execucao/` | `_reversa_sdd/architecture.md#Dry-run-Controlado-de-Dados` | contrato-alterado | Pasta aprovada da primeira execucao; nao deve versionar dados reais. |
| `src/features/data-dry-run/input-discovery.ts` | `_reversa_sdd/code-analysis.md#data-dry-run` | regra-alterada | Detectar ausencia/presenca da pasta aprovada com mensagem operacional clara. |
| `src/features/data-dry-run/input-contracts.ts` | `_reversa_sdd/data-dictionary.md#Contratos-de-Dry-run-Pos-Fase-14` | contrato-alterado | Aceitar/validar nomes esperados da Fase 15 e aliases existentes da Fase 14. |
| `src/features/data-dry-run/normalizers/*` | `_reversa_sdd/code-analysis.md#data-dry-run` | regra-alterada | Preparar normalizacao para inventario separado quando `inventory.csv/json` estiver presente. |
| `src/features/data-dry-run/reconciliation.ts` | `_reversa_sdd/migration/data_migration_plan.md#Divergencias-Bloqueadoras-do-Dry-run` | regra-alterada | Classificar divergencias por severidade, impacto go-live e origem provavel. |
| `src/features/data-dry-run/report-writer.ts` | `_reversa_sdd/architecture.md#Dry-run-Controlado-de-Dados` | contrato-alterado | Gerar relatorio de pendencia quando inputs reais nao existirem e resumo sanitizado quando aplicavel. |
| `scripts/ops/check-data-dry-run-readiness.mjs` | `_reversa_sdd/dependencies.md` | regra-alterada | Documentar/propagar comando explicito para `primeira-execucao` sem mudar guardrails. |
| `_reversa_forward/023-fase-15-approved-data-dry-run/*` | `requirements.md` da feature | componente-novo | Plano, actions futuras, auditoria, execucao, impacto e watch da fase. |

## 6. Delta no modelo de dados

- Nao ha alteracao em schema de banco, Drizzle, migrations ou entidades persistidas.
- O delta e de contratos locais de arquivo e modelo intermediario em memoria para dry-run.
- A Fase 15 deve introduzir ou consolidar a entidade intermediaria de inventario quando `inventory.csv/json` existir.
- Detalhe completo em: `_reversa_forward/023-fase-15-approved-data-dry-run/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `data-dry-run-files` | arquivo CSV/JSON local | `_reversa_forward/023-fase-15-approved-data-dry-run/interfaces/data-dry-run-files.md` |

## 8. Plano de migracao

1. Confirmar que a execucao aprovada usa apenas `data/dry-run/input/primeira-execucao/`.
2. Nao criar nem versionar dados reais nessa pasta; manter exemplos sinteticos em `data/dry-run/input/examples/`.
3. Ajustar o fluxo para detectar se os arquivos esperados existem.
4. Se os arquivos nao existirem, produzir pendencia operacional com lista de arquivos e campos esperados.
5. Se os arquivos existirem, executar `pnpm ops:check-data-dry-run -- --input data/dry-run/input/primeira-execucao --format both`.
6. Classificar divergencias por dominio, severidade, origem provavel e acao recomendada.
7. Corrigir somente divergencias cujo dono seja `next`.
8. Reexecutar dry-run apos cada correcao de codigo relevante.
9. Gerar resumo sanitizado versionavel ou registrar que o relatorio bruto ficou local/ignorado.
10. Atualizar checklist humano de importacao real futura com go/no-go.

## 9. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| Arquivos reais nao estarem disponiveis | medio | alto | Fechar a fase com pendencia operacional clara, sem inventar dados e sem bloquear o plano tecnico. |
| Contrato de nomes divergir entre export e Fase 14 | alto | medio | Aceitar nomes primarios da Fase 15 e aliases da Fase 14, documentando ambos. |
| Dados reais sensiveis aparecerem em relatorio bruto | alto | medio | Manter `data/dry-run/output/` ignorado e versionar apenas resumo sanitizado. |
| Erro de dados ser corrigido no Next indevidamente | alto | medio | Classificar dono da divergencia antes de qualquer patch. |
| `inventory.csv/json` nao existir no export | alto | medio | Marcar como `INPUT_MISSING`/bloqueador de dados para primeira execucao real, sem mascarar com estoque de produtos salvo decisao humana posterior. |
| Falso no-go por parser estrito demais | medio | medio | Corrigir contrato/parser somente quando o export estiver dentro do formato aprovado. |
| Execucao acidental com examples | medio | baixo | Documentar comando explicito com `--input data/dry-run/input/primeira-execucao`. |

## 10. Criterio de pronto

- [ ] Todas as acoes do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` sem CRITICAL nem HIGH, se executado
- [ ] Pasta aprovada `data/dry-run/input/primeira-execucao/` tratada no fluxo operacional
- [ ] Ausencia de arquivos reais gera pendencia clara e segura
- [ ] Presenca de arquivos reais executa dry-run controlado sem efeitos externos
- [ ] Divergencias classificadas por severidade e origem
- [ ] Bloqueadores do Next corrigidos, se existirem
- [ ] Problemas de dados/exportacao registrados para correcao na fonte
- [ ] Checklist humano de importacao futura atualizado
- [ ] Relatorios brutos com dados reais fora do Git
- [ ] `next-env.d.ts` limpo
- [ ] Nenhum deploy, migration real, banco real, importacao real, upload real, push ou alteracao no Laravel legado

## 11. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-07-02 | Versao inicial gerada por `/reversa-plan` | reversa |
