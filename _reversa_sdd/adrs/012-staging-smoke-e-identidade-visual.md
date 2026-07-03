# ADR 012 - Staging smoke opt-in e identidade visual Triade

Data: 2026-07-03

## Status

Aceita.

## Contexto

A Fase 17 preparou o projeto para smoke real em staging/preview, mas a infraestrutura externa ainda pode estar ausente. A mesma janela de trabalho tambem consolidou a identidade visual publica da Triade Essenza Parfum, com foco em paridade visual do storefront antes de qualquer go-live.

## Decisao

O smoke real de staging deve ser opt-in e seguro:

- sem `STAGING_SMOKE_URL`, envs remotas ou webhook Stripe test mode, o resultado correto e `pending-config`;
- sem arquivos aprovados para import staging smoke, o resultado correto e `pending-input`;
- producao e Stripe live mode devem ser bloqueados antes de qualquer requisicao externa;
- validacoes locais nao podem depender de credenciais reais;
- go-live definitivo, dominio real, migration em producao e banco de producao seguem fora do escopo.

A identidade visual Triade aplicada ao storefront passa a ser baseline publico:

- logo horizontal dourada sobre verde profundo;
- hero com frasco premium;
- paleta verde profundo/dourado/preto premium/off-white;
- vitrine com `Essenza Gold`, `Amber Imperial` e `Noir Absolu` enquanto os dados reais seguem pendentes de reconciliacao;
- footer com central de atendimento por e-mail, menu, formas de pagamento e credito AR Software Development;
- admin fora da navegacao publica para visitantes e clientes comuns.

## Consequencias

- Smoke remoto real so avanca quando houver URL/env/webhook aprovados fora do Git e aprovacao humana.
- Estados `pending-config` e `pending-input` sao aceitaveis para ambientes incompletos e nao representam sucesso de go-live.
- Qualquer regressao para placeholder, texto tecnico visivel, paleta anterior ou exposicao publica de admin deve bloquear aceite visual.
- A identidade visual nao altera regras de pagamento, estoque, cupom, frete, pedido, notificacao ou migracao.

## Guardrails

- Nao copiar `.env`.
- Nao imprimir `DATABASE_URL`, chaves Stripe, Blob/Auth ou secrets.
- Nao conectar banco real sem aprovacao explicita.
- Nao rodar migration real.
- Nao executar deploy/go-live final.
- Nao alterar Laravel legado.
