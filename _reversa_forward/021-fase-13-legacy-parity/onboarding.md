# Onboarding: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`
> Data: `2026-07-01`

## 1. Objetivo para quem entra na fase

Entender rapidamente como auditar paridade Laravel x Next e preparar migracao controlada sem alterar o Laravel, sem copiar `.env`, sem expor secrets, sem conectar banco real, sem executar migration real, sem importar dados reais e sem deploy.

## 2. Antes de comecar

1. Confirmar workspace Next:
   - `D:\Projetos\triade-essenza-next`
2. Confirmar que o Laravel legado e somente fonte de leitura:
   - `D:\Projetos\triadeessenzaparfum.com.br`
3. Confirmar Git limpo ou entender alteracoes pendentes.
4. Nao abrir, copiar, imprimir ou resumir `.env` do legado ou do Next.
5. Nao rodar `php artisan migrate`, `pnpm db:migrate`, seeders reais, deploy ou comandos que conectem banco real.

## 3. Leitura recomendada

1. `_reversa_forward/021-fase-13-legacy-parity/requirements.md`
2. `_reversa_forward/021-fase-13-legacy-parity/roadmap.md`
3. `_reversa_forward/021-fase-13-legacy-parity/data-delta.md`
4. `_reversa_sdd/architecture.md`
5. `_reversa_sdd/domain.md`
6. `_reversa_sdd/code-analysis.md`
7. `_reversa_sdd/migration/data_migration_plan.md`
8. `_reversa_sdd/migration/cutover_plan.md`

## 4. Como comparar Laravel x Next com seguranca

### Laravel legado

Permitido:

- Listar arquivos e pastas.
- Ler rotas, controllers, actions, policies, migrations, views, docs, specs, testes e assets publicos.
- Registrar nomes de tabelas, entidades, rotas e arquivos.

Proibido:

- Alterar qualquer arquivo.
- Ler ou copiar `.env`.
- Imprimir secrets.
- Rodar migrations.
- Rodar seeders reais.
- Conectar banco real.
- Enviar e-mail, chamar provider externo ou fazer deploy.

### Next atual

Permitido:

- Ler SDD, docs, testes, scripts `ops:*` e codigo.
- Rodar checks locais seguros quando a etapa de implementacao pedir.
- Gerar relatorios versionaveis dentro da feature.

Proibido:

- Mudar regra de negocio sem tarefa explicita.
- Importar dados reais.
- Rodar migration real.
- Fazer deploy.
- Fazer push automatico.

## 5. Sequencia operacional esperada

1. Criar inventario de superficies Laravel:
   - rotas publicas, admin, customer, auth, webhooks;
   - controllers/actions;
   - views Blade;
   - migrations;
   - assets de produto;
   - docs/specs/testes relevantes.
2. Criar inventario de capacidades Next:
   - rotas App Router;
   - features;
   - schema Drizzle;
   - testes;
   - docs operacionais.
3. Montar matriz de paridade por dominio.
4. Classificar lacunas:
   - bloqueador real;
   - pos-go-live aceitavel;
   - fora de escopo;
   - decisao humana.
5. Mapear dados migraveis.
6. Definir dry-run e reconciliacao.
7. Preparar checklist de substituicao.
8. Preparar rollback.
9. Registrar regression-watch para os guardrails.

## 6. Criterios de bloqueador

Uma lacuna deve ser bloqueadora se impedir:

- catalogo vendavel correto;
- carrinho/checkout/pedido seguro;
- pagamento teste/real em modo aprovado;
- integridade de preco, estoque, cupom ou frete;
- seguranca de auth/admin/customer;
- privacidade de dados pessoais;
- operacao minima acordada para o dia zero.

Uma lacuna pode ser pos-go-live se:

- nao impede venda;
- tem workaround operacional claro;
- nao viola seguranca, privacidade ou financeiro;
- foi aceita explicitamente no checklist.

## 7. Evidencias esperadas

Cada afirmacao de paridade deve apontar para pelo menos uma evidencia:

- arquivo Laravel;
- arquivo Next;
- SDD;
- teste;
- doc operacional;
- migration;
- asset inventariado;
- relatorio de dry-run/reconciliacao.

## 8. Validacoes finais esperadas na implementacao

Quando `/reversa-coding` implementar a fase, esperar no minimo:

- `git status --short`
- `git diff --check`
- validacao de JSON/Markdown gerado quando aplicavel
- checks locais seguros existentes, se usados:
  - `pnpm ops:check-env`
  - `pnpm ops:check-migrations`
  - `pnpm ops:check-build`
  - `pnpm ops:check-smoke`

Testes completos (`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e`) podem ser exigidos se a implementacao adicionar scripts/testes ou tocar em codigo Next.

## 9. Resultado que a fase deve deixar

- Um relatorio claro do que o Next ja substitui.
- Uma lista curta e objetiva de bloqueadores reais.
- Uma lista de itens pos-go-live.
- Um plano de migracao dry-run.
- Um plano de reconciliacao.
- Um checklist de go-live futuro.
- Um rollback plan.
- Nenhuma alteracao no Laravel legado.
