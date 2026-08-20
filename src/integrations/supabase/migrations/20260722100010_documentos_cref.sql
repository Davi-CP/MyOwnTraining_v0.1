-- ============================================================
-- Migration: documentos_cref
-- Depende de: perfis_personal_trainer, auth.users, papeis_usuario,
--             enum status_documento_cref
-- ============================================================
-- Histórico de documentos enviados por personal trainers para
-- comprovação do registro profissional (CREF).
-- ============================================================

create table documentos_cref (
    id uuid primary key default gen_random_uuid(),
    personal_id uuid not null references perfis_personal_trainer(id) on delete cascade,
    numero_cref text not null,
    url_documento text not null,
    status status_documento_cref not null default 'pendente',
    revisado_por uuid references auth.users(id) on delete set null,
    revisado_em timestamptz,
    observacoes text,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);
comment on table documentos_cref is 'Histórico de documentos de comprovação do registro profissional (CREF).';
comment on column documentos_cref.revisado_por is 'Usuário (admin/suporte) que revisou o documento.';
-- Regra de negócio: apenas um documento aprovado vigente por personal.
-- Implementada abaixo via índice único parcial.

-- Índices
create index idx_documentos_cref_personal_id on documentos_cref (personal_id);
create index idx_documentos_cref_status on documentos_cref (status);
create index idx_documentos_cref_revisado_por on documentos_cref (revisado_por);

-- Garante no máximo um documento "aprovado" vigente por personal trainer
create unique index uq_documentos_cref_aprovado_vigente
    on documentos_cref (personal_id)
    where status = 'aprovado';

-- Row Level Security
alter table documentos_cref enable row level security;

-- O personal vê seus próprios documentos; revisores (admin/suporte) veem todos
create policy documentos_cref_select_personal_ou_revisor
    on documentos_cref for select
    using (
        personal_id = (select id from perfis_personal_trainer where usuario_id = auth.uid())
        or exists (
            select 1 from papeis_usuario
            where usuario_id = auth.uid() and papel in ('admin', 'suporte')
        )
    );

-- Apenas o próprio personal pode enviar um novo documento
create policy documentos_cref_insert_personal
    on documentos_cref for insert
    with check (personal_id = (select id from perfis_personal_trainer where usuario_id = auth.uid()));

-- Apenas revisores (admin/suporte) podem atualizar status/revisão
create policy documentos_cref_update_revisor
    on documentos_cref for update
    using (
        exists (
            select 1 from papeis_usuario
            where usuario_id = auth.uid() and papel in ('admin', 'suporte')
        )
    );
