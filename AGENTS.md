# Reversa

> Framework de Engenharia Reversa instalado neste projeto.

## Como usar

Digite `reversa` para ativar o Reversa e iniciar ou retomar a análise do projeto.

## Comportamento ao ativar

Quando o usuário digitar `reversa` sozinho em uma mensagem:

1. Ative o skill `reversa` disponível em `.agents/skills/reversa/SKILL.md`
2. Leia o SKILL.md na íntegra e siga exatamente as instruções do Reversa

## Regra não-negociável

Nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto legado.
O Reversa escreve **apenas** em `.reversa/` e `_reversa_sdd/`.

## Regra de copy PT-BR

Toda alteração que crie ou modifique texto exibido ao cliente, ao admin ou em relatórios/scripts operacionais deve revisar gramática, acentuação e consistência em PT-BR antes da entrega.

Use linguagem final, clara e natural; não deixe termos sem acento em mensagens humanas. Valores técnicos, slugs, enums, variáveis de ambiente, rotas e códigos internos podem permanecer sem acento quando isso fizer parte do contrato técnico.

Sempre que possível, rode:

```bash
pnpm ops:check-ptbr-copy
```
