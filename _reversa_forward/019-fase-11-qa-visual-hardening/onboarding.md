# Onboarding: Fase 11 - QA visual, hardening frontend e preparacao segura de producao

> Identificador: `019-fase-11-qa-visual-hardening`
> Data: `2026-06-22`

## 1. Objetivo para quem for implementar/testar

Validar que a Tríade Essenza Parfum esta visualmente apresentavel, navegavel e pronta para teste controlado de producao, sem redesign premium, sem mudanca de regra de negocio e sem uso de recursos reais.

## 2. Pre-requisitos esperados

1. Trabalhar em `D:\Projetos\triade-essenza-next`.
2. Confirmar que nao esta em `D:\Projetos\triadeessenzaparfum.com.br`.
3. Nao copiar `.env`.
4. Nao expor secrets.
5. Nao conectar banco real.
6. Nao rodar migration real.
7. Nao enviar e-mail real.
8. Nao fazer deploy.
9. Usar apenas mock/dev/test/fixture seguro.
10. Se `next-env.d.ts` sujar durante execucao local, restaurar antes de commit.

## 3. Preparacao local segura

1. Conferir estado Git antes de iniciar coding futuro:

```powershell
git status --short
git status -sb
```

2. Instalar dependencias somente se necessario e ja esperado pelo projeto:

```powershell
pnpm install
```

3. Rodar servidor local para QA visual quando a implementacao existir:

```powershell
pnpm dev
```

4. Abrir `http://localhost:3000` e navegar pelas rotas alvo.

## 4. Roteiro de QA visual storefront

| Rota | O que validar |
|------|---------------|
| `/` | Marca Tríade Essenza Parfum, header, hero/CTA, vitrine/estado vazio aceitavel, ausencia de placeholder antigo. |
| `/produtos` | Grid/lista de produtos, cards legiveis, BRL, CTA para produto/carrinho e estado vazio amigavel. |
| `/produto/[slug]` | Imagem/descricao/preco/estoque/CTA, erro 404 ou indisponivel sem texto tecnico. |
| `/carrinho` | Itens, quantidades, cupom, frete, totais, carrinho vazio, CTA para checkout e responsividade. |
| `/checkout` | Login exigido quando necessario, endereco/dados de compra, frete/cupom snapshotado e erros amigaveis. |
| `/pedidos/[id]/pagamento` | Payment mock/test claro, sem coleta propria de cartao, sem secret/client_secret exposto como formulario. |

## 5. Roteiro de QA visual auth/customer

| Rota | O que validar |
|------|---------------|
| `/login` | Form legivel, erro amigavel, link de cadastro e retorno seguro. |
| `/cadastro` | Form legivel, validacao amigavel e texto PT-BR. |
| `/minha-conta` | Estado minimo apresentavel, sem "Reconstrucao em andamento" ou "Placeholder funcional". |
| `/enderecos` | Estado minimo apresentavel, deixando claro se endereco completo ainda nao esta disponivel. |
| `/pedidos` | Lista/estado vazio, pedidos proprios, status, total e proxima acao. |

## 6. Roteiro de QA visual admin

| Rota | O que validar |
|------|---------------|
| `/admin` | Protecao por auth/admin-like e dashboard minimo sem placeholder tecnico. |
| `/admin/produtos` | Tabela/lista, empty state, acoes de criar/editar, mensagens sem texto tecnico indevido. |
| `/admin/cupons` | Tabela/lista, status, empty state e forms legiveis. |
| `/admin/frete` e `/admin/fretes` | Consistencia de rota, regras manuais, empty state e ausencia de promessa de provider real. |
| `/admin/pedidos` | Pedidos, status de pagamento, notificacoes basicas e nenhuma acao fora de escopo. |
| `/admin/documentos-fiscais` | Nao implementar fiscal; se rota continuar visivel, mensagem deve dizer que fiscal/Bling/NF-e esta fora desta fase. |

## 7. Breakpoints obrigatorios

Validar pelo menos:

- 360px de largura;
- 430px de largura;
- 768px de largura;
- 1366px de largura.

Checklist por breakpoint:

- sem overflow horizontal;
- header navegavel;
- cards legiveis;
- carrinho/checkout usaveis;
- botoes clicaveis;
- formularios sem quebra;
- texto sem sobreposicao;
- admin minimamente navegavel no desktop.

## 8. Fluxo feliz mock/dev

1. Visitante entra pela home.
2. Visitante abre catalogo.
3. Visitante abre produto.
4. Visitante adiciona produto ao carrinho.
5. Cliente cadastra ou loga.
6. Cliente aplica cupom valido quando houver fixture.
7. Cliente calcula/seleciona frete manual.
8. Cliente cria pedido pendente.
9. Cliente paga via mock/test.
10. Pedido muda para status pago conforme fluxo existente.
11. Notificacao mock/outbox e criada ou status seguro e mostrado.
12. Admin visualiza pedido/status/notificacao.

Esse fluxo nao deve usar banco real, Stripe real, e-mail real, deploy ou migration real.

## 9. Varredura textual obrigatoria

Antes de concluir a fase, procurar pelo menos os termos abaixo em UI/testes relevantes:

```powershell
rg -n "Reconstrucao|Reconstrução|Placeholder funcional|Storefront|DATABASE_URL|secret|token|client_secret|BLOB_READ_WRITE_TOKEN|STRIPE_SECRET_KEY|SMTP_PASSWORD" src/app src/components src/features src/tests
```

Nem toda ocorrencia em teste, provider ou sanitizacao e erro. O objetivo e confirmar que usuario final nao ve texto tecnico indevido.

## 10. Validacoes finais futuras

Quando a implementacao da Fase 11 existir:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Se alguma validacao falhar por dependencia externa real, isso deve ser tratado como bug da Fase 11 ou configuracao insegura, nao como requisito para usar credencial real.

## 11. Checklist operacional de producao

1. Revisar `.env.example` sem valores reais.
2. Separar variaveis obrigatorias e opcionais.
3. Confirmar que secrets nao estao versionados.
4. Confirmar que build/test nao exigem credenciais reais.
5. Documentar checklist de migrations sem executar.
6. Documentar Stripe test mode e webhook futuro sem chave real.
7. Documentar Neon sem conectar banco real.
8. Documentar Blob/upload sem token real.
9. Documentar dominio/deploy sem fazer deploy.
10. Reafirmar fora de escopo: Bling, NF-e, rotinas fiscais, WhatsApp e SMS.

## 12. O que nao fazer nesta fase

- Deploy real.
- Migration real.
- Banco real.
- Credenciais reais.
- Stripe real obrigatorio.
- E-mail real.
- Bling.
- NF-e.
- Rotinas fiscais.
- WhatsApp.
- SMS.
- Redesign premium.
- Mudanca em regras de pagamento, estoque, cupom, frete, checkout, pedidos ou notificacoes.

## 13. Historico

| Data | Alteracao | Autor |
|------|-----------|-------|
| 2026-06-22 | Onboarding inicial gerado por `/reversa-plan` | reversa |
