-- ============================================================
-- Migration: admin_metrics
-- Métricas do painel administrativo calculadas no servidor.
-- SECURITY DEFINER: roda como o usuário que criou a função
-- (postgres), ignorando RLS — essencial para contagens globais.
-- search_path vazio impede sequestro de search_path.
-- ============================================================

create or replace function public.get_admin_metrics()
returns table (usuarios bigint, cref_pendentes bigint, chamados_abertos bigint)
language sql
security definer
set search_path = ''
stable
as $$
    select
        (select count(*)::bigint from auth.users) as usuarios,
        (select count(*)::bigint from public.documentos_cref where status = 'pendente') as cref_pendentes,
        (select count(*)::bigint from public.chamados_suporte where status in ('aberto', 'em_andamento', 'aguardando_cliente')) as chamados_abertos;
$$;

revoke all on function public.get_admin_metrics() from public, anon;
grant execute on function public.get_admin_metrics() to authenticated;