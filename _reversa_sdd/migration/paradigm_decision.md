# Paradigm Decision - Migração Geral

## Decisão humana

**Opção escolhida: 1 - Transformacional.**

Registrado após apresentação das opções do Paradigm Advisor. A migração deve preservar o comportamento de negócio, mas não precisa preservar a forma arquitetural Laravel.

## Paradigma detectado no legado

- Monólito Laravel MVC.
- Eloquent Active Record como modelo dominante.
- Blade/Tailwind no frontend server-rendered.
- Services e Actions para regras transacionais.
- Jobs/listeners/eventos para efeitos colaterais.
- Integrações externas acopladas ao backend Laravel.
- Testes PHPUnit/Pest/Laravel Feature como contrato comportamental.

## Paradigma natural do alvo

- Next.js App Router com composição por rotas e domínios.
- Server Components para leitura pública e privada.
- Server Actions e Route Handlers para mutações e webhooks.
- Drizzle com schema explícito e migrations versionadas.
- Serviços de domínio em TypeScript, sem Active Record.
- Integrações isoladas por adapters e contratos testáveis.
- Playwright/Vitest como malha de equivalência funcional.

## Gaps gerados pela mudança

- Active Record do Laravel precisa virar repositories/services explícitos.
- Blade views precisam virar componentes React e rotas App Router.
- Policies/middlewares Laravel precisam virar guards e funções de autorização.
- Jobs/listeners precisam virar outbox, webhooks, cron seguro ou filas equivalentes.
- Uploads locais precisam virar storage gerenciado.
- Configuração `.env` Laravel precisa virar contrato secret-safe separado por ambiente.

## Diretriz

Migrar por domínios verticais, não por arquivos. Cada feature forward deve declarar:

- regra preservada;
- diferença intencional em relação ao legado;
- dados afetados;
- riscos de regressão;
- prova de equivalência.
