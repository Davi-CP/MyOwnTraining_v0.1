-- ============================================================
-- Migration: agendamentos
-- Depende de: perfis_cliente, perfis_personal_trainer,
--             agendamentos_recorrentes, enum status_agendamento
-- ============================================================
-- Registro efetivo de uma sessão de treino agendada entre
-- cliente e personal trainer.
-- ============================================================

create table agendamentos (
    id uuid primary key default gen_random_uuid(),
    cliente_id uuid not null references perfis_cliente(id) on delete cascade,
    personal_id uuid not null references perfis_personal_trainer(id) on delete cascade,
    recorrencia_id uuid references agendamentos_recorrentes(id) on delete set null,
    agendado_para timestamptz not null,
    duracao_minutos integer not null,
    local text,
    status status_agendamento not null default 'pendente',
    observacoes text,
    subtotal numeric not null default 0,
    desconto numeric not null default 0,
    taxa_plataforma numeric not null default 0,
    valor_personal numeric not null default 0,
    total numeric not null default 0,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);
comment on table agendamentos is 'Registro efetivo de uma sessão de treino agendada.';
comment on column agendamentos.agendado_para is 'Data e hora previstas para a sessão.';
comment on column agendamentos.recorrencia_id is 'Referência opcional à regra de recorrência que originou este agendamento.';

-- Índices
create index idx_agendamentos_cliente_id on agendamentos (cliente_id);
create index idx_agendamentos_personal_id on agendamentos (personal_id);
create index idx_agendamentos_recorrencia_id on agendamentos (recorrencia_id);
create index idx_agendamentos_status on agendamentos (status);
create index idx_agendamentos_agendado_para on agendamentos (agendado_para);

-- Row Level Security
alter table agendamentos enable row level security;

-- Cliente e personal envolvidos podem ver o agendamento
create policy agendamentos_select_participantes
    on agendamentos for select
    using (
        cliente_id = (select id from perfis_cliente where usuario_id = auth.uid())
        or personal_id = (select id from perfis_personal_trainer where usuario_id = auth.uid())
    );

-- Apenas o cliente pode criar o agendamento
create policy agendamentos_insert_cliente
    on agendamentos for insert
    with check (cliente_id = (select id from perfis_cliente where usuario_id = auth.uid()));

-- Cliente e personal envolvidos podem atualizar (ex: status, observações)
create policy agendamentos_update_participantes
    on agendamentos for update
    using (
        cliente_id = (select id from perfis_cliente where usuario_id = auth.uid())
        or personal_id = (select id from perfis_personal_trainer where usuario_id = auth.uid())
    );
