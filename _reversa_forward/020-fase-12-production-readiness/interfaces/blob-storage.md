# Interface: Vercel Blob

> Feature: `020-fase-12-production-readiness`
> Tipo: storage externo
> Status: contrato operacional; upload real apenas quando token e ambiente forem aprovados.

## 1. Objetivo

Preparar Vercel Blob para imagens de produto e validar fallback seguro quando `BLOB_READ_WRITE_TOKEN` estiver ausente.

## 2. Entradas

| Entrada | Sensível | Regra |
|---------|----------|-------|
| `BLOB_READ_WRITE_TOKEN` | Sim | Nunca imprimir; presença/ausência basta para checks. |
| Arquivo de imagem | Não, em fixture | JPEG, PNG ou WebP conforme domínio atual. |
| Usuário admin/manager | Sim, credencial de acesso | Não registrar credenciais; usar ambiente aprovado. |

## 3. Regras existentes a preservar

- Upload exige admin/manager.
- Tipos aceitos: JPEG, PNG, WebP.
- Limite atual do domínio: 5 MB.
- Sem token, upload real bloqueia antes de chamar Vercel Blob.
- Rota/API de upload não deve virar canal público sem policy.

## 4. Operações planejadas

| Operação | Permitida automaticamente? | Observação |
|----------|----------------------------|------------|
| Verificar presença de `BLOB_READ_WRITE_TOKEN` | Sim | Sem imprimir valor. |
| Documentar store/ambiente Blob | Sim | Sem token. |
| Fazer upload real de teste | Não | Exige token e aprovação do ambiente. |
| Apagar blob real | Não | Exige decisão humana. |

## 5. Critérios de sucesso

- Checklist identifica se Blob é obrigatório para staging ou pode ficar bloqueado com fallback.
- Token é tratado como secret.
- Limites de arquivo e tipos aceitos estão documentados.
- Smoke não exige upload real por padrão.

## 6. Critérios de falha

- Token aparece em log/doc.
- Upload real roda sem aprovação.
- Rota pública permite upload sem admin-like.
- Teste depende de arquivo grande ou provider real sem necessidade.

## 7. Histórico

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-06-26 | Contrato inicial gerado por `/reversa-plan` | reversa |
