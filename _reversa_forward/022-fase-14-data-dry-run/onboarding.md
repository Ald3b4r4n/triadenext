# Onboarding: Fase 14 - Controlled Data Dry-run and Reconciliation

> Data: `2026-07-02`
> Feature: `022-fase-14-data-dry-run`

## Objetivo

Orientar uma pessoa do time a testar a Fase 14 pela primeira vez com arquivos locais controlados, sem banco real, sem Laravel mutável, sem upload real e sem importação em produção.

## Pré-requisitos

- Estar em `D:\Projetos\triade-essenza-next`.
- Confirmar que não está em `D:\Projetos\triadeessenzaparfum.com.br`.
- Não copiar `.env`.
- Não usar credenciais reais.
- Não colocar dados reais sensíveis no Git.
- Ter fonte aprovada manualmente para os arquivos de dry-run.

## Preparação da entrada

1. Criar ou usar a pasta `data/dry-run/input/`.
2. Manter `.gitkeep` ou exemplos sintéticos versionados.
3. Colocar arquivos reais aprovados apenas localmente e ignorados pelo Git.
4. Usar preferencialmente CSV/JSON com estes nomes:
   - `categories.csv` ou `categories.json`
   - `products.csv` ou `products.json`
   - `product-images.csv` ou `product-images.json`
   - `coupons.csv` ou `coupons.json`
   - `shipping-rules.csv` ou `shipping-rules.json`

## Execução esperada futura

> Os comandos exatos serão definidos em `/reversa-coding`. Este onboarding descreve o fluxo esperado.

1. Rodar verificação de segurança da pasta de entrada.
2. Validar schema e campos obrigatórios.
3. Normalizar dados para formato intermediário Next-compatible.
4. Validar imagens por referência sem copiar binários.
5. Gerar relatório de reconciliação.
6. Revisar divergências bloqueadoras.
7. Preencher checklist de aprovação humana para importação futura.

## O que observar

- Produtos publicados precisam de SKU, slug, preço em centavos, estoque positivo e imagem/fallback aprovado.
- Cupons ativos precisam bater em código, tipo, valor, vigência e limites.
- Frete mínimo precisa cobrir as UFs/faixas de CEP aprovadas.
- Divergências financeiras sem explicação devem bloquear avanço.
- Relatórios não podem conter secrets, `.env`, URL real de banco ou dados pessoais crus.

## Falhas esperadas e resposta

| Falha | Resposta esperada |
|-------|-------------------|
| Arquivo obrigatório ausente | Falhar com mensagem de entidade ausente e sem executar import. |
| Cabeçalho/campo inválido | Listar arquivo, linha/campo e regra violada. |
| Produto publicado sem imagem/fallback | Registrar divergência bloqueadora. |
| Preço/cupom/frete divergente | Registrar divergência HIGH/CRITICAL conforme impacto. |
| Tentativa de banco real ou secret | Falhar fechado e registrar bloqueio de segurança. |

## Validação final esperada

- `git status --short` mostra apenas arquivos planejados/esperados da fase.
- `next-env.d.ts` permanece limpo.
- Nenhum arquivo do Laravel legado foi alterado.
- Nenhuma migration real, conexão real, deploy, upload real ou push foi executado.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-02 | Versão inicial gerada por `/reversa-plan` | reversa |
