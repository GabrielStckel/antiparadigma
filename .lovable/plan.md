# Refatoração de usabilidade — módulo Ferramentas

Somente interface, navegação e estados. Nada de schema, RLS, migrações ou regras de negócio. Quatro blocos, com parada para validação entre cada um.

Observação de banco confirmada na leitura do schema: `tools.descricao_uso` é NOT NULL (sem default). A adição rápida grava string vazia nesse campo — é o que torna o registro "incompleto" e não exige nenhuma alteração de banco. O Sheet deixa de bloquear o salvamento pela descrição (a exigência passa a ser só o nome), mas o campo nunca fica sem sinal: quando vazio ele aparece marcado como pendente (rótulo "pendente", borda de atenção e texto auxiliar dizendo que o registro fica incompleto sem ele) e entra na contagem do selo "incompleto". Salvar sem descrição é possível e visivelmente inacabado, nunca silencioso.

## Bloco 1 — Tirar a criação do porão

- **Ação primária no cabeçalho**: botão "Nova ferramenta" ao lado do título de `/ferramentas`, visível nas três abas, condicionado a permissão de edição. O Sheet passa a ser controlado pela rota (estado elevado), e `TabelaFerramentas` recebe callbacks para abrir/editar em vez de instanciar o próprio Sheet.
- **Atalho N**: registrado no escopo do módulo, ignorado quando o foco está em input, textarea, campo editável ou quando um diálogo já está aberto.
- **Adição rápida**: faixa fixa acima da tabela com input de nome, input de valor mensal e botão Adicionar. Enter no valor cria e devolve o foco ao nome. O registro nasce `status: ativa`, `ciclo: mensal`, `moeda: BRL`, `num_licencas: 1`, demais campos vazios. Toast de confirmação com ação "Completar dados" que abre o Sheet no registro criado.
- **Selo "incompleto"**: derivado no front — falta área, categoria, responsável ou descrição de uso. Selo discreto na coluna do nome e uma opção de filtro "Incompletas" nos filtros existentes.
- **Formulário progressivo**: camada sempre visível (nome, valor, moeda, ciclo, área, categoria, responsável, descrição de uso) e bloco colapsável "Contrato e governança" com os 13 campos restantes, exibindo contador "4 de 13" preenchidos. Salvar funciona com o bloco fechado.
- **Catálogo embutido**: nova constante `src/lib/catalogo-ferramentas.ts` com ~60 ferramentas comuns no mercado brasileiro (nome, categoria sugerida, domínio, moeda típica). Ao digitar o nome no Sheet, sugestão por correspondência aproximada; aceitar preenche categoria (casada por nome com as categorias do banco), site e moeda. Nome livre continua permitido.
- **⌘K com ações**: grupo "Ações" no topo da paleta, filtrado por permissão — Nova ferramenta, Lançar custos do mês, Nova tarefa, Novo projeto — com o atalho exibido ao lado. Ações navegam para a rota e disparam a abertura do formulário correspondente via estado de intenção compartilhado (search param ou store leve), para que "nova ferra" chegue na ação de qualquer lugar.

## Bloco 2 — A página vazia vira um convite

- **Tela de construção** (< 5 ferramentas): substitui a visão geral como aba inicial. Contém a frase de progresso ("3 ferramentas cadastradas. A partir de 5, o painel de custos começa a fazer sentido."), barra até 5, adição rápida em destaque com foco automático, grade de sugestões clicáveis do catálogo (excluindo as já cadastradas, abrindo o Sheet pré-preenchido) e botão de importação em massa. A partir de 5 registros ela desaparece e a visão geral volta a ser o padrão.
- **Importação por colagem**: modal com textarea, detecção automática de separador (`;`, `,`, tab), pré-visualização em tabela com mapeamento de colunas trocável, marcação de linhas problemáticas sem abortar o lote, e confirmação com totais ("12 ferramentas, R$ 4.380 por mês"). Insere via o mesmo caminho de escrita da tabela (RLS inalterada).
- **Estados vazios com direção** em todo o módulo, distinguindo "não existe dado" de "filtro sem resultado" (este último com ação de limpar filtros). Sem custos lançados aponta para a aba de custos no mês corrente; sem renovações mostra "Preencha as datas de renovação para acompanhar prazos aqui" quando nenhuma ferramenta tem data.

## Bloco 3 — Hierarquia na visão geral

- **Métrica herói**: custo mensal total em número grande mono/tabular, sem card, largura inteira; projeção anual como texto secundário; variação vs. mês anterior com seta e cor semântica; sparkline de 12 meses lido de `tool_costs` (nova query agregada de leitura, sem alteração de schema).
- **KPIs secundários**: remove "Licenças" e "Criticidade alta". Ficam três indicadores clicáveis em linha — ativas (com total cadastrado), renovações em 30 dias (com valor em risco), incompletas (aplica o filtro na tabela).
- **Gráficos**: um único gráfico de composição em barras horizontais ordenadas por valor, com valor na ponta da barra, sem eixo de moeda repetida e sem rótulos angulados; alternador "por área" / "por categoria".
- **Bloco "Precisa de atenção"**: seções fixas com contador — renovando em até 30 dias; renovação automática com prazo de cancelamento vencendo; sem custo lançado no mês corrente; sem responsável; cadastro incompleto. Seção vazia fica esmaecida com zero, nunca desaparece. Cada item abre o registro.

## Bloco 4 — Vida e resposta

- **Abas com contexto**: contadores nos rótulos ("Inventário 24", "Custos mensais 3 pendentes"), ponto de alerta na aba de custos quando há ferramenta ativa sem lançamento no mês corrente, e última aba usada persistida em localStorage.
- **Tabela viva**: linha inteira clicável com hover e cursor de ponteiro (botões de ação param a propagação), edição inline de status e responsável, destaque de 2s na linha criada/editada, ordenação por clique no cabeçalho com indicador de direção e linha de resumo recalculada pelo recorte ("8 de 24 ferramentas · R$ 2.140 por mês neste recorte").
- **Respostas imediatas**: mutações otimistas em criar/editar/excluir sobre o cache `["ferramentas"]`, com rollback e toast de erro; exclusão com "Desfazer" de 5s (o delete só vai ao banco após a janela expirar); botão de salvar com estado de carregando e Sheet fechando apenas após confirmação.
- **Teclado no módulo**: N (nova), `/` (foca a busca da tabela), Escape (fecha Sheet / limpa filtros), Enter na adição rápida (cria e mantém o foco). Rodapé discreto do módulo lista os atalhos, e eles também aparecem no ⌘K.

## Qualidade (ao final de cada bloco)

Lint e build, mais teste do fluxo de cadastro do zero no navegador com cronometragem de cliques e segundos (meta: < 10s pela adição rápida, < 60s pelo formulário completo). Os três cenários de volume — banco vazio, 3 ferramentas e 25 ferramentas — serão exercitados; como o banco real precisa ficar limpo, o cenário de 25 é testado com dados temporários criados e removidos no próprio teste, ou por injeção no cache de leitura durante a verificação.

## Notas técnicas

- Arquivos afetados: `src/routes/_authenticated/ferramentas.tsx`, `src/components/ferramentas/{tabela-ferramentas,ferramenta-sheet,visao-geral,custos-lote}.tsx`, `src/components/layout/busca-global.tsx`, `src/hooks/use-ferramentas.ts`.
- Novos arquivos: `src/lib/catalogo-ferramentas.ts`, `src/components/ferramentas/{adicao-rapida,tela-construcao,importar-ferramentas,precisa-atencao,metrica-heroi}.tsx`, e um hook de mutações de ferramentas com otimismo.
- Design system existente mantido: numerais em mono com tabular-nums (`num`), status somente com tokens success/warning/danger, verdete apenas para primário/seleção/gráfico, nenhuma cor literal fora de `src/styles.css`.
