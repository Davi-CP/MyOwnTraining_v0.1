-- ============================================================
-- Migration: mensagens_suporte
-- Depende de: chamados_suporte, auth.users, papeis_usuario
-- ============================================================
-- Mensagem individual dentro de um chamado de suporte, enviada
-- pelo próprio usuário ou por um atendente.
-- ============================================================

create table mensagens_suporte (
    id uuid primary key default gen_random_uuid(),
    chamado_id uuid not null references chamados_suporte(id) on delete cascade,
    usuario_id uuid not null references auth.users(id) on delete cascade,
    mensagem text not null,
    anexos jsonb,
    criado_em timestamptz not null default now()
);
comment on table mensagens_suporte is 'Mensagem dentro de um chamado de suporte, enviada pelo usuário ou por um atendente.';

-- Índices
create index idx_mensagens_suporte_chamado_id on mensagens_suporte (chamado_id);
create index idx_mensagens_suporte_usuario_id on mensagens_suporte (usuario_id);

-- Row Level Security
alter table mensagens_suporte enable row level security;

-- Usuário vê mensagens de chamados que abriu, mensagens que ele mesmo
-- enviou, ou (se for admin/suporte) mensagens de qualquer chamado
create policy mensagens_suporte_select_participante_ou_equipe
    on mensagens_suporte for select
    using (
        usuario_id = auth.uid()
        or chamado_id in (select id from chamados_suporte where usuario_id = auth.uid())
        or exists (
            select 1 from papeis_usuario
            where usuario_id = auth.uid() and papel in ('admin', 'suporte')
        )
    );

-- Autor da mensagem deve ser o próprio usuário autenticado, e ele precisa
-- ser dono do chamado ou fazer parte da equipe de suporte/admin
create policy mensagens_suporte_insert_participante_ou_equipe
    on mensagens_suporte for insert
    with check (
        usuario_id = auth.uid()
        and (
            chamado_id in (select id from chamados_suporte where usuario_id = auth.uid())
            or exists (
                select 1 from papeis_usuario
                where usuario_id = auth.uid() and papel in ('admin', 'suporte')
            )
        )
    );
