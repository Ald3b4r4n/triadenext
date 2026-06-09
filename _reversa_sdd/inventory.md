# Inventario tecnico Reversa - Triade Essenza Next

Data da re-extracao: 2026-06-09
Escopo: estado do projeto Next.js apos Fase 7 concluida e enviada.

## Confirmacao de contexto

- Projeto atual: `D:\Projetos\triade-essenza-next`
- Nao e o legado Laravel: `D:\Projetos\triadeessenzaparfum.com.br`
- Branch: `main`
- Sincronia Git: `main...origin/main`
- Ultimo commit funcional confirmado: `5d103b7882e121fe4929537e50c0b4a0e40a615e feat: implement manual shipping quotes`

## Fases implementadas

| Fase | Commit | Estado | Observacoes |
| --- | --- | --- | --- |
| Fase 1 | `3f2e35e` | Concluida | Fundacao App Router, UI base e rotas iniciais |
| Fase 2 | `6c33c88` | Concluida | Persistencia inicial de catalogo e clientes |
| Fase 3 | `5635ccb` | Concluida | Catalogo publico com filtros e seed local |
| Fase 4 | `7ddf703` | Concluida | Autenticacao, papeis e admin base |
| Fase 5 | `7215cf1` | Concluida | Carrinho e sessao de compra sem checkout real |
| Fase 6 | `399953c` | Concluida | Cupons e descontos no carrinho |
| Fase 7 | `5d103b7` | Concluida | Frete manual, cotacao por CEP e admin basico de frete |

## Artefatos principais observados

### Aplicacao

- `src/app`: rotas App Router, incluindo catalogo, carrinho e areas admin.
- `src/features/catalog`: catalogo, produtos, filtros e componentes publicos.
- `src/features/auth`: login administrativo, sessao e papeis.
- `src/features/cart`: carrinho, itens, cupom aplicado, cotacao de frete e totais.
- `src/features/coupons`: validacao de cupons, tipos de desconto e `free_shipping`.
- `src/features/shipping`: regras manuais de frete, cotacoes, persistencia, admin e adapters futuros inativos.
- `src/db/schema.ts`: schema Drizzle com tabelas de catalogo, auth, carrinho, cupons e frete.
- `drizzle/0004_mute_ghost_rider.sql`: migration local gerada para frete; nao aplicada em banco real nesta etapa.

### Reversa

- `.reversa/state.json`
- `.reversa/context/current-state.json`
- `_reversa_sdd/inventory.md`
- `_reversa_sdd/architecture.md`
- `_reversa_sdd/domain.md`
- `_reversa_sdd/dependencies.md`
- `_reversa_sdd/data-dictionary.md`
- `_reversa_sdd/state-machines.md`
- `_reversa_sdd/permissions.md`
- `_reversa_forward/005-fase-7-frete-cotacoes/*`

## Capacidades atuais

- Catalogo publico com produtos e filtros.
- Autenticacao administrativa com papeis.
- Carrinho para visitante e usuario autenticado.
- Cupons percentuais, valor fixo e frete gratis.
- Frete manual por regras internas.
- Cotacao de frete por CEP.
- Regras de frete por UF e/ou faixa de CEP.
- Valor de frete em centavos.
- Prazo estimado manual.
- Selecao de frete persistida no carrinho.
- Total parcial com frete.
- `free_shipping` zerando somente frete manual calculado e elegivel.
- Admin basico de frete protegido por `admin`/`manager`.

## Frete manual - superficie tecnica

- Dominio: `src/features/shipping/domain.ts`
- Tipos: `src/features/shipping/types.ts`
- Servico server-side: `src/features/shipping/server/shipping-service.ts`
- Repositorio server-side: `src/features/shipping/server/shipping-repository.ts`
- Acoes admin: `src/features/shipping/server/admin-shipping-actions.ts`
- Fixtures locais: `src/features/shipping/server/shipping-fixtures.ts`
- Providers futuros: `src/features/shipping/future-providers.ts`
- UI de cotacao no carrinho: `src/features/shipping/components/shipping-quote-panel.tsx`
- UI admin: `src/app/admin/frete/**`

## Integracoes externas

| Integracao | Estado atual | Observacao |
| --- | --- | --- |
| Correios | Adapter futuro inativo | Nenhuma API real chamada |
| Jadlog | Adapter futuro inativo | Nenhuma API real chamada |
| Melhor Envio | Adapter futuro inativo | Nenhuma API real chamada |
| Stripe | Fora do escopo atual | Checkout/pagamento nao implementados |
| Banco real | Fora desta etapa | Nenhuma migration aplicada nesta re-extracao |

## Validacoes informadas para Fase 7

- `pnpm lint`: passou
- `pnpm typecheck`: passou
- `pnpm test`: passou, 23 arquivos / 67 testes
- `pnpm build`: passou
- `pnpm test:e2e`: passou, 21 testes

## Fora do escopo atual

- Checkout real.
- Pagamento.
- Stripe.
- Pedido.
- Reserva de estoque.
- Baixa de estoque.
- Chamadas reais a APIs de frete.
- Credenciais externas de frete.
- Aplicacao de migrations em banco real.

## Proxima etapa recomendada

A proxima feature deve ser aberta com:

```text
/reversa-requirements
```
