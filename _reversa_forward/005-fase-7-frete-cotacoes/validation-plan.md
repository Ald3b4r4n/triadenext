# Validation Plan — Fase 7 Frete e Cotações

> Data: `2026-06-09`

## 1. Unitários de domínio

| Área | Casos |
|------|-------|
| CEP | válido com/sem máscara, inválido, vazio, normalização determinística. |
| Regras por UF | aplica UF correta, ignora UF sem regra, prioridade determinística. |
| Regras por faixa de CEP | início/fim inclusivos, fora da faixa, conflito com prioridade. |
| Cotação | gera opções manuais, valor em centavos, prazo estimado, expiração 30 min. |
| Cálculo | subtotal - desconto + frete; frete nunca negativo. |
| `free_shipping` | zera frete manual elegível, não cria frete artificial, não altera desconto monetário. |

## 2. Unitários de service/repository/actions

| Área | Casos |
|------|-------|
| Fallback | dev/test fixture explícito; preview/prod sem banco falha seguro. |
| Banco real | erro com `DATABASE_URL` não vira fixture silenciosa. |
| Ownership | userId/guestCartToken corretos; carrinho alheio bloqueado. |
| Payload malicioso | `cartId`, owner, frete, total e provider enviados pelo cliente são ignorados/rejeitados. |
| Invalidação | add/update/remove/clear item, CEP alterado e cupom alterado. |
| Admin | admin/manager permitidos; customer/visitante bloqueados; sem credenciais externas. |
| Providers externos | Correios/Jadlog/Melhor Envio não são chamados em runtime. |

## 3. E2E

| Fluxo | Aceite |
|-------|--------|
| Visitante cota frete | Informa CEP, vê opções manuais e indicação de fallback quando aplicável. |
| Visitante seleciona frete | Total parcial com frete atualiza. |
| CEP sem cobertura | Erro controlado; nenhuma seleção indevida. |
| Cupom `free_shipping` | Frete manual elegível fica 0; sem pedido/pagamento. |
| Alteração de carrinho | Frete selecionado invalida ou recalcula. |
| Admin frete | Admin/manager lista regras; customer/visitante bloqueados. |
| Escopo proibido | Nenhum checkout, Stripe, pedido, reserva ou baixa de estoque é criado. |

## 4. Validações finais

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e`

## 5. Critérios de aceite de validação

- Todos os comandos passam sem banco real obrigatório e sem credenciais externas.
- Testes deixam explícito que provider externo é inativo.
- Testes cobrem fallback sem `DATABASE_URL`.
- Testes cobrem `free_shipping` restrito ao frete manual.
- Testes cobrem ownership e payload malicioso.
