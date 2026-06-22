# Shipping / Admin Frete Manual, Tasks

> Checklist executavel da subunidade `shipping/admin-frete-manual`.
> Escopo: administrar regras manuais de frete para uso futuro na cotacao publica, sem alterar pedidos/cotacoes ja materializados.

## 1. Preparacao de Superficie

- [ ] TASK-ADMIN-SHIPPING-001 Confirmar a rota administrativa alvo para regras manuais de frete.
- [ ] TASK-ADMIN-SHIPPING-002 Confirmar componentes e padroes ja existentes para paginas admin.
- [ ] TASK-ADMIN-SHIPPING-003 Confirmar contrato de dados atual de regras manuais de frete no schema/repositorio.
- [ ] TASK-ADMIN-SHIPPING-004 Confirmar se a implementacao deve operar apenas em ambiente com `DATABASE_URL`.
- [ ] TASK-ADMIN-SHIPPING-005 Garantir que nenhum fluxo publico de checkout seja alterado nesta subunidade.

## 2. Autorizacao e Guardrails

- [ ] TASK-ADMIN-SHIPPING-006 Proteger toda action administrativa com permissao admin/admin-like.
- [ ] TASK-ADMIN-SHIPPING-007 Aplicar guardrail de mutacao real antes de criar ou atualizar regra.
- [ ] TASK-ADMIN-SHIPPING-008 Retornar erro seguro quando o usuario nao estiver autenticado.
- [ ] TASK-ADMIN-SHIPPING-009 Retornar erro seguro quando o usuario nao tiver permissao administrativa.
- [ ] TASK-ADMIN-SHIPPING-010 Nao vazar stack trace, string de conexao ou detalhes internos em respostas da action.

## 3. Listagem Administrativa

- [ ] TASK-ADMIN-SHIPPING-011 Criar ou reaproveitar action `listManualShippingRulesAction`.
- [ ] TASK-ADMIN-SHIPPING-012 Listar regras ativas e inativas para administradores.
- [ ] TASK-ADMIN-SHIPPING-013 Exibir nome da regra, UF, faixa de CEP, valor, prazo estimado e status.
- [ ] TASK-ADMIN-SHIPPING-014 Ordenar a listagem de forma previsivel.
- [ ] TASK-ADMIN-SHIPPING-015 Exibir estado vazio amigavel quando nao houver regras cadastradas.

## 4. Criacao de Regra

- [ ] TASK-ADMIN-SHIPPING-016 Criar action administrativa para cadastrar regra manual.
- [ ] TASK-ADMIN-SHIPPING-017 Validar `label` obrigatorio e legivel.
- [ ] TASK-ADMIN-SHIPPING-018 Validar UF quando a regra for estadual.
- [ ] TASK-ADMIN-SHIPPING-019 Normalizar CEP inicial e CEP final antes de persistir.
- [ ] TASK-ADMIN-SHIPPING-020 Validar que CEP inicial nao seja maior que CEP final.
- [ ] TASK-ADMIN-SHIPPING-021 Validar valor de frete maior ou igual a zero conforme politica definida.
- [ ] TASK-ADMIN-SHIPPING-022 Validar prazo estimado como inteiro positivo.
- [ ] TASK-ADMIN-SHIPPING-023 Persistir regra usando repositorio existente ou criar repositorio dedicado.
- [ ] TASK-ADMIN-SHIPPING-024 Invalidar cache/revalidar rota administrativa apos sucesso.

## 5. Atualizacao de Regra

- [ ] TASK-ADMIN-SHIPPING-025 Criar action administrativa para atualizar regra manual.
- [ ] TASK-ADMIN-SHIPPING-026 Validar identificador da regra antes de consultar banco.
- [ ] TASK-ADMIN-SHIPPING-027 Reutilizar schema de validacao da criacao sempre que possivel.
- [ ] TASK-ADMIN-SHIPPING-028 Permitir ativar ou desativar uma regra.
- [ ] TASK-ADMIN-SHIPPING-029 Retornar `not_found` seguro quando a regra nao existir.
- [ ] TASK-ADMIN-SHIPPING-030 Garantir que atualizar regra nao altere pedidos ou cotacoes ja criados.

## 6. Schema e Parse

- [ ] TASK-ADMIN-SHIPPING-031 Criar schema de entrada para regra manual de frete.
- [ ] TASK-ADMIN-SHIPPING-032 Converter valores monetarios de formulario para representacao interna consistente.
- [ ] TASK-ADMIN-SHIPPING-033 Tratar campos vazios de CEP como `null` quando a regra permitir cobertura ampla.
- [ ] TASK-ADMIN-SHIPPING-034 Normalizar UF para caixa alta.
- [ ] TASK-ADMIN-SHIPPING-035 Retornar erros por campo para exibicao na UI administrativa.
- [ ] TASK-ADMIN-SHIPPING-036 Cobrir validacoes com testes unitarios.

## 7. Repositorio e Persistencia

- [ ] TASK-ADMIN-SHIPPING-037 Criar ou completar repositorio de regras manuais de frete.
- [ ] TASK-ADMIN-SHIPPING-038 Implementar listagem administrativa sem filtrar apenas regras ativas.
- [ ] TASK-ADMIN-SHIPPING-039 Implementar criacao de regra com timestamps quando aplicavel.
- [ ] TASK-ADMIN-SHIPPING-040 Implementar atualizacao parcial sem sobrescrever campos nao enviados.
- [ ] TASK-ADMIN-SHIPPING-041 Tratar erro de banco com mensagem segura.
- [ ] TASK-ADMIN-SHIPPING-042 Nao chamar provedores externos nesta subunidade.

## 8. Impacto em Cotacoes

- [ ] TASK-ADMIN-SHIPPING-043 Garantir que regras inativas sejam ignoradas por cotacoes publicas futuras.
- [ ] TASK-ADMIN-SHIPPING-044 Garantir que regras futuras nao recalculam pedidos ja fechados.
- [ ] TASK-ADMIN-SHIPPING-045 Documentar comportamento para sobreposicao de regras.
- [ ] TASK-ADMIN-SHIPPING-046 Implementar criterio deterministico de prioridade se houver sobreposicao.
- [ ] TASK-ADMIN-SHIPPING-047 Cobrir regressao de regra inativa versus ativa em testes.

## 9. UI Administrativa

- [ ] TASK-ADMIN-SHIPPING-048 Criar formulario simples para nova regra manual.
- [ ] TASK-ADMIN-SHIPPING-049 Criar controles para editar status ativo/inativo.
- [ ] TASK-ADMIN-SHIPPING-050 Exibir feedback de sucesso apos criacao ou atualizacao.
- [ ] TASK-ADMIN-SHIPPING-051 Exibir erros de validacao sem quebrar a pagina.
- [ ] TASK-ADMIN-SHIPPING-052 Manter layout consistente com o admin atual.
- [ ] TASK-ADMIN-SHIPPING-053 Evitar redesign amplo fora do escopo.

## 10. Testes Unitarios

- [ ] TASK-ADMIN-SHIPPING-054 Testar schema com dados validos.
- [ ] TASK-ADMIN-SHIPPING-055 Testar schema com CEP invalido.
- [ ] TASK-ADMIN-SHIPPING-056 Testar schema com faixa de CEP invertida.
- [ ] TASK-ADMIN-SHIPPING-057 Testar schema com valor de frete invalido.
- [ ] TASK-ADMIN-SHIPPING-058 Testar action bloqueada sem permissao admin.
- [ ] TASK-ADMIN-SHIPPING-059 Testar action bloqueada por guardrail de mutacao real.
- [ ] TASK-ADMIN-SHIPPING-060 Testar repositorio de listagem/criacao/atualizacao com mocks.

## 11. Testes E2E

- [ ] TASK-ADMIN-SHIPPING-061 Criar E2E administrativo para acessar pagina de regras de frete.
- [ ] TASK-ADMIN-SHIPPING-062 Validar que usuario nao admin nao acessa a tela.
- [ ] TASK-ADMIN-SHIPPING-063 Validar criacao de regra com fixture segura.
- [ ] TASK-ADMIN-SHIPPING-064 Validar desativacao de regra com fixture segura.
- [ ] TASK-ADMIN-SHIPPING-065 Validar que checkout nao e exposto diretamente nem alterado por esta tela.

## 12. Documentacao de Regressao

- [ ] TASK-ADMIN-SHIPPING-066 Registrar impacto esperado em `legacy-impact.md` da feature ativa.
- [ ] TASK-ADMIN-SHIPPING-067 Registrar riscos em `regression-watch.md`.
- [ ] TASK-ADMIN-SHIPPING-068 Marcar explicitamente que nao ha migracao real nem chamada de frete externo.
- [ ] TASK-ADMIN-SHIPPING-069 Marcar explicitamente que pedidos existentes permanecem imutaveis.

## 13. Validacoes

- [ ] TASK-ADMIN-SHIPPING-070 Rodar `pnpm lint`.
- [ ] TASK-ADMIN-SHIPPING-071 Rodar `pnpm typecheck`.
- [ ] TASK-ADMIN-SHIPPING-072 Rodar `pnpm test`.
- [ ] TASK-ADMIN-SHIPPING-073 Rodar `pnpm build`.
- [ ] TASK-ADMIN-SHIPPING-074 Rodar `pnpm test:e2e` se houver fluxo admin coberto.

## 14. Definition of Done

- [ ] TASK-ADMIN-SHIPPING-075 Administrador consegue listar regras manuais de frete.
- [ ] TASK-ADMIN-SHIPPING-076 Administrador consegue criar regra valida.
- [ ] TASK-ADMIN-SHIPPING-077 Administrador consegue ativar/desativar regra.
- [ ] TASK-ADMIN-SHIPPING-078 Regras invalidas retornam erro por campo.
- [ ] TASK-ADMIN-SHIPPING-079 Usuarios nao autorizados sao bloqueados.
- [ ] TASK-ADMIN-SHIPPING-080 Nenhum pedido, pagamento, cupom ou estoque e alterado por esta subunidade.
- [ ] TASK-ADMIN-SHIPPING-081 Nenhum segredo ou detalhe sensivel e exposto.
