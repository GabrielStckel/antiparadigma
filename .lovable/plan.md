# Refatoração de design do Antiparadigma OS

Somente camada visual: nenhuma alteração em queries, hooks de dados, RLS, migrações ou regras de negócio. Quatro blocos, com pausa para validação entre cada um.

Verificado no repositório antes de planejar: `src/styles.css` está na paleta slate padrão do shadcn, sem `--font-*`; `src/routes/_authenticated/index.tsx:119` tem `<Progress value={0} />` chumbado; `#6366f1` aparece em 4 pontos (`aba-estrutura.tsx` ×3, `projeto-config.tsx` ×1); cores literais red/amber em `use-tarefas.ts`, `tarefas/index.tsx`, `tarefa-extras.tsx`, `lista-tarefas.tsx`, `cronograma-tarefas.tsx`; `text-[10px]`/`text-[11px]` em 13 arquivos.

## Bloco 1 — Fundação do design system

- **Tipografia**: `preconnect` + `<link>` para Geist (400/500/600) e Geist Mono (400/500) no `head()` do `__root.tsx`; tokens `--font-sans` / `--font-mono` em `@theme inline`; `--font-sans` no body.
- **Regra permanente**: todo numeral lido pelo usuário (BRL, datas, códigos, contadores, %, horas, eixos de gráfico) em mono com `tabular-nums`. Entra como utilitário `@utility num` em `styles.css` e passa a ser aplicado nas telas ao longo dos blocos 2 a 4; também vai para a memória do projeto.
- **Neutros quentes**: rampa convertida para oklch com matiz ~70. background=50, card=branco, muted=100, border=200, muted-foreground=600, foreground=900. Escuro inverte a rampa mantendo o matiz quente.
- **Marca**: `--primary` = #2C5F5A em oklch, foreground claro; uso restrito a botão primário, selecionado, foco, links e série principal de gráfico. Clareado no escuro para AA.
- **Semânticas**: `--success` #4E7C4A, `--warning` #A8762C, `--danger` #9C4038, cada um com variantes `-bg`, `-border`, `-fg` registradas em `@theme inline`. Substituição de todos os literais red/amber e dos quatro `#6366f1` (o color picker de área/status passa a oferecer a paleta de tokens da marca).
- **Gráficos**: chart-1..5 como cinco degraus derivados do verdete + um neutro.
- **Escala tipográfica**: tokens `text-label` (11px, uppercase, tracking .1em), `text-aux` (12px), `text-base-ui` (13px, base da interface), `text-section` (15px/500), `text-page` (20px/500, tracking -.015em), `text-kpi` (32px mono/500, tracking -.02em). Todos os `text-[10px]`/`text-[11px]` eliminados; título de página e de seção passam a ser visualmente distintos.
- **Densidade**: atributo `data-density` no `<html>` com `confortavel` (padrão) e `compacto`, controlando altura de linha, padding de célula e gaps via variáveis CSS; hook + botão no /perfil, persistido em localStorage (mesmo padrão do tema já existente).
- **Foco**: `:focus-visible` global com anel 2px na cor de marca e offset 2px.

## Bloco 2 — Assinatura e componentes base

- `src/components/ui/horizonte.tsx`: barra de 6px, trilho no neutro 200, preenchimento proporcional à aproximação da data numa janela padrão de 90 dias, rótulo de distância em mono ("4 dias", "vencido há 3 dias"). Faixas: >60 neutro, 30–60 warning, <30 danger, vencido danger com trilho cheio. Sem animação sob `prefers-reduced-motion`.
- Aplicado em: coluna de renovação da tabela de ferramentas, alertas da visão geral, coluna de prazo da lista de tarefas, cartão do kanban, próximos prazos do dashboard inicial e detalhe da tarefa.
- `selo.tsx`: componente único para status e prioridade (fundo claro + texto escuro do mesmo token, 11px uppercase tracking largo), substituindo as classes de cor espalhadas.
- `celula-num.tsx`: célula de tabela alinhada à direita, mono, tabular.
- `estado-vazio.tsx`: ícone discreto, frase-convite e ação principal opcional; unifica as ~16 mensagens "Nenhum X" existentes, reescritas como convite.
- Skeletons com a forma do conteúdo real (linhas de tabela, cartões de KPI, colunas de kanban).

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
