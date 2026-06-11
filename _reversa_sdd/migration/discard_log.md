# Discard Log

| Item legado | Decisão | Motivo |
| --- | --- | --- |
| Blade views | Descartar como implementação | React/App Router substitui a camada visual. |
| Controllers Laravel | Descartar como estrutura | Regras migram para actions/services/handlers TypeScript. |
| Eloquent Active Record | Descartar como paradigma | Drizzle usa schema e queries explícitas. |
| Form Requests Laravel | Recriar | Validação deve virar Zod e validação server-side. |
| Storage local público | Recriar | Usar storage gerenciado/adapters. |
| Jobs/listeners Laravel | Reinterpretar | Viram outbox, cron, webhooks ou fila alvo. |
| Artisan commands operacionais | Recriar seletivamente | Só migram se representarem operação real necessária. |
| CSS/JS de bibliotecas específicas | Reavaliar | Manter estética, não dependência técnica. |

## Critério de descarte

Descartar mecanismos do framework quando forem apenas forma de implementação. Preservar regras, dados, invariantes e efeitos observáveis.
