# Auth e Policies

## Escopo

- Better Auth como provider inicial.
- Login por e-mail/senha.
- Cadastro publico criando apenas `customer`.
- Roles `customer`, `admin` e `manager`.
- `admin` e `manager` equivalentes no MVP.
- Protecao server-side de `/admin/**`, `/minha-conta/**` e actions administrativas.

## Limites

- Google OAuth preparado apenas para o futuro.
- Magic link fora da Fase 4.
- Checkout, pagamento, frete, cupom, pedidos reais e documentos fiscais reais fora do escopo.

## Regras de operacao

- Session e policy sempre sao avaliadas no servidor.
- Sessao ausente, expirada, invalida ou com timeout falha de forma segura.
- Preview/producao bloqueiam mutacoes admin se auth/policies reais nao estiverem ativas.
- Build/test continuam funcionando sem credenciais reais.

## Fluxos principais

- Login retorna erro controlado para credenciais invalidas.
- Signup publico ignora ou rejeita role administrativa e cria apenas `customer`.
- Logout invalida a sessao no servidor.
- Ownership customer sempre depende de `session.user.id`.
