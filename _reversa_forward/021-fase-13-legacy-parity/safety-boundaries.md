# Safety Boundaries

> Fase 13 executa comparacao e planejamento. Nao executa operacao real.

## Operacoes proibidas

| Categoria | Proibicao | Gate futuro |
|-----------|-----------|-------------|
| Secrets | Ler/copiar/imprimir `.env`, tokens, senhas, URLs reais ou chaves privadas | Aprovacao humana e canal seguro fora do Git |
| Banco | Conectar banco real, rodar query real, dump, import ou seed real | Aprovacao humana explicita + alvo identificado |
| Migration | Rodar migration real ou `drizzle-kit migrate` contra ambiente remoto | Aprovacao humana explicita + backup |
| Laravel | Alterar arquivo, cache, storage, banco, filas ou config do legado | Nao permitido nesta fase |
| Deploy | Vercel deploy, dominio, cutover ou go-live | Fase posterior com checklist aprovado |
| Providers | Stripe live, Bling, NF-e, Melhor Envio, Correios, e-mail real | Fora do escopo atual |

## Comandos seguros usados nesta fase

- `Get-ChildItem`, `Get-Content` e `rg` sobre arquivos permitidos.
- `git status`, `git diff --check` e validacoes locais do Next.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm test:e2e` apos gerar artefatos.

## Comandos bloqueados nesta fase

- `php artisan *` no Laravel.
- `pnpm db:migrate`, `pnpm db:seed`, `drizzle-kit migrate` e equivalentes.
- `vercel deploy`, `git push` e qualquer comando que publique estado externo.
- Qualquer comando que leia `.env*`.

## Resultado esperado

Todos os artefatos podem ser versionados porque contem nomes de variaveis, nomes de arquivos, contagens e decisoes, nunca valores secretos nem dados pessoais crus.
