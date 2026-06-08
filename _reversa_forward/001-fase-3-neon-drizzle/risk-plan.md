# Plano de riscos tecnicos

> Feature: `001-fase-3-neon-drizzle`  
> Data: `2026-06-08`

## 1. Riscos principais

| ID | Risco | Severidade | Sinal de alerta | Mitigacao |
|----|-------|------------|-----------------|-----------|
| R-01 | Migration aplicada contra banco errado | Critica | `DATABASE_URL` aponta para preview/producao ou nao foi validada | Exigir validacao humana antes de `db:migrate`; documentar local-dev primeiro. |
| R-02 | Fallback mascarar falha real | Alta | Com `DATABASE_URL` presente, repository retorna fixtures apos erro Drizzle | Fallback apenas quando `db === null`; erros Drizzle propagam. |
| R-03 | Admin sem auth gravar em ambiente nao seguro | Alta | Preview/producao com `DATABASE_URL` permitem mutacao | Guardrail bloqueia mutacao real fora de desenvolvimento ate Fase 4. |
| R-04 | Seed com dados que parecem producao | Media | Nomes, imagens ou descricoes podem ser confundidos com catalogo real | Usar dados claramente ficticios e placeholders marcados como dev. |
| R-05 | Metadata de imagem orfa | Media | Registro em `product_images` sem Blob real | Persistir metadata somente apos `uploaded`; transacao onde aplicavel. |
| R-06 | Unique/indices ausentes causarem duplicidade | Media | Slug/SKU duplicado ou multiplas capas | Revisar schema/migration e adicionar tests/constraints. |
| R-07 | Build/test dependerem de banco | Alta | CI/local falham sem `DATABASE_URL` | Manter env opcional e testes sem banco. |

## 2. Criterios de escalonamento

- Qualquer risco critico vira bloqueio para `/reversa-coding` ate existir acao mitigadora.
- Qualquer instrucao que envolva banco real exige confirmacao humana explicita.
- Qualquer necessidade de secret real deve ser removida do plano e tratada como configuracao local privada.

## 3. Rollback operacional

- Reverter feature para modo fixture se repository real falhar antes de deploy.
- Nao aplicar migrations em preview/producao nesta fase.
- Limpar apenas banco local-dev se seed causar dados incorretos, com confirmacao humana.
- Manter docs indicando o estado seguro atual.
