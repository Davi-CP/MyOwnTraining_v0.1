-- ============================================================
-- Migration: grants_dados
-- Expõe as tabelas de domínio à Data API (PostgREST).
-- Necessário porque o Supabase não auto-expõe tabelas novas por
-- padrão (auto_expose_new_tables desabilitado). O RLS continua
-- sendo a fonte de verdade para o acesso por linha.
-- ============================================================

grant usage on schema public to anon, authenticated;

grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

grant usage on all sequences in schema public to anon, authenticated;