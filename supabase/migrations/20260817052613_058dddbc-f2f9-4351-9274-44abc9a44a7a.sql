delete from public.audit_log
where entidade = 'tools'
  and (coalesce(dados_depois->>'nome', dados_antes->>'nome') like 'ZZTESTE — %'
       or coalesce(dados_depois->>'nome', dados_antes->>'nome') in ('Figma','Notion'));