# Requirements - Área do Cliente Completa

## Objetivo

Completar a área autenticada do cliente no Next, substituindo placeholders por páginas funcionais de perfil, endereços, pedidos e segurança.

## Escopo

- Perfil do cliente.
- Cadastro e edição de endereços.
- Listagem e detalhe de pedidos próprios.
- Atualização segura de dados cadastrais.
- Alteração/recuperação de senha se aplicável à estratégia de auth.

## Regras

- Cliente só acessa dados próprios.
- Dados sensíveis não devem aparecer em logs.
- Endereço usado em pedido fechado deve permanecer como snapshot do pedido.

## Fora do escopo

- Admin de clientes.
- Migração de dados real.
- Integração fiscal.
