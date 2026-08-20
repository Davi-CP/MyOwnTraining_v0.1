-- ============================================================
-- Migration: indicacoes_codigo
-- Depende de: auth.users (nativa do Supabase)
-- ============================================================
-- Código de indicação de um usuário (no máximo um por usuário).
-- ============================================================

create table indicacoes_codigo (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    codigo text not null,
    ativo boolean not null default true,
    quantidade_usos integer not null default 0,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint indicacoes_codigo_usuario_id_key unique (usuario_id),
    constraint indicacoes_codigo_codigo_key unique (codigo)
);
comment on table indicacoes_codigo is 'Código de indicação pertencente a um usuário.';

-- Row Level Security
alter table indicacoes_codigo enable row level security;

create policy indicacoes_codigo_select_owner
    on indicacoes_codigo for select
    using (auth.uid() = usuario_id);

create policy indicacoes_codigo_insert_owner
    on indicacoes_codigo for insert
    with check (auth.uid() = usuario_id);

create policy indicacoes_codigo_update_owner
    on indicacoes_codigo for update
    using (auth.uid() = usuario_id)
    with check (auth.uid() = usuario_id);
