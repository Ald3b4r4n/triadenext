# ADR 001 - Fallback explícito sem banco

## Status

Aceito retroativamente.

## Contexto

O projeto precisa rodar build, testes e E2E sem `DATABASE_URL` real, mas não pode fingir persistência real.

## Decisão

Usar `db = null` quando `DATABASE_URL` estiver ausente e selecionar repositories fallback/fixtures em dev/test. Retornos devem expor `dev_fallback`, `unavailable` ou `blocked` quando não há persistência real.

## Alternativas consideradas

- Exigir banco para qualquer execução local.
- Usar fixtures silenciosas mesmo quando banco real falha.
- Copiar dados reais do legado para desenvolvimento.

## Consequências

- 🟢 Testes e desenvolvimento ficam seguros sem credenciais.
- 🟢 Erros reais com banco configurado não devem virar fixture.
- 🟡 A UI precisa comunicar fallback quando isso importa para admin.
