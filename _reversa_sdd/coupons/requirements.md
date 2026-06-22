# Coupons

> Spec executavel da unit `coupons`. Foca no QUE o sistema deve garantir para normalizacao, validacao, calculo, fallback dev/test e administracao protegida de cupons.

## Visao Geral

A unit `coupons` gerencia codigos promocionais usados no carrinho e no checkout. Ela normaliza codigos, valida vigencia/status/limites, calcula descontos percentuais ou fixos, prepara beneficio de frete gratis, fornece fallback seguro sem banco em dev/test e expoe administracao protegida para listar, criar e atualizar cupons.

## Responsabilidades

- Normalizar codigo de cupom.
- Mapear tipos legados `percent` e `fixed` para tipos atuais.
- Determinar status do cupom.
- Validar cupom contra subtotal atual.
- Calcular desconto percentual ou valor fixo com clamp ao subtotal.
- Representar cupom em formato de view.
- Calcular cupom aplicado no carrinho.
- Bloquear cupom quando banco esta indisponivel fora de dev/test.
- Listar cupons para administracao.
- Criar cupom via administracao protegida.
- Atualizar cupom via administracao protegida.
- Usar fallback dev/fixture quando `DATABASE_URL` esta ausente.
- Bloquear mutacao real quando guardrail de runtime nao permite.
- Incrementar uso do cupom apos consumo confirmado por fluxos posteriores.

## Regras de Negocio

- 🟢 Codigo de cupom deve ser trimado e convertido para uppercase.
- 🟢 Codigo de cupom deve ter entre 1 e 64 caracteres nos schemas de entrada.
- 🟢 Tipo legado `percent` deve mapear para `percentage`.
- 🟢 Tipo legado `fixed` deve mapar para `fixed_amount`.
- 🟢 Tipos atuais aceitos: `percentage`, `fixed_amount`, `free_shipping`.
- 🟢 Cupom inactive retorna status `inactive`.
- 🟢 Cupom com `startsAt` futuro retorna status `scheduled`.
- 🟢 Cupom com `endsAt` passado retorna status `expired`.
- 🟢 Cupom com `usedCount >= maxUses` retorna status `exhausted`.
- 🟢 Cupom ativo deve passar por validacao de subtotal.
- 🟢 Subtotal menor ou igual a zero invalida cupom.
- 🟢 `minimumSubtotalCents` deve ser respeitado.
- 🟢 Percentual deve ser maior que 0 e menor ou igual a 100.
- 🟢 Valor fixo deve ser inteiro positivo.
- 🟢 Desconto percentual e valor fixo devem ser limitados ao subtotal.
- 🟢 Cupom `free_shipping` nao gera desconto monetario direto; prepara beneficio de frete.
- 🟢 `toCouponView` deve expor `isPreparedBenefit` true para `free_shipping`.
- 🟢 Sem banco fora de dev/test, validacao de cupom deve retornar `database_unavailable`.
- 🟢 Admin de cupons exige politica admin-like.
- 🟢 Criar/atualizar cupom deve validar schema antes de persistir.
- 🟢 Mutacao real deve passar por `assertCanMutateRealData`.
- 🟢 Fallback sem banco deve usar `devCoupons` e mensagem explicita de sem persistencia real.
- 🟡 `updateCoupon` em fallback zera `usedCount` ao recriar cupom.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-COUPON-01 | Normalizar codigo. | Must | Entrada com espacos/minusculas vira codigo uppercase sem bordas. |
| RF-COUPON-02 | Mapear tipos legados. | Should | `percent` vira `percentage`; `fixed` vira `fixed_amount`. |
| RF-COUPON-03 | Determinar status ativo. | Must | Cupom ativo, vigente e com usos disponiveis retorna `active`. |
| RF-COUPON-04 | Determinar status inactive/scheduled/expired/exhausted. | Must | Campos `isActive`, `startsAt`, `endsAt`, `maxUses` geram status correto. |
| RF-COUPON-05 | Validar cupom inexistente. | Must | Cupom ausente retorna `coupon_not_found`. |
| RF-COUPON-06 | Validar subtotal. | Must | Subtotal zero/negativo ou menor que minimo retorna erro amigavel. |
| RF-COUPON-07 | Validar valor percentual. | Must | Percentual fora de 1..100 retorna `coupon_invalid_value`. |
| RF-COUPON-08 | Validar valor fixo. | Must | Valor fixo nao inteiro ou menor/igual a zero retorna `coupon_invalid_value`. |
| RF-COUPON-09 | Calcular desconto percentual. | Must | Desconto = subtotal * percentual / 100, arredondado e limitado ao subtotal. |
| RF-COUPON-10 | Calcular desconto fixo. | Must | Desconto fixo e limitado ao subtotal. |
| RF-COUPON-11 | Calcular free shipping. | Must | Cupom `free_shipping` retorna desconto 0 e `isPreparedBenefit=true`. |
| RF-COUPON-12 | Calcular cupom aplicado. | Must | Retorna `coupon`, `discountCents`, `partialTotalCents` e mensagens. |
| RF-COUPON-13 | Validar cupom no carrinho. | Must | `validateCouponForCart` busca codigo normalizado e valida contra subtotal. |
| RF-COUPON-14 | Bloquear validacao sem banco fora dev/test. | Must | Retorna `database_unavailable` com mensagem segura. |
| RF-COUPON-15 | Listar cupons admin. | Must | Admin-like recebe lista de `CouponView` ordenada por codigo. |
| RF-COUPON-16 | Criar cupom admin. | Must | Admin-like com dados validos cria cupom ou retorna fallback/bloqueio. |
| RF-COUPON-17 | Atualizar cupom admin. | Must | Admin-like com id e dados validos atualiza cupom existente. |
| RF-COUPON-18 | Bloquear admin sem permissao. | Must | Usuario sem politica admin-like recebe forbidden ou blocked. |
| RF-COUPON-19 | Incrementar uso. | Should | `incrementUsedCount` soma 1 ao `usedCount` quando cupom existe. |

## Requisitos Nao Funcionais

| Tipo | Requisito inferido | Evidencia no codigo | Confianca |
|------|--------------------|---------------------|-----------|
| Seguranca | Administracao exige `requireAdminLike`. | `admin-coupon-actions.ts` | 🟢 |
| Integridade | Mutacao real exige guardrail de runtime. | `coupon-repository.ts` | 🟢 |
| Consistencia | Desconto nunca passa do subtotal. | `clampDiscount`, `calculateCouponDiscountCents` | 🟢 |
| Compatibilidade | Tipos legados sao mapeados para tipos atuais. | `mapLegacyCouponType`, `normalizeCouponType` | 🟢 |
| Resiliencia | Fallback sem banco usa fixtures e mensagens explicitas. | `coupon-repository.ts`, `coupon-fixtures.ts` | 🟢 |
| Usabilidade | Views formatam valor em `%`, BRL ou frete gratis preparado. | `formatCouponValue`, `toCouponView` | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: validar cupom percentual ativo
  Dado cupom ativo do tipo percentage com valor 10
  E subtotal de R$ 100,00
  Quando calcula cupom aplicado
  Entao desconto e R$ 10,00
  E total parcial e R$ 90,00

Cenario: cupom fixo maior que subtotal
  Dado cupom fixed_amount de R$ 200,00
  E subtotal de R$ 100,00
  Quando calcula desconto
  Entao desconto e limitado a R$ 100,00

Cenario: cupom de frete gratis
  Dado cupom active do tipo free_shipping
  Quando gera CouponView
  Entao `isPreparedBenefit` e true
  E label e "Frete gratis preparado"

Cenario: cupom vencido
  Dado cupom com endsAt no passado
  Quando valida cupom
  Entao retorna invalid com codigo coupon_expired
  E mensagem "Cupom expirado."

Cenario: validacao sem banco em producao
  Dado ambiente production sem DATABASE_URL
  Quando valida cupom no carrinho
  Entao retorna invalid database_unavailable
  E nao usa fixture silencioso

Cenario: admin cria cupom sem permissao
  Dado usuario sem papel admin-like
  Quando chama createCouponAction
  Entao retorna forbidden ou blocked
  E nao persiste cupom
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Validacao de cupom no carrinho | Must | Protege total comercial antes de pedido/pagamento. |
| Calculo de desconto limitado ao subtotal | Must | Evita total negativo e abuso de desconto. |
| Status active/inactive/scheduled/expired/exhausted | Must | Define elegibilidade do cupom. |
| Admin protegido | Must | Mutacao de beneficio comercial e sensivel. |
| Fallback dev/test explicito | Must | Mantem desenvolvimento seguro sem banco real. |
| Incrementar uso | Should | Necessario no settlement, mas consumo acontece em fluxo posterior. |
| Mapeamento legado | Should | Ajuda migracao/compatibilidade, mas entradas atuais ja usam tipos novos. |

## Rastreabilidade de Codigo

| Arquivo | Funcao / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/features/coupons/domain.ts` | `normalizeCouponCode` | 🟢 |
| `src/features/coupons/domain.ts` | `mapLegacyCouponType`, `normalizeCouponType` | 🟢 |
| `src/features/coupons/domain.ts` | `getCouponStatus` | 🟢 |
| `src/features/coupons/domain.ts` | `validateCouponForSubtotal` | 🟢 |
| `src/features/coupons/domain.ts` | `calculateCouponDiscountCents` | 🟢 |
| `src/features/coupons/domain.ts` | `calculateCartCoupon` | 🟢 |
| `src/features/coupons/domain.ts` | `toCouponView`, `formatCouponValue` | 🟢 |
| `src/features/coupons/server/coupon-service.ts` | `validateCouponForCart`, `calculateAppliedCoupon` | 🟢 |
| `src/features/coupons/server/coupon-service.ts` | `listAdminCoupons`, `createAdminCoupon`, `updateAdminCoupon` | 🟢 |
| `src/features/coupons/server/coupon-repository.ts` | Drizzle/fallback repository | 🟢 |
| `src/features/coupons/server/admin-coupon-actions.ts` | admin actions e policies | 🟢 |
| `src/features/coupons/schemas.ts` | schemas publicos/admin | 🟢 |
| `src/features/coupons/types.ts` | contratos de cupom | 🟢 |

## Lacunas e Riscos

- 🟡 `free_shipping` prepara beneficio, mas zerar frete efetivo ocorre no carrinho.
- 🟡 Fallback de update recria cupom e pode zerar `usedCount`.
- 🟡 `parseOptionalDate` aceita `new Date(value)` sem checagem explicita de data invalida antes do schema.
- 🟡 Admin cria/atualiza sem checagem explicita de codigo duplicado no nivel service.
- 🔴 Incremento de uso deve acontecer apenas apos confirmacao financeira, para evitar consumo indevido antes de pagamento.
