# Roadmap: Fase 3 - Neon, Drizzle, migrations locais, seed controlado e persistencia real

> Identificador: `001-fase-3-neon-drizzle`  
> Data: `2026-06-08`  
> Requirements: `_reversa_forward/001-fase-3-neon-drizzle/requirements.md`  
> Confidencia: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A Fase 3 transforma a persistencia preparada das Fases 1 e 2 em persistencia real de catalogo quando `DATABASE_URL` existir, preservando fallback explicito quando o banco estiver ausente. O delta tecnico concentra-se em cinco frentes: modo de banco/fallback, repository Drizzle completo, migrations locais revisadas, seed controlado de desenvolvimento e persistencia de metadata de imagens. Storefront e admin continuam consumindo services/repository, mas passam a refletir dados reais quando o banco esta disponivel. Migrations podem ser geradas localmente, mas nenhuma aplicacao em banco real entra sem validacao humana. Mutacoes reais no admin ficam restritas a ambiente de desenvolvimento enquanto a Fase 4 de auth/policies nao existir.

## 2. Principios aplicados

| Principio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Guardrail Reversa: nao modificar legado | O plano usa o Laravel apenas como referencia e nao toca em `D:\Projetos\triadeessenzaparfum.com.br`. | respeita |
| Fallback explicito | O plano preserva fixtures apenas quando `DATABASE_URL` esta ausente e impede falsa persistencia. | respeita |
| Segredos fora do repositorio | O plano nao exige copiar `.env`, nao documenta valores reais e trata `DATABASE_URL`/tokens como flags booleanas em UI/logs. | respeita |
| Paridade de catalogo | O plano preserva produto publico por `published`, `publishedAt <= now` e `stockQuantity > 0`. | respeita |

## 3. Decisoes tecnicas

| ID | Decisao | Justificativa | Alternativas descartadas | Confidencia |
|----|---------|---------------|--------------------------|-------------|
| D-01 | Manter `db === null` como sinal unico de ausencia de banco. | `src/db/client.ts` ja usa este contrato e services/repository podem roteiar fallback sem quebrar build/test. | Lancar erro no import; exigir banco para build/test. | 🟢 |
| D-02 | Criar helper de modo de runtime para distinguir `database`, `fallback`, `development`, `preview` e `production`. | O admin precisa bloquear mutacoes reais fora de desenvolvimento sem auth/policies. | Espalhar checagens de env em componentes/actions. | 🟢 |
| D-03 | Completar `createDrizzleProductRepository` para leituras e joins reais. | O repository atual grava parcialmente, mas ainda le fixtures nas leituras mesmo com `db` disponivel. | Manter fixtures ate auth; consultar banco direto nas paginas. | 🟢 |
| D-04 | Converter rows Drizzle para os tipos de dominio `Product`, `Category` e `ProductImage`. | Storefront/admin ja dependem destes tipos e das regras em `domain.ts`. | Criar tipos paralelos para banco; alterar componentes para rows brutas. | 🟢 |
| D-05 | Executar criacao/edicao de produto, categorias e imagens em transacao quando houver multiplas tabelas. | Evita produto persistido sem vinculos ou capa inconsistente. | Operacoes independentes sem rollback coordenado. | 🟡 |
| D-06 | Gerar migrations locais via Drizzle, mas nao rodar `db:migrate` contra banco real sem validacao humana. | Requisito clarificado e guardrail operacional. | Rodar migration automaticamente; postergar migrations. | 🟢 |
| D-07 | Criar seed de desenvolvimento idempotente ou explicitamente reexecutavel com upsert. | Permite preparar banco local/dev sem dados reais e sem duplicidades. | Seed one-shot fragil; usar fixtures diretamente como banco. | 🟢 |
| D-08 | Usar imagens placeholder seguras no seed, sem copiar assets do Laravel. | Decisao humana da clarificacao e evita vazamento/migracao prematura. | Copiar imagens reais; seed sem imagens. | 🟢 |
| D-09 | Persistir metadata de imagem apenas apos upload real bem-sucedido e banco disponivel. | `uploads-plan.md` e docs locais exigem binario fora do banco. | Gravar metadata antes do Blob; salvar binario no banco. | 🟢 |
| D-10 | Atualizar docs operacionais junto com o codigo da fase. | A feature muda comandos, modos de ambiente e rotina de seed/migrations. | Documentar apenas depois da implementacao. | 🟢 |

## 4. Premissas

Nao ha premissas oriundas de marcadores `[DOUBT]` ou `[DÚVIDA]` nao resolvidos. As cinco duvidas foram respondidas em `doubts.md` e integradas ao requirements.

## 5. Delta arquitetural

| Componente | Fonte | Tipo de mudanca | Resumo |
|------------|-------|-----------------|--------|
| `src/db/client.ts` | `_reversa_sdd/inventory.md#Fundacao` | contrato-alterado | Manter `db` opcional e expor modo seguro de conexao sem exigir banco para build/test. |
| `drizzle.config.ts` | `docs/operations/neon.md#Neon` | contrato-alterado | Ajustar fluxo de generate/migrate para local/dev sem segredos e sem aplicacao automatica em banco real. |
| `src/db/schema.ts` | `docs/architecture/database.md#Fase 1 - Catalogo` | regra-alterada | Revisar indices, unique constraints e consistencia das tabelas de catalogo/imagens. |
| `src/features/products/server/product-repository.ts` | `docs/architecture/database.md#Fase 2 - Persistencia Preparada` | componente-alterado | Trocar leituras Drizzle de fixtures para queries reais e adicionar imagens/categorias. |
| `src/features/products/server/product-service.ts` | `docs/features/catalog-products-images.md#Decisoes implementadas` | regra-alterada | Preservar filtros publicos com dados reais ou fallback. |
| `src/features/products/server/product-actions.ts` | `docs/features/admin-products.md#Como o admin cria e edita produto` | contrato-alterado | Propagar estados de persisted, dev_fallback e bloqueio por ambiente sem prometer gravacao falsa. |
| `src/features/uploads/product-image-upload.ts` | `docs/architecture/uploads.md#Fase 2 - Upload Controlado` | contrato-alterado | Integrar resultado uploaded com persistencia de metadata em `product_images`. |
| Storefront `/produtos` e `/produto/[slug]` | `docs/features/catalog-products-images.md#Escopo` | comportamento-alterado | Consumir dados reais via service quando banco existe, mantendo fallback sem banco. |
| Admin `/admin/produtos*` | `docs/features/admin-products.md#Escopo` | comportamento-alterado | Indicar modo sem banco e bloquear mutacoes reais fora de desenvolvimento sem auth. |

## 6. Delta no modelo de dados

Resumo das mudancas: a Fase 3 nao cria um novo dominio, mas consolida o schema de catalogo existente para uso real em Neon/Drizzle. O foco e revisar `categories`, `products`, `product_images` e `product_categories`; adicionar/confirmar indices e constraints para `slug`, `sku`, relacao N:N e capa; e garantir que os tipos Drizzle convertam corretamente para os tipos de dominio. O detalhe completo vive em `data-delta.md`.

Detalhe completo em: `_reversa_forward/001-fase-3-neon-drizzle/data-delta.md`

## 7. Delta de contratos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| Product persistence contract | Interno repository/service/actions | `_reversa_forward/001-fase-3-neon-drizzle/interfaces/product-persistence-contract.md` |

Nao ha novo contrato HTTP publico, fila, gRPC ou GraphQL nesta fase.

## 8. Plano de migracao

1. Revisar `drizzle.config.ts` para `db:generate` seguro e documentado.
2. Revisar `src/db/schema.ts` apenas no escopo de catalogo, imagens e constraints necessarias.
3. Gerar migrations locais com Drizzle somente se tecnicamente possivel sem `DATABASE_URL`; se nao for, registrar pendencia operacional.
4. Revisar os arquivos SQL gerados antes de qualquer aplicacao.
5. Implementar seed de desenvolvimento que exige `DATABASE_URL` e falha com mensagem segura quando ausente.
6. Aplicar migrations/seed apenas em banco local-dev apos validacao humana explicita, nunca em producao/preview nesta fase.

## 9. Riscos e mitigacoes

| Risco | Impacto | Probabilidade | Mitigacao |
|-------|---------|---------------|-----------|
| `drizzle.config.ts` usar placeholder e permitir comando perigoso contra alvo errado | alto | medio | Separar generate de migrate, validar env e documentar proibicao de banco real sem aprovacao. |
| Repository com `DATABASE_URL` presente cair para fixtures silenciosamente | alto | medio | Em caminho Drizzle, erros devem propagar como falha real; fallback so quando `db === null`. |
| Admin sem auth persistir dados em preview/producao | alto | medio | Guardrail por ambiente para permitir mutacao real apenas em desenvolvimento ate Fase 4. |
| Seed duplicar dados a cada execucao | medio | medio | Usar upsert/chaves estaveis ou documentar limpeza/idempotencia. |
| Metadata de imagem ficar persistida sem Blob real | medio | medio | Persistir metadata somente apos `uploaded` e com `db` disponivel. |
| Constraints de capa/slug/sku divergirem da capacidade Drizzle/Postgres | medio | baixo | Revisar migration gerada e registrar constraints que exigem SQL manual. |
| Testes sem banco quebrarem por import de Drizzle/Neon | medio | baixo | Manter env opcional e mocks/fallback isolados. |

## 10. Estrategia de fallback sem banco

- `db === null` continua o unico gatilho para modo sem banco.
- Leituras usam fixtures apenas nesse modo.
- Mutacoes retornam `dev_fallback` e mensagem explicita sem gravacao real.
- Admin exibe aviso de modo sem persistencia real.
- Falha com `DATABASE_URL` presente nao cai para fixtures; deve ser erro operacional.
- Build, lint, typecheck, unit e e2e seguem executaveis sem banco.

## 11. Estrategia de guardrail por ambiente

- Introduzir contrato de ambiente que diferencie desenvolvimento/local-dev de preview/producao sem expor segredos.
- Mutacoes reais no admin so podem prosseguir em desenvolvimento/local-dev enquanto nao houver auth/policies.
- Preview/producao com `DATABASE_URL` ficam bloqueados para mutacoes admin reais ate Fase 4.
- Storefront pode ler banco real em ambiente configurado, desde que nao dependa de auth admin.
- UI/admin deve informar claramente quando o painel ainda nao esta protegido.

## 12. Estrategia de seed

- Criar script `pnpm db:seed`.
- Seed exige `DATABASE_URL`; sem ela, falha com mensagem segura.
- Dados devem ser ficticios: categorias, produto publicado, draft, futuro, sem estoque e inactive.
- Imagens usam URLs placeholder/caminhos ficticios marcados como desenvolvimento.
- Nao copiar imagens nem dados reais do Laravel.
- Preferir seed idempotente por slugs/SKUs estaveis; se nao for possivel, documentar limpeza/reexecucao.

## 13. Estrategia de testes

- Unit tests para fallback repository sem `DATABASE_URL`.
- Unit tests para nao cair em fallback quando `DATABASE_URL` existe e Drizzle falha.
- Unit tests para regra publica: `published`, `publishedAt <= now`, `stockQuantity > 0`, `draft`, futuro, sem estoque e inactive.
- Tests para seed sem `DATABASE_URL` falhar com mensagem segura.
- Tests para existencia de scripts `db:generate`, `db:migrate`, `db:studio`, `db:seed`.
- Tests para upload sem token bloquear e nao persistir metadata.
- Playwright ou teste de pagina para admin/storefront carregarem em modo sem banco.
- Build/typecheck/lint/test/e2e como validacoes finais da implementacao.

## 14. Impactos em documentacao

| Arquivo | Impacto |
|---------|---------|
| `docs/architecture/database.md` | Atualizar schema efetivo, migrations geradas e limites de execucao. |
| `docs/operations/neon.md` | Documentar local-dev, generate, migrate, studio, seed e proibicao de producao. |
| `docs/operations/env.md` | Explicar variaveis sem valores reais e comportamento sem `DATABASE_URL`/Blob token. |
| `docs/features/admin-products.md` | Registrar modo real, fallback, guardrail sem auth e bloqueio preview/producao. |
| `docs/features/catalog-products-images.md` | Registrar leitura real, seed de desenvolvimento e regras publicas preservadas. |
| `docs/architecture/uploads.md` | Registrar persistencia de metadata e placeholder no seed. |

## 15. Criterios de rollback

- Reverter o uso Drizzle real no repository para o fallback anterior sem remover fixtures.
- Manter migrations locais em disco sem aplica-las novamente.
- Se seed popular banco local-dev incorretamente, limpar apenas o banco de desenvolvimento afetado apos confirmacao humana.
- Se guardrail bloquear demais, desabilitar apenas mutacoes reais mantendo leituras/fallback.
- Nunca usar rollback contra banco de producao nesta fase.

## 16. Criterio de pronto

- [ ] `roadmap.md`, `investigation.md`, `data-delta.md`, `onboarding.md`, `risk-plan.md`, `validation-plan.md` e contrato em `interfaces/` gerados.
- [ ] `/reversa-to-do` decompos os passos em `actions.md`.
- [ ] Implementacao futura preserva build/test sem `DATABASE_URL`.
- [ ] Repository Drizzle real cobre produtos, categorias, vinculos e imagens.
- [ ] Fallback sem banco e UI admin nao prometem persistencia real.
- [ ] Migrations locais geradas/revisadas sem execucao em banco real sem validacao.
- [ ] Seed de desenvolvimento criado com dados ficticios e imagens placeholder.
- [ ] Docs operacionais atualizadas.
- [ ] `lint`, `typecheck`, `test`, `build` e `test:e2e` definidos como validacoes obrigatorias da implementacao.

## 17. Ordem recomendada de implementacao

1. Criar helpers de runtime/fallback e guardrail de ambiente.
2. Ajustar `drizzle.config.ts` e scripts de banco, sem rodar migration real.
3. Revisar schema de catalogo/imagens e gerar migrations locais.
4. Implementar mapeadores Drizzle row -> dominio.
5. Completar leituras Drizzle do repository.
6. Completar criacao/edicao transacional com categorias.
7. Persistir/listar metadata de imagens.
8. Integrar avisos e bloqueios no admin.
9. Criar seed e `pnpm db:seed`.
10. Atualizar docs.
11. Adicionar testes.
12. Rodar validacoes locais permitidas na etapa de coding.

## 18. Historico de alteracoes

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-08 | Versao inicial gerada por `/reversa-plan` | reversa |
