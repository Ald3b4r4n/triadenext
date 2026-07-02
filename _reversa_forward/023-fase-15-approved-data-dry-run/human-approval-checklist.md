# Checklist Humano - Importacao Real Futura

## Identificacao

- Feature: `023-fase-15-approved-data-dry-run`
- Execucao aprovada inicial: `primeira-execucao`
- Pasta de entrada: `data/dry-run/input/primeira-execucao/`
- Status esperado sem arquivos reais: `pending-input`

## Guardrails antes de qualquer aprovacao

- [ ] O Laravel legado permaneceu somente leitura.
- [ ] Nenhum `.env` foi copiado.
- [ ] Nenhum secret foi impresso, versionado ou anexado ao relatorio.
- [ ] Nenhum banco real foi conectado.
- [ ] Nenhuma migration real foi rodada.
- [ ] Nenhuma importacao real foi executada.
- [ ] Nenhum upload real de imagens foi executado.
- [ ] Nenhum deploy foi executado.
- [ ] Arquivos reais em `data/dry-run/input/primeira-execucao/` permanecem ignorados pelo Git.
- [ ] Relatorios brutos em `data/dry-run/output/` permanecem ignorados pelo Git.

## Arquivos aprovados esperados

- [ ] `products.csv` ou `products.json`
- [ ] `categories.csv` ou `categories.json`
- [ ] `product_images.csv` ou `product_images.json`
- [ ] `inventory.csv` ou `inventory.json`
- [ ] `shipping.csv` ou `shipping.json`
- [ ] `coupons.csv` ou `coupons.json`, se houver cupons ativos a validar

## Comando de dry-run aprovado

```powershell
pnpm ops:check-data-dry-run -- --input data/dry-run/input/primeira-execucao --format both
```

## Criterios GO

- [ ] Resultado do dry-run: `go`.
- [ ] Bloqueadores: `0`.
- [ ] `UNSAFE_INPUT`: `0`.
- [ ] `INPUT_MISSING`: `0`.
- [ ] Produtos publicados reconciliam categoria, preco, published_at, estoque positivo e imagem/fallback.
- [ ] Imagens referenciam produtos existentes.
- [ ] Inventario referencia SKUs existentes e possui estoque disponivel para produtos publicados.
- [ ] Cupons ativos exportados possuem tipo e valores validos.
- [ ] Frete minimo possui ao menos uma regra ativa com preco positivo.
- [ ] Resumo sanitizado foi revisado sem dados sensiveis.

## Criterios NO-GO

- [ ] Resultado do dry-run: `pending-input`.
- [ ] Resultado do dry-run: `no-go`.
- [ ] Qualquer divergencia CRITICAL ou HIGH sem resolucao.
- [ ] Qualquer indicio de secret, `.env`, token ou URL real de banco.
- [ ] Arquivo obrigatorio ausente.
- [ ] Produto publicado sem estoque positivo.
- [ ] Produto publicado sem imagem/fallback aprovado.
- [ ] Nenhuma regra ativa de frete minimo.
- [ ] Relatorio bruto com dados reais foi parar no Git.

## Separacao de responsabilidades

| Origem | Quem corrige | Exemplos |
| --- | --- | --- |
| `dados` | Fonte/export aprovado | SKU ausente, categoria faltando, preco invalido, imagem sem produto, estoque inconsistente. |
| `next` | Projeto Next | Erro de relatorio, mensagem operacional, bug de reconciliacao ou escrita segura. |
| `mapeamento` | Engenharia + aprovador humano | Campo exportado correto, mas contrato/normalizador ainda nao aceita o formato aprovado. |
| `humana` | Decisao humana | Excecao de go-live, adiar cupom, aceitar fallback temporario, nova fase de importacao. |

## Rollback e seguranca

- A Fase 15 nao executa importacao real; rollback tecnico e remover/ignorar relatorios locais gerados.
- Se houver arquivo real indevidamente versionado, interromper a fase antes de commit e remover do staging/worktree conforme decisao humana.
- Se algum secret aparecer em arquivo, terminal ou relatorio, interromper a fase, invalidar o artefato e tratar como incidente de seguranca.
- Importacao real futura deve ocorrer somente em fase posterior, com aprovacao humana explicita, backup e plano de rollback proprio.

## Decisao humana

- [ ] Aprovado para planejar importacao real futura.
- [ ] Reprovado por pendencia de dados/exportacao.
- [ ] Reprovado por problema do Next a corrigir.
- [ ] Requer decisao humana adicional antes de avancar.

Responsavel:

Data:

Observacoes:
