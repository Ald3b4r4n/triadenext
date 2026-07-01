# Divergence Report Model

## Estrutura recomendada

| Campo | Descricao |
|-------|-----------|
| ID | `DVG-001`, sequencial |
| Dominio | catalogo, imagens, cupom, frete, pedido, cliente, admin etc. |
| Tipo | dado, regra, UI/navegacao, admin, integracao, conteudo |
| Severidade | CRITICAL, HIGH, MEDIUM, LOW |
| Impacto go-live | bloqueador, decisao humana, pos-go-live, fora de escopo |
| Evidencia origem | Arquivo/tabela/export Laravel |
| Evidencia destino | Arquivo/tabela/teste Next |
| Acao recomendada | migrar, corrigir, aceitar, backlog, nova fase |

## Severidade

- CRITICAL: risco financeiro, privacy/security, catalogo invendavel, rollback impossivel.
- HIGH: falta de entidade Must, divergencia de preco/estoque/cupom/frete.
- MEDIUM: UX/SEO/admin com workaround.
- LOW: cosmetico ou pos-go-live aceito.

## Categorias iniciais provaveis

- URLs legadas e SEO.
- Catalogo real.
- Imagens/capa.
- Frete externo/rastreamento.
- Clientes/pedidos historicos.
- Fiscal/Bling/NF-e.
- Relatorios/analytics.
