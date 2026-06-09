# Cross-check Audit — Fase 7 Frete e Cotações

> Data: `2026-06-09`
> Feature: `005-fase-7-frete-cotacoes`
> Requirements: `_reversa_forward/005-fase-7-frete-cotacoes/requirements.md`
> Roadmap: `_reversa_forward/005-fase-7-frete-cotacoes/roadmap.md`
> Actions: `_reversa_forward/005-fase-7-frete-cotacoes/actions.md`
> Auditoria: `/reversa-audit`

## Veredito

**Aprovado sem CRITICAL/HIGH.**

Os artefatos estão suficientemente alinhados para avançar para `/reversa-coding`. A auditoria encontrou apenas uma observação LOW de consistência textual no resumo do `actions.md`; ela não altera escopo, segurança, dependências executáveis nem cobertura.

## Resumo de findings

| Severidade | Quantidade |
|------------|------------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 1 |

## Findings

| ID | Severidade | Eixo | Descrição | Onde está |
|----|------------|------|-----------|-----------|
| A001 | LOW | Sanidade do actions | O resumo informa `Maior cadeia de dependência | F7-001 → F7-096`, mas as validações finais seguem até `F7-103`. A cadeia executável real termina em `F7-103`. | `actions.md#Resumo`, `actions.md#16-validações-finais-e-commit-opcional` |

### A001 — impacto e sugestão

Impacto baixo: a tabela de ações, dependências e critérios de aceite permanece válida, e nenhuma tarefa depende de ID inexistente. A correção sugerida é ajustar futuramente a linha do resumo para `F7-001 → F7-103` em uma etapa de refinamento textual, se desejado.

## Itens verificados que passaram

### Cobertura

- Todos os 20 requisitos funcionais têm cobertura no roadmap e no actions.
- CEP e normalização estão cobertos por domínio, actions e testes (`F7-014` a `F7-016`, `F7-079`).
- Regra manual por UF/faixa de CEP está coberta (`F7-017` a `F7-027`, `F7-080`, `F7-081`).
- Cotação manual, expiração de 30 minutos e ausência de cobertura estão cobertas (`F7-028` a `F7-033`, `F7-082`, `F7-089`, `F7-092`).
- Seleção persistida no carrinho e ownership estão cobertos (`F7-034` a `F7-042`, `F7-084`, `F7-085`, `F7-090`).
- `free_shipping` sobre frete manual está coberto (`F7-043` a `F7-047`, `F7-086`, `F7-091`).
- Admin básico protegido está coberto (`F7-060` a `F7-068`, `F7-087`, `F7-093`).
- Providers futuros inativos estão cobertos (`F7-076` a `F7-078`, `F7-088`).
- Fallback sem banco/sem credenciais externas está coberto (`F7-028`, `F7-033`, `F7-051`, `F7-052`, `F7-083`).
- Documentação está coberta (`F7-094` a `F7-096`).

### Segurança

- Nenhuma tarefa manda expor secrets, copiar `.env` do legado ou usar credenciais externas.
- Nenhuma tarefa manda chamar API externa real.
- Nenhuma tarefa manda conectar banco de produção, rodar migration real, fazer deploy ou push.
- Payload/client-side forçando frete é explicitamente bloqueado (`F7-059`, `F7-084`).
- Seleção de frete em carrinho alheio é coberta por ownership e testes (`F7-056`, `F7-084`).
- Customer/visitante são bloqueados no admin de frete (`F7-061`, `F7-067`, `F7-087`, `F7-093`).
- Erro real com `DATABASE_URL` não vira fixture silenciosa (`F7-052`).

### Escopo

- Nenhuma tarefa implementa checkout, pagamento, Stripe, pedido, reserva ou baixa de estoque.
- Nenhuma tarefa implementa API externa real ou credencial de provider externo.
- Nenhuma tarefa exige endereço completo ou peso/dimensões.
- Nenhuma tarefa implementa painel avançado de transportadoras, contratos, SLA real ou relatórios.
- `free_shipping` é limitado ao frete manual calculado e elegível, sem frete artificial.

### Ordem e dependências

- Schema/migration local vem antes de repository/service (`F7-006` a `F7-012` antes de `F7-048`).
- Domínio vem antes de regras manuais e cotação (`F7-013` a `F7-027` antes de `F7-028`).
- Cotação vem antes de seleção no carrinho (`F7-028` a `F7-033` antes de `F7-034`).
- Seleção no carrinho vem antes de UI/E2E (`F7-034` a `F7-058` antes de `F7-069` e `F7-089`).
- Integração com cupons vem depois da base de frete/carrinho (`F7-043` a `F7-047`).
- Server actions vêm depois de service/repository (`F7-055` a `F7-061` dependem de `F7-054`/`F7-050`).
- Testes unitários e E2E vêm antes das validações finais (`F7-079` a `F7-093` antes de `F7-097`).
- Todas as dependências apontam para IDs existentes.
- Nenhum ciclo de dependência foi identificado.

### Paralelismo

- Existem 10 tarefas marcadas `[//]`.
- As tarefas paralelizáveis não compartilham o mesmo arquivo alvo entre si.
- Tarefas em arquivos críticos (`src/db/schema.ts`, `drizzle/`, `src/features/cart/**`, `src/features/coupons/**`, `src/app/(storefront)/carrinho/**`, `src/app/admin/frete/**`) estão sequenciais quando compartilham superfície crítica.
- Documentação paralelizável usa arquivos distintos (`docs/features/shipping.md`, `docs/architecture/shipping.md`).

### Testabilidade

- Testes unitários cobrem CEP válido/normalização, CEP inválido, regra por UF, faixa de CEP, ausência de cobertura, expiração, fallback, ownership, payload malicioso, `free_shipping`, provider inativo e admin protegido.
- E2E cobre visitante cotando CEP, selecionando frete, `free_shipping`, CEP sem cobertura e admin de regras manuais.
- Validações finais incluem `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm test:e2e`.

### Coerência com SDD e legado

- O plano preserva regras confirmadas de carrinho: `guestCartToken`, `session.userId`, subtotal em centavos, produto comprável e ownership.
- O plano respeita o estado da Fase 6: cupom existe, `free_shipping` estava preparado e agora fica restrito ao frete manual da Fase 7.
- O plano preserva checkout, pagamento, pedido, reserva e baixa de estoque fora de escopo.
- O plano usa o legado apenas como direção conceitual de frete no carrinho, sem importar provedores reais para o runtime.

## Correções sugeridas

- LOW: ajustar a métrica `Maior cadeia de dependência` em `actions.md` para terminar em `F7-103`.

## Próxima etapa recomendada

Executar `/reversa-coding`, pois não há findings CRITICAL ou HIGH.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-09 | Auditoria cruzada gerada por `/reversa-audit` | reversa |
