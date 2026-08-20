-- ============================================================
-- Migration: agendamentos_recorrentes
-- Depende de: perfis_cliente, perfis_personal_trainer
-- ============================================================
-- Regra de recorrência que pode gerar vários agendamentos
-- individuais periódicos.
-- ============================================================

create table agendamentos_recorrentes (
    id uuid primary key default gen_random_uuid(),
    cliente_id uuid not null references perfis_cliente(id) on delete cascade,
    personal_id uuid not null references perfis_personal_trainer(id) on delete cascade,
    dia_semana integer not null check (dia_semana between 0 and 6),
    hora_inicio time not null,
    duracao_minutos integer not null,
    local text,
    data_inicio date not null,
    data_fim date,
    ativo boolean not null default true,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);
comment on table agendamentos_recorrentes is 'Regra de recorrência que pode gerar vários agendamentos individuais.';
comment on column agendamentos_recorrentes.dia_semana is 'Dia da semana da recorrência (0 = domingo ... 6 = sábado).';

-- Índices
create index idx_agendamentos_recorrentes_cliente_id on agendamentos_recorrentes (cliente_id);
create index idx_agendamentos_recorrentes_personal_id on agendamentos_recorrentes (personal_id);
create index idx_agendamentos_recorrentes_ativo on agendamentos_recorrentes (ativo);

-- Row Level Security
alter table agendamentos_recorrentes enable row level security;

-- Cliente e personal envolvidos podem ver a recorrência
create policy agendamentos_recorrentes_select_participantes
    on agendamentos_recorrentes for select
    using (
        cliente_id = (select id from perfis_cliente where usuario_id = auth.uid())
        or personal_id = (select id from perfis_personal_trainer where usuario_id = auth.uid())
    );

-- Apenas o cliente pode criar a recorrência
create policy agendamentos_recorrentes_insert_cliente
    on agendamentos_recorrentes for insert
    with check (cliente_id = (select id from perfis_cliente where usuario_id = auth.uid()));

-- Cliente e personal envolvidos podem atualizar (ex: cancelar a recorrência)
create policy agendamentos_recorrentes_update_participantes
    on agendamentos_recorrentes for update
    using (
        cliente_id = (select id from perfis_cliente where usuario_id = auth.uid())
        or personal_id = (select id from perfis_personal_trainer where usuario_id = auth.uid())
    );
