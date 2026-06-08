# Regression Watch — 001-fase-3-neon-drizzle

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|

Nenhum watch item principal foi criado nesta rodada porque nenhuma regra 🟢 preservada foi
modificada ou removida.

## Histórico de re-extrações

Vazio.

## Arquivadas

Vazio.

## Observações

- O schema de `product_images` usa unique parcial de capa por produto; re-extrações futuras devem
  confirmar compatibilidade operacional com Neon.
- `price` decimal permanece ao lado de `priceCents`, mas o dominio continua calculando por centavos.
