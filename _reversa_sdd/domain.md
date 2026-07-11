# Domain - Triade Essenza Next

Atualizado em: 2026-07-03
Agente: Detective
Nível: detalhado

## Glossário

| Termo | Definição | Confiança |
| --- | --- | --- |
| Produto público | Produto `published`, com `publishedAt <= now` e `stockQuantity > 0`. | 🟢 |
| Produto comprável | Produto público disponível para entrada no carrinho. | 🟢 |
| Carrinho ativo | Carrinho `active` associado a guest token ou usuário autenticado. | 🟢 |
| Carrinho convertido | Carrinho usado para criar pedido; não deve receber novas mutações. | 🟢 |
| Cupom vigente | Cupom ativo, dentro da janela, não esgotado e com valor válido. | 🟢 |
| Frete manual | Cotação gerada por regras internas por UF/faixa de CEP. | 🟢 |
| Pedido pendente | Pedido `aguardando_pagamento`, criado a partir do carrinho e ainda não liquidado. | 🟢 |
| Snapshot de pedido | Cópia de cliente, endereço, itens, preços, cupom e frete no momento do checkout. | 🟢 |
| PaymentIntent interno | Registro local da tentativa de pagamento Stripe/mock. | 🟢 |
| Settlement | Efeito de confirmar pagamento: pedido pago, pagamento pago, estoque baixado e cupom consumido. | 🟢 |
| Outbox de notificação | Registro idempotente de entrega transacional pós-pagamento. | 🟢 |
| Readiness de produção | Conjunto documental e de scripts locais que prepara staging/producao sem executar deploy, migration real ou banco real automaticamente. | 🟢 |
| Paridade legado x Next | Evidencia comparativa de que um dominio do Laravel e substituido, parcial, ausente, fora do go-live, decisao humana ou bloqueador no Next. | 🟢 |
| Dry-run de migracao | Ensaio controlado por arquivos locais aprovados, sem importacao real em producao. | 🟢 |
| Reconciliacao de dados | Conferencia de contagens, chaves comerciais, valores em centavos, status, amostras mascaradas e assets. | 🟢 |
| Fonte local aprovada | Pasta dentro de `data/dry-run/input/`, preenchida manualmente com CSV/JSON autorizados para ensaio. | 🟢 |
| Primeira execucao aprovada | Pasta `data/dry-run/input/primeira-execucao/`, nomeada pela Fase 15 para o primeiro dry-run real/controlado. | 🟢 |
| Pending input | Resultado seguro quando a primeira execucao aprovada ainda nao contem os arquivos reais/exportados Must. | 🟢 |
| Importacao staging controlada | Ensaio de escrita em staging/dev remoto autorizado, com upsert seguro, producao bloqueada e relatorios antes/depois. | 🟢 |
| Preflight staging | Verificacao previa de ambiente nao produtivo, arquivos aprovados, dry-run aceitavel, aprovacao humana e backup/snapshot quando necessario. | 🟢 |
| Reset protegido | Limpeza de staging permitida somente com backup confirmado, flag explicita, aprovacao humana e ambiente nao produtivo. | 🟢 |
| Divergencia bloqueadora | Issue `CRITICAL`/`HIGH` ou `goLiveImpact=bloqueador` que impede avancar para importacao real futura. | 🟢 |

## Regras de Domínio

### Catálogo

- 🟢 Produto público precisa estar publicado, vigente e com estoque positivo.
- 🟢 Produto publicado exige nome, slug, SKU, preço positivo, estoque positivo e `publishedAt` válido.
- 🟢 Imagem de capa usa `isCover`; se não houver, usa a primeira por ordenação.
- 🟢 Preço e totais de regra usam centavos.

### Carrinho

- 🟢 Carrinho pertence a guest token ou a usuário autenticado.
- 🟢 Item de carrinho preserva snapshot de nome e preço unitário.
- 🟢 Alteração de item limpa seleção de frete, pois o `cartHash` fica obsoleto.
- 🟢 Recálculo remove item indisponível, limita estoque e remove cupom inválido.
- 🟢 Carrinho convertido é terminal para mutações de compra.

### Cupom

- 🟢 Código é normalizado em uppercase.
- 🟢 Cupom pode ser `percentage`, `fixed_amount` ou `free_shipping`.
- 🟢 Percentual precisa estar entre 1 e 100.
- 🟢 Valor fixo não pode exceder subtotal efetivo.
- 🟢 `usedCount` não muda ao aplicar/remover; só muda no settlement confirmado.

### Frete

- 🟢 CEP é normalizado para 8 dígitos.
- 🟢 Frete atual é manual, por UF ou faixa de CEP.
- 🟢 Cotação expira em 30 minutos.
- 🟢 Frete escolhido é salvo no carrinho e vira snapshot no pedido.
- 🟢 Correios, Jadlog e Melhor Envio são providers futuros inativos.

### Checkout e Pedido

- 🟢 Checkout exige customer autenticado.
- 🟢 Pedido nasce de carrinho ativo, com itens, cupom e frete revalidados no servidor.
- 🟢 CEP do endereço precisa coincidir com CEP da cotação.
- 🟢 Pedido pendente expira em 60 minutos.
- 🟢 `cartId` único impede dois pedidos para o mesmo carrinho.
- 🟢 Customer só lê pedidos próprios; admin/manager lê pedidos administrativos.

### Pagamento

- 🟢 Pedido só pode iniciar pagamento se estiver `aguardando_pagamento`, não expirado e com total positivo.
- 🟢 PaymentIntent usa valor e moeda do snapshot do pedido.
- 🟢 Retorno client-side não confirma pagamento.
- 🟢 Webhook `payment_intent.succeeded` é a fonte de verdade financeira.
- 🟢 Valor, moeda e metadata precisam bater entre Stripe e pedido.
- 🟢 Evento Stripe duplicado não repete settlement.

### Settlement

- 🟢 Settlement real é transacional: estoque, cupom, pagamento, pedido e evento.
- 🟢 Falha antes do commit impede estado parcial.
- 🟢 Divergência de valor/moeda/metadata marca pagamento como divergente/falha.
- 🟢 Falha de notificação posterior não desfaz settlement.

### Notificações

- 🟢 Notificação pós-pagamento só roda após pedido `pago`.
- 🟢 Tipos atuais: `customer_order_paid`, `admin_order_paid`.
- 🟢 Idempotência inclui pedido, evento, tipo e destinatário normalizado.
- 🟢 Ausência de destinatários admin gera `skipped`, não envio implícito.
- 🟢 Mock é permitido em dev/test; preview/production sem provider real falham de forma segura.

### Guardrails de Ambiente

- 🟢 Sem `DATABASE_URL`, `db = null`.
- 🟢 Repositories podem usar fallback explícito em dev/test.
- 🟢 Mutação real exige auth pronto e ambiente development/test.
- 🟢 Sem `BLOB_READ_WRITE_TOKEN`, upload real bloqueia.
- 🟢 Secrets não são gravados nos artefatos nem expostos em mensagens.

### Readiness Operacional

- 🟢 `.env.example` descreve nomes de variaveis por ambiente, sem valores reais.
- 🟢 `ops:check-env` mostra apenas presenca/ausencia e nao imprime secrets.
- 🟢 `ops:check-migrations` analisa migrations Drizzle estaticamente e nao conecta banco.
- 🟢 `ops:check-build` nao chama Vercel, banco, migration real ou provider externo.
- 🟢 `ops:check-smoke` usa alvo local por padrao e nao executa pagamento/e-mail/upload real.
- 🟢 Deploy, migration real, banco real, credenciais reais e go-live continuam dependentes de aprovacao humana explicita.

### Paridade e Migracao Controlada

- 🟢 Laravel legado e fonte somente leitura para analise; nao deve ser alterado, migrado ou executado por comando com efeito colateral nesta fase.
- 🟢 Catalogo real, imagens, precos, estoque, cupons ativos e frete minimo sao dados Must para go-live e exigem dry-run/reconciliacao aprovados.
- 🟢 Divergencia financeira nao explicada em preco, desconto, frete ou total bloqueia avancar.
- 🟢 Importacao real, migration real, conexao com banco real, upload real e deploy real exigem aprovacao humana explicita.
- 🟢 Importacao staging da Fase 16 e restrita a staging/dev remoto, deve bloquear producao por padrao e nunca imprimir `DATABASE_URL` ou secrets.
- 🟢 Upsert staging e o modo padrao; reset/limpeza nao pode ocorrer sem backup/snapshot, flag explicita, aprovacao humana e confirmacao de ambiente nao produtivo.
- 🟢 Legado permanece base de rollback ate aceite formal pos-cutover.
- 🟡 Clientes, enderecos e pedidos historicos podem ser migrados ou ficar em consulta temporaria no legado conforme decisao humana.
- 🟡 Frete externo/rastreamento e fiscal/Bling/NF-e podem bloquear go-live apenas se negocio exigir no dia zero.

### Dry-run Controlado de Dados

- 🟢 A entrada do dry-run da Fase 14 precisa estar dentro de `data/dry-run/input/`.
- 🟢 O padrao seguro usa exemplos sinteticos em `data/dry-run/input/examples`.
- 🟢 A primeira execucao aprovada da Fase 15 usa `data/dry-run/input/primeira-execucao/`.
- 🟢 Se a primeira execucao aprovada nao tiver arquivos reais/exportados suficientes, o resultado correto e `pending-input`, com relatorio de pendencias e sem falha indevida.
- 🟢 Arquivos primarios da Fase 15: `products.*`, `categories.*`, `product_images.*`, `inventory.*`, `coupons.*` e `shipping.*`.
- 🟢 Aliases da Fase 14 para imagens e frete permanecem aceitos: `product-images.*` e `shipping-rules.*`.
- 🟢 Saidas de dry-run ficam em `data/dry-run/output/` e nao devem ser versionadas quando contiverem dados reais.
- 🟢 O script `ops:check-data-dry-run` nao conecta banco, nao importa dados, nao roda migration, nao faz upload, nao faz deploy e nao le `.env`.
- 🟢 Arquivos, campos ou valores com aparencia de `.env`, secret, token, URL real de banco ou credencial viram `UNSAFE_INPUT`.
- 🟢 Produto publicado sem categoria valida, preco positivo, estoque positivo, `published_at` valido, capa ou fallback aprovado bloqueia avancar.
- 🟢 Inventario da Fase 15 e reconciliado em memoria: `inventory.csv/json` sobrescreve a disponibilidade normalizada para dry-run sem persistir nada.
- 🟢 Frete minimo exige pelo menos uma regra ativa com preco positivo.
- 🟢 Divergencias devem manter origem `dados`, `next`, `mapeamento` ou `humana`, separando correcao de export/fonte de correcao de codigo Next.
- 🟢 Importacao real futura depende de checklist humano separado, backup/rollback e fonte real aprovada.
- 🟡 O dry-run sintetico da Fase 14 prova o pipeline; nao prova ainda os dados reais legados.

### Importacao Staging Controlada

- 🟢 O alvo inicial e staging/dev remoto, preferencialmente Neon dev/staging separado; producao e proibida nesta fase.
- 🟢 A execucao real de `pnpm ops:import-staging` exige arquivos aprovados em `data/dry-run/input/primeira-execucao/` e dry-run anterior `go` ou sem bloqueios criticos.
- 🟢 Sem arquivos aprovados, sem `STAGING_DATABASE_URL`, sem aprovacao humana ou sem backup exigido, o resultado correto e bloqueio operacional/pending-input, nao tentativa de importar.
- 🟢 O script deve gerar relatorios antes/depois e divergencias sem imprimir valores sensiveis.
- 🟢 `pnpm ops:check-staging-import-smoke` valida home, catalogo, produto, carrinho, checkout teste, admin, pedidos e outbox/notificacoes quando houver URL staging aprovada; sem URL, o skipped e esperado.
- 🟢 Nenhuma regra de pagamento, estoque, cupom, frete, pedido ou notificacao muda por causa da importacao staging.

### Staging Smoke e Storefront Triade

- 🟢 `pnpm ops:check-staging-smoke` deve validar smoke real somente contra staging/preview/dev remoto aprovado; sem URL/env/webhook retorna `pending-config`.
- 🟢 Stripe live mode e qualquer indicador de producao devem bloquear o smoke antes de requisicao externa.
- 🟢 Arquivos aprovados ausentes para import staging smoke retornam `pending-input`; o fluxo nao conecta banco, nao importa dados e nao executa deploy.
- 🟢 O storefront publico comunica venda de perfumes, nao apenas perfumes arabes.
- 🟢 A home publica usa identidade visual Triade Essenza Parfum: logo horizontal, verde profundo/dourado, hero premium e vitrine editorial.
- 🟢 Produtos de vitrine sintetica atual: `Essenza Gold`, `Amber Imperial` e `Noir Absolu`; eles existem para demonstracao visual e nao substituem reconciliacao de catalogo real.
- 🟢 Textos fixture/provisorios e mensagens tecnicas nao devem ficar visiveis ao usuario final.
- 🟢 Painel admin deve ficar fora da navegacao publica para visitantes e clientes comuns, aparecendo apenas a contas admin/manager autenticadas.
- 🟢 Rodape publico deve conter central de atendimento por e-mail, menu, formas de pagamento aceitas e credito de desenvolvimento da AR Software Development.

### Readiness de Providers e Ambiente Staging

- 🟢 A ausência de Vercel Preview, Neon staging/dev, Stripe test webhook ou URL aprovada retorna `pending-config` e decisão `no-go`, sem conexão remota.
- 🟢 A ausência dos arquivos aprovados permanece `pending-input`; o status nunca equivale a autorização de importação ou go-live.
- 🟢 Produção, domínio definitivo e Stripe live devem ser bloqueados antes de qualquer driver, conexão, request ou efeito externo.
- 🟢 `pnpm ops:migrate-staging` opera em modo check por padrão; execução exige alvo não produtivo, flag explícita, aprovação humana, migrations revisadas e snapshot.
- 🟢 `pnpm ops:bootstrap-admin-staging` opera em modo check por padrão; execução exige staging aprovado e e-mail master presente na allowlist.
- 🟢 `pnpm ops:check-staging-environment` reporta somente presença/ausência e estados sanitizados, sem imprimir URL ou segredo.
- 🟢 O smoke controlado cobre storefront, checkout, admin e notificações/outbox apenas quando configuração externa e aprovação humana estiverem disponíveis.
- 🟢 O relatório só retorna `go` quando todos os critérios obrigatórios estão verdes e existe aprovação humana final.

## Decisões Implícitas Extraídas do Git

- 🟢 A migração avançou em fases verticais: persistência, auth, carrinho, cupons, frete, checkout, pagamento, notificações e storefront.
- 🟢 A Fase 12 consolidou uma macrofase operacional antes do go-live para evitar microfeatures de producao.
- 🟢 A Fase 13 consolidou uma macrofase de decisao de substituicao do Laravel, separando paridade, bloqueadores reais, decisoes humanas e rollback.
- 🟢 A Fase 14 consolidou uma macrofase de dry-run controlado por arquivo, com reconciliacao executavel e guardrails contra operacao real.
- 🟢 A Fase 15 consolidou a primeira execucao aprovada e o estado `pending-input` para nao mascarar ausencia de dados reais como sucesso.
- 🟢 A Fase 16 consolidou a ponte entre dry-run local e staging/dev remoto, mantendo producao bloqueada e operacoes destrutivas atras de backup, flag e aprovacao humana.
- 🟢 A Fase 17 consolidou smoke staging real opt-in e identidade visual publica sem mudar regras de negocio.
- 🟢 A Fase 18 consolidou readiness offline e gates de providers sem autorizar execução remota automática.
- 🟢 Cada fase veio com artefatos `_reversa_forward`, validações e regressão.
- 🟢 O sistema prefere fallback explícito a falha silenciosa.
- 🟢 Integrações externas reais só entram atrás de adapters, mocks e guardrails.
- 🟢 Operação financeira é protegida contra confirmação por browser/admin.

## Lacunas

- 🔴 Área do cliente completa ainda falta: perfil, endereços reais, segurança de conta.
- 🔴 Operação pós-pagamento ainda não usa a máquina completa de status do enum.
- 🔴 Fiscal/Bling/NF-e existe como schema/roadmap, não como fluxo funcional.
- 🔴 Frete externo real e rastreamento ainda não estão implementados.
- 🔴 Estoque auditável por movimentos ainda não existe.
- 🔴 Relatórios, analytics e admin operacional permanecem como features futuras.
- 🔴 Deploy real, migration real em producao e migracao de dados reais ainda nao foram executados nem aprovados.
- 🔴 Dry-run/reconciliacao com fonte real aprovada ainda nao foi executado nem aprovado.
- 🔴 Catalogo real, imagens, precos, estoque, cupons ativos e frete minimo ainda nao estao provados contra dados legados reais.
- 🔴 A pasta `data/dry-run/input/primeira-execucao/` ainda precisa receber arquivos reais/exportados aprovados para sair de `pending-input`.
- 🔴 Importacao staging real ainda depende de ambiente staging/dev remoto aprovado, `STAGING_DATABASE_URL` configurada fora do Git, backup/snapshot e dry-run `go`.
- 🔴 Vercel Preview, Neon staging/dev e Stripe test webhook ainda precisam ser configurados e aprovados externamente para sair de `pending-config`.
