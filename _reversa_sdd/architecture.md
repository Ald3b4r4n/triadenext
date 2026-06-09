# Arquitetura Reversa - Triade Essenza Next

Data: 2026-06-09
Escopo: arquitetura do projeto Next.js apos Fase 7.

## Visao geral

O sistema atual e uma aplicacao Next.js App Router para a operacao da Triade Essenza Parfum. O projeto substitui gradualmente o legado Laravel por uma stack moderna com dominio modular em `src/features`, persistencia Drizzle e fluxos server-side para regras sensiveis.

Apos a Fase 7, o carrinho passou a incorporar frete manual calculado por regras internas, cotacao por CEP, selecao persistida e total parcial com frete. Providers externos existem apenas como adapters futuros inativos.

## Camadas

| Camada | Local | Responsabilidade |
| --- | --- | --- |
| Rotas | `src/app/**` | Paginas publicas, admin e server actions de rota |
| Dominio | `src/features/*/domain.ts` | Regras puras de negocio |
| Servicos server-side | `src/features/*/server/**` | Orquestracao com sessao, permissao, repositorios e efeitos locais |
| Repositorios | `src/features/*/server/*repository.ts` | Acesso a Drizzle ou fallback local controlado |
| Componentes | `src/features/*/components/**` | UI de catalogo, carrinho, cupons, frete e admin |
| Persistencia | `src/db/schema.ts`, `drizzle/**` | Schema Drizzle e migrations locais |

## Modulos funcionais

### Catalogo

- Produtos, categorias, filtros e pagina publica.
- Dados persistidos via schema Drizzle e seeds locais.

### Autenticacao e permissoes

- Sessao administrativa.
- Papeis `admin`, `manager` e usuarios com escopo restrito.
- Protecao de areas admin por helpers server-side.

### Carrinho

- Carrinho ativo por visitante ou usuario autenticado.
- Itens com quantidade e precos em centavos.
- Cupom aplicado ao carrinho.
- Selecao de frete persistida.
- Campos de frete:
  - CEP cotado.
  - quote selecionada.
  - opcao selecionada.
  - valor de frete em centavos.
  - total parcial com frete.
- Alteracoes de itens invalidam a selecao de frete para evitar total stale.

### Cupons

- Tipos principais: percentual, valor fixo e `free_shipping`.
- Cupom `free_shipping` nao cria desconto monetario direto em itens.
- Na Fase 7, `free_shipping` zera somente frete manual calculado e elegivel.

### Frete manual

- Modulo: `src/features/shipping`.
- Regras internas por UF e/ou faixa de CEP.
- Cotacao por CEP normalizado.
- Ordenacao de regras aplicaveis por prioridade, preco e nome.
- Cotacao com validade local.
- Selecao de opcao persistida no carrinho.
- Admin basico de regras em `/admin/frete`.
- Protecao admin/manager via `requireAdminLike`.
- Sem chamada real a Correios, Jadlog ou Melhor Envio.
- Sem credenciais externas obrigatorias.

## Persistencia

Migrations locais observadas:

- `drizzle/0000_initial_schema.sql`
- `drizzle/0001_phase_4_auth.sql`
- `drizzle/0002_cart_purchase_session.sql`
- `drizzle/0003_*` relacionada a cupons/descontos
- `drizzle/0004_mute_ghost_rider.sql` gerada para Fase 7 de frete

A migration `0004_mute_ghost_rider.sql` foi gerada localmente e versionada, mas nao foi aplicada em banco real durante esta re-extracao.

## Banco e entidades relevantes

- `products`, `categories`: catalogo.
- `customers`, `admin_users` e entidades de auth: identidade e permissoes.
- `carts`, `cart_items`: carrinho.
- `coupons`, `coupon_redemptions`: cupons.
- `shipping_rules`: regras manuais de frete.
- `shipping_quotes`: cotacoes de frete geradas para carrinhos.

## Integracoes externas

| Area | Estado |
| --- | --- |
| Frete externo | Somente adapters futuros inativos |
| Pagamento/Stripe | Fora do escopo implementado |
| Banco real | Nao acessado nesta etapa |
| Deploy | Nao executado nesta etapa |

## Guardrails arquiteturais atuais

- Regras sensiveis de carrinho, cupom e frete ficam no servidor.
- Payloads de cliente nao sao fonte de verdade para totais, dono do carrinho ou valor de frete.
- Selecao de quote exige pertencer ao carrinho ativo.
- Providers externos de frete permanecem declarativos e inativos.
- Checkout, pagamento, pedido, reserva e baixa de estoque ainda nao existem como fluxo produtivo.

## Proxima evolucao

A proxima fase deve iniciar em `/reversa-requirements`, definindo explicitamente o proximo incremento antes de qualquer alteracao funcional.
