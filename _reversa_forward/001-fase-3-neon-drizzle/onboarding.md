# Onboarding: testando a Fase 3 pela primeira vez

> Feature: `001-fase-3-neon-drizzle`  
> Este guia e para a futura implementacao. Nao execute migrations contra banco real sem validacao humana.

## 1. Pre-requisitos

- Estar no workspace `D:\Projetos\triade-essenza-next`.
- Nao estar no projeto Laravel legado.
- Ter dependencies instaladas.
- Ter `.env.example` sem valores reais.
- Ter uma decisao humana explicita antes de qualquer `db:migrate` contra banco real.

## 2. Modo sem banco

1. Garantir que `DATABASE_URL` esta ausente.
2. Rodar as validacoes locais permitidas na etapa de implementacao: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`.
3. Abrir storefront e admin.
4. Confirmar que admin informa modo sem persistencia real.
5. Confirmar que qualquer criacao/edicao retorna mensagem de fallback sem dizer que salvou em banco.

## 3. Modo local-dev com banco

1. Configurar `DATABASE_URL` apenas para banco Neon/local-dev permitido.
2. Confirmar que nao e preview/producao.
3. Gerar migrations locais com `pnpm db:generate`.
4. Revisar os arquivos gerados.
5. Somente apos validacao humana, executar `pnpm db:migrate` contra local-dev.
6. Executar `pnpm db:seed`.
7. Abrir `pnpm db:studio` se necessario para inspecao manual.

## 4. Validacao funcional esperada

- Admin lista produtos do banco quando `DATABASE_URL` existe.
- Admin consegue criar/editar apenas em desenvolvimento/local-dev.
- Storefront mostra apenas produto publico valido.
- Produto `draft`, futuro, sem estoque e `inactive` nao aparecem publicamente.
- Upload sem `BLOB_READ_WRITE_TOKEN` fica bloqueado.
- Upload com token e banco persiste metadata em `product_images`.
- Seed cria dados ficticios e imagens placeholder.

## 5. Alertas operacionais

- Nao usar secrets em chat, docs, fixtures, logs ou commits.
- Nao copiar `.env` do Laravel.
- Nao copiar imagens reais do Laravel.
- Nao rodar migrate em producao.
- Nao liberar mutacao real de admin em preview/producao sem auth/policies da Fase 4.

## 6. Saida esperada

Ao final da futura implementacao, o humano deve conseguir alternar entre:

- modo sem banco: app funcional com fallback explicito;
- modo local-dev com banco: persistencia real para catalogo, categorias e imagens placeholder;
- modo sem Blob token: upload bloqueado com mensagem segura.
