# Database Migrations

Migrations locais sao geradas com Drizzle, mas nao devem ser aplicadas contra banco real sem
validacao humana explicita.

## Scripts

- `pnpm db:generate`: gera SQL local em `drizzle/` a partir de `src/db/schema.ts`.
- `pnpm db:migrate`: exige `DATABASE_URL` e depois executa `drizzle-kit migrate`.
- `pnpm db:studio`: abre Drizzle Studio para inspecao.

`scripts/db/require-database-url.mjs` bloqueia migrate sem alvo configurado e nao imprime secrets.

## Fase 3

A migration local gerada foi `drizzle/0000_shallow_shinko_yamashiro.sql`.

Revisao:

- cria enums, tabelas, FKs e indices iniciais;
- inclui unique de `categories.slug`, `products.slug`, `products.sku`;
- inclui unique N:N de `product_categories`;
- inclui unique parcial de capa em `product_images`;
- nao contem `DROP`, `TRUNCATE` ou operacao destrutiva.

Pendencia segura: aplicar essa migration exige banco Neon de desenvolvimento validado por humano.
Preview/producao ficam fora desta fase.

## Fase 4

A Fase 4 adiciona migration local para `users`, `sessions`, `accounts` e `verifications`, preservando
compatibilidade com o schema anterior. A regra continua a mesma:

- gerar localmente;
- revisar SQL;
- nao aplicar em banco real sem validacao humana;
- nao conectar banco de producao;
- nao expor credenciais.

Migration local gerada: `drizzle/0001_curvy_blink.sql`.
