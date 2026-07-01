# Data Inventory Validation

## Template por entidade

| Campo | Descricao |
|-------|-----------|
| Entidade | Categoria, produto, imagem, cliente, endereco, cupom, frete, pedido, pagamento etc. |
| Origem Laravel | Migration/tabela/rota/action/asset candidato |
| Destino Next | Tabela Drizzle ou feature |
| Obrigatoriedade | Must, Should, pos-go-live ou decisao humana |
| Chave comercial | SKU, slug, codigo, numero de pedido, email mascarado |
| Transformacao | Normalizacao esperada sem dado pessoal cru |
| Reconciliacao | Contagem, chave, valor, status, amostra mascarada ou asset |
| Risco | Baixo, medio, alto |

## Validacoes por dominio

- Catalogo: contagem, slug, SKU, status publico, preco em centavos, estoque e categoria.
- Imagens: arquivo existe, capa, ordem, produto associado, tipo permitido e fallback.
- Cliente: email unico mascarado, perfil, telefone/CPF somente mascarados e consentimento de import futuro.
- Endereco: CEP, UF, cidade, bairro, logradouro e vinculo com cliente.
- Cupom: codigo, tipo, valor, vigencia, limite e status.
- Frete: UF/faixa CEP, preco/prazo, provider manual ou externo.
- Pedido: numero, status, itens, snapshots, subtotais, desconto, frete e total.
- Pagamento: provider reference, status e valor.

## Regra de privacidade

Relatorios versionados nao devem conter CPF, telefone completo, email completo, endereco completo, URL real de banco ou token.
