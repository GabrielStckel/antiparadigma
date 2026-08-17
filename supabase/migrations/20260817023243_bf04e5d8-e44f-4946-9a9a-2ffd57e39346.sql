revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated;
revoke execute on function public.is_master_admin(uuid) from anon, authenticated;
revoke execute on function public.has_module_access(uuid, public.app_module, public.permission_level) from anon, authenticated;
revoke execute on function public.set_updated_at() from anon, authenticated;
revoke execute on function public.calc_custo_mensal() from anon, authenticated;
revoke execute on function public.log_audit() from anon, authenticated;
revoke execute on function public.handle_new_user() from anon, authenticated;