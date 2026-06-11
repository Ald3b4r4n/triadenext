# Migration Risk Register

| Risco | Severidade | Mitigação |
| --- | --- | --- |
| Divergência de total de pedido | Crítica | Snapshots e testes de cálculo com fixtures legadas. |
| Webhook duplicado | Crítica | Idempotency key e estado transacional. |
| Produto indevido publicado | Alta | Filtro público centralizado e testes negativos. |
| Frete recalculado após pedido | Alta | Persistir serviço/preço/prazo escolhidos. |
| Emissão fiscal incorreta | Crítica | Sandbox-first, auditoria e bloqueio por feature flag. |
| Estoque negativo | Alta | Reserva/baixa transacional e log de movimentação. |
| Vazamento de dados de cliente | Alta | Guards por ownership e testes de autorização. |
| Admin com permissões amplas demais | Alta | Matriz de permissões e testes por papel. |
| Perda de identidade visual | Média | Design tokens extraídos e validados por telas-chave. |
| Cutover com dados incompletos | Alta | Dry-run, reconciliação e rollback plan. |
