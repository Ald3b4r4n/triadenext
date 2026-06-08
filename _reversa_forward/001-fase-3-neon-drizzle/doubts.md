# Clarificacao: Fase 3 - Neon, Drizzle, migrations locais, seed controlado e persistencia real

> Identificador: `001-fase-3-neon-drizzle`  
> Data: `2026-06-08`  
> Documento integrado: `requirements.md`  
> Resultado: 5 duvidas resolvidas, 0 remanescentes

## Respostas aplicadas

| ID | Pergunta | Decisao |
|----|----------|---------|
| D-01 | `inactive` deve continuar como equivalente funcional de arquivado/inativo? | Sim. Nesta reconstrucao inicial, `inactive` e equivalente funcional de inativo/arquivado, nao aparece publicamente, nao e compravel e permanece acessivel apenas no admin. A nomenclatura final pode ser revisada futuramente. |
| D-02 | Migrations locais podem ser geradas sem `DATABASE_URL`? | Sim, gerar arquivos de migration e permitido sem aplicar em banco real, se for tecnicamente possivel. Executar `db:migrate` contra banco real exige validacao humana explicita. |
| D-03 | O seed deve criar imagens com URLs placeholder ou sem imagens? | O seed deve criar categorias e produtos ficticios com imagens placeholder seguras. Nao usar imagens reais do legado e nao copiar arquivos do Laravel. |
| D-04 | O primeiro banco Neon sera local/dev, preview ou producao? | O primeiro banco Neon sera desenvolvimento/local-dev. Nao tratar como producao e documentar separacao futura entre local/dev, preview e producao. |
| D-05 | Admin sem autenticacao real pode criar registros quando `DATABASE_URL` existir? | Mutacao real so deve ser permitida em ambiente de desenvolvimento, marcada como temporaria e protegida por guardrail de ambiente. Preview/producao ficam bloqueados sem auth/policies. |

## Duvidas remanescentes

Nenhuma.

## Proxima etapa recomendada

`/reversa-quality`
