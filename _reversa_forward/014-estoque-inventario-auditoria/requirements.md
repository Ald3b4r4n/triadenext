# Requirements - Estoque, Inventário e Auditoria

## Objetivo

Transformar `stockQuantity` em operação auditável de estoque, com movimentos e proteção contra divergência.

## Escopo

- Movimentações de estoque.
- Ajuste administrativo com motivo.
- Baixa por pedido pago ou evento definido.
- Alerta de baixo estoque.
- Auditoria de ator, data e origem.

## Regras

- Não permitir estoque negativo sem decisão explícita.
- Toda alteração manual exige motivo.
- Compra pública só considera estoque disponível.

## Fora do escopo

- Integração ERP em tempo real.
