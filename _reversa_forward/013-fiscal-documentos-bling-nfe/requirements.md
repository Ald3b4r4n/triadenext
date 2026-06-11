# Requirements - Fiscal, Documentos e Bling NF-e

## Objetivo

Planejar e implementar camada fiscal segura para documentos e integração Bling/NF-e.

## Escopo

- Modelo de documento fiscal por pedido.
- Status fiscal e tentativas de integração.
- Adapter Bling com sandbox/fake.
- Admin para consultar status e erros seguros.
- Regras de emissão conforme decisão humana.

## Regras

- Nunca usar credenciais reais em teste.
- Falha fiscal não pode corromper pedido.
- Respostas externas devem ser normalizadas e auditáveis.

## Fora do escopo

- Deploy.
- Emissão real sem homologação.
