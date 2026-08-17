create or replace function public.aplicar_cambio(_taxas jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _antes jsonb;
  _total_antes numeric;
  _total_depois numeric;
  _afetadas int;
begin
  if not (public.has_role(auth.uid(), 'admin') or public.is_master_admin(auth.uid())) then
    raise exception 'Apenas administradores podem alterar o câmbio';
  end if;

  if _taxas is null or jsonb_typeof(_taxas) <> 'object' then
    raise exception 'Taxas inválidas';
  end if;

  select valor into _antes from public.settings where chave = 'cambio';

  select coalesce(sum(custo_mensal_brl), 0) into _total_antes
  from public.tools where moeda is distinct from 'BRL';

  insert into public.settings (chave, valor, updated_at)
  values ('cambio', _taxas, now())
  on conflict (chave) do update set valor = excluded.valor, updated_at = now();

  -- Recalcula via trigger de cálculo, sem gerar auditoria linha a linha.
  alter table public.tools disable trigger trg_tools_audit;
  update public.tools set valor = valor where moeda is distinct from 'BRL';
  get diagnostics _afetadas = row_count;
  alter table public.tools enable trigger trg_tools_audit;

  select coalesce(sum(custo_mensal_brl), 0) into _total_depois
  from public.tools where moeda is distinct from 'BRL';

  insert into public.audit_log (user_id, acao, entidade, entidade_id, dados_antes, dados_depois)
  values (
    auth.uid(),
    'recalculo_cambio',
    'settings',
    null,
    jsonb_build_object('taxas', _antes, 'total_mensal_brl', _total_antes),
    jsonb_build_object(
      'taxas', _taxas,
      'total_mensal_brl', _total_depois,
      'ferramentas_afetadas', _afetadas,
      'delta_brl', _total_depois - _total_antes
    )
  );

  return jsonb_build_object(
    'ferramentas_afetadas', _afetadas,
    'total_antes', _total_antes,
    'total_depois', _total_depois,
    'delta_brl', _total_depois - _total_antes
  );
end;
$$;

revoke execute on function public.aplicar_cambio(jsonb) from public, anon;
grant execute on function public.aplicar_cambio(jsonb) to authenticated;