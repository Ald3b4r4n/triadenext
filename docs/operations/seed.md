# Seed

O seed de desenvolvimento fica em `scripts/db/seed.mjs`.

## Como executar

Use `pnpm db:seed` somente com `DATABASE_URL` apontando para Neon de desenvolvimento/local-dev.

Sem `DATABASE_URL`, o script falha com mensagem segura:

```text
DATABASE_URL ausente. Seed bloqueado sem conectar banco real.
```

## Dados criados

O seed usa somente dados ficticios:

- categorias `Dev Florais` e `Dev Arquivada`;
- produto publicado;
- produto draft;
- produto com publicacao futura;
- produto publicado sem estoque;
- produto inactive;
- imagem placeholder `https://placehold.co/...`.

Os slugs e IDs sao estaveis para permitir reexecucao idempotente. Nenhuma imagem, preco, SKU ou
descricao do Laravel legado e copiada.
