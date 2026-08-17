-- Estado final e explícito das permissões de execução das funções SECURITY DEFINER.
-- Funções de trigger não devem ser chamáveis por ninguém via API; as funções de
-- checagem de acesso usadas nas políticas de RLS ficam disponíveis a usuários logados.

DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated', f.sig);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_master_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_module_access(uuid, public.app_module, public.permission_level) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_project(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_edit_task(uuid, uuid) TO authenticated;