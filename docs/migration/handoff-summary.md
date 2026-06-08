# Handoff Summary

Esta reconstrucao usa como fonte de verdade inicial os documentos do Reversa gerados no legado Laravel em:

`D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd\migration`

O objetivo da fundacao e preparar o workspace Next.js isolado, sem copiar o Laravel, secrets, banco local, `vendor`, `storage` ou arquivos privados.

Decisoes trazidas para esta fase:

- `inactive` e tratado inicialmente como inativo/arquivado, pendente validacao humana.
- Imagens de produto e documentos fiscais devem usar Vercel Blob.
- Stripe real permanece desativado ate a fase de checkout/pagamentos.
- Frete deve ser extensivel para manual, Melhor Envio, Jadlog e Correios.
- RBAC inicial usa `customer`, `admin` e `manager`.

## Fase 1 — Catalogo, Produtos e Imagens

A Fase 1 implementa a base funcional de catalogo no workspace Next.js:

- Dominio testavel em `src/features/products` para produto publico, slug, preco e imagens.
- Storefront de `/produtos` e `/produto/[slug]` usando fixtures temporarias enquanto Neon nao esta conectado.
- Admin `/admin/produtos` como estrutura inicial de leitura, sem criacao/edicao real.
- Upload de imagem preparado para Vercel Blob, bloqueado quando `BLOB_READ_WRITE_TOKEN` nao existe.

Observacao de handoff: o caminho informado
`D:\Projetos\triadeessenzaparfum.com.br_reversa_sdd` nao existia nesta maquina. Os artefatos foram lidos em
`D:\Projetos\triadeessenzaparfum.com.br\_reversa_sdd`, sem modificar o projeto legado.
