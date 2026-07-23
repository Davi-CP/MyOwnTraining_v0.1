create type app_role as enum ('admin', 'suporte', 'financeiro', 'usuario');

create table public.usuarios_admin (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  email text not null,
  role app_role not null default 'usuario',
  created_at timestamptz not null default now()
);

-- RLS: apenas admins podem ver/modificar
alter table public.usuarios_admin enable row level security;

create policy "Admins can view all" on public.usuarios_admin
  for select using ( (select role from public.usuarios_admin where user_id = auth.uid()) in ('admin','suporte','financeiro') );

create policy "Users can view own record" on public.usuarios_admin
  for select using ( auth.uid() = user_id );