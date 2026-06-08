# Auth

RBAC inicial:

- `customer`
- `admin`
- `manager`

Policies server-side devem garantir que clientes acessem apenas pedidos, documentos e enderecos proprios. Admins devem passar por validacoes de role, e `mustChangePassword` deve ser respeitado quando a autenticacao for implementada.
