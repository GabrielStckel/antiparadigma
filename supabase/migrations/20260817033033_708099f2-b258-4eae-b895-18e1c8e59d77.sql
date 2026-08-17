-- ENUMS
create type public.task_priority as enum ('urgente','alta','normal','baixa');
create type public.status_type as enum ('aberto','andamento','revisao','concluido','cancelado');
create type public.project_status as enum ('planejado','ativo','pausado','concluido','cancelado');
create type public.dependency_type as enum ('bloqueia','aguarda','relacionada');
create type public.project_role as enum ('owner','editor','leitor');

-- PROJETOS
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  area_id uuid references public.areas(id),
  cor text,
  icone text,
  status public.project_status not null default 'ativo',
  owner_id uuid references auth.users(id),
  cliente text,
  data_inicio date,
  data_fim_prevista date,
  data_fim_real date,
  arquivado boolean not null default false,
  ordem numeric not null default 1000,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.projects to authenticated;
grant all on public.projects to service_role;

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel public.project_role not null default 'editor',
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);
grant select, insert, update, delete on public.project_members to authenticated;
grant all on public.project_members to service_role;

create table public.task_statuses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  nome text not null,
  tipo public.status_type not null default 'aberto',
  cor text not null default '#94a3b8',
  ordem numeric not null default 1000,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.task_statuses to authenticated;
grant all on public.task_statuses to service_role;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  codigo text unique,
  titulo text not null,
  descricao text,
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  nivel smallint not null default 0,
  status_id uuid not null references public.task_statuses(id),
  prioridade public.task_priority not null default 'normal',
  responsavel_id uuid references auth.users(id),
  data_inicio date,
  prazo date,
  concluida_em timestamptz,
  estimativa_horas numeric(8,2),
  horas_gastas numeric(8,2) not null default 0,
  progresso smallint not null default 0,
  tags text[] not null default '{}',
  recorrencia jsonb,
  ordem numeric not null default 1000,
  arquivada boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;

create table public.task_assignees (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (task_id, user_id)
);
grant select, insert, update, delete on public.task_assignees to authenticated;
grant all on public.task_assignees to service_role;

create table public.task_watchers (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unique (task_id, user_id)
);
grant select, insert, update, delete on public.task_watchers to authenticated;
grant all on public.task_watchers to service_role;

create table public.task_dependencies (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  depends_on_id uuid not null references public.tasks(id) on delete cascade,
  tipo public.dependency_type not null default 'aguarda',
  created_at timestamptz not null default now(),
  unique (task_id, depends_on_id),
  check (task_id <> depends_on_id)
);
grant select, insert, update, delete on public.task_dependencies to authenticated;
grant all on public.task_dependencies to service_role;

create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  texto text not null,
  concluido boolean not null default false,
  ordem numeric not null default 1000,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.task_checklist_items to authenticated;
grant all on public.task_checklist_items to service_role;

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  conteudo text not null,
  mencionados uuid[] not null default '{}',
  editado_em timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.task_comments to authenticated;
grant all on public.task_comments to service_role;

create table public.task_attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  nome_arquivo text not null,
  storage_path text not null,
  tamanho_bytes bigint,
  mime_type text,
  uploaded_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.task_attachments to authenticated;
grant all on public.task_attachments to service_role;

create table public.task_time_entries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  data date not null default current_date,
  horas numeric(6,2) not null,
  descricao text,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.task_time_entries to authenticated;
grant all on public.task_time_entries to service_role;

create table public.task_activity (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid references auth.users(id),
  campo text not null,
  valor_antes text,
  valor_depois text,
  created_at timestamptz not null default now()
);
grant select on public.task_activity to authenticated;
grant all on public.task_activity to service_role;

-- INDICES
create index idx_tasks_project on public.tasks(project_id);
create index idx_tasks_parent on public.tasks(parent_task_id);
create index idx_tasks_responsavel on public.tasks(responsavel_id);
create index idx_tasks_status on public.tasks(status_id);
create index idx_tasks_prazo on public.tasks(prazo);
create index idx_tasks_project_ordem on public.tasks(project_id, ordem);
create index idx_task_assignees_user on public.task_assignees(user_id);
create index idx_task_comments_task on public.task_comments(task_id, created_at);
create index idx_task_activity_task on public.task_activity(task_id, created_at);
create index idx_project_members_user on public.project_members(user_id);
create index idx_time_entries_user on public.task_time_entries(user_id, data);

-- FUNCOES DE ACESSO
create or replace function public.can_access_project(_user_id uuid, _project_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('master_admin','admin'))
      or exists (select 1 from public.projects p where p.id = _project_id and p.owner_id = _user_id)
      or exists (select 1 from public.project_members m where m.project_id = _project_id and m.user_id = _user_id);
$$;

create or replace function public.can_edit_task(_user_id uuid, _task_id uuid)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  t record;
begin
  select project_id, responsavel_id into t from public.tasks where id = _task_id;
  if t is null then return false; end if;
  if public.has_module_access(_user_id, 'tarefas', 'edit') and public.can_access_project(_user_id, t.project_id) then
    return true;
  end if;
  if t.responsavel_id = _user_id then return true; end if;
  return exists (select 1 from public.task_assignees a where a.task_id = _task_id and a.user_id = _user_id);
end;
$$;

revoke all on function public.can_access_project(uuid, uuid) from anon;
revoke all on function public.can_edit_task(uuid, uuid) from anon;

-- SEQUENCE / CODIGO
create sequence if not exists public.task_codigo_seq start 1;

create or replace function public.gerar_codigo_tarefa()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.codigo is null then
    new.codigo := 'ANT-' || nextval('public.task_codigo_seq')::text;
  end if;
  return new;
end;
$$;

create or replace function public.calc_nivel_tarefa()
returns trigger language plpgsql set search_path = public as $$
declare
  nivel_pai smallint;
  pai_projeto uuid;
begin
  if new.parent_task_id is null then
    new.nivel := 0;
    return new;
  end if;
  if new.parent_task_id = new.id then
    raise exception 'Uma tarefa não pode ser pai de si mesma';
  end if;
  select nivel, project_id into nivel_pai, pai_projeto from public.tasks where id = new.parent_task_id;
  if nivel_pai is null then
    raise exception 'Tarefa-pai inexistente';
  end if;
  if nivel_pai >= 2 then
    raise exception 'Máximo de dois níveis de subtarefa';
  end if;
  new.nivel := (nivel_pai + 1)::smallint;
  new.project_id := pai_projeto;
  return new;
end;
$$;

create or replace function public.impedir_ciclo_hierarquia()
returns trigger language plpgsql set search_path = public as $$
declare
  atual uuid := new.parent_task_id;
  passos int := 0;
begin
  while atual is not null and passos < 10 loop
    if atual = new.id then
      raise exception 'Hierarquia circular de tarefas não permitida';
    end if;
    select parent_task_id into atual from public.tasks where id = atual;
    passos := passos + 1;
  end loop;
  return new;
end;
$$;

create or replace function public.impedir_ciclo_dependencia()
returns trigger language plpgsql set search_path = public as $$
declare
  existe boolean;
begin
  with recursive cadeia as (
    select depends_on_id as id from public.task_dependencies where task_id = new.depends_on_id
    union
    select d.depends_on_id from public.task_dependencies d join cadeia c on d.task_id = c.id
  )
  select exists (select 1 from cadeia where id = new.task_id) into existe;
  if existe then
    raise exception 'Dependência circular não permitida';
  end if;
  return new;
end;
$$;

create or replace function public.marcar_conclusao()
returns trigger language plpgsql set search_path = public as $$
declare
  tipo_novo public.status_type;
begin
  select tipo into tipo_novo from public.task_statuses where id = new.status_id;
  if tipo_novo = 'concluido' then
    if new.concluida_em is null then new.concluida_em := now(); end if;
    new.progresso := 100;
  else
    new.concluida_em := null;
    if new.progresso = 100 then new.progresso := 0; end if;
  end if;
  return new;
end;
$$;

create or replace function public.rollup_tarefa_pai()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pai uuid;
  passos int := 0;
  total int;
  feitas int;
begin
  pai := coalesce(new.parent_task_id, old.parent_task_id);
  while pai is not null and passos < 5 loop
    select count(*), count(*) filter (where s.tipo = 'concluido')
      into total, feitas
      from public.tasks t join public.task_statuses s on s.id = t.status_id
     where t.parent_task_id = pai and t.arquivada = false;

    if total > 0 then
      update public.tasks p set
        progresso = (feitas * 100 / total)::smallint,
        estimativa_horas = (select sum(estimativa_horas) from public.tasks where parent_task_id = pai and arquivada = false),
        horas_gastas = coalesce((select sum(horas_gastas) from public.tasks where parent_task_id = pai and arquivada = false), 0),
        prazo = (select max(prazo) from public.tasks where parent_task_id = pai and arquivada = false)
      where p.id = pai;
    end if;

    select parent_task_id into pai from public.tasks where id = pai;
    passos := passos + 1;
  end loop;
  return null;
end;
$$;

create or replace function public.somar_horas()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  t uuid := coalesce(new.task_id, old.task_id);
begin
  update public.tasks set horas_gastas = coalesce((select sum(horas) from public.task_time_entries where task_id = t), 0)
  where id = t;
  return null;
end;
$$;

create or replace function public.gerar_recorrencia()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  tipo_novo public.status_type;
  tipo_antigo public.status_type;
  intervalo int;
  tipo_rec text;
  novo_prazo date;
begin
  if new.recorrencia is null then return null; end if;
  select tipo into tipo_novo from public.task_statuses where id = new.status_id;
  select tipo into tipo_antigo from public.task_statuses where id = old.status_id;
  if tipo_novo <> 'concluido' or tipo_antigo = 'concluido' then return null; end if;

  tipo_rec := coalesce(new.recorrencia->>'tipo', 'mensal');
  intervalo := coalesce((new.recorrencia->>'intervalo')::int, 1);
  novo_prazo := coalesce(new.prazo, current_date) + case tipo_rec
    when 'diaria' then (intervalo || ' days')::interval
    when 'semanal' then (intervalo * 7 || ' days')::interval
    when 'mensal' then (intervalo || ' months')::interval
    when 'anual' then (intervalo || ' years')::interval
    else (intervalo || ' months')::interval end;

  if new.recorrencia ? 'fim' and (new.recorrencia->>'fim') is not null
     and novo_prazo > (new.recorrencia->>'fim')::date then
    return null;
  end if;

  insert into public.tasks (titulo, descricao, project_id, parent_task_id, status_id, prioridade,
    responsavel_id, data_inicio, prazo, estimativa_horas, tags, recorrencia, ordem, created_by)
  select new.titulo, new.descricao, new.project_id, new.parent_task_id,
    (select id from public.task_statuses where coalesce(project_id, new.project_id) = new.project_id and tipo = 'aberto' order by ordem limit 1),
    new.prioridade, new.responsavel_id, new.data_inicio, novo_prazo, new.estimativa_horas,
    new.tags, new.recorrencia, new.ordem + 1, new.created_by;
  return null;
end;
$$;

create or replace function public.log_task_activity()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status_id is distinct from old.status_id then
    insert into public.task_activity (task_id, user_id, campo, valor_antes, valor_depois)
    values (new.id, auth.uid(), 'status',
      (select nome from public.task_statuses where id = old.status_id),
      (select nome from public.task_statuses where id = new.status_id));
  end if;
  if new.responsavel_id is distinct from old.responsavel_id then
    insert into public.task_activity (task_id, user_id, campo, valor_antes, valor_depois)
    values (new.id, auth.uid(), 'responsavel', old.responsavel_id::text, new.responsavel_id::text);
  end if;
  if new.prioridade is distinct from old.prioridade then
    insert into public.task_activity (task_id, user_id, campo, valor_antes, valor_depois)
    values (new.id, auth.uid(), 'prioridade', old.prioridade::text, new.prioridade::text);
  end if;
  if new.prazo is distinct from old.prazo then
    insert into public.task_activity (task_id, user_id, campo, valor_antes, valor_depois)
    values (new.id, auth.uid(), 'prazo', old.prazo::text, new.prazo::text);
  end if;
  if new.estimativa_horas is distinct from old.estimativa_horas then
    insert into public.task_activity (task_id, user_id, campo, valor_antes, valor_depois)
    values (new.id, auth.uid(), 'estimativa', old.estimativa_horas::text, new.estimativa_horas::text);
  end if;
  return null;
end;
$$;

create or replace function public.herdar_status_projeto()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.task_statuses (project_id, nome, tipo, cor, ordem)
  select new.id, nome, tipo, cor, ordem from public.task_statuses where project_id is null order by ordem;
  insert into public.project_members (project_id, user_id, papel)
  values (new.id, coalesce(new.owner_id, new.created_by), 'owner')
  on conflict do nothing;
  return null;
end;
$$;

-- TRIGGERS
create trigger trg_projects_updated_at before update on public.projects for each row execute function public.set_updated_at();
create trigger trg_projects_audit after insert or update or delete on public.projects for each row execute function public.log_audit();
create trigger trg_projects_status after insert on public.projects for each row execute function public.herdar_status_projeto();

create trigger trg_tasks_codigo before insert on public.tasks for each row execute function public.gerar_codigo_tarefa();
create trigger trg_tasks_nivel before insert or update of parent_task_id on public.tasks for each row execute function public.calc_nivel_tarefa();
create trigger trg_tasks_ciclo before insert or update of parent_task_id on public.tasks for each row execute function public.impedir_ciclo_hierarquia();
create trigger trg_tasks_conclusao before insert or update of status_id on public.tasks for each row execute function public.marcar_conclusao();
create trigger trg_tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();
create trigger trg_tasks_activity after update on public.tasks for each row execute function public.log_task_activity();
create trigger trg_tasks_recorrencia after update of status_id on public.tasks for each row execute function public.gerar_recorrencia();
create trigger trg_tasks_rollup after insert or update of status_id, prazo, estimativa_horas, horas_gastas or delete on public.tasks for each row execute function public.rollup_tarefa_pai();

create trigger trg_dep_ciclo before insert or update on public.task_dependencies for each row execute function public.impedir_ciclo_dependencia();
create trigger trg_time_horas after insert or update or delete on public.task_time_entries for each row execute function public.somar_horas();

-- RLS
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.task_statuses enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_watchers enable row level security;
alter table public.task_dependencies enable row level security;
alter table public.task_checklist_items enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.task_time_entries enable row level security;
alter table public.task_activity enable row level security;

create policy projects_select on public.projects for select to authenticated
using (public.has_module_access(auth.uid(),'tarefas','view') and public.can_access_project(auth.uid(), id));
create policy projects_insert on public.projects for insert to authenticated
with check (public.has_module_access(auth.uid(),'tarefas','edit'));
create policy projects_update on public.projects for update to authenticated
using (public.has_module_access(auth.uid(),'tarefas','edit') and public.can_access_project(auth.uid(), id))
with check (public.has_module_access(auth.uid(),'tarefas','edit'));
create policy projects_delete on public.projects for delete to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()) or owner_id = auth.uid());

create policy members_select on public.project_members for select to authenticated
using (public.can_access_project(auth.uid(), project_id));
create policy members_write on public.project_members for all to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid())
       or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
with check (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid())
       or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

create policy statuses_select on public.task_statuses for select to authenticated
using (project_id is null or public.can_access_project(auth.uid(), project_id));
create policy statuses_write on public.task_statuses for all to authenticated
using (
  case when project_id is null
    then (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()))
    else (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid())
          or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
  end)
with check (
  case when project_id is null
    then (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()))
    else (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid())
          or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()))
  end);

create policy tasks_select on public.tasks for select to authenticated
using (public.can_access_project(auth.uid(), project_id));
create policy tasks_insert on public.tasks for insert to authenticated
with check (public.has_module_access(auth.uid(),'tarefas','edit') and public.can_access_project(auth.uid(), project_id));
create policy tasks_update on public.tasks for update to authenticated
using (public.can_edit_task(auth.uid(), id)) with check (public.can_access_project(auth.uid(), project_id));
create policy tasks_delete on public.tasks for delete to authenticated
using (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid())
       or exists (select 1 from public.projects p where p.id = project_id and p.owner_id = auth.uid()));

create policy assignees_select on public.task_assignees for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));
create policy assignees_write on public.task_assignees for all to authenticated
using (public.can_edit_task(auth.uid(), task_id)) with check (public.can_edit_task(auth.uid(), task_id));

create policy watchers_select on public.task_watchers for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));
create policy watchers_write on public.task_watchers for all to authenticated
using (public.can_edit_task(auth.uid(), task_id) or user_id = auth.uid())
with check (public.can_edit_task(auth.uid(), task_id) or user_id = auth.uid());

create policy deps_select on public.task_dependencies for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));
create policy deps_write on public.task_dependencies for all to authenticated
using (public.can_edit_task(auth.uid(), task_id)) with check (public.can_edit_task(auth.uid(), task_id));

create policy checklist_select on public.task_checklist_items for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));
create policy checklist_write on public.task_checklist_items for all to authenticated
using (public.can_edit_task(auth.uid(), task_id)) with check (public.can_edit_task(auth.uid(), task_id));

create policy attachments_select on public.task_attachments for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));
create policy attachments_write on public.task_attachments for all to authenticated
using (public.can_edit_task(auth.uid(), task_id)) with check (public.can_edit_task(auth.uid(), task_id));

create policy comments_select on public.task_comments for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));
create policy comments_insert on public.task_comments for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));
create policy comments_update on public.task_comments for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy comments_delete on public.task_comments for delete to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));

create policy time_select on public.task_time_entries for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'gestor') or public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));
create policy time_insert on public.task_time_entries for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));
create policy time_update on public.task_time_entries for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy time_delete on public.task_time_entries for delete to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid()));

create policy activity_select on public.task_activity for select to authenticated
using (exists (select 1 from public.tasks t where t.id = task_id and public.can_access_project(auth.uid(), t.project_id)));

-- STATUS PADRAO GLOBAL
insert into public.task_statuses (project_id, nome, tipo, cor, ordem) values
  (null,'Backlog','aberto','#94a3b8',100),
  (null,'A fazer','aberto','#64748b',200),
  (null,'Em andamento','andamento','#3b82f6',300),
  (null,'Em revisão','revisao','#a855f7',400),
  (null,'Concluída','concluido','#22c55e',500),
  (null,'Cancelada','cancelado','#ef4444',600);

-- STORAGE POLICIES
create policy "task_attachments_select" on storage.objects for select to authenticated
using (bucket_id = 'task-attachments' and public.has_module_access(auth.uid(),'tarefas','view'));
create policy "task_attachments_insert" on storage.objects for insert to authenticated
with check (bucket_id = 'task-attachments' and public.has_module_access(auth.uid(),'tarefas','edit'));
create policy "task_attachments_delete" on storage.objects for delete to authenticated
using (bucket_id = 'task-attachments' and (public.has_role(auth.uid(),'admin') or public.is_master_admin(auth.uid())));