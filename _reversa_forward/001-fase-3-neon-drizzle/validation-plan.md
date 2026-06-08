# Plano de validacao

> Feature: `001-fase-3-neon-drizzle`  
> Data: `2026-06-08`

## 1. Validacoes obrigatorias da futura implementacao

| Categoria | Validacao |
|-----------|-----------|
| Qualidade | `pnpm lint` |
| Tipos | `pnpm typecheck` |
| Unit/integration | `pnpm test` |
| Build | `pnpm build` |
| E2E | `pnpm test:e2e` |

## 2. Casos de teste planejados

| ID | Caso | Resultado esperado |
|----|------|--------------------|
| V-01 | Sem `DATABASE_URL`, repository usa fallback | Leituras retornam fixtures e mutacoes retornam `dev_fallback`. |
| V-02 | Sem `DATABASE_URL`, app faz build/test | Nenhuma validacao exige banco real. |
| V-03 | Com `DATABASE_URL`, repository Drizzle lista produtos reais | Admin e storefront refletem banco local-dev. |
| V-04 | Com `DATABASE_URL`, falha Drizzle nao vira fixture | Erro operacional e reportado. |
| V-05 | Produto publico valido | Apenas `published`, `publishedAt <= now`, `stockQuantity > 0` aparece. |
| V-06 | Produto draft/futuro/sem estoque/inactive | Nao aparece publicamente. |
| V-07 | Admin sem banco | UI informa ausencia de persistencia real. |
| V-08 | Admin em preview/producao sem auth | Mutacao real bloqueada por guardrail. |
| V-09 | Upload sem Blob token | Retorna `blocked/missing_blob_token` e nao persiste metadata. |
| V-10 | Upload com Blob token e banco local-dev | Blob recebe arquivo e metadata e gravada em `product_images`. |
| V-11 | Seed sem `DATABASE_URL` | Falha com mensagem segura. |
| V-12 | Seed com banco local-dev | Cria dados ficticios e imagens placeholder. |
| V-13 | Scripts de banco | `db:generate`, `db:migrate`, `db:studio`, `db:seed` existem no `package.json`. |

## 3. Validacao manual

- Revisar migrations geradas antes de qualquer migrate.
- Conferir que banco alvo e desenvolvimento/local-dev.
- Conferir que docs nao contem secrets.
- Conferir que admin exibe aviso de falta de auth.
- Conferir que placeholders de imagem nao usam assets reais do Laravel.

## 4. Nao validar nesta fase

- Checkout, frete, cupom, pagamento e pedidos.
- Deploy, dominio e producao.
- Auth/policies finais de admin.
- Migracao real de dados ou imagens do Laravel.
