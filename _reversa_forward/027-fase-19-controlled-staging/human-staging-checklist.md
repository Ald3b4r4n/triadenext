# Checklist humano para staging real — Fase 19

> Derivado do diagnóstico de `2026-07-13`
> Estado atual: **NO-GO**

## Ações ordenadas

| Prioridade | Área | Status origem | Responsável sugerido | Ação fora do Git | Evidência esperada | Gate |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Segurança | `blocked` | Aprovador técnico | Confirmar que todos os targets futuros são staging, preview ou dev remoto. | Registro humano do target não produtivo. | Produção e Stripe live bloqueados. |
| 2 | Neon | `pending-config` | Responsável pelo banco | Criar banco/branch staging isolado e role mínima. | Ambiente existe sem registrar host ou connection string. | Target não produtivo confirmado. |
| 3 | Snapshot | `pending-config` | Responsável pelo banco | Definir snapshot, restore, responsável e janela. | Procedimento de rollback testável. | Obrigatório antes de migration ou escrita. |
| 4 | Vercel | `pending-config` | Responsável por infraestrutura | Criar Preview/staging conectado ao repositório e definir URL controlada. | Ambiente e URL presentes, sem registrar o valor. | Sem promoção para Production. |
| 5 | Stripe | `pending-config` | Responsável por pagamentos | Configurar chaves test e webhook test com eventos PaymentIntent aprovados. | Presença das envs test e webhook validada. | Live mode rejeitado. |
| 6 | Auth/admin | `pending-config` | Responsável pela aplicação | Configurar auth staging e `ADMIN_MASTER_EMAILS`. | Master esperado na allowlist e login futuro planejado. | Nenhuma senha ou sessão em Git/log. |
| 7 | Dados | `pending-input` | Responsável pelos dados | Colocar exports aprovados em `data/dry-run/input/primeira-execucao/`. | Produtos, categorias, imagens, inventário, cupons e frete presentes. | Arquivos ignorados pelo Git. |
| 8 | Reconciliação | `pending-input` | Responsável pelos dados | Rodar dry-run com os arquivos aprovados e revisar divergências. | Relatório sanitizado sem bloqueio crítico. | Aprovação humana do dry-run. |
| 9 | Migration | `pending-config` | Aprovador técnico e responsável pelo banco | Revisar migrations e autorizar janela futura. | Revisão, snapshot e aprovação específicos. | Wrapper continua em check até autorização. |
| 10 | Bootstrap | `pending-config` | Aprovador técnico e responsável pela aplicação | Autorizar bootstrap master somente após schema e auth prontos. | Gate específico aprovado. | Sem reutilizar aprovação de outra ação. |
| 11 | Importação | `blocked` | Aprovador técnico e responsável pelos dados | Autorizar upsert staging somente após dry-run aprovado. | Precheck `passed` e relatório antes da escrita. | Reset continua proibido sem gate adicional. |
| 12 | Smoke remoto | `skipped` | Responsável por QA | Autorizar smoke de storefront, checkout test, admin e outbox. | URL aprovada e providers prontos. | Nenhum deploy ou produção. |

## Critério de avanço

O staging real só pode ser considerado candidato a execução quando:

- todos os itens Must estiverem `passed`;
- não houver `pending-config`, `pending-input`, `blocked` ou `failed`;
- skips obrigatórios tiverem sido resolvidos;
- snapshot e rollback estiverem confirmados;
- cada ação remota tiver aprovação humana própria;
- a nova decisão go/no-go estiver sanitizada e registrada.

Concluir este checklist não executa nenhuma ação automaticamente.
