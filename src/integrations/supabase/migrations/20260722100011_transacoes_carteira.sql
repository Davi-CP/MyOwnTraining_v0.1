-- ============================================================
-- Migration: transacoes_carteira
-- Depende de: carteiras, agendamentos, enums tipo_transacao e
--             status_transacao
-- ============================================================
-- Movimentações financeiras registradas em uma carteira
-- (créditos, débitos, estornos, pagamentos, saques).
-- ============================================================

create table transacoes_carteira (
    id uuid primary key default gen_random_uuid(),
    carteira_id uuid not null references carteiras(id) on delete cascade,
    agendamento_id uuid references agendamentos(id) on delete set null,
    valor numeric not null,
    tipo tipo_transacao not null,
    status status_transacao not null default 'pendente',
    descricao text,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);
comment on table transacoes_carteira is 'Movimentação financeira de uma carteira (crédito, débito, estorno, pagamento, saque).';
comment on column transacoes_carteira.agendamento_id is 'Referência opcional ao agendamento que originou a movimentação.';

-- Índices
create index idx_transacoes_carteira_carteira_id on transacoes_carteira (carteira_id);
create index idx_transacoes_carteira_agendamento_id on transacoes_carteira (agendamento_id);
create index idx_transacoes_carteira_status on transacoes_carteira (status);

-- Row Level Security
alter table transacoes_carteira enable row level security;

-- Usuário só vê transações da própria carteira
create policy transacoes_carteira_select_owner
    on transacoes_carteira for select
    using (carteira_id in (select id from carteiras where usuario_id = auth.uid()));
