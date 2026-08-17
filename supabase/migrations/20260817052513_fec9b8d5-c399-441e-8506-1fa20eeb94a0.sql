insert into public.tools (nome, descricao_uso, status, ciclo, moeda, num_licencas, valor, criticidade)
select
  'ZZTESTE — Ferramenta ' || lpad(i::text, 2, '0'),
  case when i % 3 = 0 then '' else 'Registro temporário de teste de volume' end,
  (array['ativa','trial','pausada','em_avaliacao'])[1 + (i % 4)]::tool_status,
  'mensal'::billing_cycle,
  'BRL',
  1 + (i % 5),
  50 + (i * 37),
  (array['critica','alta','media','baixa'])[1 + (i % 4)]::criticidade
from generate_series(1, 25) as i;