# Roadmap: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`
> Data: `2026-07-01`
> Requirements: `_reversa_forward/021-fase-13-legacy-parity/requirements.md`
> Confianca: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 13 deve funcionar como uma macrofase de decisao de substituicao, nao como mais uma microfeature. O plano e comparar o Laravel legado em modo read-only com o Next atual por dominio de negocio, gerar uma matriz de paridade, classificar lacunas, mapear dados migraveis e preparar dry-run/reconciliacao sem tocar em banco real. O Laravel entra apenas como fonte de inventario de rotas, controllers, actions, migrations, views, specs e assets. O Next entra como alvo atual, com SDD pos-Fase 12, scripts operacionais seguros e testes existentes. O resultado esperado e um pacote de evidencias para decidir um go-live futuro, com bloqueadores reais separados de itens pos-go-live.

## 2. Principios aplicados

| Principio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Guardrail Reversa do projeto | A fase escreve artefatos apenas em `_reversa_forward/021-*` durante planejamento; Laravel legado e codigo funcional permanecem intocados. | respeita |
| Readiness seguro pos-Fase 12 | O plano reaproveita `ops:*`, checklists e politicas de nao imprimir secrets, nao conectar banco real e nao executar deploy/migration real. | respeita |
| Paridade por evidencia | A substituicao do Laravel deve ser provada por matriz, divergencias, dry-run e smoke, nao por intuicao. | respeita |

Nenhum arquivo `.reversa/principles.md` foi encontrado; portanto nao ha conflito formal de principios ativos.

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confianca |
|----|---------|---------------|--------------------------|-----------|
| D-01 | Comparar por dominio funcional: storefront, catalogo, produto, categoria, imagem, carrinho, cupom, frete, checkout, pedido, cliente, admin, integracoes e dados. | O SDD confirma que o Next cobre fluxo comercial central, mas o legado tem dominios adicionais como Bling, NF-e, frete real, relatorios e backoffice ampliado. | Comparar apenas por rotas; comparar apenas por tabelas. | 🟢 |
| D-02 | Tratar o Laravel como fonte read-only de arquivos e metadados, sem `.env`, sem comandos artisan, sem banco e sem escrita. | O usuario proibiu alteracao no legado e a Fase 12 reforcou guardrails contra secrets/banco/deploy. | Rodar migrations, seeders ou comandos de auditoria dentro do Laravel. | 🟢 |
| D-03 | Produzir uma matriz de paridade com status `substituido`, `parcial`, `ausente`, `fora-do-go-live`, `decisao-humana` e `bloqueador`. | O objetivo e decidir substituicao com clareza operacional. | Usar apenas checklist binario sim/nao. | 🟢 |
| D-04 | Preparar migracao por dry-run e formato intermediario sanitizado, sem importacao real. | O plano legado existente ja recomenda export read-only, formato intermediario, ambiente isolado e reconciliacao. | Importacao direta do banco legado para Neon. | 🟢 |
| D-05 | Reconciliar por contagem, chaves comerciais, amostras mascaradas e checksums seguros quando viaveis. | Integridade de catalogo, clientes, cupons, frete e pedidos precisa ser comprovada antes de go-live. | Validar apenas manualmente por telas. | 🟡 |
| D-06 | Classificar bloqueador por impacto no fluxo de venda, integridade financeira, seguranca, privacidade ou catalogo vendavel. | Nem toda diferenca do Laravel deve bloquear o corte; Bling/NF-e/WhatsApp/SMS seguem fora de escopo. | Exigir paridade total do Laravel antes de qualquer go-live. | 🟢 |
| D-07 | Nao criar contrato externo novo nesta fase de planejamento. | A fase define relatorios e possiveis scripts futuros; nao adiciona HTTP/API/fila/GraphQL. | Criar interface externa prematura para importacao real. | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` secao) | Risco se errada |
|----------|----------------------------------|-----------------|
| Nao ha duvidas bloqueadoras antes do plano. | Secao 10 | Baixo; eventuais decisoes podem virar itens `decisao-humana` no actions. |
| A primeira comparacao usa arquivos e specs do Laravel sem banco real. | Secoes 4, 5 e 6 | Medio; lacunas de dados reais podem exigir etapa posterior aprovada. |
| Bling, NF-e, WhatsApp e SMS nao bloqueiam a Fase 13, mas devem ser marcados na matriz. | Secoes 4 e 5 | Baixo; se negocio decidir que fiscal e bloqueador, isso vira decisao humana antes do go-live. |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudanca | Resumo |
|------------|------------------------------|-----------------|--------|
| `Operational Readiness` | `_reversa_sdd/architecture.md#Containers` | regra-alterada | Amplia readiness para incluir paridade legado x Next e dry-run de migracao controlada. |
| `Domain Modules` | `_reversa_sdd/architecture.md#Componentes-Internos` | regra-nova | Cada dominio ganha criterio de paridade e classificacao de lacuna. |
| `Database` | `_reversa_sdd/data-dictionary.md#Tabelas` | delta-de-dados | Nao muda schema nesta fase; cria mapa de origem/destino e reconciliacao. |
| `Blob Storage` | `_reversa_sdd/architecture.md#Integracoes-Externas` | regra-nova | Imagens legadas entram como inventario e correspondencia, sem upload real automatico. |
| `Stripe` | `_reversa_sdd/domain.md#Pagamento` | regra-preservada | PaymentIntent/webhook seguem como fonte financeira; smoke usa test/mock, nunca live mode. |
| `Laravel legado` | `D:\Projetos\triadeessenzaparfum.com.br` | fonte-read-only | Entra como fonte de analise de rotas, migrations, views, actions, specs e assets. |

## 6. Delta no modelo de dados

- Resumo das mudancas: nao ha schema novo planejado nesta etapa. O delta e um mapa conceitual de migracao, reconciliacao e classificacao de lacunas entre tabelas/entidades Laravel e tabelas Next.
- Entidades criticas: categorias, produtos, imagens, clientes, enderecos, cupons, regras de frete, pedidos, itens, pagamentos/status, notificacoes e dados administrativos.
- Detalhe completo em: `_reversa_forward/021-fase-13-legacy-parity/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| n/a | n/a | n/a |

Nenhum contrato externo novo deve ser criado no planejamento. Possiveis scripts dry-run futuros serao comandos locais seguros e deverao ser detalhados em `actions.md`, nao em `interfaces/`, salvo se uma etapa posterior decidir por um formato de arquivo formal.

## 8. Plano de migracao

1. Confirmar workspace Next e caminho Laravel legado; registrar guardrails de leitura read-only.
2. Inventariar superficie Laravel sem `.env`: rotas, controllers/actions, migrations, views, specs, docs e assets publicos.
3. Inventariar capacidades Next atuais a partir de SDD, rotas, features, docs operacionais e testes.
4. Montar matriz de paridade por dominio, com evidencias de ambos os lados.
5. Classificar lacunas em bloqueador, pos-go-live, fora de escopo ou decisao humana.
6. Mapear entidades de dados: origem Laravel, destino Next, campos minimos, transformacoes e riscos.
7. Definir dry-run seguro: entrada sanitizada, formato intermediario, validacoes, amostras mascaradas e zero escrita em producao.
8. Definir reconciliacao: contagens, chaves, checksums seguros e relatorio de divergencias.
9. Preparar checklist de substituicao: pre-go-live, janela, smoke final, rollback e criterio avancar/abortar.
10. Gerar regression-watch para preservar guardrails: Laravel read-only, sem secrets, sem import real, sem migration real, sem deploy.

## 9. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| Ler ou vazar `.env`/secrets do legado por acidente | alto | baixo | Excluir `.env*`, mascarar valores, listar apenas nomes de variaveis quando necessario. |
| Confundir lacuna fora de escopo com bloqueador real | alto | medio | Usar taxonomia fixa e exigir justificativa por dominio. |
| Dados historicos de pedidos/clientes serem maiores que o necessario para go-live | medio | medio | Separar migracao obrigatoria de historico opcional e decisao humana. |
| Imagens legadas nao mapearem 1:1 para Blob/Next | medio | medio | Inventario de assets, capa, fallback e upload real somente com aprovacao. |
| Fiscal/Bling/NF-e serem considerados obrigatorios pelo negocio depois | alto | medio | Marcar explicitamente como fora de escopo tecnico atual e decisao humana de go-live. |
| Reconciliacao sem banco real ter evidencia parcial | medio | medio | Planejar dry-run em ambiente isolado aprovado antes de importacao real. |
| Next substituir fluxo de venda, mas admin operacional ficar inferior ao Laravel | alto | medio | Matriz separa storefront/comercial de backoffice e classifica pos-go-live vs bloqueador. |

## 10. Criterio de pronto

- [ ] `roadmap.md`, `investigation.md`, `data-delta.md` e `onboarding.md` criados.
- [ ] `actions.md` gerado e auditado antes de implementacao.
- [ ] Matriz de paridade planejada por dominio com taxonomia de lacunas.
- [ ] Estrategia de inventario de dados legados documentada sem leitura de `.env`.
- [ ] Estrategia de dry-run e reconciliacao documentada sem banco real.
- [ ] Checklist de substituicao e rollback planejado.
- [ ] `cross-check.md` sem CRITICAL nem HIGH, se `/reversa-audit` for executado.
- [ ] `regression-watch.md` gerado durante `/reversa-coding`.

## 11. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-07-01 | Versao inicial gerada por `/reversa-plan` | reversa |
