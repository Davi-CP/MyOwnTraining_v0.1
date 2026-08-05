-- ============================================================
-- Migration: papeis_usuario
-- Depende de: auth.users (nativa do Supabase), enum papel_usuario
-- ============================================================
-- Fonte de verdade para autorização baseada em papel.
-- ============================================================

create table papeis_usuario (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references auth.users(id) on delete cascade,
    papel papel_usuario not null,
    constraint papeis_usuario_usuario_id_papel_key unique (usuario_id, papel)
);
comment on table papeis_usuario is 'Papéis de autorização associados a um usuário; um usuário pode acumular vários papéis.';

-- Índices
create index idx_papeis_usuario_usuario_id on papeis_usuario (usuario_id);

-- Row Level Security
alter table papeis_usuario enable row level security;

-- Usuário só enxerga seus próprios papéis. Concessão/revogação de papéis de
-- terceiros deve ser feita via service role ou função com privilégios
-- elevados (SECURITY DEFINER), fora do escopo de policies de usuário comum.
create policy papeis_usuario_select_owner
    on papeis_usuario for select
    using (auth.uid() = usuario_id);