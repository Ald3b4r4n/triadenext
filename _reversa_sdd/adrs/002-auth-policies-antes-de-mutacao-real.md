# ADR 002 - Auth e policies antes de mutação real

## Status

Aceito retroativamente.

## Contexto

As primeiras fases precisavam preparar admin e persistência sem liberar escrita real insegura em preview/produção.

## Decisão

Centralizar sessão e policies em `src/features/auth/server/*`, exigir `admin` ou `manager` para admin e bloquear mutação real quando auth/banco não estão prontos.

## Alternativas consideradas

- Permitir admin temporário sem auth.
- Validar papel no client.
- Adiar toda persistência administrativa.

## Consequências

- 🟢 Mutação real passa por guardrails server-side.
- 🟢 Build/test continuam sem credenciais.
- 🟡 `manager` e `admin` são equivalentes no MVP, exigindo refinamento futuro.
