# Domain - Triade Essenza Next

Atualizado em: 2026-07-02
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

## Decisões Implícitas Extraídas do Git

- 🟢 A migração avançou em fases verticais: persistência, auth, carrinho, cupons, frete, checkout, pagamento, notificações e storefront.
- 🟢 A Fase 12 consolidou uma macrofase operacional antes do go-live para evitar microfeatures de producao.
- 🟢 A Fase 13 consolidou uma macrofase de decisao de substituicao do Laravel, separando paridade, bloqueadores reais, decisoes humanas e rollback.
- 🟢 A Fase 14 consolidou uma macrofase de dry-run controlado por arquivo, com reconciliacao executavel e guardrails contra operacao real.
- 🟢 A Fase 15 consolidou a primeira execucao aprovada e o estado `pending-input` para nao mascarar ausencia de dados reais como sucesso.
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
