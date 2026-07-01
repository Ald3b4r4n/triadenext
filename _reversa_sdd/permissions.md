# Permissions - Triade Essenza Next

Atualizado em: 2026-07-01
Agente: Detective

## Papéis

| Papel | Descrição | Confiança |
| --- | --- | --- |
| Visitante | Usuário sem sessão; navega storefront e pode ter carrinho guest. | 🟢 |
| Customer | Usuário autenticado para compra e leitura dos próprios pedidos. | 🟢 |
| Manager | Papel administrativo operacional no MVP. | 🟢 |
| Admin | Papel administrativo amplo dentro dos guardrails. | 🟢 |
| Sistema/Webhook | Ator sem sessão browser, autorizado por assinatura/evento externo. | 🟢 |

## Matriz de Permissões

| Recurso/ação | Visitante | Customer | Manager | Admin | Sistema/Webhook |
| --- | ---: | ---: | ---: | ---: | ---: |
| Ver home/catálogo/produto público | Sim | Sim | Sim | Sim | N/A |
| Ver draft/inactive/futuro/sem estoque no público | Não | Não | Não | Não | N/A |
| Criar/editar produto | Não | Não | Sim | Sim | Não |
| Upload de imagem de produto | Não | Não | Sim | Sim | Não |
| Carrinho guest | Sim | Não | Não | Não | Não |
| Carrinho autenticado próprio | Não | Sim | Sim* | Sim* | Não |
| Aplicar/remover cupom no próprio carrinho | Sim | Sim | Sim* | Sim* | Não |
| Cotar/selecionar frete no próprio carrinho | Sim | Sim | Sim* | Sim* | Não |
| Checkout/criar pedido | Não | Sim | Não | Não | Não |
| Ler pedido próprio | Não | Sim | Não | Não | Não |
| Ler pedidos administrativos | Não | Não | Sim | Sim | Não |
| Criar PaymentIntent do próprio pedido | Não | Sim | Não | Não | Não |
| Confirmar pagamento | Não | Não | Não | Não | Sim |
| Baixar estoque/consumir cupom | Não | Não | Não | Não | Sim |
| Ler status admin de notificações | Não | Não | Sim | Sim | Não |
| Receber notificação de pedido pago | Não | Sim | Configurado | Configurado | Dispara |
| Reenviar notificação | Não | Não | Não | Não | Não |
| Operar fiscal/Bling/NF-e | Não | Não | Não | Não | Não |
| Executar deploy/migration real | Não | Não | Não | Não | Não |

`*` Manager/Admin podem ter sessão com papel administrativo, mas carrinho continua resolvido por usuário/sessão própria; não há operação "editar carrinho de terceiro".

## Policies

- 🟢 `requireCustomer` protege checkout, pagamento e leitura de pedido customer.
- 🟢 `requireAdminLike` protege admin, produtos, cupons, frete, upload e status administrativo.
- 🟢 `requireOwner` existe para ownership explícito, embora nem todos os fluxos usem diretamente.
- 🟢 Webhook Stripe não depende de sessão; depende de adapter/assinatura/eventId.

## Guardrails

- 🟢 Admin-like também bloqueia quando `DATABASE_URL` ou auth real estão ausentes.
- 🟢 Mutação real usa `assertCanMutateRealData`, liberando somente auth pronto em dev/test.
- 🟢 Preview/produção sem provider externo real falham de forma segura.
- 🟢 Mensagens de erro são controladas e não expõem secrets.
- 🟢 Scripts `ops:*` podem ser executados localmente por operador humano, mas nao concedem permissao de deploy, migration real, banco real, pagamento real ou envio real.
- 🟢 Deploy/migration real ficam fora das permissoes da aplicacao e exigem aprovacao humana operacional.

## Lacunas de Permissão

- 🔴 Não há matriz granular além de `admin`/`manager`.
- 🔴 Customer profile e endereços ainda não têm actions completas.
- 🔴 Operações pós-pagamento administrativas ainda não foram implementadas.
- 🔴 Fiscal/Bling/NF-e não possui superfície funcional autorizável.
