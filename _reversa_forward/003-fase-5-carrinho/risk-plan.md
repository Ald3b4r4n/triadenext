# Risk Plan: Fase 5 - Carrinho

> Data: `2026-06-08`

## 1. Riscos principais

| ID | Risco | Severidade | Probabilidade | Mitigacao |
|---|---|---|---|---|
| R-01 | `guestCartToken` vazar em log/erro/teste. | Alta | Media | Redigir logs; nunca imprimir cookie/token. |
| R-02 | Carrinho anonimo ser usado como autorizacao forte isolada. | Alta | Media | Resolver no servidor e limitar escopo ao carrinho associado. |
| R-03 | Merge ao login duplicar itens. | Alta | Media | Transacao, status `converted` e teste de idempotencia. |
| R-04 | Carrinho ativo duplicado por usuario. | Media | Media | Unique parcial ou regra transacional. |
| R-05 | Produto indisponivel entrar por action direta. | Alta | Media | Validar produto/estoque no service/action, nao apenas UI. |
| R-06 | Subtotal com erro de arredondamento. | Media | Media | Usar centavos inteiros no dominio. |
| R-07 | Fallback sem banco fingir persistencia. | Media | Media | Estados `fallback` e avisos explicitos. |
| R-08 | Scope creep para checkout/frete/cupom/pedido. | Alta | Media | Manter CTAs como placeholder e testes contra operacoes reais. |
| R-09 | Migration real aplicada sem autorizacao. | Critica | Baixa | Gerar apenas SQL local; registrar proibicao de migrate real. |

## 2. Guardrails

- Nao implementar checkout, pagamento, frete, cupom, pedido ou reserva de estoque.
- Nao expor cookies, tokens, `DATABASE_URL`, secrets ou SQL sensivel.
- Nao aceitar `userId`, `role`, `cartId` ou owner do cliente como fonte confiavel.
- Nao mascarar erro real com banco como fallback.
- Nao rodar migration real sem validacao humana.
- Nao modificar Laravel legado.

## 3. Rollback

Antes de migration real:

- remover arquivos de cart criados na branch;
- descartar migration local gerada;
- restaurar `/carrinho` como placeholder;
- manter catalogo/auth intactos.

Depois de migration real futura em ambiente autorizado:

- aplicar migration reversa revisada;
- bloquear actions de carrinho;
- expirar cookies anonimos se necessario;
- manter storefront publico operacional.

## 4. Decisoes que nao devem ser reabertas no coding

- `guestCartToken` opaco.
- Itens/precos fora do cookie.
- Merge automatico no login sem pergunta ao usuario.
- Carrinho nao reserva estoque.
- Quantidade maxima igual a `stockQuantity`.
- Admin/manager sem privilegio especial no carrinho.
