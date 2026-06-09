# Legacy Direction Check - Fase 6 Cupons e Descontos

Data: 2026-06-08

## Objetivo

Auditar se a recriacao da Fase 6 no projeto Next.js segue um caminho correto em relacao ao sistema Laravel legado, usando as lentes Reversa Scout, Archaeologist, Detective, Paradigm Advisor, Inspector e Reviewer.

Esta auditoria nao implementa codigo, nao altera schema, nao executa migrations e nao modifica o projeto Laravel legado.

## Escopo Consultado

### Legado Laravel

- `app/Models/Coupon.php`
- `app/Domain/Cart/Services/CartPricingService.php`
- `app/Http/Controllers/Cart/CartController.php`
- `app/Http/Requests/Cart/ApplyCouponRequest.php`
- `app/Http/Requests/Admin/StoreCouponRequest.php`
- `app/Http/Requests/Admin/UpdateCouponRequest.php`
- `database/migrations/2026_05_04_230047_create_cart_coupon_shipping_tables.php`
- `tests/Unit/Coupons/CouponValidationTest.php`
- `tests/Feature/Cart/CartWorkflowTest.php`
- `_reversa_sdd/`

### Projeto Next.js

- `src/db/schema.ts`
- `src/features/cart/server/cart-service.ts`
- `_reversa_forward/004-fase-6-cupons-descontos/requirements.md`
- `_reversa_forward/004-fase-6-cupons-descontos/doubts.md`
- `_reversa_forward/004-fase-6-cupons-descontos/roadmap.md`
- `_reversa_forward/004-fase-6-cupons-descontos/data-delta.md`
- `_reversa_forward/004-fase-6-cupons-descontos/validation-plan.md`
- `_reversa_forward/004-fase-6-cupons-descontos/interfaces/`
- `_reversa_forward/004-fase-6-cupons-descontos/actions.md`

## Scout

O legado concentra cupons em tres superficies principais:

- modelo `Coupon`, com normalizacao, status calculado e calculo de desconto;
- controller de carrinho, com aplicar/remover cupom via sessao;
- service `CartPricingService`, com subtotal, desconto, frete e total.

A tabela `coupons` do legado possui `code`, `type`, `value`, `starts_at`, `ends_at`, `max_uses`, `used_count` e `is_active`.

O legado nao persiste cupom aplicado na tabela `carts`; o cupom aplicado fica na sessao em `cart_coupon_code`.

## Archaeologist

Regras extraidas do legado:

- codigo de cupom e normalizado com `trim` e uppercase;
- tipos legados: `percent` e `fixed`;
- status efetivos:
  - inactive quando `is_active` e falso;
  - scheduled quando `starts_at` esta no futuro;
  - expired quando `ends_at` esta no passado;
  - exhausted quando `used_count >= max_uses`;
  - active nos demais casos validos;
- desconto percentual calcula percentual sobre subtotal;
- desconto fixo e limitado ao subtotal;
- desconto nunca deve tornar total negativo;
- cupom invalido, expirado, inativo, agendado ou esgotado nao deve ser aplicado;
- remover cupom limpa a sessao;
- aplicar/remover cupom nao cria pedido;
- aplicar/remover cupom nao consome `used_count`;
- frete existe no legado, mas e calculado em superficie propria e nao deve entrar como implementacao real nesta fase.

## Detective

Regras implicitas relevantes:

- `used_count` existe, mas a politica de incremento nao esta comprovada no fluxo de carrinho; deve permanecer fora da Fase 6.
- cupom aplicado em carrinho e uma intencao de precificacao, nao uma compra confirmada.
- desconto depende do subtotal atual, logo recalculo precisa ocorrer quando itens mudam.
- cupons devem ser validados server-side, inclusive quando action direta for chamada.
- admin cria e edita cupom, mas isso nao autoriza uso de cupom invalido no carrinho.

## Paradigm Advisor

O caminho atual esta correto.

O legado usa Laravel MVC, Eloquent Active Record, requests validados, controllers e services. O projeto Next.js segue arquitetura diferente: App Router, server actions, Better Auth, policies server-side, Drizzle e services/repositories.

A recriacao nao deve copiar a forma do legado; deve preservar comportamento. O plano atual faz isso ao mover regras para dominio/service server-side, manter actions como camada de entrada, proteger admin com `requireAdminLike` e proteger carrinho por ownership.

## Inspector

Para provar equivalencia comportamental, a Fase 6 deve manter testes para:

- normalizacao de codigo uppercase/trim;
- cupom ativo aplicavel;
- cupom inativo bloqueado;
- cupom expirado bloqueado;
- cupom futuro/agendado bloqueado;
- cupom esgotado bloqueado;
- desconto percentual;
- desconto fixo;
- desconto limitado ao subtotal;
- total/subtotal em centavos;
- aplicar cupom sem incrementar `usedCount`;
- remover cupom recalculando o carrinho;
- action direta nao burlando validacao;
- usuario nao acessando carrinho de outro usuario;
- fallback sem banco explicito;
- `free_shipping` preparado sem frete real nesta fase.

Tambem e recomendavel testar paridade de arredondamento entre o legado decimal e o Next em centavos.

## Reviewer Findings

### MEDIUM - Divergencia de tipos de cupom

O legado usa `percent` e `fixed`. O schema atual do Next usa `percentage`, `fixed_amount` e `free_shipping`.

Esta divergencia e aceitavel como modernizacao, mas precisa ficar documentada como mapeamento explicito de migracao/importacao:

- `percent` -> `percentage`
- `fixed` -> `fixed_amount`

Sem esse mapeamento, uma futura migracao de dados pode importar cupons com tipo invalido.

### MEDIUM - Persistencia de cupom aplicado mudou de sessao para banco

No legado, o cupom aplicado fica em sessao (`cart_coupon_code`). A Fase 6 planeja persistir referencia/codigo de cupom no carrinho.

Esta mudanca e defensavel porque o Next ja possui carrinho autenticado por `userId` e persistencia entre dispositivos, mas deve ser registrada como divergencia intencional, com ownership e guest token protegidos.

### MEDIUM - `free_shipping` e novo/preparado, nao legado

O legado tem frete separado por shipping options/quotes e nao possui tipo de cupom `free_shipping`.

Como frete esta fora de escopo, `free_shipping` deve permanecer preparado e nao produzir desconto real de frete nesta fase. Se aparecer na UI/admin, deve estar claramente limitado para nao sugerir checkout/frete implementado.

### MEDIUM - Paridade de arredondamento precisa de teste

O legado calcula desconto com decimal e `round`. O Next trabalha em centavos.

A decisao de usar centavos esta correta, mas os testes devem cobrir percentuais com arredondamento para evitar diferenca sutil entre PHP e JavaScript.

### LOW - `minimumSubtotalCents` e regra nova

O legado consultado nao possui `minimum_subtotal`. A Fase 6 inclui minimo de subtotal por decisao humana.

Isso e aceitavel, mas deve ser documentado como extensao do MVP, nao como paridade legada.

### LOW - Admin CRUD do legado e mais amplo

O legado possui superficies administrativas alem de criar/editar/listar, incluindo alternar estado e excluir em alguns fluxos.

Se a Fase 6 mantiver CRUD admin minimo, isso deve ser tratado como recorte consciente da fase, nao como paridade administrativa completa.

### LOW - Cupom invalido em sessao legada e ignorado silenciosamente

O legado ignora cupom invalido ao recalcular, mas pode manter a chave de sessao. O Next deve preferir aviso/limpeza controlada, conforme requirements.

Essa divergencia melhora a UX e a seguranca operacional, mas precisa ser testada para nao confundir o usuario.

## Veredito

A recriacao esta no caminho correto.

As decisoes atuais preservam o comportamento essencial do legado e adaptam a implementacao ao paradigma do Next.js com server actions, Drizzle, Better Auth, policies e carrinho persistido.

Nao ha achado que recomende interromper a Fase 6. Antes de `/reversa-coding`, recomenda-se que a auditoria cruzada confirme explicitamente:

- mapeamento `percent`/`fixed` para `percentage`/`fixed_amount`;
- persistencia de cupom aplicado no carrinho como divergencia intencional;
- `free_shipping` apenas preparado, sem frete real;
- testes de arredondamento em centavos;
- `usedCount` sem incremento no carrinho;
- admin sem bypass de validade do cupom.

## Proximo Passo Recomendado

Executar `/reversa-audit` para validar se `actions.md` cobre os pontos desta auditoria antes de iniciar `/reversa-coding`.
