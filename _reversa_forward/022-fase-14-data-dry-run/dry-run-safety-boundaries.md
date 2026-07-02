# Dry-run Safety Boundaries

> Feature: `022-fase-14-data-dry-run`
> Data: `2026-07-02`

## Workspace confirmado

- Projeto Next: `D:\Projetos\triade-essenza-next`.
- Laravel legado: `D:\Projetos\triadeessenzaparfum.com.br`.
- A Fase 14 trabalha no projeto Next e trata o Laravel legado somente como fonte aprovada/manual de leitura.

## Guardrails obrigatórios

- Não alterar arquivos do Laravel legado.
- Não copiar `.env`.
- Não expor secrets.
- Não conectar banco real.
- Não importar dados reais automaticamente.
- Não fazer upload real de imagens.
- Não rodar migrations reais.
- Não fazer deploy.
- Não fazer push.
- Não versionar dados reais sensíveis.
- Restaurar `next-env.d.ts` se o Next sujar o arquivo automaticamente.

## Escopo de dados Must

- Categorias.
- Produtos.
- Imagens por referência.
- Preços.
- Estoque.
- Cupons ativos.
- Frete mínimo/configurações necessárias.

## Fora de escopo operacional

- Clientes, endereços e pedidos históricos.
- Bling, NF-e, WhatsApp e SMS.
- Importação real em produção.
- Migration real.
- Deploy real.
- Banco real sem aprovação humana explícita.
- Upload real para Blob/storage.

## Evidência inicial

Esta fase parte de `requirements.md`, `roadmap.md`, `data-delta.md`, `interfaces/` e `actions.md` aprovados por `audit/cross-check.md`, com veredito aprovado e zero findings.
