# Refatoração de design do Antiparadigma OS

Somente camada visual: nenhuma alteração em queries, hooks de dados, RLS, migrações ou regras de negócio. Quatro blocos, com pausa para validação entre cada um.

Verificado no repositório antes de planejar: `src/styles.css` está na paleta slate padrão do shadcn, sem `--font-*`; `src/routes/_authenticated/index.tsx:119` tem `<Progress value={0} />` chumbado; `#6366f1` aparece em 4 pontos (`aba-estrutura.tsx` ×3, `projeto-config.tsx` ×1); cores literais red/amber em `use-tarefas.ts`, `tarefas/index.tsx`, `tarefa-extras.tsx`, `lista-tarefas.tsx`, `cronograma-tarefas.tsx`; `text-[10px]`/`text-[11px]` em 13 arquivos.

## Bloco 1 — Fundação do design system

- **Tipografia**: `preconnect` + `<link>` para Geist (400/500/600) e Geist Mono (400/500) no `head()` do `__root.tsx`; tokens `--font-sans` / `--font-mono` em `@theme inline`; `--font-sans` no body.
- **Regra permanente**: todo numeral lido pelo usuário (BRL, datas, códigos, contadores, %, horas, eixos de gráfico) em mono com `tabular-nums`. Entra como utilitário `@utility num` em `styles.css` e passa a ser aplicado nas telas ao longo dos blocos 2 a 4; também vai para a memória do projeto.
- **Neutros quentes**: rampa convertida para oklch com matiz ~70. background=50, card=branco, muted=100, border=200, muted-foreground=600, foreground=900. Escuro inverte a rampa mantendo o matiz quente.
- **Marca**: `--primary` = #2C5F5A em oklch, foreground claro; uso restrito a botão primário, selecionado, foco, links e série principal de gráfico. Clareado no escuro para AA.
- **Semânticas**: `--success` #4E7C4A, `--warning` #A8762C, `--danger` #9C4038, cada um com variantes `-bg`, `-border`, `-fg` registradas em `@theme inline`. Substituição de todos os literais red/amber.
- **Color picker de áreas e status**: os `#6366f1` de `aba-estrutura.tsx` e `projeto-config.tsx` são apenas o valor inicial de um campo editável. O picker passa a oferecer uma paleta fechada de 8 cores derivadas do sistema (verdete + degraus de gráfico + semânticas), com a primeira como novo default. Cores legadas gravadas no banco continuam renderizando pelo valor salvo: o swatch mostra a cor exata mesmo fora da paleta, e ela aparece no picker como opção extra marcada como atual. Nenhuma migração reescreve cores existentes.
- **Gráficos**: chart-1..5 como cinco degraus derivados do verdete + um neutro.
- **Escala tipográfica**: registra os tokens `text-label` (11px, uppercase, tracking .1em), `text-aux` (12px), `text-base-ui` (13px, base da interface), `text-section` (15px/500), `text-page` (20px/500, tracking -.015em), `text-kpi` (32px mono/500, tracking -.02em). Sem substituição em massa neste bloco: a aplicação fica restrita aos títulos das quatro rotas de topo (dashboard, ferramentas, tarefas, admin), para que título de página e de seção já fiquem visualmente distintos. Os `text-[10px]`/`text-[11px]` dos 13 arquivos são trocados no bloco da tela correspondente (blocos 2 a 4), um conjunto por vez, para revisão visual.
- **Densidade**: atributo `data-density` no `<html>` com `confortavel` (padrão) e `compacto`, controlando altura de linha, padding de célula e gaps via variáveis CSS; hook + botão no /perfil, persistido em localStorage (mesmo padrão do tema já existente).
- **Foco**: `:focus-visible` global com anel 2px na cor de marca e offset 2px.

## Bloco 2 — Assinatura e componentes base

- `src/components/ui/horizonte.tsx`: barra de 6px, trilho no neutro 200, preenchimento proporcional à aproximação da data numa janela padrão de 90 dias, rótulo de distância em mono ("4 dias", "vencido há 3 dias"). Faixas: >60 neutro, 30–60 warning, <30 danger, vencido danger com trilho cheio. Sem animação sob `prefers-reduced-motion`.
- Aplicado em: coluna de renovação da tabela de ferramentas, alertas da visão geral, coluna de prazo da lista de tarefas, cartão do kanban, próximos prazos do dashboard inicial e detalhe da tarefa.
- `selo.tsx`: componente único para status e prioridade (fundo claro + texto escuro do mesmo token, 11px uppercase tracking largo), substituindo as classes de cor espalhadas.
- `celula-num.tsx`: célula de tabela alinhada à direita, mono, tabular.
- `estado-vazio.tsx`: ícone discreto, frase própria de cada espaço e ação principal opcional. O componente padroniza a forma, não o texto — cada ocorrência recebe copy específica (tabela abaixo).
- Skeletons com a forma do conteúdo real (linhas de tabela, cartões de KPI, colunas de kanban).

### Copy de estado vazio — proposta por local

Levantamento completo: 22 estados vazios reais. Distinção importante entre **espaço ainda não usado** (convite + ação) e **filtro sem resultado** (não é convite, é ajuste de filtro).

| Local | Texto hoje | Texto proposto | Ação |
| --- | --- | --- | --- |
| `index.tsx:98` próximos prazos | Nenhuma tarefa com prazo. | Nenhum prazo no horizonte. Defina prazos para acompanhar o que vence. | Ver tarefas |
| `index.tsx:123` projetos | Nenhum projeto cadastrado. | Comece criando seu primeiro projeto. | Criar projeto |
| `tarefas/projetos.tsx:144` | Nenhum projeto cadastrado. | Projetos organizam tarefas, prazos e responsáveis. Crie o primeiro. | Novo projeto |
| `tarefas/index.tsx:127` minhas tarefas | Nenhuma tarefa atribuída a você no momento. | Sua fila está limpa. Nada atribuído a você agora. | — |
| `tarefas/quadro.tsx:79` | Crie um projeto na aba Projetos para usar o quadro. | O quadro precisa de um projeto para existir. Crie um e as colunas aparecem aqui. | Criar projeto |
| `tarefas/cronograma.tsx:67` | Crie um projeto na aba Projetos para ver o cronograma. | O cronograma nasce do primeiro projeto com datas. | Criar projeto |
| `tarefas/dashboard.tsx:67` | Crie um projeto na aba Projetos para ver os indicadores. | Os indicadores aparecem quando existir um projeto com tarefas. | Criar projeto |
| `quadro-tarefas.tsx:71` coluna vazia | Vazio | Arraste uma tarefa para cá. | — |
| `lista-tarefas.tsx:437` | Nenhuma tarefa encontrada. | Sem tarefas para estes filtros. Amplie o período ou limpe os filtros. | Limpar filtros |
| `cronograma-tarefas.tsx:53` | Nenhuma tarefa com data de início ou prazo definidos neste projeto. | Nenhuma tarefa tem datas ainda. Defina início e prazo para desenhar o cronograma. | — |
| `dashboard-projeto.tsx:157` | Nenhuma tarefa aberta. | Tudo concluído neste projeto. | — |
| `detalhe-tarefa.tsx:286` comentários | Nenhum comentário. | Abra a conversa desta tarefa. | — |
| `tarefa-extras.tsx:125` horas | Nenhuma hora apontada. | Aponte as horas trabalhadas para acompanhar o esforço real. | Apontar horas |
| `tarefa-extras.tsx:196` anexos | Nenhum anexo. | Anexe contratos, telas e arquivos de referência. | Anexar arquivo |
| `tarefa-extras.tsx:280` dependências | Nenhuma dependência. | Esta tarefa não espera nenhuma outra. Ligue uma dependência se houver ordem a respeitar. | Adicionar |
| `projeto-config.tsx:247` membros | Nenhum membro além do responsável. | Só o responsável tem acesso. Adicione quem vai trabalhar no projeto. | Adicionar membro |
| `tabela-ferramentas.tsx:179` | Nenhuma ferramenta encontrada. | Cadastre a primeira ferramenta (com filtro ativo: "Nenhuma ferramenta com estes filtros.") | Nova ferramenta / Limpar filtros |
| `visao-geral.tsx:154` renovações | Nenhuma renovação nos próximos 60 dias. | Nenhuma renovação nos próximos 60 dias. Horizonte tranquilo. | — |
| `aba-usuarios.tsx:167` | Nenhum usuário encontrado. | Nenhum usuário com esta busca. (base vazia: "Convide a primeira pessoa do time.") | Convidar |
| `aba-auditoria.tsx:203` | Nenhum registro no período. | Nada aconteceu no período selecionado. Amplie as datas para ver mais. | — |
| áreas (`aba-estrutura.tsx`) | (sem estado vazio hoje) | Áreas agrupam ferramentas e tarefas por time. Crie a primeira. | Nova área |
| categorias (`aba-estrutura.tsx`) | (sem estado vazio hoje) | Categorias classificam o tipo de ferramenta. Crie a primeira. | Nova categoria |

Ajusto qualquer linha desta tabela antes de implementar o bloco 2.

## Bloco 3 — Shell e navegação

- **Cabeçalho de contexto**: título da rota atual à esquerda, com caminho quando houver hierarquia (Tarefas › Projeto › ANT-142); ações contextuais e busca à direita. Cada rota declara seu título (metadado de rota consumido pelo shell).
- **Sidebar**: recolhível para trilho de ícones com tooltip, estado em localStorage; item ativo com barra vertical de 2px na marca + fundo sutil; bloco do usuário vira dropdown (perfil, densidade, tema, sair).
- **Mobile**: barra inferior fixa com ícone + rótulo (máx. 4 itens, `safe-area-inset-bottom`); busca e menu do usuário em cabeçalho compacto.

## Bloco 4 — Telas

- **Dashboard inicial**: corrige o `value={0}` calculando progresso real pelas tarefas concluídas de cada projeto (usando os dados já carregados pelos hooks atuais). Cabeçalho passa a mostrar nome, data por extenso e o estado real do dia (ou a ausência de urgências). KPIs com rótulo 11px, número 32px mono e linha de contexto (variação com seta e cor semântica, ou composição do número). Cards de lista com indicador de horizonte e altura previsível.
- **Ferramentas**: cabeçalho de tabela fixo, zebra no neutro 50, linha inteira clicável, valores em mono à direita, renovação com horizonte, avatar quadrado 20px com fallback de iniciais. Gráficos na escala do verdete, grid horizontal, sem borda, tooltip em card com valores em mono. Alertas em blocos com contador grande em mono; bloco vazio esmaecido, não removido.
- **Tarefas**: cartão de kanban com título 13px, código mono 11px, avatar, selo de prioridade e horizonte; cabeçalho de coluna com contador e soma de estimativas. Lista com linha-guia vertical na indentação de subtarefa e prioridade como selo.

## Qualidade (ao final de cada bloco)

Lint, build, varredura por cores literais fora de `styles.css`, teste dos dois temas e das duas densidades, e conferência de contraste AA em texto e bordas de controle.

## Notas técnicas

Tailwind v4: tokens em `@theme inline` dentro de `src/styles.css`; fontes só por `<link>` no `__root.tsx` (nunca `@import` remoto); utilitários customizados via `@utility`. Densidade e tema controlados por atributo/classe no `<html>` com variáveis CSS, sem re-render de árvore. Nenhum arquivo gerado (`routeTree.gen.ts`, integrações do backend) é tocado.
