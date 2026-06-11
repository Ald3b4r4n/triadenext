# Target Business Rules

## Regras que devem migrar

### Storefront e catálogo

- Exibir publicamente apenas produtos publicados, não futuros, ativos e com estoque disponível.
- Preservar slug canônico de produto/categoria quando existir rota pública equivalente.
- Exibir preço, preço promocional, imagens e disponibilidade sem revelar estado administrativo.

### Carrinho, cupons e checkout

- Carrinho deve calcular subtotais, descontos, frete e total de forma determinística.
- Cupom deve respeitar validade, status, tipo de desconto, limites e escopo.
- Checkout deve criar pedido pendente com snapshot de itens, preços, desconto, frete e endereço.
- Pagamento confirmado por webhook deve ser idempotente.

### Pedidos e pós-pagamento

- Cliente só visualiza pedidos próprios.
- Admin visualiza e opera pedidos conforme permissão.
- Mudanças de status devem ter histórico, ator e data.
- Cancelamento, reembolso, envio, entrega e falha precisam de regras explícitas antes de implementação.

### Frete e logística

- Cotação manual atual é aceitável como fallback, mas integrações reais devem ser adapters.
- Prazo, preço, transportadora e serviço escolhidos no checkout devem ser persistidos como snapshot.
- Rastreamento não deve depender de recalcular frete após pedido fechado.

### Fiscal e Bling

- Documento fiscal deve ficar associado ao pedido e ter status próprio.
- Emissão/consulta deve ser adapter-safe, com sandbox/fake em teste.
- Erros fiscais devem ser visíveis ao admin sem vazar segredos técnicos.

### Notificações

- E-mails transacionais devem ser disparados por evento de negócio, com idempotência.
- Falhas de envio devem ser rastreáveis sem bloquear confirmação financeira.
- Testes devem usar provider fake e impedir envios reais.

### Admin, auditoria e permissões

- Superfícies administrativas exigem autenticação e papel autorizado.
- Ações sensíveis devem registrar auditoria.
- Relatórios não podem expor dados pessoais além do necessário.

## Regras que não migram como comportamento

- Estrutura Blade, controllers Laravel, Form Requests e Eloquent.
- Dependência de storage local/public symlink como contrato de negócio.
- Nomes internos de classes, actions e services.
- Comandos artisan como mecanismo obrigatório no alvo.

## Decisões humanas pendentes

- Política final de guest checkout versus conta obrigatória.
- Status operacional definitivo de pedido e transições permitidas.
- Ordem de prioridade das transportadoras reais.
- Profundidade da integração Bling: produtos, pedidos, estoque, NF-e ou todos.
- Modelo de relatórios: operacional mínimo ou BI completo.
