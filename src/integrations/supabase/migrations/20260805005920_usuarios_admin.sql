-- ============================================================
-- Migration: usuarios_admin
-- Depende de: auth.users (nativa do Supabase)
-- ============================================================
-- Dados de domínio de usuários administrativos.
-- Não é fonte de verdade para papéis (ver papeis_usuario).
-- ============================================================

create table usuarios_admin2 (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint usuarios_admin_usuario_id_key unique (usuario_id)
);
comment on table usuarios_admin is 'Dados de domínio de usuários administrativos. Papéis de autorização vivem em papeis_usuario.';

-- Row Level Security
alter table usuarios_admin2 enable row level security;

create policy usuarios_admin_select_authenticated
    on usuarios_admin for select
    using (auth.role() = 'authenticated');

create policy usuarios_admin_update_owner
    on usuarios_admin2 for update
    using (auth.uid() = usuario_id)
    with check (auth.uid() = usuario_id);