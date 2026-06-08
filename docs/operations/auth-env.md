# Auth Environment

Variaveis adicionadas para a Fase 4:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DEV_ADMIN_EMAIL`
- `DEV_ADMIN_PASSWORD`

Regras:

- `.env.example` mostra apenas nomes, sem valores reais.
- `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL` sao necessarias para auth real.
- `DEV_ADMIN_EMAIL` e `DEV_ADMIN_PASSWORD` sao usadas somente no seed admin dev local.
- Nenhum valor sensivel deve aparecer em logs, docs, testes ou erros.
- Sem `DATABASE_URL`, auth/policies reais ficam indisponiveis e mutacoes admin continuam bloqueadas.
