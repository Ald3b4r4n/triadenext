# Clarificação: Fase 4 - Auth e Policies

Data: 2026-06-08
Feature: `002-fase-4-auth-policies`

## Decisões aplicadas

- Provider inicial: Better Auth.
- Login inicial: e-mail e senha.
- Extensibilidade futura: Google OAuth preparado, mas fora desta fase.
- Roles MVP: `customer`, `admin`, `manager`.
- Regra MVP: `admin` e `manager` equivalentes em permissões administrativas.
- Cadastro público: habilitado para criar apenas `customer`.
- Area customer: protegida e estruturada, sem pedidos, checkout, pagamento ou documentos fiscais reais.
- Seed dev: permitido somente em desenvolvimento/local-dev, com variaveis explicitas e sem senha hardcoded.
- Produção/preview: continuam bloqueando mutacoes admin sem auth/policies reais.

## Dúvidas resolvidas

- `[DOUBT-AUTH-001]` resolvida com Better Auth + e-mail/senha.
- `[DOUBT-SCOPE-002]` resolvida com roles customer/admin/manager, admin/manager equivalentes, cadastro público customer e área customer protegida.
- `[DOUBT-DEV-003]` resolvida com seed admin dev controlado, sem bypass global e sem senha fixa.

## Auditoria de qualidade

- A revisão de quality encontrou duas ressalvas no requirements: edge cases de sessão/cadastro e linguagem ainda pouco separada entre requisito e detalhe técnico.
- Esta rodada de clarificação tratou as duas ressalvas com requisitos textuais adicionais e com a reorganização dos trechos mais solucionistas.
- Não restam dúvidas abertas nesta feature após esta atualização.

## Segunda auditoria de quality

- A reauditoria de quality apontou três ressalvas: falta de cenários Gherkin dedicados para logout e cadastro público, concorrência/retentativa/timeout ainda pouco formalizados e presença residual de nomes de tecnologia fora da seção de decisão validada.
- Esta rodada de clarificação adicionou os cenários Gherkin de logout e cadastro público, formalizou concorrência/retentativa/timeout e concentrou a decisão técnica em uma seção separada.
- As decisões humanas já validadas permaneceram intactas, incluindo Better Auth como provider inicial.
- Não restam dúvidas abertas nesta feature após esta atualização.

## Dúvidas remanescentes

- Nenhuma.