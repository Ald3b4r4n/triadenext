# Permissoes Reversa - Triade Essenza Next

Data: 2026-06-09
Escopo: permissoes apos Fase 7.

## Papeis

| Papel | Descricao |
| --- | --- |
| Visitante | Usuario anonimo com carrinho por identificador local |
| Cliente autenticado | Usuario com carrinho proprio |
| Manager | Operador administrativo com permissao operacional |
| Admin | Administrador com permissao ampla |

## Matriz de acesso

| Recurso/acao | Visitante | Cliente | Manager | Admin |
| --- | --- | --- | --- | --- |
| Ver catalogo | Sim | Sim | Sim | Sim |
| Gerenciar proprio carrinho | Sim | Sim | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Aplicar/remover cupom no proprio carrinho | Sim | Sim | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Cotar frete do proprio carrinho | Sim | Sim | Sim, como usuario se aplicavel | Sim, como usuario se aplicavel |
| Selecionar quote de outro carrinho | Nao | Nao | Nao | Nao |
| Acessar admin | Nao | Nao | Sim | Sim |
| Listar regras de frete admin | Nao | Nao | Sim | Sim |
| Criar/editar regras de frete | Nao | Nao | Sim | Sim |

## Protecoes server-side

- Acoes de carrinho resolvem o ator no servidor.
- Dono do carrinho, totais, desconto e frete nao sao aceitos como fonte de verdade pelo payload cliente.
- Selecao de frete valida que a quote pertence ao carrinho ativo.
- Acoes administrativas de frete usam `requireAdminLike`.
- Rotas `/admin/frete/**` ficam sob area administrativa.

## Frete

- Visitante e cliente podem cotar frete para o proprio carrinho.
- CEP invalido e bloqueado por validacao.
- Quote de outro carrinho e bloqueada.
- Providers externos inativos nao exigem credenciais nem permissao adicional.

## Cupom `free_shipping`

- Pode ser aplicado no carrinho conforme regras de cupom.
- Afeta somente frete manual calculado e elegivel.
- Nao concede desconto monetario em produtos.
- Nao cria frete quando nao ha frete cotado.

## Fora do escopo de permissao atual

- Permissoes de checkout.
- Permissoes de pedido.
- Permissoes de pagamento.
- Permissoes de reserva/baixa de estoque.
- Permissoes para credenciais de providers externos.
