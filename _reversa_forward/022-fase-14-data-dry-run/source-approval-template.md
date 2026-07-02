# Source Approval Template

> Feature: `022-fase-14-data-dry-run`
> Data: `2026-07-02`

Preencha este template antes de usar arquivos reais no dry-run. Não inclua secrets, `.env`, URLs reais de banco ou dados pessoais crus.

## Aprovação

| Campo | Valor |
|-------|-------|
| Responsável pela aprovação | `<nome>` |
| Data da aprovação | `<YYYY-MM-DD>` |
| Tipo de fonte | `CSV/JSON export manual`, `dump sanitizado/local` ou `banco local clonado aprovado` |
| Pasta local | `data/dry-run/input/<subpasta-local>` |
| Contém dados sensíveis? | `sim/nao` |
| Confirmado fora do Git? | `sim/nao` |

## Escopo aprovado

- [ ] Categorias.
- [ ] Produtos.
- [ ] Imagens por referência.
- [ ] Preços.
- [ ] Estoque.
- [ ] Cupons ativos.
- [ ] Frete mínimo/configurações.

## Confirmações de segurança

- [ ] Não copia `.env`.
- [ ] Não contém secrets.
- [ ] Não exige conexão com banco real.
- [ ] Não altera Laravel legado.
- [ ] Não inclui clientes ou pedidos históricos.
- [ ] Não inclui binários reais de imagem para upload.

## Observações

Registre aqui decisões humanas, exceções e limitações da fonte aprovada.
