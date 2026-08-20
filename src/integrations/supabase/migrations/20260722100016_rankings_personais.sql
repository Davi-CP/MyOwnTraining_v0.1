-- ============================================================
-- Migration: rankings_personais
-- Depende de: perfis_personal_trainer
-- ============================================================
-- Resultados calculados de rankings de personal trainers,
-- por período, modalidade e região.
-- ============================================================

create table rankings_personais (
    id uuid primary key default gen_random_uuid(),
    personal_id uuid not null references perfis_personal_trainer(id) on delete cascade,
    pontuacao numeric not null,
    posicao integer not null,
    periodo text not null,
    modalidade text,
    cidade text,
    bairro text,
    calculado_em timestamptz not null default now(),
    constraint rankings_personais_unicidade_key unique (personal_id, periodo, modalidade, cidade, bairro)
);
comment on table rankings_personais is 'Resultado calculado de ranking de personal trainers por período, modalidade e região.';
comment on column rankings_personais.periodo is 'Período de referência do ranking, representado como texto (ex: "2026-07").';

-- Índices
create index idx_rankings_personais_personal_id on rankings_personais (personal_id);
create index idx_rankings_personais_cidade on rankings_personais (cidade);
create index idx_rankings_personais_bairro on rankings_personais (bairro);

-- Row Level Security
-- Visualização pública (qualquer um pode ver rankings).
alter table rankings_personais enable row level security;

create policy rankings_personais_select_public
    on rankings_personais for select
    using (true);
