delete from public.task_time_entries;
delete from public.task_activity;
delete from public.tasks;
delete from public.task_statuses where project_id is not null;
delete from public.project_members;
delete from public.projects;
alter sequence public.task_codigo_seq restart with 1;