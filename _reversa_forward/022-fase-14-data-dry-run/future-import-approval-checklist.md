# Checklist de Aprovação Humana para Importação Futura

> Feature: `022-fase-14-data-dry-run`
> Data: `2026-07-02`

## Finalidade

Este checklist existe para uma etapa futura de importação real. Ele não autoriza importação, migration, deploy, upload, banco real ou alteração no Laravel legado durante a Fase 14.

## Pré-condições obrigatórias

- [ ] Fonte local aprovada registrada em `source-approval-template.md`.
- [ ] Arquivos reais mantidos fora do Git em `data/dry-run/input/` ou pasta local equivalente permitida.
- [ ] Nenhum `.env`, secret, token, URL real de banco ou credencial aparece na entrada versionada.
- [ ] Dry-run executado por `pnpm ops:check-data-dry-run` ou comando equivalente seguro.
- [ ] Relatórios gerados em `data/dry-run/output/` e mantidos fora do Git quando contiverem dados reais.
- [ ] Resultado do relatório é `go` ou divergências de `conditional-go` têm exceção formal.
- [ ] Bloqueadores `no-go` foram corrigidos ou reprocessados em novo dry-run.
- [ ] Backup e rollback do ambiente alvo futuro foram planejados antes de qualquer importação real.
- [ ] Janela operacional futura foi aprovada por responsável técnico e responsável de negócio.

## Entidades Must

| Entidade | Critério de aceite antes de import real |
|----------|------------------------------------------|
| Categorias | Slugs únicos, hierarquia resolvida e contagem reconciliada. |
| Produtos | SKU/slug únicos, status mapeado, preço em centavos, estoque e categoria válidos. |
| Imagens | Todo produto publicado tem capa ou fallback aprovado por referência. |
| Cupons | Códigos uppercase, tipo, valor, vigência, uso e subtotal mínimo reconciliados. |
| Frete mínimo | Pelo menos uma regra ativa válida por UF ou faixa de CEP com valor e prazo. |

## Bloqueadores para importação futura

- Produto publicado sem preço positivo, estoque positivo ou `published_at` válido.
- SKU, slug, código de cupom ou regra de frete duplicada.
- Produto apontando para categoria ausente.
- Imagem apontando para produto ausente.
- Produto publicado sem capa e sem fallback aprovado.
- Cupom ativo inválido, vencido sem decisão ou com valor incompatível.
- Ausência de frete mínimo ativo.
- Qualquer divergência financeira sem explicação formal.
- Qualquer detecção de `.env`, secret, token, URL real de banco ou credencial.

## Aprovação explícita

| Papel | Nome | Data | Decisão | Observação |
|-------|------|------|---------|------------|
| Responsável técnico |  |  |  |  |
| Responsável de negócio |  |  |  |  |
| Operação de catálogo |  |  |  |  |

## Proibições preservadas

- Não executar import real nesta fase.
- Não executar migration real nesta fase.
- Não conectar banco real nesta fase.
- Não fazer upload real de imagens nesta fase.
- Não fazer deploy nesta fase.
- Não alterar Laravel legado.
- Não usar credenciais reais em código, docs versionáveis ou logs.

## Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Checklist inicial da Fase 14 | reversa-coding |
