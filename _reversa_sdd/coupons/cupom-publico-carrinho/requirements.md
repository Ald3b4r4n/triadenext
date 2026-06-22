# Coupons / Cupom Publico no Carrinho

> Spec executavel da subunit `coupons/cupom-publico-carrinho`.
> Foca no QUE o sistema deve garantir quando um usuario aplica, remove e visualiza cupom no carrinho publico.

## Visao Geral

A subunit `cupom-publico-carrinho` cobre a experiencia publica de cupom dentro do carrinho. Ela conecta o formulario de cupom da UI ao service de carrinho e ao service de cupons, garantindo que codigo promocional seja normalizado, validado contra subtotal server-side, persistido no carrinho ativo e recalculado com segurança.

O cupom publico nao deve consumir uso, nao deve confirmar pagamento, nao deve alterar estoque e nao deve confiar em calculo client-side. A fonte de verdade para elegibilidade e desconto permanece no servidor.

## Escopo

- Renderizar painel publico de cupom no carrinho.
- Aceitar codigo de cupom informado pelo usuario.
- Normalizar codigo antes da validacao.
- Validar cupom contra subtotal atual server-side.
- Aplicar cupom valido ao carrinho ativo.
- Rejeitar cupom invalido com mensagem amigavel.
- Remover cupom aplicado.
- Recalcular totais apos aplicar/remover cupom.
- Revalidar cupom durante recalculo do carrinho.
- Remover cupom aplicado quando ele deixar de ser valido.
- Representar cupom aplicado na UI publica.
- Usar fallback seguro dev/test quando banco nao estiver configurado.

## Fora de Escopo

- Criar, editar ou listar cupons administrativos.
- Incrementar `usedCount`.
- Criar pedido.
- Confirmar pagamento.
- Fazer settlement Stripe.
- Reservar ou decrementar estoque.
- Enviar email.
- Integrar Bling/NF-e.
- Rodar migrations.
- Conectar banco de producao durante validacao documental.
- Alterar Laravel legado.

## Atores

| Ator | Descricao | Permissao esperada |
|------|-----------|--------------------|
| Guest | Visitante anonimo com carrinho por token. | Pode aplicar/remover cupom no proprio carrinho. |
| Customer | Usuario autenticado com carrinho ativo. | Pode aplicar/remover cupom no proprio carrinho. |
| Sistema | Server actions/services. | Valida cupom, persiste referencia e recalcula totais. |
| Admin | Usuario administrativo. | Sem privilegio especial neste fluxo publico. |

## Regras de Negocio

- 🟢 Aplicar cupom deve resolver ator com suporte a guest token.
- 🟢 Codigo informado deve ser trimado e normalizado para uppercase.
- 🟢 Cupom deve existir ou retornar `coupon_not_found`.
- 🟢 Cupom deve estar ativo, vigente e nao esgotado.
- 🟢 Cupom deve respeitar subtotal minimo.
- 🟢 Cupom percentual deve ter valor entre 1 e 100.
- 🟢 Cupom fixo deve ter valor inteiro positivo.
- 🟢 Desconto percentual e fixo devem ser limitados ao subtotal.
- 🟢 Cupom `free_shipping` nao gera desconto direto de itens; prepara beneficio de frete.
- 🟢 Aplicar cupom deve usar subtotal server-side atual, nao subtotal enviado pelo cliente.
- 🟢 Cupom valido deve ser associado ao carrinho ativo e recalculado.
- 🟢 Cupom invalido nao deve alterar totais nem persistir referencia invalida.
- 🟢 Remover cupom deve limpar referencia no carrinho e recalcular totais.
- 🟢 Recalculo do carrinho deve revalidar cupom aplicado.
- 🟢 Cupom que deixou de ser valido deve ser removido durante recalculo.
- 🟢 Aplicar cupom no carrinho nao deve incrementar `usedCount`.
- 🟢 Criar pedido aguardando pagamento nao deve incrementar `usedCount`.
- 🟢 Incremento de uso pertence apenas ao settlement financeiro confirmado.
- 🟢 Sem banco fora de dev/test, validacao deve retornar erro seguro `database_unavailable`.
- 🟢 Em dev/test sem banco, fallback deve ser explicito.
- 🟡 Cupom de frete gratis depende da regra de frete do carrinho para zerar frete manual elegivel.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-PUBLIC-COUPON-01 | Exibir painel de cupom sem cupom aplicado. | Must | Carrinho exibe heading "Cupom", campo de codigo e CTA para aplicar. |
| RF-PUBLIC-COUPON-02 | Aceitar codigo informado pelo usuario. | Must | Usuario consegue enviar codigo via action server-side. |
| RF-PUBLIC-COUPON-03 | Normalizar codigo. | Must | Entrada `" promo10 "` vira `"PROMO10"`. |
| RF-PUBLIC-COUPON-04 | Validar cupom contra subtotal server-side. | Must | O subtotal usado vem do carrinho ativo recalculado no servidor. |
| RF-PUBLIC-COUPON-05 | Aplicar cupom percentual valido. | Must | Cupom valido reduz total parcial pelo percentual limitado ao subtotal. |
| RF-PUBLIC-COUPON-06 | Aplicar cupom fixo valido. | Must | Cupom valido reduz total parcial pelo valor limitado ao subtotal. |
| RF-PUBLIC-COUPON-07 | Aplicar cupom de frete gratis. | Must | Cupom fica aplicado e prepara beneficio de frete gratis sem desconto direto nos itens. |
| RF-PUBLIC-COUPON-08 | Rejeitar cupom inexistente. | Must | Retorna mensagem amigavel e nao altera carrinho. |
| RF-PUBLIC-COUPON-09 | Rejeitar cupom inativo, futuro, expirado ou esgotado. | Must | Retorna erro amigavel e nao persiste cupom no carrinho. |
| RF-PUBLIC-COUPON-10 | Rejeitar subtotal minimo nao atendido. | Must | Cupom nao e aplicado quando subtotal atual esta abaixo do minimo. |
| RF-PUBLIC-COUPON-11 | Exibir cupom aplicado. | Must | UI mostra codigo, valor/label e CTA de remocao. |
| RF-PUBLIC-COUPON-12 | Remover cupom aplicado. | Must | Referencia do cupom e limpa e totais sao recalculados. |
| RF-PUBLIC-COUPON-13 | Revalidar cupom no recalculo. | Must | Cupom stale/invalido e removido durante recalculo do carrinho. |
| RF-PUBLIC-COUPON-14 | Atualizar UI apos aplicacao/remocao. | Should | Fluxo chama refresh/revalidate necessario para refletir totais. |
| RF-PUBLIC-COUPON-15 | Preservar carrinho de guest. | Must | Guest recebe token se necessario e opera apenas no proprio carrinho. |
| RF-PUBLIC-COUPON-16 | Preservar carrinho de customer. | Must | Customer aplica/remove cupom no proprio carrinho ativo. |
| RF-PUBLIC-COUPON-17 | Nao consumir uso ao aplicar. | Must | `usedCount` nao muda ao aplicar/remover cupom no carrinho. |
| RF-PUBLIC-COUPON-18 | Bloquear sem banco fora dev/test. | Must | Retorna `database_unavailable` sem fallback silencioso. |
| RF-PUBLIC-COUPON-19 | Usar fallback explicito em dev/test. | Should | Cupom fixture pode ser validado com mensagem clara de ambiente. |

## Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia esperada | Confianca |
|------|-----------|--------------------|-----------|
| Integridade | Subtotal e desconto sao calculados no servidor. | `applyCouponToActiveCart`, `validateCouponForCart`. | 🟢 |
| Seguranca | Usuario opera apenas no proprio carrinho. | Resolucao de ator/cart ativo. | 🟢 |
| Consistencia | Cupom stale e removido no recalculo. | `recalculateCartView`. | 🟢 |
| Resiliencia | Sem banco em dev/test usa fallback explicito. | `coupon-repository` fallback. | 🟢 |
| UX | Mensagens de sucesso/erro sao amigaveis. | Painel de cupom e action results. | 🟢 |
| Financeiro | Desconto nunca gera total negativo. | Clamp de desconto no dominio. | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: aplicar cupom percentual valido
  Dado carrinho ativo com subtotal de R$ 100,00
  E cupom PROMO10 ativo do tipo percentage com valor 10
  Quando usuario aplica o codigo "promo10"
  Entao o cupom e persistido no carrinho
  E o desconto e R$ 10,00
  E a UI mostra mensagem de cupom aplicado

Cenario: aplicar cupom fixo maior que subtotal
  Dado carrinho ativo com subtotal de R$ 80,00
  E cupom FIXO100 ativo de valor R$ 100,00
  Quando usuario aplica o cupom
  Entao o desconto e limitado a R$ 80,00
  E total parcial nao fica negativo

Cenario: rejeitar cupom inexistente
  Dado carrinho ativo
  Quando usuario aplica codigo inexistente
  Entao o sistema retorna mensagem amigavel
  E o carrinho permanece sem cupom aplicado

Cenario: remover cupom
  Dado carrinho com cupom aplicado
  Quando usuario remove o cupom
  Entao a referencia do cupom e limpa
  E os totais sao recalculados sem desconto

Cenario: cupom aplicado fica expirado
  Dado carrinho com cupom aplicado
  E o cupom expira antes do recalculo
  Quando carrinho e recalculado
  Entao o cupom e removido
  E o total volta a considerar somente itens e frete aplicavel

Cenario: aplicar cupom sem banco em producao
  Dado ambiente production sem DATABASE_URL
  Quando usuario tenta aplicar cupom
  Entao o sistema retorna database_unavailable
  E nao usa fixture de desenvolvimento
```

## Contratos de Entrada

| Campo | Origem | Regra |
|-------|--------|-------|
| `code` | Campo publico de cupom | Obrigatorio, trimado, normalizado para uppercase e validado no servidor. |
| `cart actor` | Sessao/customer/guest token | Resolvido no servidor com `createGuestToken` quando aplicavel. |
| `subtotal` | Carrinho ativo | Calculado no servidor; nunca confiar em valor enviado pelo cliente. |

## Contratos de Saida

### Aplicar Cupom

- `success`: cupom aplicado e carrinho recalculado.
- `coupon_invalid`: cupom inexistente, inelegivel ou subtotal insuficiente.
- `validation_error`: codigo vazio/invalido.
- `database_unavailable`: ambiente sem banco fora de dev/test.
- `blocked`: guardrail ou estado de carrinho impede operacao.

### Remover Cupom

- `success`: cupom removido e carrinho recalculado.
- `blocked`: carrinho nao encontrado/indisponivel.
- `validation_error`: estado inconsistente ou requisicao invalida.

## Rastreabilidade de Codigo

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/features/cart/components/cart-coupon-panel.tsx` | UI publica de cupom no carrinho. |
| `src/features/cart/server/cart-actions.ts` | Actions de aplicar/remover cupom. |
| `src/features/cart/server/cart-service.ts` | `applyCouponToActiveCart`, `removeCouponFromActiveCart`, `recalculateCartView`. |
| `src/features/coupons/server/coupon-service.ts` | `validateCouponForCart`, `calculateAppliedCoupon`. |
| `src/features/coupons/domain.ts` | Normalizacao, status, validacao e calculo de desconto. |
| `src/features/coupons/server/coupon-repository.ts` | Busca de cupom por codigo/id e fallback. |
| `src/features/cart/types.ts` | Contratos de carrinho/view/totais. |
| `src/features/shipping/domain` | Aplicacao posterior de frete gratis manual elegivel. |

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Aplicar/remover cupom no carrinho | Must | E parte central do fluxo comercial antes do checkout. |
| Validar subtotal server-side | Must | Evita manipulacao client-side de desconto. |
| Revalidar cupom no recalculo | Must | Evita desconto stale ou indevido. |
| Nao consumir uso no carrinho | Must | Consumo pertence ao pagamento confirmado. |
| Fallback dev/test explicito | Must | Mantem desenvolvimento seguro sem banco real. |
| Refresh automatico da UI | Should | Melhora UX, mas nao muda regra de negocio. |

## Riscos e Lacunas

- 🟡 Cupom `free_shipping` depende do modulo de frete para zerar apenas frete manual elegivel.
- 🟡 Se a UI nao fizer refresh apos action, o resumo pode ficar visualmente defasado ate nova navegacao.
- 🟡 Fallback dev/test pode dar falsa sensacao de persistencia; mensagem precisa ser explicita.
- 🟡 Mudancas de itens no carrinho precisam acionar recalculo para remover cupom que deixou de ser valido.
- 🔴 Incrementar uso ao aplicar cupom seria bug financeiro; uso deve ser consumido somente em settlement confirmado.

## Guardrails

- Nao incrementar `usedCount` no carrinho.
- Nao criar pedido neste fluxo.
- Nao confirmar pagamento.
- Nao decrementar estoque.
- Nao enviar email.
- Nao rodar migrations.
- Nao conectar banco de producao em validacao documental.
- Nao expor secrets.
- Nao alterar Laravel legado.

## Definition of Done

- Painel publico de cupom renderiza estados sem/aplicado.
- Cupom valido aplica desconto ou beneficio preparado server-side.
- Cupom invalido falha com mensagem amigavel.
- Remocao limpa referencia e recalcula totais.
- Recalculo remove cupom stale.
- Guest/customer operam apenas no proprio carrinho.
- `usedCount` nao muda antes do settlement financeiro.
