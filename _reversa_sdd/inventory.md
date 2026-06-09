# Inventario Reversa — triade-essenza-next

Atualizado em: 2026-06-08T22:45:00-03:00

## Escopo desta re-extracao

Esta re-extracao registra o estado do projeto Next.js apos a Fase 6
`004-fase-6-cupons-descontos`, concluida, validada e commitada localmente.

Nao foram executados migrations, conexoes com banco real, upload real, deploy, push ou alteracoes em
codigo funcional nesta etapa. O Laravel legado permaneceu fora do diretorio de trabalho.

## Diretorio

- Projeto atual: `D:\Projetos\triade-essenza-next`
- Projeto Laravel legado: `D:\Projetos\triadeessenzaparfum.com.br`
- Confirmacao: este inventario pertence ao projeto Next.js, nao ao legado Laravel.

## Git

- Branch: `main`
- Estado observado antes da re-extracao: `main...origin/main [ahead 1]`
- Worktree observado antes da re-extracao: limpo
- Commit da Fase 6: `399953c4dd8046550b2823f476880e5b15f84a02`
- Mensagem: `feat: implement coupons and cart discounts`
- Commits recentes:
  - `399953c feat: implement coupons and cart discounts`
  - `df28aa1 docs: update reversa state after phase 5`
  - `7215cf1 feat: implement cart and purchase session foundation`
  - `79025c3 docs: update reversa state after phase 4`
  - `fcdb929 feat: add auth and policy foundation`

## Fases implementadas

### Fundacao

- Next.js App Router, React, TypeScript, Tailwind, ESLint, Vitest e Playwright.
- Drizzle/Neon configurados sem exigir `DATABASE_URL` para build/test local.
- Health check, superficies iniciais de storefront/admin/customer e `.env.example` sem segredos.

### Fase 1 — Catalogo, produtos e imagens

- Dominio de produtos em `src/features/products`.
- Storefront em `/produtos` e `/produto/[slug]`.
- Regras publicas preservadas:
  - `status = published`;
  - `publishedAt <= now`;
  - `stockQuantity > 0`.
- `draft`, futuro, sem estoque e `inactive` nao ficam publicos.
- Imagens usam `isCover`, `sortOrder` e metadata; binario nao entra no banco.

### Fase 2 — Admin de produtos

- Admin em `/admin/produtos`, `/admin/produtos/novo` e `/admin/produtos/[id]/editar`.
- Formulario validado com Zod, server actions e repository.
- Upload controlado aceita JPEG, PNG e WebP ate 5 MB.
- Sem `BLOB_READ_WRITE_TOKEN`, upload retorna bloqueio controlado.

### Fase 3 — Neon/Drizzle, migrations locais e seed

- Runtime seguro em `src/lib/runtime-mode.ts`.
- `src/db/client.ts` exporta `db = null` sem `DATABASE_URL`.
- `src/db/schema.ts` expressa uniques/indices de catalogo, N:N e capa unica parcial.
- Migration local gerada: `drizzle/0000_shallow_shinko_yamashiro.sql`.
- Migration nao aplicada contra banco real.
- Repository Drizzle/fallback implementado para catalogo, admin de produtos e metadata de imagens.

### Fase 4 — Auth real, sessao e policies

- Better Auth integrado em `src/features/auth/server/auth.ts` com adapter Drizzle quando `db` existe.
- Route handler do provider em `src/app/api/auth/[...all]/route.ts`.
- Login, cadastro e logout por e-mail/senha via server actions em `src/features/auth/server/actions.ts`.
- Cadastro publico customer-only; role enviada pelo cliente nao e usada para criar admin/manager.
- Sessao server-side normalizada em `src/features/auth/server/session.ts` com `userId`, `email` e `role`.
- Roles reais: `customer`, `admin`, `manager`.
- `admin` e `manager` sao equivalentes no MVP para acesso administrativo.
- Policies reais em `src/features/auth/server/policies.ts`:
  - `requireAuthenticated`;
  - `requireAdminLike`;
  - `requireCustomer`;
  - `requireOwner`.
- `/admin/**` protegido por `src/app/admin/layout.tsx`.
- Area customer protegida por `src/app/(customer)/layout.tsx`.
- Server actions administrativas de produto e upload exigem `requireAdminLike`.
- Seed admin dev controlado em `scripts/db/seed-admin-dev.ts`.
- Migration local de auth gerada: `drizzle/0001_curvy_blink.sql`.
- Migration de auth nao aplicada contra banco real.
- Google OAuth, magic link e granularidade fina de permissoes ficaram fora do escopo atual.

### Fase 5 — Carrinho e sessao de compra

- Carrinho funcional em `src/features/cart`.
- Carrinho anonimo usa cookie seguro/opaco `guestCartToken`.
- Cookie nao armazena itens, precos, subtotal, userId, role ou dados sensiveis.
- Carrinho autenticado e resolvido server-side por `session.userId`.
- Ownership do carrinho fica no servidor; actions nao aceitam owner vindo do cliente.
- Repository/service de carrinho usam Drizzle quando ha banco e fallback dev/test explicito sem banco.
- Validacao de produto/estoque bloqueia `draft`, `inactive`, futuro, sem estoque e quantidade acima de `stockQuantity`.
- Merge no login soma quantidades por produto, limita por estoque e marca carrinho anonimo como `converted`.
- Server actions implementadas:
  - obter carrinho;
  - adicionar item;
  - atualizar quantidade;
  - remover item;
  - limpar carrinho.
- `/carrinho` renderiza estado vazio, itens, quantidade, subtotal, remocao, limpeza e aviso de fallback.
- Checkout aparece desabilitado; checkout, pagamento, frete, cupom, pedido, reserva e baixa de estoque continuam fora de escopo.
- Migration local de carrinho gerada: `drizzle/0002_tiny_enchantress.sql`.
- Migration de carrinho nao aplicada contra banco real.

### Fase 6 — Cupons e descontos no carrinho

- Dominio de cupons criado em `src/features/coupons`.
- Mapeamento legado documentado e implementado:
  - `percent` -> `percentage`;
  - `fixed` -> `fixed_amount`.
- Codigo de cupom normalizado com trim/uppercase.
- Validacao server-side bloqueia cupom inativo, futuro, expirado, esgotado, abaixo de subtotal minimo e tipo indisponivel.
- Desconto percentual e fixo calculados em centavos e limitados ao subtotal.
- Arredondamento percentual coberto por teste unitario.
- `free_shipping` fica apenas preparado/modelado, sem frete real e sem promessa de checkout.
- Carrinho passa a persistir uma referencia unica de cupom aplicado em `carts.applied_coupon_id` quando ha banco real.
- Divergencia intencional frente ao legado: no Laravel, cupom aplicado ficava em sessao (`cart_coupon_code`); no Next, fica no carrinho para preservar experiencia entre sessoes/dispositivos.
- `usedCount` e consultado para bloquear cupom esgotado, mas nao e consumido em apply/remove/merge do carrinho.
- Server actions de cupom nao aceitam desconto, subtotal, total, owner, role, cartId ou couponId vindos do cliente.
- Admin minimo de cupons em `/admin/cupons`, `/admin/cupons/novo` e `/admin/cupons/[id]/editar`, protegido por `requireAdminLike`.
- Admin de cupons e recorte minimo, nao paridade administrativa completa do legado.
- Migration local de cupons gerada: `drizzle/0003_elite_titanium_man.sql`.
- Migration de cupons nao aplicada contra banco real.

## Validacoes registradas da Fase 6

- `pnpm lint`: passou.
- `pnpm typecheck`: passou.
- `pnpm test`: passou, 16 files / 54 tests.
- `pnpm build`: passou.
- `pnpm test:e2e`: passou, 16 tests.

## Artefatos Reversa da Fase 4

- `_reversa_forward/002-fase-4-auth-policies/requirements.md`
- `_reversa_forward/002-fase-4-auth-policies/roadmap.md`
- `_reversa_forward/002-fase-4-auth-policies/actions.md`
- `_reversa_forward/002-fase-4-auth-policies/progress.jsonl`
- `_reversa_forward/002-fase-4-auth-policies/legacy-impact.md`
- `_reversa_forward/002-fase-4-auth-policies/regression-watch.md`

## Artefatos Reversa da Fase 5

- `_reversa_forward/003-fase-5-carrinho/requirements.md`
- `_reversa_forward/003-fase-5-carrinho/roadmap.md`
- `_reversa_forward/003-fase-5-carrinho/actions.md`
- `_reversa_forward/003-fase-5-carrinho/progress.jsonl`
- `_reversa_forward/003-fase-5-carrinho/legacy-impact.md`
- `_reversa_forward/003-fase-5-carrinho/regression-watch.md`

## Artefatos Reversa da Fase 6

- `_reversa_forward/004-fase-6-cupons-descontos/requirements.md`
- `_reversa_forward/004-fase-6-cupons-descontos/roadmap.md`
- `_reversa_forward/004-fase-6-cupons-descontos/actions.md`
- `_reversa_forward/004-fase-6-cupons-descontos/progress.jsonl`
- `_reversa_forward/004-fase-6-cupons-descontos/legacy-impact.md`
- `_reversa_forward/004-fase-6-cupons-descontos/regression-watch.md`
- `_reversa_forward/004-fase-6-cupons-descontos/audit/cross-check.md`
- `_reversa_forward/004-fase-6-cupons-descontos/audit/legacy-direction-check.md`

## Guardrails atuais

- Nao ler, copiar ou expor `.env`.
- Nao expor `DATABASE_URL`.
- Nao rodar migrations sem validacao humana.
- Nao conectar banco real nesta re-extracao.
- Nao fazer upload real sem `BLOB_READ_WRITE_TOKEN`.
- Nao fazer deploy.
- Nao fazer push nesta etapa.
- Carrinho nao reserva nem baixa estoque definitivamente.
- Checkout, pagamento, frete real, pedido, reserva e baixa de estoque continuam fora de escopo.
- Cupom acumulativo, limite por usuario e restricao por produto/categoria continuam fora de escopo.
- `free_shipping` nao aplica beneficio real de frete nesta fase.
- Nao modificar o Laravel legado.

## Proxima fase recomendada

Proxima fase recomendada: abrir a proxima feature com requisitos novos, mantendo catalogo,
persistencia, auth/policies, carrinho e cupons/descontos como base confirmada. Sugestoes naturais:
enderecos customer, frete real, pre-checkout/checkout sem pagamento real ou pedidos, conforme
decisao de produto.

Comando recomendado para abrir o ciclo: `/reversa-requirements`.
