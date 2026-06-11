# Domain - Triade Essenza Next

Atualizado em: 2026-06-11  
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

## Decisões Implícitas Extraídas do Git

- 🟢 A migração avançou em fases verticais: persistência, auth, carrinho, cupons, frete, checkout, pagamento, notificações e storefront.
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
