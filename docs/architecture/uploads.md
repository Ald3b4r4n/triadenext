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

## Fase 2 — Upload Controlado

`src/features/uploads/product-image-upload.ts` valida imagens de produto antes de qualquer upload:

- tipos aceitos: `image/jpeg`, `image/png`, `image/webp`;
- limite tecnico atual: 5 MB;
- metadata preparada: `productId`, `blobUrl`, `pathname`, `altText`, `sortOrder`, `isCover`,
  `width`, `height`, `sizeBytes`, `contentType`;
- sem `BLOB_READ_WRITE_TOKEN`, retorna bloqueio controlado `missing_blob_token`;
- arquivo binario nunca e salvo no banco.

O input visual de upload no admin fica desabilitado ate autenticacao, Blob e persistencia real serem
ligados.

## Fase 3 — Metadata com banco

`uploadProductImage` so chama Vercel Blob quando `BLOB_READ_WRITE_TOKEN` existe. Depois de um upload
real bem-sucedido, o resultado `uploaded` e enviado ao repository para persistir metadata em
`product_images`.

Guardrails:

- sem token Blob, retorna `blocked/missing_blob_token` e nao tenta salvar metadata;
- sem `DATABASE_URL`, o upload pode completar apenas se o token existir, mas a metadata retorna
  `dev_fallback` explicito;
- fora de desenvolvimento/local-dev, mutacao real de metadata e bloqueada ate auth/policies reais;
- tipos aceitos continuam `image/jpeg`, `image/png`, `image/webp`;
- limite continua 5 MB.
