# Antiparadigma OS — 4 blocos de conclusão

Entrego bloco por bloco, parando para sua validação. Ao fim de cada bloco: lint + build e relatório de erros.

## Bloco 1 — Correções críticas

**Credenciais**
- `.gitignore` recebe `.env` e `.env.*` (com exceção de `.env.example`), e crio `.env.example` com as chaves em branco.
- Observação honesta: não posso executar comandos git (`git rm --cached`) — o versionamento é gerenciado pela plataforma. Após o `.gitignore` eu aviso o que falta fazer do seu lado, se algo faltar.

**Guarda de rota**
- Novo `src/components/auth/protected-route.tsx` com `<ProtectedRoute module minLevel>`: skeleton enquanto carrega, tela "Você não tem acesso a este módulo" com link ao dashboard quando `pode()` reprova.
- Aplico em `/ferramentas` (view), no layout de `/tarefas` (view, cobrindo subrotas) e `/admin` (`admin`/`admin`).
- Nova rota pública-autenticada `/acesso-pendente`. Removo o toast + `signOut` de `useMeuAcesso`; `pending`/`suspended` passam a ser redirecionados para lá (com botão de sair), sem piscar tela.

**Recuperação de senha**
- Link "Esqueci minha senha" no login abrindo diálogo que chama `resetPasswordForEmail` com `redirectTo` para `/redefinir-senha`.
- Rota `/redefinir-senha` que consome o token da URL e faz `updateUser`.
- Mensagem de retorno idêntica exista ou não o e-mail.

**Migrações**
- Uma nova migração final e documentada: `REVOKE EXECUTE` de `anon` e `public` em todas as funções SECURITY DEFINER; `GRANT EXECUTE` a `authenticated` só nas não-trigger (`has_role`, `is_master_admin`, `has_module_access`, `can_access_project`, `can_edit_task`). Migrações antigas ficam intactas.

## Bloco 2 — Módulo /admin

`/admin` com cinco abas, cada aba em seu componente sob `src/components/admin/`, dados via novos hooks em `src/hooks/use-admin.ts`.

- **Usuários** — tabela (avatar, nome, e-mail, cargo, área, roles, status, último acesso), filtros por status/role, busca; ações por linha: aprovar, suspender, reativar, editar cargo/área, gerenciar roles. `master_admin` só concedível/removível por master_admin, com bloqueio do último master_admin. Botão "Convidar usuário".
- **Permissões** — matriz usuários × (ferramentas, tarefas, admin) com select none/view/edit/admin, salvamento por linha com loading e confirmação, aviso de que vale após o usuário recarregar a sessão.
- **Áreas e categorias** — CRUD de `areas` (nome, cor, responsável) e `tool_categories`; exclusão bloqueada quando em uso, mostrando a contagem de dependentes e oferecendo realocação.
- **Configurações** — edição de `settings.cambio` (USD/EUR) com prévia do impacto no total mensal antes de confirmar; ao salvar, recálculo de `custo_mensal_brl` das ferramentas em moeda estrangeira (touch nas linhas, o trigger `calc_custo_mensal` recalcula).
- **Auditoria** — leitura de `audit_log` com filtros por usuário, entidade, ação e período; diff legível antes/depois, paginação e export CSV.

**Convite (server function)**
- `src/lib/convidar-usuario.functions.ts` (mantido fora de `src/server/`, que é bloqueado no bundle cliente) com `createServerFn` + `requireSupabaseAuth`.
- Valida via `has_role` que o chamador é admin/master_admin; senão 403. Só então `await import('@/integrations/supabase/client.server')` e `inviteUserByEmail`.
- Preenche `profiles` (nome, cargo, área), `module_permissions`, role inicial e registra em `audit_log`.
- Verificação final: busca por `SUPABASE_SERVICE_ROLE_KEY` e pela chave no output do build de produção, com o resultado reportado explicitamente.

## Bloco 3 — /ferramentas

- **Detalhe `/ferramentas/$id`**: cabeçalho (logo, nome, fornecedor, status, editar/excluir); painel de dados nas mesmas seções do formulário; histórico de custos em linha + tabela previsto vs. realizado por competência; aba "Usuários com acesso" (CRUD de `tool_users`, nível de acesso, inativo, licenças contratadas vs. atribuídas com alerta de licença ociosa); aba "Histórico" (`audit_log` da ferramenta); anexos de contrato e notas fiscais do bucket.
- **Alertas**: blocos com contador e lista para renovações em 30/60/90 dias separadas, sem responsável, trials com renovação próxima, ativas sem custo no mês corrente, e renovação automática com prazo de cancelamento vencido ou a menos de 7 dias.
- **KPIs**: custo anual projetado e variação % vs. mês anterior.
- **Export CSV** da lista filtrada, extraindo o gerador de CSV de `lista-tarefas` para `src/lib/csv.ts` e reusando nos dois lugares.

## Bloco 4 — /tarefas

- **Projeto e tarefa na URL**: novas rotas `/tarefas/$projectId/{lista,quadro,calendario,cronograma,dashboard}` e `/tarefas/$projectId/$taskId` abrindo o detalhe sobre a visualização atual. `/tarefas` segue como "Minhas tarefas" multiprojeto. Última visualização por projeto guardada em `localStorage`. Rotas antigas (`/tarefas/lista` etc.) redirecionam para o último projeto usado.
- **Kanban com @dnd-kit** (instalo `@dnd-kit/core`, `sortable`, `modifiers`): reordenação dentro da coluna persistindo `tasks.ordem`, sensores de toque, `DragOverlay`, update otimista com rollback.
- **Recursos sem interface**: seletor de recorrência no detalhe gravando `tasks.recorrencia` (diária, semanal com dias, mensal, intervalo, data final) + selo visual na lista/quadro; gestão de `task_watchers`; autocomplete de `@` no comentário preenchendo `mencionados`; seção de dependências ("bloqueia"/"aguarda") com busca de tarefa e aviso quando bloqueada por tarefa não concluída (hoje existe hook e um componente inicial — completo a UI e o aviso).
- **Ações em lote**: barra flutuante com status, responsável, prioridade, prazo, mover de projeto e arquivar (hoje há uma versão parcial na lista; amplio para prazo e mover de projeto).
- **Sidebar de projetos**: sidebar secundária do módulo com áreas expansíveis, projetos aninhados, contador de tarefas abertas, busca e seção recolhida de arquivados.

## Notas técnicas

- Nada de novas tabelas, funções ou triggers, exceto a migração de grants do bloco 1.
- Toda leitura/escrita continua pelo cliente do navegador sob RLS; a única exceção é o convite, que usa service role apenas depois de validar a role do chamador.
- Rotas novas ficam sob `_authenticated/`; `/redefinir-senha` e `/acesso-pendente` são públicas.
- `head()` com título e descrição próprios em cada rota nova.
