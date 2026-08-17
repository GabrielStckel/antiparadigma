create policy "notas_select_ferramentas_view" on storage.objects for select to authenticated
using (bucket_id = 'notas-fiscais' and public.has_module_access(auth.uid(), 'ferramentas'::public.app_module, 'view'::public.permission_level));

create policy "notas_insert_ferramentas_edit" on storage.objects for insert to authenticated
with check (bucket_id = 'notas-fiscais' and public.has_module_access(auth.uid(), 'ferramentas'::public.app_module, 'edit'::public.permission_level));

create policy "notas_update_ferramentas_edit" on storage.objects for update to authenticated
using (bucket_id = 'notas-fiscais' and public.has_module_access(auth.uid(), 'ferramentas'::public.app_module, 'edit'::public.permission_level))
with check (bucket_id = 'notas-fiscais' and public.has_module_access(auth.uid(), 'ferramentas'::public.app_module, 'edit'::public.permission_level));

create policy "notas_delete_admin" on storage.objects for delete to authenticated
using (bucket_id = 'notas-fiscais' and (public.has_role(auth.uid(), 'admin'::public.app_role) or public.is_master_admin(auth.uid())));