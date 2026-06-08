# Uploads

Uploads reais permanecem desativados ate configurar `BLOB_READ_WRITE_TOKEN`.

Imagens de produto devem persistir metadata em `product_images`:

- `id`, `productId`, `blobUrl`, `pathname`, `altText`, `sortOrder`, `isCover`
- `width`, `height`, `sizeBytes`, `contentType`, `createdAt`

Documentos fiscais devem persistir metadata em `fiscal_documents`:

- `id`, `orderId`, `uploadedByUserId`, `blobUrl`, `pathname`, `filename`
- `contentType`, `sizeBytes`, `type`, `createdAt`

Arquivos binarios nao devem ser armazenados no banco.

## Fase 1 — Imagens de Produto

Fluxo planejado:

1. Admin seleciona imagem em tela autenticada.
2. Server action/route valida permissao, tipo e tamanho.
3. `uploadProductImage` envia o arquivo para Vercel Blob somente se `BLOB_READ_WRITE_TOKEN`
   estiver configurado.
4. O banco persiste apenas metadata: URL, pathname, alt text, ordenacao, capa, dimensoes, tamanho e
   content type.
5. Storefront usa `isCover` como capa; sem capa explicita, usa a primeira imagem ordenada por
   `sortOrder` como fallback tecnico.

Lacunas:

- Definir limites finais de tamanho e tipos aceitos.
- Definir se imagens de produto serao sempre publicas ou se havera Blob privado/signed URLs.
- Inventariar arquivos existentes antes de qualquer migracao de assets.
