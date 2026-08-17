-- ENUMS
create type public.app_role as enum ('master_admin','admin','gestor','membro','visualizador');
create type public.app_module as enum ('ferramentas','tarefas','admin');
create type public.permission_level as enum ('none','view','edit','admin');
create type public.user_status as enum ('pending','active','suspended');
create type public.tool_status as enum ('ativa','trial','em_avaliacao','pausada','cancelada');
create type public.billing_cycle as enum ('mensal','trimestral','semestral','anual','vitalicio','uso','gratuito');
create type public.criticidade as enum ('critica','alta','media','baixa');

-- TABELAS
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null,
  email text not null,
  avatar_url text,
  cargo text,
  area_id uuid,
  status public.user_status not null default 'pending',
  ultimo_acesso timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table public.module_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module public.app_module not null,
  level public.permission_level not null default 'none',
  granted_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (user_id, module)
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  acao text not null,
  entidade text not null,
  entidade_id uuid,
  dados_antes jsonb,
  dados_depois jsonb,
  created_at timestamptz not null default now()
);

create table public.settings (
  chave text primary key,
  valor jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.areas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  cor text,
  responsavel_id uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.tool_categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  created_at timestamptz not null default now()
);

create table public.tools (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  fornecedor text,
  site_url text,
  logo_url text,
  categoria_id uuid references public.tool_categories(id),
  area_id uuid references public.areas(id),
  descricao_uso text not null,
  status public.tool_status not null default 'ativa',
  criticidade public.criticidade not null default 'media',
  responsavel_id uuid references auth.users(id),
  aprovada_por uuid references auth.users(id),
  plano text,
  ciclo public.billing_cycle not null default 'mensal',
  valor numeric(12,2) not null default 0,
  moeda text not null default 'BRL',
  num_licencas integer not null default 1,
  custo_mensal_brl numeric(12,2),
  forma_pagamento text,
  ultimos_4_digitos text,
  centro_custo text,
  data_contratacao date,
  data_renovacao date,
  renovacao_automatica boolean not null default true,
  prazo_cancelamento_dias integer,
  contrato_url text,
  contem_dados_sensiveis boolean not null default false,
  observacoes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tool_costs (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete cascade,
  competencia date not null,
  valor numeric(12,2) not null,
  moeda text not null default 'BRL',
  taxa_cambio numeric(10,4),
  valor_brl numeric(12,2) not null,
  nota_fiscal_url text,
  observacao text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (tool_id, competencia)
);

create table public.tool_users (
  id uuid primary key default gen_random_uuid(),
  tool_id uuid not null references public.tools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nivel_acesso text,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tool_id, user_id)
);

alter table public.profiles add constraint profiles_area_fk foreign key (area_id) references public.areas(id) on delete set null;

-- ÍNDICES
create index idx_tools_area on public.tools(area_id);
create index idx_tools_categoria on public.tools(categoria_id);
create index idx_tools_responsavel on public.tools(responsavel_id);
create index idx_tools_status on public.tools(status);
create index idx_tools_renovacao on public.tools(data_renovacao);
create index idx_tool_costs_tool_comp on public.tool_costs(tool_id, competencia);
create index idx_tool_users_tool on public.tool_users(tool_id);
create index idx_module_permissions_user on public.module_permissions(user_id);
create index idx_user_roles_user on public.user_roles(user_id);
create index idx_audit_log_entidade on public.audit_log(entidade, entidade_id, created_at desc);

-- GRANTS
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select on public.user_roles to authenticated;
grant insert, update, delete on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
grant select, insert, update, delete on public.module_permissions to authenticated;
grant all on public.module_permissions to service_role;
grant select, insert on public.audit_log to authenticated;
grant all on public.audit_log to service_role;
grant select, insert, update, delete on public.settings to authenticated;
grant all on public.settings to service_role;
grant select, insert, update, delete on public.areas to authenticated;
grant all on public.areas to service_role;
grant select, insert, update, delete on public.tool_categories to authenticated;
grant all on public.tool_categories to service_role;
grant select, insert, update, delete on public.tools to authenticated;
grant all on public.tools to service_role;
grant select, insert, update, delete on public.tool_costs to authenticated;
grant all on public.tool_costs to service_role;
grant select, insert, update, delete on public.tool_users to authenticated;
grant all on public.tool_users to service_role;

-- FUNÇÕES
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

create or replace function public.is_master_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = 'master_admin');
$$;

create or replace function public.has_module_access(_user_id uuid, _module public.app_module, _min_level public.permission_level)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  lvl public.permission_level;
  rank_of int;
  rank_min int;
begin
  if exists (select 1 from public.user_roles where user_id = _user_id and role in ('master_admin','admin')) then
    return true;
  end if;
  select level into lvl from public.module_permissions where user_id = _user_id and module = _module;
  if lvl is null then return false; end if;
  rank_of := case lvl when 'none' then 0 when 'view' then 1 when 'edit' then 2 when 'admin' then 3 end;
  rank_min := case _min_level when 'none' then 0 when 'view' then 1 when 'edit' then 2 when 'admin' then 3 end;
  return rank_of >= rank_min;
end;
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger trg_tools_updated_at before update on public.tools for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  primeiro boolean;
  m public.app_module;
begin
  select count(*) = 0 into primeiro from public.profiles;

  insert into public.profiles (id, nome_completo, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome_completo', new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    case when primeiro then 'active'::public.user_status else 'pending'::public.user_status end
  );

  if primeiro then
    insert into public.user_roles (user_id, role) values (new.id, 'master_admin');
    foreach m in array array['ferramentas','tarefas','admin']::public.app_module[] loop
      insert into public.module_permissions (user_id, module, level) values (new.id, m, 'admin');
    end loop;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'membro');
    foreach m in array array['ferramentas','tarefas','admin']::public.app_module[] loop
      insert into public.module_permissions (user_id, module, level) values (new.id, m, 'none');
    end loop;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.calc_custo_mensal()
returns trigger language plpgsql set search_path = public as $$
declare
  taxa numeric := 1;
  cambio jsonb;
  base numeric;
begin
  if new.moeda is distinct from 'BRL' then
    select valor into cambio from public.settings where chave = 'cambio';
    if cambio is not null and cambio ? new.moeda then
      taxa := (cambio->>new.moeda)::numeric;
    end if;
  end if;

  base := coalesce(new.valor,0) * coalesce(new.num_licencas,1) * taxa;

  new.custo_mensal_brl := case new.ciclo
    when 'mensal' then base
    when 'trimestral' then base / 3
    when 'semestral' then base / 6
    when 'anual' then base / 12
    when 'vitalicio' then 0
    when 'gratuito' then 0
    when 'uso' then base
  end;

  return new;
end;
$$;

create trigger trg_tools_custo before insert or update of valor, moeda, ciclo, num_licencas on public.tools
for each row execute function public.calc_custo_mensal();

create or replace function public.log_audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_log (user_id, acao, entidade, entidade_id, dados_depois)
    values (auth.uid(), 'criacao', tg_table_name, new.id, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    insert into public.audit_log (user_id, acao, entidade, entidade_id, dados_antes, dados_depois)
    values (auth.uid(), 'alteracao', tg_table_name, new.id, to_jsonb(old), to_jsonb(new));
    return new;
  else
    insert into public.audit_log (user_id, acao, entidade, entidade_id, dados_antes)
    values (auth.uid(), 'exclusao', tg_table_name, old.id, to_jsonb(old));
    return old;
  end if;
end;
$$;

create trigger trg_tools_audit after insert or update or delete on public.tools
for each row execute function public.log_audit();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.module_permissions enable row level security;
alter table public.audit_log enable row level security;
alter table public.settings enable row level security;
alter table public.areas enable row level security;
alter table public.tool_categories enable row level security;
alter table public.tools enable row level security;
alter table public.tool_costs enable row level security;
alter table public.tool_users enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated
using (id = auth.uid() or public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()))
with check (id = auth.uid() or public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));
create policy "profiles_insert_admin" on public.profiles for insert to authenticated
with check (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));

create policy "user_roles_select_own_or_admin" on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));
create policy "user_roles_write_master" on public.user_roles for all to authenticated
using (public.is_master_admin(auth.uid())) with check (public.is_master_admin(auth.uid()));

create policy "module_permissions_select_own_or_admin" on public.module_permissions for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));
create policy "module_permissions_write_admin" on public.module_permissions for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()))
with check (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));

create policy "audit_select_admin" on public.audit_log for select to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));
create policy "audit_insert_authenticated" on public.audit_log for insert to authenticated with check (true);

create policy "settings_select_authenticated" on public.settings for select to authenticated using (true);
create policy "settings_write_admin" on public.settings for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()))
with check (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));

create policy "areas_select_authenticated" on public.areas for select to authenticated using (true);
create policy "areas_write_ferramentas_edit" on public.areas for all to authenticated
using (public.has_module_access(auth.uid(),'ferramentas','edit'))
with check (public.has_module_access(auth.uid(),'ferramentas','edit'));

create policy "categories_select_authenticated" on public.tool_categories for select to authenticated using (true);
create policy "categories_write_ferramentas_edit" on public.tool_categories for all to authenticated
using (public.has_module_access(auth.uid(),'ferramentas','edit'))
with check (public.has_module_access(auth.uid(),'ferramentas','edit'));

create policy "tools_select" on public.tools for select to authenticated
using (public.has_module_access(auth.uid(),'ferramentas','view'));
create policy "tools_insert" on public.tools for insert to authenticated
with check (public.has_module_access(auth.uid(),'ferramentas','edit'));
create policy "tools_update" on public.tools for update to authenticated
using (public.has_module_access(auth.uid(),'ferramentas','edit'))
with check (public.has_module_access(auth.uid(),'ferramentas','edit'));
create policy "tools_delete" on public.tools for delete to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));

create policy "tool_costs_select" on public.tool_costs for select to authenticated
using (public.has_module_access(auth.uid(),'ferramentas','view'));
create policy "tool_costs_insert" on public.tool_costs for insert to authenticated
with check (public.has_module_access(auth.uid(),'ferramentas','edit'));
create policy "tool_costs_update" on public.tool_costs for update to authenticated
using (public.has_module_access(auth.uid(),'ferramentas','edit'))
with check (public.has_module_access(auth.uid(),'ferramentas','edit'));
create policy "tool_costs_delete" on public.tool_costs for delete to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));

create policy "tool_users_select" on public.tool_users for select to authenticated
using (public.has_module_access(auth.uid(),'ferramentas','view'));
create policy "tool_users_insert" on public.tool_users for insert to authenticated
with check (public.has_module_access(auth.uid(),'ferramentas','edit'));
create policy "tool_users_update" on public.tool_users for update to authenticated
using (public.has_module_access(auth.uid(),'ferramentas','edit'))
with check (public.has_module_access(auth.uid(),'ferramentas','edit'));
create policy "tool_users_delete" on public.tool_users for delete to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));

-- DADOS INICIAIS
insert into public.tool_categories (nome) values
('Design'),('Marketing'),('Vendas'),('Financeiro'),('Desenvolvimento'),('IA'),
('Comunicação'),('Gestão'),('Infraestrutura'),('Jurídico'),('RH'),('Outros');

insert into public.areas (nome) values
('Diretoria'),('Marketing'),('Comercial'),('Operações'),('Financeiro'),('Tecnologia'),('Criação');

insert into public.settings (chave, valor) values ('cambio', '{"USD": 5.40, "EUR": 5.90}'::jsonb);