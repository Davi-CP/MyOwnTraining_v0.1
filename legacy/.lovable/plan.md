## Situação atual

O Supabase já está conectado e o schema do MyOwnTraining está criado (16 tabelas com RLS ativa):

`client_profiles`, `professional_profiles`, `bookings`, `recurring_bookings`, `wallets`, `wallet_transactions`, `favorites`, `notifications`, `support_tickets`, `support_messages`, `cref_documents`, `referral_codes`, `referral_rewards`, `admin_users`, `user_roles`, `trainer_rankings`.

Hoje o app usa `src/lib/storage.ts` (localStorage + mock-data) para tudo. Nada está realmente persistido no banco.

## Objetivo do plano

Conectar o app às tabelas reais do Supabase, sem alterar UI, branding ou navegação. Apenas trocar a camada de dados.

## Etapas

### 1. Autenticação real (base de tudo)
- Ativar email/senha + Google no Lovable Cloud.
- Criar rota `/auth` (login/cadastro) reaproveitando o visual atual de signup.
- Criar layout protegido `src/routes/_authenticated/route.tsx` e mover rotas privadas (home, favorites, bookings, profile.*, pro.*, admin.*) para dentro dele.
- Hook `useAuth` lendo `supabase.auth` + listener no `__root.tsx`.
- No primeiro login, criar linha em `client_profiles` ou `professional_profiles` conforme o tipo de cadastro.

### 2. Camada de dados via Server Functions
Criar arquivos `*.functions.ts` em `src/lib/` agrupados por domínio, todos usando `requireSupabaseAuth`:

- `profile.functions.ts` — get/update client e professional profile.
- `trainers.functions.ts` — listagem pública de profissionais (home, ranking, busca), boost, filtros por bairro.
- `bookings.functions.ts` — criar, listar, cancelar, confirmar, treinos recorrentes.
- `favorites.functions.ts` — toggle e listagem.
- `wallet.functions.ts` — saldo, transações, saque.
- `notifications.functions.ts` — listar, marcar como lida.
- `support.functions.ts` — tickets e mensagens.
- `referrals.functions.ts` — código próprio, aplicar código, recompensas.
- `cref.functions.ts` — upload/status do documento CREF.
- `admin.functions.ts` — listagens, bloqueio, cupons, reengajamento (gated por `has_role('admin')`).
- `ranking.functions.ts` — ranking por bairro.

### 3. Substituir `storage.ts` nas telas
Trocar chamadas do `storage` por `useQuery` / `useMutation` (TanStack Query já no projeto) que consomem as server functions acima. Telas afetadas, sem mudança visual:

- `home.tsx`, `favorites.tsx`, `bookings.tsx`, `notifications.tsx`, `ranking.tsx`
- `trainer.$id.tsx`, `booking.$id.tsx`, `payment.tsx`, `chat.$id.tsx`
- `profile.tsx` + `profile_.*`
- `pro.dashboard.tsx`, `pro.profile.tsx`, `pro.schedules.tsx`, `pro.wallet.tsx`, `pro.recurring.tsx`, `pro.reviews.tsx`, `pro.coupons.tsx`, `pro.history.tsx`, `pro.notifications.tsx`, `pro.chats.tsx`
- `admin.dashboard.tsx`

`src/lib/storage.ts` e `src/lib/mock-data.ts` ficam apenas como seed opcional (não usados em produção).

### 4. Storage de arquivos
Criar bucket `avatars` (público) e `cref-documents` (privado) no Supabase Storage para fotos de perfil e documentos CREF.

### 5. Ajustes de schema, se necessário durante a migração
Se alguma tela precisar de coluna que não existe (ex.: `neighborhood` em `professional_profiles`, `coupon_code` em `bookings`), abro migration específica no momento — sem recriar nada existente.

## Detalhes técnicos

- Server functions seguem o padrão TanStack Start: `createServerFn` + `requireSupabaseAuth`, lendo via cliente autenticado (RLS aplicada como o usuário).
- Operações admin usam `has_role(auth.uid(), 'admin')` dentro da policy; nada de service role no client.
- `attachSupabaseAuth` já está em `src/start.ts`.
- Leituras públicas (home/ranking de treinadores) usam server fn sem middleware, com `supabaseAdmin` carregado via `await import(...)` dentro do `.handler()` e projeção explícita de colunas seguras.
- Rotas públicas continuam públicas; loaders chamam apenas server fns públicas.

## Fora do escopo

- Qualquer mudança de UI, cores, tipografia, layout ou navegação.
- Reescrever fluxos existentes além da troca da fonte de dados.
- Pagamentos reais (Stripe/Pix) — mantém o fluxo atual de mock até pedido explícito.

## Sugestão de ordem de entrega

1. Auth + layout `_authenticated` + criação de profile no signup.
2. Trainers + Favorites + Home.
3. Bookings + Payment + Wallet.
4. Notifications + Chat + Support.
5. Referrals + CREF + Ranking.
6. Admin.

Posso entregar tudo de uma vez ou ir por fases — me diga se quer que eu comece pela fase 1 ou faça o pacote completo.