do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    left join pg_type t on t.oid = p.prorettype
    where n.nspname = 'public' and p.prosecdef and t.typname <> 'trigger'
  loop
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;