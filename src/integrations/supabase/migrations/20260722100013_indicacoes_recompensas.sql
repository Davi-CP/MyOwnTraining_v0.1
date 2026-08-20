-- ============================================================
-- Migration: indicacoes_recompensas
-- Depende de: indicacoes_codigo, auth.users, enum status_recompensa
-- ============================================================
-- Recompensa gerada quando um usuário é indicado via código
-- de indicação de outro usuário.
-- ============================================================

create table indicacoes_recompensas (
    id uuid primary key default gen_random_uuid(),
    codigo_indicacao_id uuid not null references indicacoes_codigo(id) on delete cascade,
    usuario_indicado_id uuid not null references auth.users(id) on delete cascade,
    valor_recompensa numeric not null,
    status status_recompensa not null default 'pendente',
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);
comment on table indicacoes_recompensas is 'Recompensa gerada pela indicação de um novo usuário via código.';
comment on column indicacoes_recompensas.usuario_indicado_id is 'Usuário que foi indicado; o indicador é derivado via codigo_indicacao_id.';

-- Índices
create index idx_indicacoes_recompensas_codigo_indicacao_id on indicacoes_recompensas (codigo_indicacao_id);
create index idx_indicacoes_recompensas_usuario_indicado_id on indicacoes_recompensas (usuario_indicado_id);

-- Row Level Security
alter table indicacoes_recompensas enable row level security;

-- O usuário indicado e o dono do código de indicação (indicador) podem ver
create policy indicacoes_recompensas_select_participantes
    on indicacoes_recompensas for select
    using (
        usuario_indicado_id = auth.uid()
        or codigo_indicacao_id in (select id from indicacoes_codigo where usuario_id = auth.uid())
    );
