# Dry-run Safety Checklist

## Antes de qualquer dry-run futuro

- [ ] Fonte de dados aprovada pelo humano.
- [ ] Export ou fixture sanitizado, sem secrets e sem dados pessoais crus.
- [ ] Ambiente alvo isolado e descartavel.
- [ ] Nenhum apontamento para producao.
- [ ] Nenhum comando de migration real.
- [ ] Nenhum envio de e-mail, webhook ou chamada a provider externo.
- [ ] Logs configurados para nao imprimir valores sensiveis.

## Durante o dry-run futuro

- [ ] Validar schema intermediario antes de qualquer gravacao.
- [ ] Rodar import apenas em fixture/local isolado.
- [ ] Gerar relatorio de divergencias.
- [ ] Interromper em divergencia financeira nao explicada.
- [ ] Interromper em chave comercial duplicada ou ausente em entidade critica.

## Depois do dry-run futuro

- [ ] Descartar ambiente se necessario.
- [ ] Registrar contagens, chaves divergentes e amostras mascaradas.
- [ ] Atualizar checklist go-live sem promover import real automaticamente.

## Bloqueio explicito

Esta Fase 13 documenta o dry-run; ela nao executa importacao real nem migration real.
