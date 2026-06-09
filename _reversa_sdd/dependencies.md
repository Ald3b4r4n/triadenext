# Dependencias Reversa - Triade Essenza Next

Data: 2026-06-09
Escopo: dependencias apos Fase 7.

## Dependencias de runtime observadas

| Area | Uso |
| --- | --- |
| Next.js App Router | Rotas, server components e server actions |
| React | Componentes de UI |
| Drizzle | Schema, queries e migrations locais |
| Zod | Validacao de formularios, cupons, carrinho e frete |
| server-only | Isolamento de modulos server-side |
| Stripe | Dependencia existente/futura; checkout fora do escopo atual |

## Modulos internos

| Modulo | Dependencias internas principais |
| --- | --- |
| `catalog` | Schema de produtos/categorias, componentes publicos |
| `auth` | Sessao, papeis, protecao admin |
| `cart` | Catalogo, cupons, frete, repositorio de carrinho |
| `coupons` | Carrinho e regras de desconto |
| `shipping` | Carrinho, auth admin, Drizzle/fallback local |

## Frete

O modulo `src/features/shipping` nao adiciona dependencia externa de provider. Ele usa:

- Tipos e dominio locais.
- Zod para formularios e actions.
- Drizzle/fallback para regras e cotacoes.
- `requireAdminLike` para admin de frete.
- Integracao com carrinho por servicos server-side.

Providers externos mapeados:

| Provider | Estado | Dependencia externa |
| --- | --- | --- |
| Correios | Futuro inativo | Nenhuma |
| Jadlog | Futuro inativo | Nenhuma |
| Melhor Envio | Futuro inativo | Nenhuma |

Nao ha chamada real a API de frete, nem leitura de credenciais de frete na Fase 7.

## Persistencia

- Schema Drizzle atualizado para campos de frete em `carts`.
- Tabela `shipping_rules` para regras manuais.
- Tabela `shipping_quotes` para cotacoes.
- Migration local gerada: `drizzle/0004_mute_ghost_rider.sql`.
- Nenhuma migration foi aplicada em banco real nesta etapa.

## Scripts validados na Fase 7

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` - 23 arquivos / 67 testes
- `pnpm build`
- `pnpm test:e2e` - 21 testes

## Riscos de dependencia

- Ativar provider externo de frete exigira nova camada de credenciais, retries, erros de API e testes dedicados.
- Ativar checkout/pagamento exigira contrato novo entre carrinho, frete, cupom, pedido e pagamento.
- Aplicar migrations em banco real deve ser tratado em etapa operacional separada.
