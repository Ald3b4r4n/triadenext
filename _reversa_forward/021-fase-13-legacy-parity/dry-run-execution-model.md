# Dry-run Execution Model

## Modelo seguro

```text
fonte aprovada -> export sanitizado -> validacao de schema -> fixture/local isolado -> reconciliacao -> relatorio -> decisao humana
```

## Entrada permitida

- Fixtures controladas.
- Export aprovado e sanitizado por humano.
- Arquivos intermediarios sem secrets e sem dados pessoais crus.

## Saida permitida

- Relatorio versionavel com contagens, divergencias e amostras mascaradas.
- Nenhum dado real importado em producao.
- Nenhum valor secreto impresso.

## Falhas que abortam

- Presenca de `.env`, token, senha, URL real de banco ou chave privada.
- Dado pessoal cru em arquivo versionavel.
- Divergencia financeira nao explicada.
- Produto vendido sem SKU/slug/preco/estoque.
- Imagem obrigatoria ausente sem fallback aprovado.

## Aprovacoes humanas exigidas

- Conexao a banco legado.
- Export real.
- Import real.
- Migration real.
- Deploy/cutover.
