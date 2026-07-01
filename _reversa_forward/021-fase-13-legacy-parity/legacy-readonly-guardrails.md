# Legacy Read-only Guardrails

> Feature: `021-fase-13-legacy-parity`
> Data: `2026-07-01`

## Confirmacao de escopo

| Item | Valor |
|------|-------|
| Projeto Next | `D:\Projetos\triade-essenza-next` |
| Laravel legado | `D:\Projetos\triadeessenzaparfum.com.br` |
| Modo de uso do legado | Somente leitura e analise |
| Escrita permitida | Apenas em `_reversa_forward/021-fase-13-legacy-parity/` e `.reversa/active-requirements.json` |

## Permitido no Laravel legado

- Listar arquivos e pastas.
- Ler `routes/`, controllers, actions, policies, migrations, views, docs, specs e assets publicos.
- Registrar nomes de tabelas, rotas, dominios e arquivos.
- Contar arquivos de assets para estimar volume de imagens.

## Proibido no Laravel legado

- Alterar, apagar, mover ou formatar arquivos.
- Ler, copiar, imprimir ou resumir `.env` ou `.env.*`.
- Rodar `php artisan`, migrations, seeders, filas, jobs, cache clear, storage link ou comandos com efeito colateral.
- Conectar banco real, importar dados reais, enviar e-mail real, chamar provider externo ou fazer deploy.

## Evidencia desta rodada

- Diretório confirmado como Next atual: `D:\Projetos\triade-essenza-next`.
- Caminho legado tratado apenas por comandos de listagem/leitura.
- Nenhum comando de escrita foi executado em `D:\Projetos\triadeessenzaparfum.com.br`.
- Nenhum `.env` foi lido; somente `.env.example` do Next foi consultado para nomes de variaveis.

## Decisao operacional

Qualquer etapa futura que exija banco legado, export real, dump, import real ou migration deve parar e solicitar aprovacao humana explicita antes de executar.
