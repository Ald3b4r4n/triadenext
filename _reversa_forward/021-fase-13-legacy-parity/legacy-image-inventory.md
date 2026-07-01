# Legacy Image Inventory

## Fontes detectadas

| Fonte | Contagem lida | Uso esperado |
|-------|---------------|--------------|
| `D:\Projetos\triadeessenzaparfum.com.br\public\products` | 18 arquivos | Imagens publicas de produto |
| `D:\Projetos\triadeessenzaparfum.com.br\Imagens` | 19 arquivos | Imagens legadas/candidatas |

## Mapeamento necessario

| Campo | Regra |
|-------|-------|
| Produto | Associar por SKU, slug, nome normalizado ou metadado aprovado |
| Capa | Uma imagem principal por produto vendido |
| Ordem | Preservar ordenacao se existir; caso contrario ordenar por prioridade/capa |
| Alt text | Gerar a partir de nome do produto quando ausente |
| Tipo | Aceitar JPEG, PNG e WebP conforme schema de upload Next |
| Fallback | Definir fallback visual para produto sem imagem valida |

## Riscos

- Arquivo duplicado, ausente ou sem associacao.
- Nome de arquivo sem relacao direta com SKU/slug.
- Produto vendavel sem capa.
- Upload real para Blob sem aprovacao.

## Criterio de aceite

Go-live de catalogo exige que todo produto publicado tenha imagem de capa real ou fallback aprovado pelo negocio. Upload real para Blob fica em fase aprovada separada.
