# Dúvidas Resolvidas — Fase 7 Frete e Cotações

> Feature: `005-fase-7-frete-cotacoes`
> Data: `2026-06-09`
> Origem: `/reversa-clarify`
> Documento integrado: `requirements.md`

## Resumo

Todas as dúvidas abertas no requirements inicial foram resolvidas por decisão humana. A Fase 7 permanece limitada a frete manual e cotações no carrinho, sem checkout, pagamento, Stripe, pedido, reserva, baixa de estoque, deploy, push, migration real, segredo real ou alteração no Laravel legado.

## Correção pós-quality

A execução de `/reversa-quality` em 2026-06-09 reprovou o `requirements.md` por três problemas textuais:

1. condicionais antigas ainda apareciam após a clarificação;
2. alguns trechos ainda podiam sugerir API externa real ou credenciais de provider na Fase 7;
3. `free_shipping` ainda aparecia em alguns pontos como decisão pendente/preparada.

Esta nova passagem de clarificação corrigiu esses pontos no `requirements.md`:

- condicionais antigas foram substituídas por regras afirmativas;
- Correios, Jadlog e Melhor Envio ficaram explicitamente fora do runtime da Fase 7, como adapters futuros inativos;
- a Fase 7 ficou explícita como fase sem credenciais externas obrigatórias;
- `free_shipping` ficou alinhado como benefício real somente sobre frete manual calculado e elegível;
- admin básico de regras manuais ficou registrado como parte do MVP;
- não restam dúvidas abertas.

## Decisões

### 1. Provedores do MVP

- Provedor MVP: `manual`.
- Correios, Jadlog e Melhor Envio ficam apenas documentados/preparados.
- Nenhuma API real de transportadora deve ser chamada nesta fase.
- Nenhuma credencial externa deve ser exigida para build, test ou e2e.

### 2. API externa real

- A Fase 7 não usa API externa real.
- Runtime deve usar apenas regra manual persistida e/ou fixture/mock controlado.
- Adapters externos, se existirem, devem permanecer desacoplados e inativos.
- Preview/produção sem credenciais externas não devem tentar cotação real.

### 3. Destino mínimo

- CEP é suficiente para cotação nesta fase.
- Endereço completo fica para checkout/endereço futuro.
- CEP deve ser validado e normalizado.
- Número, complemento, bairro e cidade não são obrigatórios para cotação no carrinho.

### 4. Regra de cálculo

- Frete manual deve ser calculado por UF e/ou faixa de CEP.
- Valor do frete deve ser fixo e em centavos por regra.
- A regra deve retornar uma ou mais opções manuais com nome, valor e prazo estimado textual ou em dias.
- Subtotal e quantidade não são critérios obrigatórios do MVP.

### 5. Peso e dimensões

- Peso e dimensões reais não entram no cálculo da Fase 7.
- Nenhum produto deve ser bloqueado por ausência de peso/dimensão.
- Integrações futuras com Correios, Jadlog e Melhor Envio devem revisar peso/dimensões.

### 6. Admin básico

- Admin básico de regras manuais entra como fundação mínima.
- Admin/manager autenticado pode listar regras manuais.
- Admin/manager pode criar/editar regra manual mínima.
- Customer e visitante não podem acessar admin de frete.
- Fallback sem banco não deve fingir persistência real.

### 7. Cupom `free_shipping`

- `free_shipping` aplica benefício real somente sobre frete manual calculado nesta fase.
- O benefício zera apenas o valor de frete manual elegível.
- Não chama API externa e não promete frete grátis de transportadora real.
- Não cria checkout, pedido, pagamento, reserva ou baixa de estoque.
- Se não houver opção de frete calculada, o cupom não cria frete artificial.

### 8. Validade e invalidação

- Cotação manual tem validade padrão de 30 minutos.
- Mudança no carrinho invalida ou recalcula a cotação selecionada.
- Mudança no CEP invalida a cotação selecionada.
- Mudança no cupom recalcula o total com frete.
- Alteração de regra manual no admin afeta cotações futuras; cotações existentes podem ser invalidadas conforme plano técnico.

### 9. Persistência da seleção

- Opção de frete selecionada deve persistir no carrinho quando houver banco real.
- Carrinho autenticado persiste entre sessões/dispositivos por `userId`.
- Carrinho anônimo persiste vinculado ao `guestCartToken`.
- Sem banco real, persistência é apenas fallback/dev explícito.
- Ownership deve bloquear acesso cruzado.

### 10. Fallback

- Sem `DATABASE_URL`, frete funciona apenas em fixture/mock controlado em development/test.
- Preview/produção sem banco falham de forma segura para mutações reais de frete.
- Ausência de credenciais externas não bloqueia a Fase 7 porque APIs externas reais estão fora do runtime.
- UI deve sinalizar fixture/mock quando aplicável.
- Com `DATABASE_URL`, falha real não deve cair em fallback silencioso.

## Dúvidas remanescentes

Nenhuma.

## Próxima etapa recomendada

Executar `/reversa-quality` para auditar a clareza textual do `requirements.md` clarificado antes do plano técnico.
