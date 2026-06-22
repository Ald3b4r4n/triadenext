# Cart, Tasks

> Checklist executavel da unit `cart`. Cada tarefa preserva o comportamento observado no Next.js atual e serve como contrato para manutencao, auditoria ou reconstrucao futura.

## 1. Preparacao e Contratos

- [ ] TASK-CART-001 Mapear os tipos publicos de carrinho em `src/features/cart/types.ts`.
  - Validar `CartActor`, `CartView`, `CartItem`, `CartActionResult` e persistencias possiveis.
  - Confirmar que `unavailable` nao carrega stack trace, segredo ou detalhe de infraestrutura.

- [ ] TASK-CART-002 Mapear schemas de entrada em `src/features/cart/schemas.ts`.
  - Conferir schemas para add item, update quantity, remove item, cupom, CEP e selecao de frete.
  - Garantir erro amigavel para FormData invalido.

- [ ] TASK-CART-003 Documentar fronteira server-only.
  - Confirmar que session, repository e service de carrinho rodam no servidor.
  - Garantir que cliente chama somente server actions ou formularios.

## 2. Resolucao de Ator

- [ ] TASK-CART-004 Validar resolucao de usuario autenticado.
  - Dado sessao valida, ator deve ser `authenticated`.
  - Preservar guest token existente para merge posterior quando aplicavel.

- [ ] TASK-CART-005 Validar resolucao de visitante anonimo.
  - Dado cookie `triade_cart`, ator deve ser `guest`.
  - Dado mutacao sem cookie, gerar novo token quando permitido.

- [ ] TASK-CART-006 Validar modo indisponivel.
  - Em preview/producao sem banco seguro, retornar `unavailable`.
  - Nao tentar fallback em memoria em producao.

- [ ] TASK-CART-007 Validar fallback dev/test sem banco.
  - Sem `DATABASE_URL` em dev/test, retornar persistencia `dev_fallback`.
  - Garantir mensagem clara de fallback para UI/testes.

## 3. Produto Compravel e Estoque

- [ ] TASK-CART-008 Validar regra de produto compravel.
  - Produto precisa existir, estar ativo/publicado, ter `publishedAt <= now` e estoque positivo.
  - Produto draft, inactive, futuro ou sem estoque deve retornar `product_unavailable`.

- [ ] TASK-CART-009 Validar quantidade de item.
  - Quantidade deve ser inteiro maior ou igual a 1.
  - Quantidade total no carrinho nao pode exceder estoque atual.

- [ ] TASK-CART-010 Garantir snapshot de item.
  - Persistir nome, slug, preco unitario e imagem no momento da adicao.
  - Subtotal deve usar snapshot de preco, nao preco recalculado de forma implicita.

## 4. Mutacoes de Carrinho

- [ ] TASK-CART-011 Implementar/validar `addItemToCart`.
  - Resolver ator.
  - Buscar produto.
  - Validar compravel e estoque.
  - Obter/criar carrinho ativo.
  - Inserir ou incrementar item.
  - Recalcular carrinho e revalidar rotas publicas relevantes.

- [ ] TASK-CART-012 Implementar/validar `updateCartItemQuantity`.
  - Bloquear item inexistente ou de outro carrinho.
  - Revalidar produto e estoque.
  - Atualizar quantidade.
  - Limpar frete selecionado.
  - Recalcular totais.

- [ ] TASK-CART-013 Implementar/validar `removeCartItem`.
  - Bloquear item fora do carrinho do ator.
  - Remover item.
  - Limpar frete selecionado.
  - Recalcular carrinho.

- [ ] TASK-CART-014 Implementar/validar `clearActiveCart`.
  - Remover todos os itens do carrinho ativo.
  - Limpar frete selecionado.
  - Manter retorno seguro para carrinho inexistente/vazio.

## 5. Recalculo

- [ ] TASK-CART-015 Validar recalculo de itens.
  - Buscar produto atual para cada item.
  - Marcar/remover item indisponivel conforme comportamento atual.
  - Reduzir quantidade quando estoque atual for menor que quantidade no carrinho.

- [ ] TASK-CART-016 Validar subtotal, desconto, frete e total.
  - Subtotal = soma dos subtotais dos itens validos.
  - Desconto vem do cupom aplicado e valido.
  - Frete vem da selecao ativa valida.
  - Total = subtotal - desconto + frete, respeitando piso zero quando aplicavel.

- [ ] TASK-CART-017 Validar mensagens de recalculo.
  - Emitir avisos para produto removido, estoque reduzido, cupom invalido ou frete stale.
  - Evitar vazamento de erro tecnico na UI.

## 6. Cupom

- [ ] TASK-CART-018 Implementar/validar aplicacao de cupom.
  - Resolver ator com criacao de guest token quando necessario.
  - Obter/criar carrinho ativo.
  - Validar cupom contra subtotal atual.
  - Persistir codigo normalizado.
  - Recalcular carrinho.

- [ ] TASK-CART-019 Implementar/validar remocao de cupom.
  - Limpar cupom aplicado.
  - Recalcular carrinho.
  - Retornar mensagem amigavel.

- [ ] TASK-CART-020 Validar cupom de frete gratis.
  - Quando elegivel, zerar somente o frete manual elegivel.
  - Nao alterar a cotacao original persistida.

## 7. Frete

- [ ] TASK-CART-021 Implementar/validar cotacao de frete.
  - Validar CEP.
  - Carregar carrinho ativo com itens compraveis.
  - Gerar `cartHash`.
  - Criar opcoes via regras manuais ou fixture dev/test.
  - Persistir cotacao e selecionar opcao padrao quando aplicavel.

- [ ] TASK-CART-022 Implementar/validar selecao de opcao.
  - Verificar se a cotacao pertence ao carrinho atual.
  - Rejeitar quote de outro carrinho.
  - Persistir opcao selecionada e recalcular total.

- [ ] TASK-CART-023 Implementar/validar remocao de frete.
  - Limpar selecao atual.
  - Recalcular total sem frete.

- [ ] TASK-CART-024 Garantir invalidacao de frete em mudancas de item.
  - Add/update/remove/clear devem limpar selecao de frete.
  - Cotacoes antigas nao devem ser usadas com carrinho alterado.

## 8. Merge Guest para Usuario

- [ ] TASK-CART-025 Implementar/validar merge apos login.
  - Ler token anonimo.
  - Carregar carrinho guest e carrinho autenticado.
  - Migrar somente itens ainda compraveis.
  - Respeitar estoque restante considerando itens ja existentes do usuario.

- [ ] TASK-CART-026 Validar conversao do carrinho guest.
  - Marcar carrinho anonimo como `converted`.
  - Impedir novas mutacoes nesse carrinho convertido.

- [ ] TASK-CART-027 Validar transferencia de cupom.
  - Transferir cupom guest apenas se carrinho autenticado ainda nao tiver cupom.
  - Revalidar cupom apos migracao.

## 9. Persistencia

- [ ] TASK-CART-028 Validar repositorio Drizzle.
  - Buscar/criar carrinho ativo por usuario ou guest token.
  - Inserir/incrementar item.
  - Atualizar/remover/limpar itens.
  - Persistir cupom, frete, cotacoes e conversao.

- [ ] TASK-CART-029 Validar fallback em memoria.
  - Usar `Map` global somente em dev/test.
  - Gerar ids previsiveis o bastante para testes.
  - Expor persistencia `dev_fallback`.
  - Nao abrir conexao real com banco.

- [ ] TASK-CART-030 Isolar estado de teste.
  - Garantir reset ou isolamento do fallback entre cenarios automatizados.
  - Evitar que testes longos contaminem carrinhos entre specs.

## 10. UI Publica

- [ ] TASK-CART-031 Validar pagina `/carrinho`.
  - Renderizar heading do carrinho.
  - Mostrar estado vazio quando nao ha itens.
  - Mostrar mensagens de fallback/erro seguro.
  - Manter CTA para catalogo quando vazio.

- [ ] TASK-CART-032 Validar lista de itens.
  - Exibir nome, quantidade, preco unitario, subtotal e imagem quando houver.
  - Permitir atualizar quantidade.
  - Permitir remover item.

- [ ] TASK-CART-033 Validar painel de cupom.
  - Aplicar cupom por formulario.
  - Remover cupom aplicado.
  - Mostrar erro/sucesso sem quebrar layout.

- [ ] TASK-CART-034 Validar painel de frete.
  - Cotar CEP.
  - Listar opcoes.
  - Selecionar/remover opcao.
  - Mostrar ausencia de cobertura de forma amigavel.

- [ ] TASK-CART-035 Validar gate de checkout.
  - Carrinho vazio ou sem item compravel nao deve ir para checkout.
  - Carrinho sem frete deve orientar cotacao antes de checkout.
  - Guest com carrinho pronto deve ir para login com `returnTo=/checkout`.
  - Usuario autenticado com carrinho pronto deve ir para `/checkout`.

## 11. Testes

- [ ] TASK-CART-036 Cobrir dominio de estoque e subtotal.
  - Testar subtotal por item.
  - Testar subtotal de carrinho.
  - Testar quantidade invalida e estoque insuficiente.

- [ ] TASK-CART-037 Cobrir service de add/update/remove.
  - Produto valido entra no carrinho.
  - Produto indisponivel e rejeitado.
  - Update acima do estoque falha.
  - Remove/clear recalculam totais.

- [ ] TASK-CART-038 Cobrir cupom no carrinho.
  - Cupom valido aplica desconto.
  - Cupom invalido retorna erro amigavel.
  - Cupom de frete gratis zera frete elegivel.

- [ ] TASK-CART-039 Cobrir frete no carrinho.
  - CEP valido gera opcoes.
  - Selecao de frete altera total.
  - Mudanca de item limpa selecao.
  - Quote de outro carrinho e rejeitada.

- [ ] TASK-CART-040 Cobrir merge guest.
  - Migrar item valido.
  - Reduzir quantidade quando estoque nao comporta soma.
  - Ignorar item indisponivel.
  - Marcar carrinho guest como convertido.

- [ ] TASK-CART-041 Cobrir E2E publico.
  - Abrir `/carrinho` sem banco real.
  - Confirmar estado vazio/fallback.
  - Adicionar produto fixture ao carrinho quando disponivel.
  - Validar acesso ao carrinho, cupom/frete basico e gate de checkout.

## 12. Validacoes Recomendadas

- [ ] TASK-CART-042 Rodar `pnpm lint`.
- [ ] TASK-CART-043 Rodar `pnpm typecheck`.
- [ ] TASK-CART-044 Rodar `pnpm test`.
- [ ] TASK-CART-045 Rodar `pnpm test:e2e` para fluxos de carrinho.
- [ ] TASK-CART-046 Rodar `pnpm build` quando houver mudanca funcional.

## 13. Guardrails

- [ ] TASK-CART-047 Nao conectar banco real durante testes de fallback.
- [ ] TASK-CART-048 Nao alterar regras de pagamento, pedido ou settlement ao mexer no carrinho.
- [ ] TASK-CART-049 Nao expor checkout direto sem carrinho valido.
- [ ] TASK-CART-050 Nao considerar carrinho como reserva de estoque.
- [ ] TASK-CART-051 Nao usar fallback em memoria em producao/preview.

## 14. Definition of Done

- [ ] Trio canonico `requirements.md`, `design.md`, `tasks.md` da unit `cart` esta completo.
- [ ] Requisitos funcionais possuem tarefas rastreaveis.
- [ ] Fallback sem banco esta documentado e protegido por guardrails.
- [ ] Fluxos de cupom, frete e merge guest estao cobertos por tarefas.
- [ ] Riscos de estoque sem reserva e stale shipping quote estao explicitados.
