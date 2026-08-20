-- ============================================================
-- Migration: notificacoes
-- Depende de: auth.users (nativa do Supabase), enum tipo_notificacao
-- ============================================================
-- Notificações enviadas aos usuários.
-- ============================================================

create table notificacoes (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    titulo text not null,
    corpo text not null,
    tipo tipo_notificacao not null,
    dados jsonb,
    lida_em timestamptz,
    criado_em timestamptz not null default now()
);
comment on table notificacoes is 'Notificações enviadas a um usuário.';
comment on column notificacoes.lida_em is 'Data/hora de leitura; NULL indica notificação ainda não lida.';

-- Índices
create index idx_notificacoes_usuario_id on notificacoes (usuario_id);
create index idx_notificacoes_lida_em on notificacoes (lida_em);

-- Row Level Security
alter table notificacoes enable row level security;

create policy notificacoes_select_owner
    on notificacoes for select
    using (auth.uid() = usuario_id);

-- Usuário pode marcar suas próprias notificações como lidas (lida_em)
create policy notificacoes_update_owner
    on notificacoes for update
    using (auth.uid() = usuario_id)
    with check (auth.uid() = usuario_id);
