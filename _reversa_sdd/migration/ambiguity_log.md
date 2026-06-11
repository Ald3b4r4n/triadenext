# Ambiguity Log

| ID | Ambiguidade | Impacto | Ação recomendada |
| --- | --- | --- | --- |
| AMB-001 | Guest checkout versus conta obrigatória | Afeta checkout, área do cliente e recuperação de pedido | Decidir antes de evoluir checkout. |
| AMB-002 | Status finais e intermediários de pedido | Afeta admin, e-mail, relatórios e Bling | Criar máquina de estados antes da feature de pós-pagamento. |
| AMB-003 | Provedores reais de frete prioritários | Afeta adapters, env e testes | Priorizar um provedor por fase com fallback manual. |
| AMB-004 | Escopo Bling | Afeta fiscal, estoque, catálogo e pedidos | Separar NF-e de sincronização comercial. |
| AMB-005 | Fonte da verdade de estoque | Afeta compra, admin e integração externa | Definir se estoque nasce no Next ou no ERP. |
| AMB-006 | Profundidade visual do legado | Afeta design system | Validar quais telas devem ter paridade visual e quais podem modernizar. |
| AMB-007 | Relatórios financeiros | Afeta privacidade e performance | Definir métricas obrigatórias e janela temporal. |
