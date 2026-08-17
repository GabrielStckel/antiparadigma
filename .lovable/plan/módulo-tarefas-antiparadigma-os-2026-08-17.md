# Módulo Tarefas — Antiparadigma OS

Novo módulo em `/tarefas`, substituindo o placeholder. Reaproveita autenticação, áreas, permissões (`app_module = 'tarefas'`) e o audit_log já existentes. Mesmo padrão do módulo Ferramentas: TanStack Start, Tailwind v4, shadcn/ui, TanStack Query, zod, pt-BR, datas DD/MM/AAAA. Arrastar e soltar com @dnd-kit.

Hierarquia: Área → Projeto → Tarefa → Subtarefa (máximo 2 níveis de aninhamento). A tarefa-pai é contêiner; a subtarefa é a unidade executável com responsável, prazo e estimativa próprios. Quando há subtarefas, o pai agrega progresso, horas e prazo.

## Entrega em duas etapas

**Etapa 1 (agora):** banco completo, sidebar de projetos, Minhas tarefas, Lista, Quadro (kanban), painel de detalhe da tarefa, dashboard hub em `/` e busca global.

**Etapa 2 (próximo pedido):** Calendário, Cronograma (gantt com biblioteca pronta) e dashboard do projeto.

## Banco de dados (migração única)

Enums `task_priority`, `status_type`, `project_status`, `dependency_type`, `project_role` e as tabelas `projects`, `project_members`, `task_statuses`, `tasks`, `task_assignees`, `task_watchers`, `task_dependencies`, `task_checklist_items`, `task_comments`, `task_attachments`, `task_time_entries`, `task_activity` exatamente como especificado, com todos os índices pedidos e GRANTs por tabela.

Funções `SECURITY DEFINER` com `search_path = public`: `can_access_project` (admin/master_admin, owner ou membro) e `can_edit_task` (permissão `tarefas.edit` + acesso ao projeto, ou responsável/colaborador da tarefa).

Triggers: `gerar_codigo_tarefa` (ANT-1, ANT-2… via sequence), `calc_nivel_tarefa` (nível a partir do pai, bloqueia acima de 2), `impedir_ciclo_dependencia` (ciclos em dependências e na cadeia de pais), `rollup_tarefa_pai` (progresso pelo percentual de subtarefas concluídas, soma de estimativa e horas, maior prazo; propaga até o nível 0), `marcar_conclusao`, `somar_horas`, `gerar_recorrencia`, `log_task_activity` (status, responsável, prioridade, prazo, estimativa), `set_updated_at` em `projects` e `tasks`, e `log_audit` em `projects`.

RLS habilitada em todas as tabelas com as políticas descritas no pedido (leitura por acesso ao projeto; edição de tarefa por `can_edit_task`; comentário editável/apagável só pelo autor, com admin podendo apagar; horas apenas próprias, com gestor/admin lendo todas; `task_activity` somente leitura). Bucket privado `task-attachments` com políticas restritas a quem acessa o projeto da tarefa.

Semeadura: apenas o conjunto padrão global de status (Backlog, A fazer, Em andamento, Em revisão, Concluída, Cancelada). Ao criar projeto, o conjunto é copiado para ele e o owner pode renomear, recolorir, reordenar e criar novos. Nenhum projeto ou tarefa fictícia.

## Telas da etapa 1

**Layout do módulo** — sidebar secundária com áreas e projetos aninhados, contador de tarefas abertas por projeto, busca de projeto, botão "Novo projeto" e seção recolhida de arquivados. Barra superior com alternância Minhas tarefas | Lista | Quadro | Calendário | Cronograma (as duas últimas já aparecem, com aviso de etapa 2), lembrando a visualização escolhida por projeto.

**Minhas tarefas (`/tarefas`)** — prioridade máxima. Cards de resumo (abertas, atrasadas, concluídas na semana, horas apontadas na semana) e agrupamento por Atrasadas (vermelho), Para hoje, Esta semana, Depois, Sem prazo. Cada linha traz código, título, projeto, prioridade, prazo e status editável inline, com conclusão direta na lista.

**Lista (`/tarefas/:projectId`)** — tabela hierárquica expansível com subtarefas indentadas; colunas código, título, status, responsável, prioridade, prazo, estimativa, progresso e tags. Agrupamento por status/responsável/prioridade/tag, edição inline, adição rápida ao fim de cada grupo, filtros combináveis (responsável, prioridade, status, tag, período, apenas atrasadas, apenas minhas), busca por texto e código, seleção múltipla com ações em lote (status, responsável, prioridade, prazo, mover de projeto, arquivar) e exportação CSV.

**Quadro (`/tarefas/:projectId` visão quadro)** — colunas pelos status do projeto, arrastar e soltar entre e dentro das colunas persistindo status e ordem, cartão com código, título, avatar, prioridade colorida, prazo destacado se vencido, contador de subtarefas e ícones de comentário/anexo, cabeçalho com contagem e soma de estimativas. Agrupamento alternativo por responsável ou prioridade.

**Painel de detalhe (`/tarefas/:projectId/:taskId`)** — painel lateral largo sobre a visualização atual, com URL própria para compartilhar. Cabeçalho com código, título inline, status e botão de concluir; propriedades em duas colunas; descrição em markdown; subtarefas com criação rápida e progresso agregado; checklist reordenável; dependências com aviso de bloqueio; anexos por arrastar; apontamento de horas com histórico; abas de Comentários (menção @) e Histórico.

**Dashboard hub (`/`)** — a raiz deixa de redirecionar e passa a mostrar cards dos módulos: Ferramentas (custo mensal e ferramentas ativas) e Tarefas (minhas tarefas para hoje e número de atrasadas), respeitando as permissões do usuário.

**Busca global** — campo na barra superior (atalho ⌘K/Ctrl+K) buscando tarefas por código e título e ferramentas por nome, com navegação direta para o resultado.

## Detalhes técnicos

- Leituras e escritas via TanStack Query sobre o cliente do backend com o JWT do usuário; nenhuma chave de serviço no módulo. Autorização real no Postgres (RLS).
- Novas dependências: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers` (etapa 1) e uma biblioteca de gantt para React na etapa 2.
- Rotas sob `src/routes/_authenticated/tarefas/` (`index`, `$projectId`, `$projectId.$taskId`); componentes em `src/components/tarefas/`; hooks em `src/hooks/use-tarefas.ts`; formatação reaproveitando `src/lib/format.ts` com novos labels de prioridade e status.
- Ordenação por campo `ordem` numérico (média entre vizinhos) para evitar reescrever a coluna inteira ao arrastar.
- Ordem de execução: migração + storage → tipos e hooks → layout/sidebar do módulo → Minhas tarefas → Lista → Quadro → painel de detalhe → hub e busca global.
