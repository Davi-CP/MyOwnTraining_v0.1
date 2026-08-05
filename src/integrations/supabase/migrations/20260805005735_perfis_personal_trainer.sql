-- ============================================================
-- Migration: perfis_personal_trainer
-- Depende de: auth.users (nativa do Supabase)
-- ============================================================
-- Perfil profissional do personal trainer: localização,
-- especialidades, equipamentos, preços e reputação.
-- ============================================================

create table perfis_personal_trainer (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    nome_completo text not null,
    telefone text,
    bio text,
    cidade text,
    uf text,
    cep text,
    bairro text,
    logradouro text,
    numero text,
    complemento text,
    latitude double precision,
    longitude double precision,
    raio_atendimento_km numeric,
    especialidades text[],
    equipamentos text[],
    preco_por_hora numeric,
    preco_por_aula numeric,
    numero_cref text,
    avaliacao numeric not null default 0,
    total_avaliacoes integer not null default 0,
    ativo boolean not null default true,
    premium boolean not null default false,
    disponibilidade jsonb,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now(),
    constraint perfis_personal_trainer_usuario_id_key unique (usuario_id)
);
comment on table perfis_personal_trainer is 'Perfil profissional do personal trainer: localização, especialidades, preços e reputação.';
comment on column perfis_personal_trainer.numero_cref is 'Número profissional do CREF vigente; a situação de verificação é derivada de documentos_cref.';
comment on column perfis_personal_trainer.disponibilidade is 'Disponibilidade semanal em JSON, quando mantida diretamente no perfil.';

-- Índices
create index idx_perfis_personal_trainer_cidade on perfis_personal_trainer (cidade);
create index idx_perfis_personal_trainer_ativo on perfis_personal_trainer (ativo);

-- Row Level Security
alter table perfis_personal_trainer enable row level security;

create policy perfis_personal_trainer_select_authenticated
    on perfis_personal_trainer for select
    using (auth.role() = 'authenticated');

create policy perfis_personal_trainer_insert_owner
    on perfis_personal_trainer for insert
    with check (auth.uid() = usuario_id);

create policy perfis_personal_trainer_update_owner
    on perfis_personal_trainer for update
    using (auth.uid() = usuario_id)
    with check (auth.uid() = usuario_id);

create policy perfis_personal_trainer_delete_owner
    on perfis_personal_trainer for delete
    using (auth.uid() = usuario_id);