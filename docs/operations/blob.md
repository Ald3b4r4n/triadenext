# Vercel Blob

Vercel Blob sera usado para imagens de produto. Esta fase prepara readiness e nao executa upload
real sem token, ambiente e aprovacao humana explicita.

## Variavel

- `BLOB_READ_WRITE_TOKEN`: secret server-side. Nunca imprimir, copiar ou versionar.

## Regras existentes

- Upload exige admin/manager.
- Tipos aceitos: JPEG, PNG e WebP.
- Limite atual: 5 MB.
- Sem `BLOB_READ_WRITE_TOKEN`, upload definitivo e bloqueado antes de chamar Vercel Blob.

## Checklist staging

- [ ] Decidir se staging precisa validar upload real ou apenas fallback.
- [ ] Configurar token somente no provedor de ambiente aprovado.
- [ ] Rodar smoke sem upload real por padrao.
- [ ] Se upload real for aprovado, usar arquivo fixture pequeno e registrar apenas resultado.
- [ ] Nao apagar blob real sem decisao humana.

## Falha segura

Ausencia de token deve gerar estado indisponivel/controlado. O sistema nao deve expor token,
stack trace, URL assinada sensivel ou detalhes de provider para usuario final.
