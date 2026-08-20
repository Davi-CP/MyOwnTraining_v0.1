-- ============================================================
-- Migration: favoritos
-- Depende de: perfis_cliente, perfis_personal_trainer
-- ============================================================
-- Relação N:N entre clientes e personal trainers favoritados.
-- ============================================================

create table favoritos (
    id uuid primary key default gen_random_uuid(),
    cliente_id uuid not null references perfis_cliente(id) on delete cascade,
    personal_id uuid not null references perfis_personal_trainer(id) on delete cascade,
    criado_em timestamptz not null default now(),
    constraint favoritos_cliente_personal_key unique (cliente_id, personal_id)
);
comment on table favoritos is 'Personal trainers favoritados por clientes.';

-- Índices
create index idx_favoritos_cliente_id on favoritos (cliente_id);
create index idx_favoritos_personal_id on favoritos (personal_id);

-- Row Level Security
alter table favoritos enable row level security;

-- Apenas o próprio cliente vê e gerencia seus favoritos
create policy favoritos_select_cliente
    on favoritos for select
    using (cliente_id = (select id from perfis_cliente where usuario_id = auth.uid()));

create policy favoritos_insert_cliente
    on favoritos for insert
    with check (cliente_id = (select id from perfis_cliente where usuario_id = auth.uid()));

create policy favoritos_delete_cliente
    on favoritos for delete
    using (cliente_id = (select id from perfis_cliente where usuario_id = auth.uid()));
