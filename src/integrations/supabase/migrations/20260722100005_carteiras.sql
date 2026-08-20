-- ============================================================
-- Migration: carteiras
-- Depende de: auth.users (nativa do Supabase)
-- ============================================================
-- Carteira financeira de um usuário (no máximo uma por usuário).
-- ============================================================

create table carteiras (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    saldo_disponivel numeric not null default 0,
    saldo_pendente numeric not null default 0,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint carteiras_usuario_id_key unique (usuario_id)
);
comment on table carteiras is 'Carteira financeira do usuário.';

-- Row Level Security
alter table carteiras enable row level security;

create policy carteiras_select_owner
    on carteiras for select
    using (auth.uid() = usuario_id);

create policy carteiras_update_owner
    on carteiras for update
    using (auth.uid() = usuario_id)
    with check (auth.uid() = usuario_id);
