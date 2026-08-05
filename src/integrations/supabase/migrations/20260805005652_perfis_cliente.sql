-- ============================================================
-- Migration: perfis_cliente
-- Depende de: auth.users (nativa do Supabase)
-- ============================================================
-- Dados de domínio específicos de um cliente da plataforma,
-- separados de auth.users (1:1).
-- ============================================================

create table perfis_cliente (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    nome_completo text not null,
    telefone text,
    cidade text,
    uf text,
    cep text,
    bairro text,
    logradouro text,
    numero text,
    complemento text,
    latitude double precision,
    longitude double precision,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint perfis_cliente_usuario_id_key unique (usuario_id)
);
comment on table perfis_cliente is 'Dados de domínio específicos de um cliente da plataforma (1:1 com auth.users).';
comment on column perfis_cliente.usuario_id is 'Referência à conta de autenticação em auth.users.';
comment on column perfis_cliente.latitude is 'Latitude da localização do cliente.';
comment on column perfis_cliente.longitude is 'Longitude da localização do cliente.';

-- Índices
create index idx_perfis_cliente_cidade on perfis_cliente (cidade);

-- Row Level Security
alter table perfis_cliente enable row level security;

-- Qualquer usuário autenticado pode visualizar perfis de clientes
create policy perfis_cliente_select_authenticated
    on perfis_cliente for select
    using (auth.role() = 'authenticated');

-- Apenas o próprio dono pode inserir seu perfil
create policy perfis_cliente_insert_owner
    on perfis_cliente for insert
    with check (auth.uid() = usuario_id);

-- Apenas o próprio dono pode atualizar seu perfil
create policy perfis_cliente_update_owner
    on perfis_cliente for update
    using (auth.uid() = usuario_id)
    with check (auth.uid() = usuario_id);

-- Apenas o próprio dono pode remover seu perfil
create policy perfis_cliente_delete_owner
    on perfis_cliente for delete
    using (auth.uid() = usuario_id);