# Parity Evidence Checklist

## Evidencia minima por linha de paridade

- [ ] Dominio nomeado com linguagem de negocio.
- [ ] Evidencia Laravel: rota, controller/action, migration, view, doc/spec ou asset.
- [ ] Evidencia Next: rota, feature, schema, teste, SDD ou doc operacional.
- [ ] Status de paridade usando a taxonomia oficial.
- [ ] Classificacao de go-live: bloqueador, pos-go-live, fora de escopo ou decisao humana.
- [ ] Justificativa curta e verificavel.
- [ ] Proxima acao segura sem secrets, banco real, migration real, import real ou deploy.

## Fontes preferenciais

| Tipo | Laravel | Next |
|------|---------|------|
| Tela/fluxo | `routes/*`, `resources/views/*`, controllers | `src/app`, componentes e E2E |
| Regra | `app/Actions/*`, policies, migrations | `src/features/*`, `_reversa_sdd/domain.md` |
| Dados | migrations e modelos inferidos | `src/db/schema.ts`, `_reversa_sdd/data-dictionary.md` |
| Operacao | docs/specs, admin views | `docs/operations`, `scripts/ops` |

## Falha de evidencia

Se um dominio nao tiver evidencia suficiente sem banco real, classificar como `decisao-humana` ou `bloqueador` conforme impacto, nunca presumir paridade.
