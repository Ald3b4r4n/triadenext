# Regression Watch: Fase 11

> Data: `2026-06-22`
> Feature: `019-fase-11-qa-visual-hardening`

## Watch Items

| ID | Tipo | Origem | Deve continuar verdadeiro |
|----|------|--------|---------------------------|
| W001 | ausencia | R001/R002 | Home, customer e admin nao exibem `Reconstrucao em andamento`, `Placeholder funcional` ou `Storefront` generico. |
| W002 | presenca | M001 | Header/nav e footer simples continuam presentes e navegaveis no storefront. |
| W003 | presenca | M002 | Catalogo, produto e carrinho exibem CTAs claros, BRL e estados vazios com proxima acao. |
| W004 | presenca | M003 | Login, cadastro, minha conta, enderecos e pedidos mantem textos finais em PT-BR e sem placeholder tecnico. |
| W005 | presenca | M004/P001 | Admin continua protegido por policies e com mensagem de bloqueio amigavel sem variavel tecnica. |
| W006 | redacao | M005/R003 | Pagamento/notificacoes nao vazam secrets, tokens, `DATABASE_URL`, `client_secret` ou provider bruto em mensagens visiveis. |
| W007 | presenca | M006/P006 | `pnpm ops:check-env` reporta apenas nome/status de variaveis e nao conecta rede, banco, e-mail, migration ou deploy. |
| W008 | ausencia | P005 | Fase visual nao cria schema, migration ou alteracao em `drizzle/`/`drizzle.config.ts`. |
| W009 | presenca | M007 | Smoke responsivo cobre 360px, 430px, 768px e 1366px sem overflow horizontal nas rotas principais. |

## Validacoes executadas

| Comando | Resultado |
|---------|-----------|
| `pnpm lint` | Passou. |
| `pnpm typecheck` | Passou. |
| `pnpm test` | Passou: 34 arquivos, 102 testes. |
| `pnpm build` | Passou: Next.js compilou e gerou 25 paginas estaticas. |
| `pnpm test:e2e` | Passou: 32 testes Playwright. |

## Observacoes

- Validacao visual humana em navegador real antes de deploy continua recomendada.
- Admin autenticado com banco real deve ser revisado em ambiente seguro futuro; esta fase validou protecao sem credenciais reais.
- Checklist de producao deve ser reexecutado manualmente antes de qualquer migration/deploy real.
- Integracoes fiscais e canais externos continuam fora desta fase.

## Historico de re-extracoes

### Re-extracao 2026-07-01 - Pos-Fase 12

| ID | Veredito | Observacao |
|----|----------|------------|
| W001 | verde | SDD e smoke E2E preservam storefront sem placeholders de reconstrucao. |
| W002 | verde | Header/nav e footer seguem cobertos pelo hardening visual e smoke. |
| W003 | verde | Catalogo, produto e carrinho seguem com CTAs/BRL/estados controlados nos testes. |
| W004 | verde | Login, cadastro e areas protegidas seguem sem texto tecnico visivel em smoke. |
| W005 | verde | Admin permanece protegido e com bloqueio amigavel sem auth real. |
| W006 | verde | Mensagens e readiness nao expõem secrets, tokens, `DATABASE_URL` ou `client_secret`. |
| W007 | verde | `ops:check-env` permanece local, sem valores e sem rede/banco/deploy. |
| W008 | verde | Fase 12 nao criou migration nem alterou `drizzle/` funcionalmente. |
| W009 | verde | Smoke responsivo segue passando nas rotas principais. |

## Ambiente e seguranca

- `next-env.d.ts` permaneceu limpo apos build/testes.
- Nenhuma migration real foi executada.
- Nenhum banco real foi conectado.
- Nenhum e-mail real foi enviado.
- Nenhum deploy ou push foi executado durante a fase.
