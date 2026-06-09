# Requirements: Fase 6 — Cupons e Descontos no Carrinho

> Identificador: `004-fase-6-cupons-descontos`
> Data: `2026-06-08`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A Fase 6 deve preparar a implementação de cupons e descontos aplicados ao carrinho da Tríade Essenza Next. A feature atende visitantes, clientes autenticados e administradores, preservando a base já concluída de catálogo, persistência, auth/policies e carrinho. O objetivo é permitir aplicar e remover cupom, calcular desconto e total parcial do carrinho, sem implementar checkout, frete real, pagamento, pedido, reserva ou baixa de estoque.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/domain.md#8-carrinho` | Carrinho atual usa `guestCartToken`, `userId`, ownership server-side, subtotal em centavos e bloqueio de produto indisponível. | 🟢 |
| `_reversa_sdd/domain.md#10-checkout-fora-de-escopo` | Checkout, pagamento, frete, cupom, pedido, reserva e baixa de estoque ficaram fora da Fase 5. | 🟢 |
| `_reversa_sdd/data-dictionary.md#tabelas-fora-do-foco-funcional-atual` | Schema já modela tabelas de ecommerce preparadas, incluindo `coupons`, mas sem ativar fluxo funcional de cupom. | 🟢 |
| `_reversa_sdd/permissions.md#carrinho` | Cart actions são permitidas para visitante, customer, admin e manager, sempre com owner resolvido no servidor e sem bypass. | 🟢 |
| `_reversa_sdd/state-machines.md#carrinho` | Carrinho pode estar `active/guest`, `active/user`, `dev_fallback`, `unavailable` ou `converted`. | 🟢 |
| `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/coupons/requirements.md` | Legado normaliza código, aceita tipos `percent` e `fixed`, calcula estados e limita desconto ao subtotal. | 🟢 |
| `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/domain.md#regras-confirmadas` | Cupom válido exige ativo, janela de datas e limite de uso; desconto nunca excede subtotal. | 🟢 |
| `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/coupons/design.md` | Legado possui CRUD admin de cupom e usa cupom no cálculo do carrinho/checkout; incremento de `used_count` é lacuna. | 🟡 |
| `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/migration/database-plan.md#coupons` | Plano de migração prevê `code`, `type`, `value`, `startsAt`, `endsAt`, `maxUses`, `usedCount` e `isActive`. | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Visitante | Aplicar um cupom recebido antes de criar conta. | Informa código no carrinho anônimo e vê desconto aplicado ao total parcial. |
| Customer autenticado | Manter cupom no carrinho próprio entre sessões quando houver banco real. | Acessa `/carrinho`, aplica cupom válido e vê subtotal, desconto e total parcial. |
| Admin | Gerenciar ou preparar cupons promocionais conforme escopo final da fase. | Cria, edita ou consulta cupom se o admin básico entrar no MVP da Fase 6. |
| Manager | Operar como admin-like sem privilégio especial no carrinho. | Pode administrar cupom se permitido, mas não força desconto nem ignora validade. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Código de cupom deve ser normalizado antes de validação, comparação e persistência. 🟢
   - Origem no legado: `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/coupons/requirements.md`
   - Tipo: nova no Next, preservada do legado.
2. **RN-02:** Cupom só pode ser aplicado quando estiver ativo, dentro da janela de datas e sem limite global esgotado. 🟢
   - Origem no legado: `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/domain.md#regras-confirmadas`
   - Tipo: nova no Next, preservada do legado.
3. **RN-03:** Cupom inativo, expirado, futuro ou esgotado deve ser recusado com erro controlado. 🟢
   - Origem no legado: `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/coupons/requirements.md`
   - Tipo: nova no Next, preservada do legado.
4. **RN-04:** Desconto percentual deve derivar do subtotal em centavos e nunca ultrapassar o subtotal. 🟢
   - Origem no legado: `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/code-analysis.md`
   - Tipo: nova no Next, preservada do legado.
5. **RN-05:** Desconto fixo deve ser calculado em centavos e limitado ao subtotal. 🟢
   - Origem no legado: `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/code-analysis.md`
   - Tipo: nova no Next, preservada do legado.
6. **RN-06:** Aplicar cupom no carrinho não cria pedido, não inicia checkout, não chama pagamento e não consome estoque. 🟢
   - Origem no Next: `_reversa_sdd/domain.md#10-checkout-fora-de-escopo`
   - Tipo: nova.
7. **RN-07:** Limite de uso não deve ser consumido como venda final apenas por aplicar cupom no carrinho. 🟢
   - Origem no legado: `D:/Projetos/triadeessenzaparfum.com.br/_reversa_sdd/coupons/design.md`
   - Tipo: nova, decisão humana de Fase 6.
8. **RN-08:** Cupom aplicado pertence ao carrinho resolvido no servidor; payload client-side não pode forçar desconto, owner, subtotal ou `couponId`. 🟢
   - Origem no Next: `_reversa_sdd/permissions.md#carrinho`
   - Tipo: nova.
9. **RN-09:** Fallback sem `DATABASE_URL` deve ser explícito e não pode fingir persistência real de cupom aplicado. 🟢
   - Origem no Next: `_reversa_sdd/domain.md#7-persistencia-e-fallback`
   - Tipo: nova.
10. **RN-10:** A Fase 6 permite apenas um cupom por carrinho; cupons acumulativos ficam fora do MVP. 🟢
   - Origem: decisão humana da sessão de clarificação de 2026-06-08.
   - Tipo: nova.
11. **RN-11:** Cupom pode exigir `minimumSubtotalCents`; se houver mínimo, o subtotal do carrinho deve ser maior ou igual ao mínimo para aplicar/manter o cupom. 🟢
   - Origem: decisão humana da sessão de clarificação de 2026-06-08.
   - Tipo: nova.
12. **RN-12:** Cupom de frete grátis fica apenas modelado/preparado nesta fase e não altera frete real. 🟢
   - Origem: decisão humana da sessão de clarificação de 2026-06-08.
   - Tipo: nova.

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | O sistema deve normalizar o código do cupom antes de buscar, validar, aplicar ou remover. | Must | Espaços externos e diferença de caixa não impedem encontrar o mesmo cupom. | 🟢 |
| RF-02 | O sistema deve permitir aplicar cupom válido ao carrinho ativo resolvido no servidor. | Must | Cupom ativo, vigente e não esgotado aparece associado ao carrinho e recalcula desconto. | 🟢 |
| RF-03 | O sistema deve permitir remover cupom aplicado do carrinho ativo. | Must | Após remoção, desconto volta a 0 e subtotal permanece inalterado. | 🟢 |
| RF-04 | O sistema deve recusar cupom inativo. | Must | Cupom com `isActive = false` retorna erro controlado e não altera carrinho. | 🟢 |
| RF-05 | O sistema deve recusar cupom futuro antes da data inicial. | Must | Cupom com `startsAt > now` não é aplicado. | 🟢 |
| RF-06 | O sistema deve recusar cupom expirado depois da data final. | Must | Cupom com `endsAt < now` não é aplicado. | 🟢 |
| RF-07 | O sistema deve recusar cupom com limite global esgotado. | Must | Cupom com `maxUses` preenchido e `usedCount >= maxUses` não é aplicado. | 🟢 |
| RF-08 | O sistema deve calcular desconto percentual sobre subtotal em centavos. | Must | Percentual válido gera desconto arredondado de forma determinística e limitado ao subtotal. | 🟢 |
| RF-09 | O sistema deve calcular desconto fixo em centavos. | Must | Valor fixo válido reduz o total parcial sem exceder o subtotal. | 🟢 |
| RF-10 | O sistema deve exibir subtotal, desconto e total parcial no carrinho. | Must | `/carrinho` mostra os três valores derivados do servidor. | 🟢 |
| RF-11 | O sistema deve persistir cupom aplicado no carrinho quando houver banco real. | Must | Recarregar o carrinho mantém o cupom aplicado para o mesmo owner. | 🟡 |
| RF-12 | O sistema deve manter o cupom aplicado após login/merge quando o carrinho resultante continuar elegível. | Should | Login com carrinho anônimo preserva ou revalida cupom de forma controlada. | 🟡 |
| RF-13 | O sistema deve bloquear desconto forçado por payload client-side. | Must | Payload com desconto, total ou owner manipulados é ignorado ou recusado. | 🟢 |
| RF-14 | O sistema deve impedir aplicação ou remoção de cupom em carrinho de outro usuário ou outro guest token. | Must | Tentativa de acesso cruzado retorna erro controlado sem expor dados. | 🟢 |
| RF-15 | O sistema deve preparar cupom de frete grátis como tipo/modelo reservado, sem aplicar benefício real de frete nesta fase. | Could | Cupom de frete grátis retorna mensagem controlada de recurso preparado/indisponível ou não aplicável, sem calcular nem zerar frete. | 🟢 |
| RF-16 | O sistema deve expor server actions para aplicar e remover cupom no carrinho. | Must | Actions validam input, owner, runtime e regras de cupom no servidor. | 🟢 |
| RF-17 | O sistema deve implementar fundação mínima de admin de cupons para listar cupons e, se tecnicamente seguro, criar/editar cupons básicos. | Should | Área admin exige `admin`/`manager`, não expõe campanha avançada e respeita fallback sem banco. | 🟢 |
| RF-18 | O sistema deve permitir somente um cupom aplicado por carrinho. | Must | Aplicar novo cupom substitui ou recusa o cupom anterior conforme plano técnico, sem acumular descontos. | 🟢 |
| RF-19 | O sistema deve validar subtotal mínimo quando o cupom possuir `minimumSubtotalCents`. | Must | Carrinho abaixo do mínimo não aplica ou não mantém o cupom e retorna aviso controlado. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Nenhum desconto, total, owner, role, `couponId` ou `usedCount` deve ser confiado a partir do cliente. | Ownership e carrinho atuais resolvem actor no servidor. | 🟢 |
| Segurança | Códigos, tokens e cookies não devem ser expostos em logs ou mensagens de erro detalhadas. | Guardrails de sessão/carrinho da Fase 5. | 🟢 |
| Consistência | Todos os cálculos monetários devem usar centavos. | `_reversa_sdd/domain.md#4-produto` e carrinho atual. | 🟢 |
| Confiabilidade | Com `DATABASE_URL`, erro real de banco não pode cair em fallback silencioso. | Guardrail de persistência da Fase 3 e Fase 5. | 🟢 |
| Ambiente | Build, testes unitários e e2e não devem exigir banco real ou credenciais reais. | Padrão já validado nas Fases 3, 4 e 5. | 🟢 |
| UX | Carrinho deve comunicar cupom inválido, removido ou aplicado sem prometer checkout/frete real. | Checkout segue fora de escopo. | 🟢 |
| Testabilidade | Regras de validade, cálculo, ownership e fallback devem ser cobertas por testes unitários e e2e. | Critérios de aceite mínimos da fase. | 🟢 |

## 7. Regras de negócio herdadas

- RNH-01: Produto público/comprável continua exigindo `published`, `publishedAt <= now` e `stockQuantity > 0`. 🟢
- RNH-02: Carrinho calcula subtotal em centavos a partir dos itens. 🟢
- RNH-03: Preços permanecem em centavos. 🟢
- RNH-04: Cliente só acessa recursos próprios. 🟢
- RNH-05: Carrinho anônimo usa `guestCartToken` opaco e não armazena itens, preços ou dados sensíveis no cookie. 🟢
- RNH-06: Carrinho autenticado usa `userId` e ownership server-side. 🟢
- RNH-07: Admin e manager não têm bypass no carrinho. 🟢
- RNH-08: Carrinho não cria pedido nesta fase. 🟢
- RNH-09: Carrinho não reserva nem baixa estoque nesta fase. 🟢
- RNH-10: Desconto de cupom não pode exceder subtotal. 🟢
- RNH-11: Cupom do legado normaliza código e calcula status por ativo, datas e limite de uso. 🟢

## 8. Requisitos de segurança

- RS-01: Aplicação e remoção de cupom devem operar sobre o carrinho ativo resolvido por sessão/cookie no servidor.
- RS-02: Server actions não devem aceitar `cartId`, `userId`, role, owner, subtotal, desconto ou total como fonte confiável.
- RS-03: Usuário autenticado não pode aplicar, remover ou visualizar cupom de carrinho pertencente a outro `userId`.
- RS-04: Visitante não pode acessar carrinho associado a outro `guestCartToken`.
- RS-05: Admin e manager podem usar carrinho como usuários autenticados normais, sem privilégio para ignorar validade, limite ou valor de cupom.
- RS-06: O cookie `guestCartToken` não deve armazenar cupom, desconto, preço, subtotal, total, itens ou dados sensíveis.
- RS-07: Sem `DATABASE_URL`, fallback deve ser explícito; em preview/produção, mutações reais de cupom devem falhar de forma segura.
- RS-08: Nenhuma etapa da Fase 6 deve expor secrets, `DATABASE_URL`, cookies, tokens, senhas ou credenciais.

## 9. Requisitos de banco

- RB-01: Avaliar suporte atual do schema para `coupons` e para associação de cupom aplicado ao carrinho.
- RB-02: Se o schema atual já modelar `coupons`, confirmar campos mínimos: `code`, `type`, `value`, `startsAt`, `endsAt`, `maxUses`, `usedCount`, `isActive`, `minimumSubtotalCents` e timestamps.
- RB-03: Se necessário, preparar migration local para relacionar carrinho e cupom aplicado, sem aplicar migration em banco real.
- RB-04: Código de cupom deve ter unicidade após normalização.
- RB-05: Tipos e valores monetários devem preservar centavos para desconto fixo e totais.
- RB-06: `usedCount` deve existir ou ser preparado, mas não deve ser incrementado por mera aplicação no carrinho sem decisão humana explícita.
- RB-07: Nenhuma migration deve rodar contra banco real nesta etapa ou na implementação sem validação humana explícita.

## 10. Requisitos de cupom

- RC-01: Cupom deve ter código normalizado.
- RC-02: Cupom deve ter tipo de desconto.
- RC-02.1: Tipos do MVP: `percent` e `fixed`.
- RC-02.2: Tipo `free_shipping` pode ser reservado/modelado, mas não deve aplicar benefício real até a fase de frete.
- RC-03: Cupom deve ter valor numérico validado de acordo com o tipo.
- RC-04: Cupom deve ter flag de ativação.
- RC-05: Cupom pode ter data inicial.
- RC-06: Cupom pode ter data final/expiração.
- RC-07: Cupom pode ter limite global de uso.
- RC-08: Cupom deve calcular status operacional: ativo, inativo, futuro, expirado ou esgotado.
- RC-09: Cupom percentual deve rejeitar percentual inválido ou não positivo.
- RC-10: Cupom fixo deve rejeitar valor inválido ou não positivo.
- RC-11: Cupom de frete grátis fica preparado/modelado, mas sua aplicação real deve retornar mensagem controlada de recurso indisponível ou não aplicável nesta fase.
- RC-12: Cupons do MVP são globais para o carrinho, sem restrição por produto, categoria, marca, cliente, primeira compra ou campanha.
- RC-13: Cupons não são acumulativos; apenas um cupom pode estar aplicado por carrinho.
- RC-14: Cupom pode ter `minimumSubtotalCents`; quando preenchido, o subtotal do carrinho deve ser maior ou igual ao mínimo.

## 11. Requisitos de aplicação no carrinho

- RAC-01: Aplicar cupom deve revalidar carrinho e owner no servidor.
- RAC-02: Aplicar cupom deve revalidar cupom no momento da ação.
- RAC-03: Aplicar cupom deve recalcular subtotal, desconto e total parcial no servidor.
- RAC-04: Remover cupom deve limpar a associação do carrinho e recalcular desconto para 0.
- RAC-05: Carrinho vazio deve recusar aplicação de cupom porque não há subtotal elegível.
- RAC-06: Carrinho com produtos posteriormente indisponíveis deve revalidar itens antes de confirmar desconto.
- RAC-07: Cupom aplicado deve ser revalidado ao visualizar/recalcular carrinho.
- RAC-08: Aplicar cupom não deve criar checkout, pedido, pagamento, frete real, reserva ou baixa de estoque.
- RAC-09: Se o subtotal cair abaixo de `minimumSubtotalCents` após alteração do carrinho, o cupom deve ser removido, invalidado ou sinalizado como inválido de forma controlada.
- RAC-10: Aplicar um segundo cupom não deve acumular desconto com o cupom anterior.

## 12. Requisitos de cálculo

- RCL-01: `subtotalCents` é a soma dos subtotais dos itens do carrinho.
- RCL-02: `discountCents` deve ser 0 quando não houver cupom aplicado.
- RCL-03: Cupom percentual calcula desconto sobre `subtotalCents`.
- RCL-04: Cupom fixo usa valor fixo em centavos.
- RCL-05: `discountCents` nunca pode ser maior que `subtotalCents`.
- RCL-06: `partialTotalCents = subtotalCents - discountCents`.
- RCL-07: Frete, imposto, pagamento e total final permanecem fora do cálculo real nesta fase.
- RCL-08: Arredondamento de percentual deve ser determinístico e coberto por teste.
- RCL-09: Cupom de frete grátis não deve alterar `partialTotalCents` nesta fase.

## 13. Requisitos de limite de uso

- RLU-01: Cupom sem `maxUses` deve ser tratado como sem limite global, salvo outra decisão humana.
- RLU-02: Cupom com `usedCount >= maxUses` deve ser tratado como esgotado.
- RLU-03: Aplicar cupom no carrinho não deve consumir uso como pedido final.
- RLU-04: A contagem efetiva de uso em pedido/pagamento fica fora de escopo e deve ser preparada para fase futura.
- RLU-05: Limite por usuário fica fora desta fase e não deve ser implementado.
- RLU-06: Limite global de uso deve ser consultado ao aplicar/revalidar cupom; se `usedCount >= usageLimit` ou regra equivalente, o cupom não pode ser aplicado.

## 14. Requisitos de ownership

- RO-01: Carrinho anônimo só pode ser resolvido pelo `guestCartToken` opaco do visitante.
- RO-02: Carrinho autenticado só pode ser resolvido por `session.userId`.
- RO-03: Actions de cupom não podem aceitar `cartId` público para alterar carrinho.
- RO-04: Merge no login deve revalidar cupom aplicado no carrinho resultante, se existir.
- RO-05: Se o merge produzir carrinho sem elegibilidade para o cupom, a action deve remover ou bloquear o cupom com aviso controlado.
- RO-06: Payload client-side não pode forçar elegibilidade, mínimo de subtotal, tipo de cupom, benefício de frete ou limite de uso.

## 15. Requisitos de server actions

- RSA-01: Criar action de aplicar cupom ao carrinho.
- RSA-02: Criar action de remover cupom do carrinho.
- RSA-03: Atualizar action/view de obter carrinho para retornar subtotal, desconto, total parcial e cupom aplicado.
- RSA-04: Server actions devem validar input com schema.
- RSA-05: Server actions devem retornar erros controlados para cupom ausente, inválido, inativo, futuro, expirado, esgotado ou sem carrinho válido.
- RSA-06: Server actions devem respeitar fallback sem banco.
- RSA-07: Server actions não devem chamar Stripe, checkout, frete real, pedido, baixa de estoque ou reserva.

## 16. Requisitos de UI

- RUI-01: `/carrinho` deve exibir campo de código de cupom.
- RUI-02: `/carrinho` deve exibir ação de aplicar cupom.
- RUI-03: `/carrinho` deve exibir cupom aplicado e ação de remover cupom.
- RUI-04: `/carrinho` deve exibir subtotal, desconto e total parcial.
- RUI-05: UI deve mostrar mensagens controladas para cupom inválido, expirado, futuro, inativo, esgotado ou removido.
- RUI-06: Checkout deve continuar desabilitado/fora de escopo; a UI não deve prometer pagamento, frete real ou pedido.
- RUI-07: Em fallback sem banco, UI deve sinalizar que não há persistência real quando aplicável.

## 17. Requisitos de admin de cupons

- RAD-01: Definir na clarificação se admin básico de cupons entra na Fase 6.
- RAD-02: Admin de cupons deve exigir `requireAdminLike`.
- RAD-03: Cadastro/edição básica, se implementados pelo plano técnico, devem validar código normalizado, tipo, valor, datas, limite, subtotal mínimo e ativação.
- RAD-04: A fundação administrativa mínima deve incluir listagem de cupons e pode incluir criação/edição básica se o plano técnico confirmar segurança e compatibilidade com a fase.
- RAD-05: Customer, visitante, admin ou manager pelo carrinho não podem criar cupom por payload de carrinho.
- RAD-06: Admin de cupons não deve implementar campanhas avançadas, restrição por produto/categoria, limite por usuário ou relatórios.
- RAD-07: Admin de cupons deve respeitar fallback sem banco e não fingir persistência real.

## 18. Requisitos de ambiente/fallback

- RAF-01: Sem `DATABASE_URL` em dev/test, aplicação de cupom pode retornar resultado controlado de fixture, sinalizando ausência de persistência real.
- RAF-02: Sem `DATABASE_URL` em preview/produção, mutações reais de cupom devem falhar de forma segura.
- RAF-03: Com `DATABASE_URL`, erro real de banco não pode ser mascarado como fallback silencioso.
- RAF-04: Build/test não devem exigir banco real, credenciais reais ou `.env` real.
- RAF-05: E2E padrão deve conseguir validar UI e fallback sem banco real.
- RAF-06: Fallback dev/test pode validar cupons fictícios de desenvolvimento, desde que marcados como fixture e sem promessa de persistência real.

## 19. Critérios de aceite

- CA-01: Código do cupom é normalizado.
- CA-02: Cupom ativo, vigente e não esgotado pode ser aplicado ao carrinho.
- CA-03: Cupom inativo não pode ser aplicado.
- CA-04: Cupom expirado não pode ser aplicado.
- CA-05: Cupom futuro não pode ser aplicado antes da data de início.
- CA-06: Cupom com limite global esgotado não pode ser aplicado.
- CA-07: Desconto percentual calcula corretamente em centavos.
- CA-08: Desconto fixo calcula corretamente em centavos.
- CA-09: Desconto nunca excede subtotal.
- CA-10: Carrinho exibe subtotal, desconto e total parcial.
- CA-11: Cupom pode ser removido do carrinho.
- CA-12: Usuário não aplica nem remove cupom em carrinho de outro usuário.
- CA-13: Visitante não acessa carrinho de outro `guestCartToken`.
- CA-14: Sem `DATABASE_URL`, comportamento é explícito e não finge persistência real.
- CA-15: Build/test não exigem banco real nem credenciais reais.
- CA-16: Checkout, pagamento, Stripe, frete real, pedido, reserva e baixa de estoque continuam fora de escopo.
- CA-17: Aplicar cupom não consome limite de uso como pedido final.
- CA-18: Validações obrigatórias da futura implementação: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`.
- CA-19: Apenas um cupom pode estar aplicado por carrinho.
- CA-20: Cupom com subtotal mínimo não pode ser aplicado quando o subtotal estiver abaixo do mínimo.
- CA-21: Limite por usuário, restrição por produto/categoria, campanhas avançadas e relatórios ficam fora de escopo.
- CA-22: Cupom de frete grátis fica apenas preparado/modelado e não altera frete real.

## 20. Cenários de teste

```gherkin
Cenário: Aplicar cupom percentual válido
  Dado um carrinho ativo com subtotal em centavos
  E um cupom percentual ativo, vigente e não esgotado
  Quando o usuário aplica o código normalizado do cupom
  Então o carrinho exibe desconto calculado em centavos
  E o total parcial é subtotal menos desconto

Cenário: Aplicar cupom fixo válido
  Dado um carrinho ativo com subtotal em centavos
  E um cupom fixo ativo, vigente e não esgotado
  Quando o usuário aplica o cupom
  Então o desconto fixo é aplicado em centavos
  E o desconto não ultrapassa o subtotal

Cenário: Recusar cupom inativo
  Dado um carrinho ativo
  E um cupom existente inativo
  Quando o usuário tenta aplicar o cupom
  Então o sistema retorna erro controlado
  E o carrinho permanece sem desconto aplicado

Cenário: Recusar cupom expirado
  Dado um carrinho ativo
  E um cupom com data final anterior ao momento atual
  Quando o usuário tenta aplicar o cupom
  Então o sistema retorna erro controlado
  E o cupom não é persistido no carrinho

Cenário: Recusar cupom futuro
  Dado um carrinho ativo
  E um cupom com data inicial posterior ao momento atual
  Quando o usuário tenta aplicar o cupom
  Então o sistema retorna erro controlado
  E o desconto permanece 0

Cenário: Recusar cupom esgotado
  Dado um carrinho ativo
  E um cupom com limite global alcançado
  Quando o usuário tenta aplicar o cupom
  Então o sistema retorna erro controlado
  E o carrinho não muda

Cenário: Remover cupom aplicado
  Dado um carrinho com cupom aplicado
  Quando o usuário remove o cupom
  Então o desconto volta a 0
  E o subtotal dos itens permanece igual

Cenário: Bloquear manipulação client-side
  Dado um carrinho ativo resolvido no servidor
  Quando o cliente envia payload com desconto, total ou owner manipulado
  Então o sistema ignora ou recusa os campos manipulados
  E recalcula tudo no servidor

Cenário: Bloquear acesso cruzado
  Dado dois usuários autenticados com carrinhos diferentes
  Quando um usuário tenta aplicar cupom no carrinho do outro
  Então o sistema retorna erro de ownership
  E não expõe dados do carrinho alheio

Cenário: Fallback sem banco
  Dado o ambiente dev/test sem DATABASE_URL
  Quando o usuário interage com cupom no carrinho
  Então o sistema mostra comportamento controlado de fallback
  E não promete persistência real

Cenário: Recusar cupom por subtotal mínimo
  Dado um carrinho ativo com subtotal menor que o mínimo do cupom
  Quando o usuário tenta aplicar o cupom
  Então o sistema retorna aviso controlado de subtotal insuficiente
  E o cupom não é aplicado

Cenário: Impedir acumulação de cupons
  Dado um carrinho com cupom aplicado
  Quando o usuário tenta aplicar outro cupom
  Então o sistema não acumula descontos
  E o resultado segue a regra técnica de substituir ou recusar o segundo cupom

Cenário: Bloquear cupom de frete grátis real
  Dado um cupom de tipo frete grátis preparado
  Quando o usuário tenta aplicar o cupom antes da fase de frete
  Então o sistema retorna mensagem controlada de recurso preparado ou indisponível
  E nenhum frete real é calculado ou zerado

Cenário: Escopo proibido
  Dado um cupom aplicado ao carrinho
  Quando o usuário visualiza o total parcial
  Então nenhum pedido, pagamento, frete real, checkout, reserva ou baixa de estoque é criado
```

## 21. Gaps e dúvidas

Nenhuma dúvida aberta após a sessão de clarificação de 2026-06-08. As decisões humanas resolveram tipos do MVP, acumulação, subtotal mínimo, limite por usuário, restrição por produto/categoria, consumo de `usedCount`, admin básico, fallback sem banco e cupom de frete grátis preparado.

## 22. Glossário mínimo

| Termo | Definição |
|-------|-----------|
| Cupom | Código promocional que pode gerar desconto no carrinho quando válido. |
| Código normalizado | Código tratado de forma consistente antes de busca/comparação, preservando regra do legado de trim e uppercase. |
| Cupom percentual | Cupom que calcula desconto como percentual do subtotal. |
| Cupom fixo | Cupom que calcula desconto como valor fixo em centavos. |
| Cupom de frete grátis preparado | Tipo reservado/modelado que não aplica benefício real antes da fase de frete. |
| Cupom futuro | Cupom cuja data inicial ainda não chegou. |
| Cupom expirado | Cupom cuja data final já passou. |
| Cupom esgotado | Cupom cujo limite global de uso foi alcançado. |
| Subtotal | Soma dos itens do carrinho em centavos antes de desconto, frete ou checkout. |
| Desconto | Valor em centavos abatido do subtotal, limitado ao próprio subtotal. |
| Subtotal mínimo | Valor mínimo em centavos que o carrinho precisa atingir para o cupom ser elegível. |
| Total parcial | `subtotalCents - discountCents`, sem frete real, pagamento ou pedido. |
| Ownership | Regra server-side que garante acesso apenas ao carrinho do visitante/token ou usuário autenticado. |
| Fallback sem banco | Modo dev/test explícito que permite testes sem prometer persistência real. |

## 23. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-10 | Must | Núcleo de aplicação, validação e cálculo de cupom. |
| RF-11 | Must | Persistência do cupom aplicado é necessária para carrinho real com banco. |
| RF-12 | Should | Merge preserva experiência da Fase 5, mas exige decisão técnica posterior. |
| RF-13 a RF-16 | Must | Segurança e contrato de server actions. |
| RF-17 | Should | Fundação mínima de admin de cupons entra na Fase 6 com escopo controlado. |
| RF-18 a RF-19 | Must | Um cupom por carrinho e subtotal mínimo são decisões de escopo do MVP. |
| Cupom de frete grátis | Could | Deve ser preparado/modelado, mas frete real está fora de escopo. |
| Checkout, pagamento, pedido, frete real | Won't | Fora de escopo obrigatório da Fase 6. |

## 24. Esclarecimentos

### Sessão 2026-06-08

- **Q:** Quais tipos de cupom entram no MVP e cupons podem acumular?
  **R:** Entram cupom percentual e cupom de valor fixo. Cupom de frete grátis fica apenas preparado/modelado, sem aplicar frete real. Apenas um cupom por carrinho; cupons acumulativos ficam fora da Fase 6.
- **Q:** Quais regras de elegibilidade avançada entram na Fase 6?
  **R:** Subtotal mínimo entra por `minimumSubtotalCents`. Limite por usuário e restrição por produto/categoria ficam fora. Cupons do MVP são globais para o carrinho.
- **Q:** Quando `usedCount` é consumido?
  **R:** Não é consumido ao aplicar cupom no carrinho. Aplicar/remover cupom apenas valida e persiste associação. Consumo de uso fica para fase futura de pedido/checkout.
- **Q:** Admin básico de cupons entra na fase?
  **R:** Entra como fundação mínima: listagem e possível criação/edição básica se o plano técnico considerar seguro, sempre protegidas por admin/manager e sem campanhas avançadas, limite por usuário, restrição por produto/categoria ou relatórios.
- **Q:** Como deve funcionar fallback sem banco e cupom de frete grátis?
  **R:** Sem `DATABASE_URL`, dev/test usam fixture explícita sem falsa persistência; preview/produção falham de forma segura. Cupom de frete grátis fica modelado/preparado e não calcula nem zera frete real.

## 25. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-08 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-06-08 | Dúvidas resolvidas por `/reversa-clarify` | reversa |
