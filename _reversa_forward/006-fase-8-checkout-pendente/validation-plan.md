# Validation Plan: Fase 8 - Checkout sem Pagamento Real e Pedido Pendente

> Identificador: `006-fase-8-checkout-pendente`
> Data: `2026-06-09`

## 1. Objetivo de validacao

Provar que o checkout autenticado cria pedido pendente com snapshot completo, sem pagamento real, sem Stripe, sem coleta de cartao, sem baixa/reserva definitiva de estoque e sem permitir valores forjados pelo cliente.

## 2. Validacoes unitarias

### Checkout / order service

- bloqueia carrinho vazio;
- bloqueia usuario nao autenticado;
- bloqueia pedido anonimo;
- bloqueia produto `draft`, `inactive`, futuro ou sem estoque;
- bloqueia quantidade acima do estoque;
- bloqueia cupom invalido, expirado, futuro, inativo ou esgotado;
- bloqueia frete ausente, expirado ou de outro carrinho;
- bloqueia endereco incompleto;
- recalcula subtotal, desconto, frete e total no servidor;
- preserva snapshot de itens, cliente, endereco, cupom e frete;
- cria pedido `aguardando_pagamento` com `expiresAt = createdAt + 60 minutos`;
- marca carrinho como convertido/bloqueado;
- nao incrementa `usedCount`;
- nao baixa nem reserva estoque;
- nao cria PaymentIntent;
- nao chama Stripe.

### Repository

- salva o pedido com referencia ao carrinho convertido;
- retorna pedido e items para leitura minima;
- respeita fallback explicitamente marcado;
- falha seguro quando o ambiente real nao esta pronto.

### Auth / policies

- `requireCustomer` protege o checkout;
- `requireAdminLike` protege a area admin;
- `requireOwner` nao permite pedido de outro usuario.

## 3. Validacoes de integracao

- checkout usa carrinho real ou fallback explicito;
- carrinho convertido bloqueia novas mutacoes;
- customer lista somente pedidos proprios;
- admin lista somente pedidos pendentes com leitura basica;
- docs de cart, coupons, shipping, database e payments sao atualizados.

## 4. Validacoes e2e

- usuario autenticado revisa checkout e cria pedido pendente;
- visitor recebe redirecionamento/instrucao para login;
- carrinho vazio nao avanca;
- produto indisponivel nao avanca;
- estoque insuficiente nao avanca;
- frete invalido/expirado nao avanca;
- endereco incompleto nao avanca;
- payload nao consegue forcar subtotal, desconto, frete ou total;
- pedido aparece na area customer;
- admin visualiza o pedido sem acoes financeiras;
- carrinho convertido nao aceita nova mutacao;
- ambiente sem `DATABASE_URL` nao cria pedido real.

## 5. Criterios de aceite de regressao

- `pnpm lint` sem erro;
- `pnpm typecheck` sem erro;
- `pnpm test` sem regressao;
- `pnpm build` sem regressao;
- `pnpm test:e2e` cobrindo os fluxos principais da Fase 8.

## 6. Dados de teste

- carrinho com 1 a 3 itens validos;
- cupom valido e cupom invalido;
- frete manual valido e invalido;
- usuario autenticado customer;
- usuario admin/manager;
- usuario visitante sem login;
- ambiente dev/test com fixture explicita;
- ambiente preview/producao sem `DATABASE_URL`.

## 7. Observabilidade esperada

- mensagens controladas para validacao;
- nenhum log com secrets, tokens ou dados de cartao;
- nenhum log com payload financeiro confiavel do cliente;
- nenhuma saida que tente mascarar erro real de banco.

## 8. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-09 | Validation plan inicial gerado por `/reversa-plan` | reversa |
