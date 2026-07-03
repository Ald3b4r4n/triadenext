# Onboarding - Fase 16 Approved Staging Import

> Identificador: `024-fase-16-staging-import`
> Data: `2026-07-02`

## Objetivo

Orientar um operador humano a preparar, testar e aprovar a importacao controlada em staging/dev remoto sem tocar em producao, sem copiar `.env`, sem expor secrets e sem alterar o Laravel legado.

## Antes de comecar

1. Confirmar que esta no projeto Next:
   - `D:\Projetos\triade-essenza-next`
2. Confirmar que nao esta no Laravel legado:
   - `D:\Projetos\triadeessenzaparfum.com.br`
3. Confirmar Git limpo antes de qualquer execucao operacional.
4. Confirmar que `next-env.d.ts` esta limpo.
5. Confirmar que nao ha credenciais reais impressas em terminal, chat ou relatorio.

## Checklist de ambiente

- [ ] Ambiente alvo e staging/dev remoto, preferencialmente Neon dev/staging separado.
- [ ] Ambiente alvo nao e producao.
- [ ] Ambiente alvo possui identificador/nome que nao aponta para dominio real.
- [ ] Conexao remota foi aprovada por humano, sem imprimir `DATABASE_URL`.
- [ ] Snapshot/backup foi criado ou formalmente confirmado.
- [ ] Rollback esta documentado.
- [ ] Migrations foram revisadas estaticamente, sem aplicar migration real automatica.

Se qualquer item acima falhar, parar a importacao real e gerar pendencia operacional.

## Checklist de arquivos

Pasta aprovada:

```text
data/dry-run/input/primeira-execucao/
```

Arquivos esperados:

- [ ] `products.csv` ou `products.json`
- [ ] `categories.csv` ou `categories.json`
- [ ] `product_images.csv` ou `product_images.json`
- [ ] `inventory.csv` ou `inventory.json`
- [ ] `coupons.csv` ou `coupons.json`, se houver cupons ativos
- [ ] `shipping.csv` ou `shipping.json`

Aliases aceitos:

- `product-images.csv` ou `product-images.json`
- `shipping-rules.csv` ou `shipping-rules.json`

Se arquivos Must estiverem ausentes, o status esperado e `pending-input`.

## Precheck local seguro

Comando seguro esperado:

```powershell
pnpm ops:check-data-dry-run -- --input data/dry-run/input/primeira-execucao --format both
```

Resultado que libera planejamento de importacao:

- `go`; ou
- sem bloqueio critico, com excecoes humanas registradas.

Resultados que bloqueiam escrita:

- `pending-input`;
- `no-go`;
- qualquer `CRITICAL` ou `HIGH` sem excecao formal;
- qualquer `UNSAFE_INPUT`;
- secret ou dado sensivel em relatorio.

## Execucao de importacao staging

A Fase 16 expoe um comando staging-only. O contrato esta em:

```text
_reversa_forward/024-fase-16-staging-import/interfaces/staging-import-command.md
```

Check sem escrita:

```powershell
pnpm ops:import-staging -- --target staging --mode check
```

Upsert controlado:

```powershell
pnpm ops:import-staging -- --target staging --mode upsert --confirm-staging confirmado --backup-confirmed --human-approval APROVACAO-SANITIZADA
```

Reset protegido:

```powershell
pnpm ops:import-staging -- --target staging --mode reset-and-upsert --confirm-staging confirmado --backup-confirmed --allow-reset --human-approval APROVACAO-SANITIZADA
```

Fluxo esperado:

1. Rodar precheck sem escrita.
2. Confirmar ambiente nao produtivo.
3. Confirmar snapshot/backup e rollback.
4. Confirmar dry-run `go` ou sem bloqueio critico.
5. Rodar importacao com modo padrao `upsert`.
6. Gerar relatorio antes/depois.
7. Rodar smoke pos-importacao.
8. Registrar decisao humana: aprovado, aprovado com excecoes, no-go ou rollback.

## Reset/limpeza de staging

Reset nao e padrao.

So continuar se todos forem verdadeiros:

- [ ] Snapshot/backup confirmado.
- [ ] Flag explicita de reset informada.
- [ ] Aprovacao humana explicita registrada.
- [ ] Ambiente confirmado como nao producao.
- [ ] Relatorio pre-reset gerado sem secrets.

Qualquer sinal de producao deve abortar antes de conectar.

## Smoke pos-importacao

Smoke minimo em ambiente nao produtivo:

- [ ] Home carrega.
- [ ] Catalogo lista produtos importados.
- [ ] Produto publicado abre com preco, imagem/fallback e estoque.
- [ ] Carrinho aceita produto importado.
- [ ] Checkout teste cria pedido pendente.
- [ ] Pagamento/test mode ou mock nao usa live mode.
- [ ] Admin visualiza produtos, pedidos, frete/cupons aplicaveis.
- [ ] Outbox/notificacoes ficam em modo seguro.

Wrapper seguro:

```powershell
pnpm ops:check-staging-import-smoke
```

## Relatorios esperados

Detalhe do contrato:

```text
_reversa_forward/024-fase-16-staging-import/interfaces/staging-import-reports.md
```

Relatorios sanitizados podem ser versionaveis se nao contiverem dados reais crus. Relatorios brutos com dados reais devem permanecer fora do Git.

## Comandos proibidos nesta fase

- Deploy real.
- Migration real automatica.
- Conexao com producao.
- Importacao em producao.
- Upload real para storage produtivo.
- Copia de `.env`.
- Escrita no Laravel legado.
- Push automatico.

## Saida esperada da fase

- Ambiente staging/dev remoto preparado ou pendencia documentada.
- Importacao staging por upsert seguro executada somente se pre-condicoes forem satisfeitas.
- Relatorio antes/depois.
- Relatorio de divergencias.
- Checklist humano de aprovacao da proxima fase.
- Rollback/snapshot documentado.
