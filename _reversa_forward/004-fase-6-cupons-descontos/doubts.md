# Clarificação — Fase 6 Cupons e Descontos

> Feature: `004-fase-6-cupons-descontos`
> Data: `2026-06-08`
> Documento base: `_reversa_forward/004-fase-6-cupons-descontos/requirements.md`

## Resumo

Todas as dúvidas abertas no requirements inicial foram resolvidas por decisão humana. A Fase 6 permanece limitada a cupons e descontos no carrinho, sem checkout, pagamento, frete real, pedido, reserva ou baixa de estoque.

## Decisões

### 1. Escopo comercial do MVP

- Tipos implementáveis no MVP:
  - cupom percentual;
  - cupom de valor fixo.
- Cupom de frete grátis:
  - fica apenas modelado/preparado;
  - não calcula frete real;
  - não zera frete real;
  - não promete frete grátis em checkout.
- Acumulação:
  - apenas um cupom por carrinho;
  - cupons acumulativos ficam fora da Fase 6.

### 2. Elegibilidade avançada

- Subtotal mínimo entra na Fase 6 via `minimumSubtotalCents`.
- Se o subtotal do carrinho ficar abaixo do mínimo, o cupom deve ser removido, invalidado ou sinalizado de forma controlada.
- Limite por usuário fica fora desta fase.
- Restrição por produto/categoria fica fora desta fase.
- Cupons do MVP são globais para o carrinho.
- Não entram elegibilidades por marca, categoria, produto, cliente, primeira compra ou campanha.

### 3. Operação e persistência

- `usedCount` não é consumido ao aplicar cupom no carrinho.
- Aplicar/remover cupom apenas valida e persiste associação ao carrinho quando houver banco real.
- Limite global de uso deve ser consultado para decidir aplicabilidade.
- Consumo de uso fica para fase futura de pedido/checkout.

### 4. Admin básico

- Admin básico de cupons entra como fundação mínima.
- Deve haver listagem de cupons.
- Criação/edição básica pode entrar se o plano técnico considerar seguro e compatível.
- Admin de cupons exige admin/manager autenticado.
- Customer e visitante não acessam admin de cupons.
- Campanhas avançadas, restrição por produto/categoria, limite por usuário e relatórios ficam fora.

### 5. Fallback sem banco

- Sem `DATABASE_URL`, aplicação de cupom funciona apenas em modo dev/fixture controlado.
- Não há falsa persistência real.
- Build/test não exigem banco real.
- E2E padrão pode usar fallback/dev fixture.
- Preview/produção sem banco falham de forma segura para mutações reais.
- Com `DATABASE_URL`, erro real não deve cair em fallback silencioso.

## Dúvidas remanescentes

Nenhuma.

## Guardrails preservados

- Não implementar checkout.
- Não implementar pagamento.
- Não implementar Stripe.
- Não implementar frete real.
- Não criar pedido.
- Não reservar estoque.
- Não baixar estoque.
- Não rodar migration real sem validação humana explícita.
- Não expor secrets, `DATABASE_URL`, cookies, tokens ou credenciais.
- Não modificar o Laravel legado.
- Não fazer deploy.
- Não fazer push.
