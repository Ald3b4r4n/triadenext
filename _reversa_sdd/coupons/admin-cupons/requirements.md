# Coupons / Admin Cupons

> Spec executavel da subunit `coupons/admin-cupons`.
> Foca no QUE a administracao de cupons deve garantir para listagem, criacao, edicao, validacao, permissao e fallback seguro.

## Visao Geral

A subunit `admin-cupons` cobre a experiencia administrativa para gerenciar cupons promocionais. O fluxo permite que usuarios com permissao admin-like consultem cupons existentes, criem novos codigos e atualizem configuracoes comerciais, sempre passando por validacao server-side, guardrails de mutacao real e mensagens seguras.

Esta subunit nao define aplicacao de cupom no carrinho, calculo de frete gratis, consumo em settlement ou regras de pagamento. Esses pontos pertencem a `coupons`, `cart`, `checkout` e `payments`.

## Escopo

- Listar cupons no painel administrativo.
- Criar cupom por action server-side protegida.
- Atualizar cupom por action server-side protegida.
- Validar campos administrativos de cupom.
- Normalizar codigo antes de persistir.
- Revalidar a rota administrativa apos mutacao bem-sucedida.
- Suportar fallback dev/test quando nao houver banco.
- Bloquear mutacao real quando o runtime nao permitir.
- Retornar erros de permissao, validacao e ambiente de forma segura.

## Fora de Escopo

- Aplicar cupom no carrinho publico.
- Recalcular totais do carrinho.
- Criar pedido ou snapshot de checkout.
- Incrementar uso apos pagamento.
- Integrar Stripe, email, Bling, NF-e ou frete externo.
- Rodar migrations ou conectar banco real durante execucao documental.
- Copiar `.env` ou expor secrets.
- Alterar Laravel legado.

## Atores

| Ator | Descricao | Permissao esperada |
|------|-----------|--------------------|
| Admin | Usuario com papel administrativo pleno. | Pode listar, criar e atualizar cupons. |
| Manager | Usuario com papel gerencial equivalente a admin-like. | Pode listar, criar e atualizar cupons quando policy permitir. |
| Customer | Usuario autenticado comum. | Nao pode acessar administracao de cupons. |
| Guest | Visitante anonimo. | Nao pode acessar administracao de cupons. |
| Sistema | Server action/service/repository. | Executa validacao, guardrails e persistencia/fallback. |

## Regras de Negocio

- 🟢 Toda action administrativa de cupom deve chamar `requireAdminLike`.
- 🟢 Usuario sem permissao admin-like nao pode listar, criar nem atualizar cupons.
- 🟢 Falha de permissao deve retornar `forbidden` ou `blocked`, sem revelar detalhes internos.
- 🟢 Criacao e atualizacao devem validar schema antes de chamar repository.
- 🟢 Codigo deve ser trimado, normalizado para uppercase e limitado pelo schema.
- 🟢 Tipo aceito no admin deve ser `percentage`, `fixed_amount` ou `free_shipping`.
- 🟢 Cupom percentual deve ter valor maior que 0 e menor ou igual a 100.
- 🟢 Cupom de valor fixo deve ter valor inteiro positivo.
- 🟢 Cupom de frete gratis deve ter valor numerico permitido pelo schema e ser tratado como beneficio preparado.
- 🟢 `isActive` controla se o cupom pode ficar elegivel ao uso publico.
- 🟢 `startsAt` e `endsAt` definem janela opcional de validade.
- 🟢 `maxUses` define limite opcional de consumo.
- 🟢 `minimumSubtotalCents` define subtotal minimo opcional em centavos.
- 🟢 Mutacao real deve passar por `assertCanMutateRealData`.
- 🟢 Sem banco em dev/test, o admin pode operar em fallback explicito sem persistencia real.
- 🟢 Sem banco fora de dev/test, fallback silencioso nao deve ser usado.
- 🟢 Apos criacao ou atualizacao bem-sucedida, `/admin/cupons` deve ser revalidada.
- 🟡 O fallback atual de update pode recriar cupom e zerar `usedCount`; esse comportamento deve permanecer documentado como risco.
- 🟡 Checagem de codigo duplicado deve ser tratada pelo repository/schema ou explicitada em evolucao futura.

## Requisitos Funcionais

| ID | Requisito | Prioridade | Criterio de Aceite |
|----|-----------|-----------|-------------------|
| RF-ADMIN-COUPON-01 | Proteger listagem por policy admin-like. | Must | Usuario sem permissao recebe erro seguro e lista nao e retornada. |
| RF-ADMIN-COUPON-02 | Proteger criacao por policy admin-like. | Must | Usuario sem permissao nao consegue persistir ou criar fallback. |
| RF-ADMIN-COUPON-03 | Proteger atualizacao por policy admin-like. | Must | Usuario sem permissao nao altera cupom existente. |
| RF-ADMIN-COUPON-04 | Listar cupons para administracao. | Must | Usuario autorizado recebe lista de `CouponView` ordenada de forma previsivel. |
| RF-ADMIN-COUPON-05 | Criar cupom com dados validos. | Must | Input valido cria cupom ou retorna resultado `dev_fallback` em ambiente permitido. |
| RF-ADMIN-COUPON-06 | Atualizar cupom existente. | Must | Input valido atualiza campos do cupom identificado por id. |
| RF-ADMIN-COUPON-07 | Retornar erro para cupom inexistente em update. | Must | Id inexistente retorna erro seguro, sem stack trace. |
| RF-ADMIN-COUPON-08 | Validar codigo. | Must | Codigo vazio, longo demais ou invalido falha antes do repository. |
| RF-ADMIN-COUPON-09 | Normalizar codigo. | Must | Codigo persistido/fallback fica uppercase e sem espacos nas bordas. |
| RF-ADMIN-COUPON-10 | Validar tipo. | Must | Apenas tipos atuais aceitos no admin sao permitidos. |
| RF-ADMIN-COUPON-11 | Validar valor percentual. | Must | Percentual fora de 1..100 falha com `validation_error`. |
| RF-ADMIN-COUPON-12 | Validar valor fixo. | Must | Valor fixo menor/igual a zero ou nao inteiro falha. |
| RF-ADMIN-COUPON-13 | Validar frete gratis. | Must | Tipo `free_shipping` e aceito como beneficio preparado, sem desconto direto de itens. |
| RF-ADMIN-COUPON-14 | Validar datas opcionais. | Should | Datas vazias viram nulo; datas invalidas devem gerar erro seguro. |
| RF-ADMIN-COUPON-15 | Validar limite de usos. | Must | `maxUses` opcional deve ser inteiro positivo quando informado. |
| RF-ADMIN-COUPON-16 | Validar subtotal minimo. | Must | `minimumSubtotalCents` opcional deve ser inteiro nao negativo. |
| RF-ADMIN-COUPON-17 | Controlar status ativo/inativo. | Must | Campo `isActive` deve ser persistido e refletido na view. |
| RF-ADMIN-COUPON-18 | Revalidar UI apos mutacao. | Must | Mutacao bem-sucedida chama revalidate de `/admin/cupons`. |
| RF-ADMIN-COUPON-19 | Redirecionar formulario somente em sucesso. | Should | Form action volta ao painel apenas apos resultado bem-sucedido. |
| RF-ADMIN-COUPON-20 | Bloquear mutacao real sem guardrail. | Must | Ambiente nao autorizado retorna `blocked` e nao escreve no banco. |
| RF-ADMIN-COUPON-21 | Suportar fallback dev/test. | Must | Sem banco em dev/test, criar/atualizar retorna mensagem explicita de fallback. |
| RF-ADMIN-COUPON-22 | Nao usar fallback silencioso em producao. | Must | Ambiente production sem banco nao simula persistencia real. |

## Requisitos Nao Funcionais

| Tipo | Requisito | Evidencia esperada | Confianca |
|------|-----------|--------------------|-----------|
| Seguranca | Todas as actions administrativas exigem policy admin-like. | `requireAdminLike` nas actions. | 🟢 |
| Integridade | Mutacoes reais passam por guardrail de runtime. | `assertCanMutateRealData` no repository. | 🟢 |
| Usabilidade | Erros de formulario sao retornados como mensagens legiveis. | Resultado `validation_error`. | 🟢 |
| Resiliencia | Dev/test sem banco tem fallback explicito. | Resultado `dev_fallback`. | 🟢 |
| Observabilidade | Status de mutacao indica sucesso, bloqueio ou fallback. | `CouponMutationResult`. | 🟢 |
| Consistencia | Lista administrativa usa `CouponView`. | `listAdminCoupons` / `toCouponView`. | 🟢 |

## Criterios de Aceitacao

```gherkin
Cenario: admin lista cupons
  Dado usuario autenticado com permissao admin-like
  Quando acessa a listagem administrativa de cupons
  Entao o sistema retorna cupons em formato de view
  E os cupons aparecem em ordem previsivel

Cenario: customer tenta listar cupons admin
  Dado usuario autenticado sem permissao admin-like
  Quando chama a action de listagem administrativa
  Entao o sistema retorna forbidden ou blocked
  E nenhum dado administrativo de cupom e exposto

Cenario: admin cria cupom percentual valido
  Dado usuario admin-like
  E codigo " promo10 "
  E tipo "percentage"
  E valor 10
  Quando envia o formulario de criacao
  Entao o codigo persistido e "PROMO10"
  E a rota "/admin/cupons" e revalidada

Cenario: admin cria cupom percentual invalido
  Dado usuario admin-like
  E tipo "percentage"
  E valor 150
  Quando envia o formulario de criacao
  Entao o sistema retorna validation_error
  E nenhum cupom e criado

Cenario: admin atualiza cupom sem banco em dev
  Dado ambiente dev/test sem DATABASE_URL
  E usuario admin-like
  Quando atualiza um cupom valido
  Entao o sistema usa fallback explicito
  E retorna mensagem informando ausencia de persistencia real

Cenario: mutacao real bloqueada
  Dado ambiente com banco configurado
  Mas guardrail de mutacao real nao permite escrita
  Quando admin cria ou atualiza cupom
  Entao a operacao retorna blocked
  E o banco nao e modificado
```

## Contrato de Entrada Administrativa

| Campo | Tipo | Obrigatorio | Regra |
|-------|------|-------------|-------|
| `code` | string | Sim | trim, minimo 1, maximo 64, normalizado para uppercase. |
| `type` | enum | Sim | `percentage`, `fixed_amount` ou `free_shipping`. |
| `value` | number | Sim | Percentual 1..100; fixo inteiro positivo; frete gratis conforme schema. |
| `isActive` | boolean | Nao | Default verdadeiro quando omitido. |
| `startsAt` | date/null | Nao | Vazio vira nulo; invalido deve falhar. |
| `endsAt` | date/null | Nao | Vazio vira nulo; invalido deve falhar. |
| `maxUses` | integer/null | Nao | Inteiro positivo quando informado. |
| `minimumSubtotalCents` | integer/null | Nao | Inteiro nao negativo em centavos quando informado. |

## Contrato de Saida

### Listagem

- Sucesso: lista de `CouponView`.
- Sem permissao: resultado seguro de forbidden/blocked.
- Ambiente indisponivel: erro seguro sem stack trace.

### Criacao/Atualizacao

- `success`: cupom persistido/atualizado.
- `dev_fallback`: cupom criado/atualizado em memoria no ambiente dev/test.
- `validation_error`: input invalido.
- `forbidden`: usuario sem permissao.
- `blocked`: policy, ambiente ou guardrail bloqueou a operacao.

## Rastreabilidade de Codigo

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/features/coupons/server/admin-coupon-actions.ts` | Actions administrativas, policy, parse de FormData e revalidate. |
| `src/features/coupons/server/coupon-service.ts` | Orquestracao de listagem, criacao e atualizacao admin. |
| `src/features/coupons/server/coupon-repository.ts` | Persistencia Drizzle/fallback, guardrail e incremento. |
| `src/features/coupons/schemas.ts` | Validacao de input administrativo. |
| `src/features/coupons/domain.ts` | Normalizacao de codigo e geracao de view. |
| `src/features/auth/server/policies.ts` | `requireAdminLike`. |
| `src/lib/runtime-mode.ts` | Guardrails de ambiente e mutacao real. |
| `src/db/schema.ts` | Tabela `coupons`. |

## Riscos e Lacunas

- 🟡 Datas invalidas precisam ser rejeitadas de forma deterministica; parse nativo de `Date` pode aceitar entradas ambiguas.
- 🟡 Duplicidade de codigo deve ser coberta por constraint/repository ou por validacao explicita futura.
- 🟡 Fallback de update pode reiniciar `usedCount`; risco aceitavel apenas em dev/test e deve permanecer visivel.
- 🟡 UI administrativa precisa diferenciar erro de permissao, validacao e ambiente sem vazar detalhes tecnicos.
- 🔴 Mutacao administrativa de cupom e sensivel porque afeta valor comercial; nunca deve ocorrer sem policy e guardrail.

## Guardrails

- Nao rodar migration como parte desta subunit.
- Nao conectar banco de producao em validacao documental.
- Nao copiar `.env`.
- Nao expor secrets.
- Nao alterar regras de pagamento, estoque, pedido ou envio de email.
- Nao aplicar nem consumir cupom no admin.
- Nao modificar Laravel legado.

## Definition of Ready

- Requisitos de `coupons/requirements.md` e `coupons/design.md` estao disponiveis.
- Policies administrativas estao documentadas em `_reversa_sdd/permissions.md`.
- Guardrails de runtime estao documentados em specs arquiteturais.
- Fluxo de carrinho/checkout permanece fora desta subunit.

## Definition of Done

- Listagem admin protegida por policy.
- Criacao admin validada e protegida.
- Atualizacao admin validada e protegida.
- Fallback dev/test explicito.
- Mutacao real bloqueada quando guardrail nao permite.
- Erros seguros para permissao, validacao, banco indisponivel e cupom inexistente.
- Rota administrativa revalidada apos mutacao bem-sucedida.
