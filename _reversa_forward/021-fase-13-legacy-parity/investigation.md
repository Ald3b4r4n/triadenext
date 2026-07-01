# Investigation: Fase 13 - Legacy Parity and Controlled Data Migration

> Identificador: `021-fase-13-legacy-parity`
> Data: `2026-07-01`

## 1. Pergunta investigada

O Next atual ja consegue substituir o Laravel legado no go-live, e quais lacunas/dados precisam ser tratados antes de uma migracao controlada?

## 2. Fontes lidas

### Next atual

- `_reversa_sdd/architecture.md`
- `_reversa_sdd/domain.md`
- `_reversa_sdd/inventory.md`
- `_reversa_sdd/code-analysis.md`
- `_reversa_sdd/data-dictionary.md`
- `_reversa_sdd/deployment.md`
- `_reversa_sdd/migration/data_migration_plan.md`
- `_reversa_sdd/migration/cutover_plan.md`
- `.reversa/context/current-state.json`
- `_reversa_forward/021-fase-13-legacy-parity/requirements.md`

### Laravel legado read-only

Leitura feita sem `.env`, sem banco e sem comandos destrutivos:

- `composer.json`: Laravel 11, PHP 8.3, Livewire 4.3.
- `routes/`: `web.php`, `admin.php`, `customer.php`, `auth.php`, `webhooks.php`.
- `app/Actions`, `app/Http/Controllers`, `app/Domain`, `app/Services`, `app/Policies`.
- `database/migrations`: 24 migrations detectadas no recorte, incluindo catalogo, clientes, pedidos, estoque, frete real, Bling/NF-e, analytics e backoffice.
- `resources/views`: storefront, customer, admin, emails e componentes Blade.
- `public/products` e `Imagens`: assets de produtos candidatos a inventario.
- `docs/operations`, `specs` e `_reversa_sdd` do legado como contexto documental.

## 3. Achados principais

| Achado | Evidencia | Impacto |
|--------|-----------|---------|
| O Next cobre o fluxo comercial central. | `_reversa_sdd/architecture.md#Fluxo-Comercial-Principal` | Paridade de venda pode ser avaliada por comportamento. |
| O Laravel parece ter backoffice mais amplo. | `app/Actions/Admin/*`, `resources/views/admin/*`, migrations operacionais | Admin pode ter lacunas pos-go-live ou bloqueadoras. |
| O Laravel possui frete real e providers externos. | `app/Domain/Shipping/Providers/*`, docs de shipping, migrations de shipping labels/webhooks | Next atual tem frete manual; frete real deve ser classificado. |
| O Laravel possui Bling/NF-e funcional/documentado. | `app/Services/Bling/*`, `app\Http\Controllers\Webhooks\BlingNfeWebhookController.php`, docs/specs Bling | Fora de escopo atual, mas pode ser decisao humana de go-live. |
| O Laravel possui area do cliente mais completa. | `resources/views/customer/*`, `app\Http\Controllers\Customer/*` | Next deve mapear se cliente/endereco/pedidos sao bloqueadores. |
| O Laravel possui relatorios/analytics. | `app/Actions/Admin/Reports`, `app/Actions/Admin/Analytics`, docs/specs | Provavel pos-go-live, salvo decisao de negocio. |
| O Next tem production readiness seguro. | `scripts/ops/*`, `docs/operations/*`, Fase 12 | Base boa para dry-run e checklist, sem operacao real automatica. |

## 4. Alternativas avaliadas

| Alternativa | Vantagem | Problema | Decisao |
|-------------|----------|----------|---------|
| Exigir paridade total antes de qualquer corte | Menor risco funcional | Atrasa go-live por itens fiscais/analytics/backoffice talvez nao essenciais | Descartada |
| Comparar so telas publicas | Rapido | Ignora dados, checkout, pedido, admin e rollback | Descartada |
| Comparar so banco/migrations | Bom para dados | Nao prova comportamento nem UX | Descartada |
| Usar matriz por dominio + dados + smoke | Equilibra decisao tecnica e negocio | Exige classificacao disciplinada | Escolhida |
| Importar dados reais diretamente | Rápido em tese | Alto risco, proibido sem aprovacao | Descartada |
| Dry-run com formato intermediario e reconciliacao | Seguro e repetivel | Exige mais artefatos | Escolhida |

## 5. Padroes aplicaveis

- Read-only source audit: analisar arquivos e metadados sem executar o sistema legado.
- Strangler/cutover controlado: manter legado intacto ate aceite do alvo.
- Reconciliacao por dominio: contagens por entidade, chaves comerciais e amostras mascaradas.
- Data migration dry-run: export intermediario, import em ambiente isolado e relatorio de divergencias.
- Go/no-go checklist: criterios objetivos para avancar, pausar ou abortar.

## 6. Lacunas de investigacao para a execucao

- Quais tabelas/dados reais existem no banco legado nao pode ser confirmado sem aprovacao para conexao.
- Volume real de produtos, clientes, pedidos e imagens depende de export/dry-run futuro.
- Necessidade de pedidos historicos no go-live e decisao de negocio.
- Necessidade de Bling/NF-e no dia zero e decisao de negocio, embora esteja fora de escopo tecnico desta fase.

## 7. Conclusao

O plano deve priorizar evidencias comparativas e migracao controlada, nao implementacao imediata de lacunas. A primeira entrega util da Fase 13 e uma matriz de paridade com decisao de bloqueio, acompanhada de mapa de dados e estrategia de dry-run/reconciliacao.
