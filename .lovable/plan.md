# Antiparadigma OS — sistema interno de gestão

Sistema interno multi-módulo em português do Brasil, com backend no Lovable Cloud (banco, login, e-mails e código de servidor já inclusos). Moeda BRL, datas DD/MM/AAAA, números pt-BR.

## Estrutura de telas

- `/auth` — login por e-mail e senha + recuperação de senha. Sem cadastro público. Erros genéricos ("Credenciais inválidas") para não revelar e-mails existentes.
- `/` — dashboard hub com atalhos e indicadores dos módulos liberados.
- `/ferramentas` — módulo de ferramentas e custos (3 abas).
- `/ferramentas/:id` — detalhe da ferramenta.
- `/admin` — usuários, permissões, áreas/categorias, câmbio e auditoria.
- `/perfil` — dados do usuário logado (nome, cargo, avatar, senha).
- `/tarefas` — placeholder "em construção".

Layout com sidebar persistente, densa e funcional (estilo Linear/Notion), tema claro/escuro, responsivo mobile-first, sem emojis nem gradientes decorativos. A sidebar mostra apenas os módulos permitidos.

## Banco de dados

Todos os enums, tabelas, funções, triggers e políticas descritos no pedido, aplicados como migração única:

- Enums: `app_role`, `app_module`, `permission_level`, `user_status`, `tool_status`, `billing_cycle`, `criticidade`.
- Tabelas: `profiles`, `user_roles`, `module_permissions`, `audit_log`, `settings`, `areas`, `tool_categories`, `tools`, `tool_costs`, `tool_users`.
- Funções `SECURITY DEFINER` com `search_path = public`: `has_role`, `is_master_admin`, `has_module_access` (admin e master_admin sempre true).
- Triggers: `handle_new_user` (cria perfil `pending` + permissões `none`; primeiro usuário do sistema vira `master_admin` ativo), `set_updated_at`, `calc_custo_mensal` (regras de ciclo + conversão pela chave `cambio` em settings), `log_audit` em `tools`.
- RLS habilitado em todas as tabelas, com as políticas exatamente como especificado (papéis nunca no perfil; concessão de `master_admin` só pelo master_admin). GRANTs por tabela incluídos.

Dados iniciais: 12 categorias, 7 áreas e `settings.cambio = {"USD":5.40,"EUR":5.90}`. Sem ferramentas fictícias.

Primeiro acesso: o primeiro usuário criado no sistema (a conta de Gabriel Skywalker) recebe automaticamente `master_admin` + status `active`; nenhum e-mail fica fixo no código.

## Autenticação e permissões

- Hook `useAuth()` expõe sessão, perfil, roles e permissões por módulo.
- `<ProtectedRoute module minLevel>` protege cada rota; rotas privadas ficam sob o layout autenticado.
- Usuário `pending`/`suspended` vê a tela "Acesso aguardando liberação" e é deslogado.
- `profiles.ultimo_acesso` atualizado a cada login.
- Toda leitura/escrita passa por funções de servidor autenticadas; a autorização real é do Postgres (RLS).

## /admin

- Tabela de usuários: avatar, nome, e-mail, cargo, área, role, status, último acesso.
- Convite por e-mail real: função de servidor privilegiada que valida o JWT do chamador e sua permissão de admin antes de disparar o convite; o convidado define a própria senha pelo link.
- Aprovar, suspender, reativar; editar role (master_admin apenas pelo master_admin).
- Matriz de permissões (usuários × módulos) com select none/view/edit/admin e salvamento por linha com feedback.
- Abas de áreas/categorias (criar, renomear, cor, responsável), configurações de câmbio USD/EUR e auditoria filtrável por usuário, entidade e período.

## /ferramentas

**Visão geral** — KPIs (custo mensal BRL, custo anual projetado, ferramentas ativas, renovações em 30 dias, variação % vs. mês anterior); gráficos recharts (barras por área, pizza por categoria, linha de 12 meses via `tool_costs`); Top 10 mais caras; painel de alertas (renovações 30/60/90 dias, sem responsável, trials próximos, ativas sem custo no mês, renovação automática com prazo de cancelamento vencendo). Status `cancelada` fora de todos os totais.

**Ferramentas** — tabela densa (nome com logo, categoria, área, responsável, status, ciclo, valor original, custo mensal BRL, próxima renovação), busca, filtros por área/categoria/status/responsável, ordenação por coluna, alternância tabela/cards, exportação CSV da lista filtrada. "Nova ferramenta" abre Sheet lateral com as seções Identificação, Uso, Custo, Contrato e Observações (validação com zod). Detalhe da ferramenta com dados completos, histórico de custos em gráfico e tabela, usuários com acesso e log de alterações do `audit_log`.

**Custos** — lançamento mensal: seletor de mês, lista de ferramentas ativas com valor editável por linha, salvamento em lote, indicador de pendências do mês, comparativo previsto vs. realizado destacando desvios acima de 10%, upload opcional de nota fiscal por lançamento.

## Detalhes técnicos

- Stack do projeto: TanStack Start (React 19 + TypeScript), Tailwind v4, shadcn/ui, TanStack Query, recharts, zod.
- Backend: Lovable Cloud (Postgres + Auth + Storage). Lógica de servidor via server functions autenticadas — sem chave de serviço no cliente.
- Storage: bucket para logos/contratos/notas fiscais com políticas restritas ao módulo de ferramentas.
- Formatação centralizada em utilitários pt-BR (BRL, datas, percentuais).
- Ordem de execução: Cloud + migração → auth/layout/permissões → /admin → /ferramentas (3 abas + detalhe) → /perfil, /tarefas, dashboard.
