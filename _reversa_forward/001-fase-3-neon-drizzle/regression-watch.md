# Regression Watch — 001-fase-3-neon-drizzle

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|---|---|---|---|---|

Nenhum watch item principal foi criado nesta rodada porque nenhuma regra 🟢 preservada foi
modificada ou removida.

## Histórico de re-extrações

| Data | Re-extracao | Veredito |
|---|---|---|
| 2026-06-11 | `_reversa_sdd/` atualizado apos Fase 10; schema inclui `notification_deliveries`. | verde: sem watch principal; catalogo em centavos e fallback seguro permanecem documentados. |
| 2026-06-08 | `_reversa_sdd/` atualizado apos commit `3774c49` da Fase 3. | 🟢 Sem watch principal; regras preservadas seguem documentadas em `_reversa_sdd/domain.md`. |

## Arquivadas

Vazio.

## Observações

- O schema de `product_images` usa unique parcial de capa por produto; re-extrações futuras devem
  confirmar compatibilidade operacional com Neon.
- `price` decimal permanece ao lado de `priceCents`, mas o dominio continua calculando por centavos.
