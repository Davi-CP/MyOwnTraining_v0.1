-- ============================================================
-- Migration: chamados_suporte
-- Depende de: auth.users (nativa do Supabase), papeis_usuario,
--             enums categoria_chamado, prioridade_chamado, status_chamado
-- ============================================================
-- Chamado de suporte aberto por um usuário.
-- ============================================================

create table chamados_suporte (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    assunto text not null,
    categoria categoria_chamado not null,
    prioridade prioridade_chamado not null default 'media',
    status status_chamado not null default 'aberto',
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    fechado_em timestamptz
);
comment on table chamados_suporte is 'Chamado de suporte aberto por um usuário.';

-- Índices
create index idx_chamados_suporte_usuario_id on chamados_suporte (usuario_id);
create index idx_chamados_suporte_status on chamados_suporte (status);

-- Row Level Security
alter table chamados_suporte enable row level security;

-- O próprio usuário e a equipe de suporte/admin podem ver o chamado
create policy chamados_suporte_select_owner_ou_equipe
    on chamados_suporte for select
    using (
        auth.uid() = usuario_id
        or exists (
            select 1 from papeis_usuario
            where usuario_id = auth.uid() and papel in ('admin', 'suporte')
        )
    );

create policy chamados_suporte_insert_owner
    on chamados_suporte for insert
    with check (auth.uid() = usuario_id);

-- O próprio usuário e a equipe de suporte/admin podem atualizar (ex: status, fechamento)
create policy chamados_suporte_update_owner_ou_equipe
    on chamados_suporte for update
    using (
        auth.uid() = usuario_id
        or exists (
            select 1 from papeis_usuario
            where usuario_id = auth.uid() and papel in ('admin', 'suporte')
        )
    );
