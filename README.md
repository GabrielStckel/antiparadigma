# Antiparadigma

Construa o "Antiparadigma OS", um sistema interno de gestão da empresa Antiparadigma.

Stack: React + TypeScript + Tailwind + shadcn/ui + Supabase.

Idioma: português do Brasil em toda a interface, mensagens e dados.

Moeda base: BRL. Datas em DD/MM/AAAA. Números em formato pt-BR.

═══════════════════════════════════════

VISÃO GERAL

═══════════════════════════════════════

App único, multi-módulo, com sidebar persistente. Rotas:

/login          → autenticação

/               → dashboard hub

/ferramentas    → módulo de ferramentas e custos

/admin          → gestão de usuários e permissões

/perfil         → perfil do usuário logado

/tarefas        → placeholder por enquanto

Design: interface densa e funcional, estilo ferramenta interna (Linear, Notion),

não landing page. Tipografia legível, alta densidade de informação, sem

gradientes decorativos, sem emojis na UI. Tema claro e escuro. Responsivo

mobile-first usando os breakpoints padrão do Tailwind/shadcn.

═══════════════════════════════════════

BANCO DE DADOS

═══════════════════════════════════════

-- ENUMS

create type public.app_role as enum ('master_admin','admin','gestor','membro','visualizador');

create type public.app_module as enum ('ferramentas','tarefas','admin');

create type public.permission_level as enum ('none','view','edit','admin');

create type public.user_status as enum ('pending','active','suspended');

create type public.tool_status as enum ('ativa','trial','em_avaliacao','pausada','cancelada');

create type public.billing_cycle as enum ('mensal','trimestral','semestral','anual','vitalicio','uso','gratuito');

create type public.criticidade as enum ('critica','alta','media','baixa');

-- PERFIS (sem coluna de role)

create table public.profiles (

  id uuid primary key references auth.users(id) on delete cascade,

  nome_completo text not null,

  email text not null,

  avatar_url text,

  cargo text,

  area_id uuid,

  status public.user_status not null default 'pending',

  ultimo_acesso timestamptz,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()

);

-- ROLES EM TABELA SEPARADA

create table public.user_roles (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  role public.app_role not null,

  created_at timestamptz not null default now(),

  unique (user_id, role)

);

-- PERMISSÃO POR MÓDULO

create table public.module_permissions (

  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  module public.app_module not null,

  level public.permission_level not null default 'none',

  granted_by uuid references auth.users(id),

  created_at timestamptz not null default now(),

  unique (user_id, module)

);

-- AUDITORIA

create table public.audit_log (

  id uuid primary key default gen_random_uuid(),

  user_id uuid references auth.users(id),

  acao text not null,

  entidade text not null,

  entidade_id uuid,

  dados_antes jsonb,

  dados_depois jsonb,

  created_at timestamptz not null default now()

);

-- CONFIGURAÇÕES GLOBAIS

create table public.settings (

  chave text primary key,

  valor jsonb not null,

  updated_at timestamptz not null default now()

);

-- ÁREAS E CATEGORIAS

create table public.areas (

  id uuid primary key default gen_random_uuid(),

  nome text not null unique,

  cor text,

  responsavel_id uuid references auth.users(id),

  created_at timestamptz not null default now()

);

create table public.tool_categories (

  id uuid primary key default gen_random_uuid(),

  nome text not null unique,

  created_at timestamptz not null default now()

);

-- FERRAMENTAS

create table public.tools (

  id uuid primary key default gen_random_uuid(),

  nome text not null,

  fornecedor text,

  site_url text,

  logo_url text,

  categoria_id uuid references public.tool_categories(id),

  area_id uuid references public.areas(id),

  descricao_uso text not null,

  status public.tool_status not null default 'ativa',

  criticidade public.criticidade not null default 'media',

  responsavel_id uuid references auth.users(id),

  aprovada_por uuid references auth.users(id),

  plano text,

  ciclo public.billing_cycle not null default 'mensal',

  valor numeric(12,2) not null default 0,

  moeda text not null default 'BRL',

  num_licencas integer not null default 1,

  custo_mensal_brl numeric(12,2),

  forma_pagamento text,

  ultimos_4_digitos text,

  centro_custo text,

  data_contratacao date,

  data_renovacao date,

  renovacao_automatica boolean not null default true,

  prazo_cancelamento_dias integer,

  contrato_url text,

  contem_dados_sensiveis boolean not null default false,

  observacoes text,

  created_by uuid references auth.users(id),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()

);

-- HISTÓRICO REAL DE FATURAS

create table public.tool_costs (

  id uuid primary key default gen_random_uuid(),

  tool_id uuid not null references public.tools(id) on delete cascade,

  competencia date not null,

  valor numeric(12,2) not null,

  moeda text not null default 'BRL',

  taxa_cambio numeric(10,4),

  valor_brl numeric(12,2) not null,

  nota_fiscal_url text,

  observacao text,

  created_by uuid references auth.users(id),

  created_at timestamptz not null default now(),

  unique (tool_id, competencia)

);

-- QUEM USA CADA LICENÇA

create table public.tool_users (

  id uuid primary key default gen_random_uuid(),

  tool_id uuid not null references public.tools(id) on delete cascade,

  user_id uuid not null references auth.users(id) on delete cascade,

  nivel_acesso text,

  ativo boolean not null default true,

  created_at timestamptz not null default now(),

  unique (tool_id, user_id)

);

═══════════════════════════════════════

FUNÇÕES E TRIGGERS

═══════════════════════════════════════

Todas as funções de checagem devem ser SECURITY DEFINER com SET search_path = public,

para evitar recursão infinita nas policies de RLS:

- has_role(_user_id uuid, _role app_role) returns boolean

- is_master_admin(_user_id uuid) returns boolean

- has_module_access(_user_id uuid, _module app_module, _min_level permission_level)

  returns boolean — master_admin e admin sempre retornam true

Triggers:

- handle_new_user(): ao inserir em auth.users, cria o profile com status 'pending'

  e permissões 'none' em todos os módulos. Se for o PRIMEIRO usuário do sistema,

  atribui role 'master_admin' e status 'active'.

- set_updated_at() em profiles e tools.

- calc_custo_mensal(): recalcula tools.custo_mensal_brl sempre que valor, moeda,

  ciclo ou num_licencas mudarem. Conversão: mensal = valor × licenças;

  trimestral ÷ 3; semestral ÷ 6; anual ÷ 12; vitalício e gratuito = 0;

  uso = valor informado. Se moeda ≠ BRL, multiplica pela taxa de câmbio guardada

  em settings (chave 'cambio', ex: {"USD": 5.40, "EUR": 5.90}).

- log_audit(): grava em audit_log toda criação, alteração e exclusão em tools.

═══════════════════════════════════════

SEGURANÇA E RLS

═══════════════════════════════════════

Habilite RLS em todas as tabelas. A autorização real vive nas policies do Postgres,

não no front-end.

- profiles: usuário lê e edita o próprio; admin e master_admin leem e editam todos

- user_roles: usuário lê as próprias roles; somente master_admin insere, edita e apaga

- module_permissions: usuário lê as próprias; admin e master_admin gerenciam todas

- audit_log: leitura só para admin e master_admin; insert liberado para authenticated

- settings: leitura para authenticated; escrita só para admin e master_admin

- areas e tool_categories: leitura para authenticated; escrita para quem tem

  has_module_access('ferramentas','edit')

- tools, tool_costs, tool_users:

  · SELECT → has_module_access(auth.uid(),'ferramentas','view')

  · INSERT e UPDATE → has_module_access(auth.uid(),'ferramentas','edit')

  · DELETE → apenas admin e master_admin

A chave service_role nunca aparece no cliente. Qualquer Edge Function privilegiada

valida o JWT do chamador e checa a permissão explicitamente antes de agir.

═══════════════════════════════════════

AUTENTICAÇÃO

═══════════════════════════════════════

- Login com e-mail e senha, mais recuperação de senha.

- Signup público desabilitado: a tela de login não tem aba de cadastro.

- Mensagens de erro idênticas para e-mail inexistente e senha errada, para não

  revelar quais e-mails estão cadastrados.

- Usuário com status 'pending' ou 'suspended' vê uma tela de "acesso aguardando

  liberação" e é deslogado.

- Hook useAuth() expondo sessão, perfil, roles e permissões de módulo.

- Componente <ProtectedRoute module="..." minLevel="..."> protegendo cada rota.

- A sidebar renderiza apenas os módulos que o usuário tem permissão de ver.

- Atualiza profiles.ultimo_acesso a cada login.

═══════════════════════════════════════

PÁGINA /admin

═══════════════════════════════════════

Visível apenas para admin e master_admin. Contém:

- Tabela de usuários: avatar, nome, e-mail, cargo, área, role, status, último acesso

- Convidar novo usuário por e-mail, via Edge Function usando service_role no servidor

- Aprovar, suspender e reativar usuário

- Editar role, sendo que conceder ou remover 'master_admin' é exclusivo do master_admin

- Matriz de permissões: linhas = usuários, colunas = módulos, célula = select com

  none/view/edit/admin, salvando por linha com feedback visual

- Aba de gestão de áreas e categorias (criar, renomear, definir cor e responsável)

- Aba de configurações: taxas de câmbio USD e EUR

- Aba de auditoria: log filtrável por usuário, entidade e período

═══════════════════════════════════════

MÓDULO /ferramentas

═══════════════════════════════════════

Três abas.

ABA 1 — VISÃO GERAL

Cards de KPI no topo:

  · Custo mensal total em BRL

  · Custo anual projetado

  · Nº de ferramentas ativas

  · Nº de renovações nos próximos 30 dias

  · Variação percentual do custo vs. mês anterior

Gráficos com recharts:

  · Barras: custo mensal por área

  · Pizza: custo por categoria

  · Linha: evolução do custo total nos últimos 12 meses, a partir de tool_costs

Tabela "Top 10 ferramentas mais caras".

Painel de alertas:

  · Renovações em 30 / 60 / 90 dias

  · Ferramentas sem responsável definido

  · Trials com data de renovação próxima

  · Ferramentas ativas sem custo lançado no mês corrente

  · Ferramentas com renovação automática ligada e prazo de cancelamento vencendo

Ferramentas com status 'cancelada' ficam fora de todos os totais.

ABA 2 — FERRAMENTAS

Tabela densa: nome com logo, categoria, área, responsável, status, ciclo, valor

na moeda original, custo mensal em BRL, próxima renovação.

Busca textual, filtros por área, categoria, status e responsável, ordenação por

qualquer coluna, alternância entre visualização em tabela e em cards.

Botão "Nova ferramenta" abre um Sheet lateral com formulário em seções:

  · Identificação: nome, fornecedor, site, logo, categoria, área

  · Uso: descrição de uso, criticidade, responsável, contém dados sensíveis

  · Custo: plano, ciclo, valor, moeda, nº de licenças, forma de pagamento,

    últimos 4 dígitos, centro de custo

  · Contrato: data de contratação, data de renovação, renovação automática,

    prazo de cancelamento em dias, link do contrato

  · Observações

Clicar numa linha abre a página de detalhe com dados completos, histórico de

custos mensais em gráfico e tabela, usuários com acesso à ferramenta, e o log

de alterações vindo de audit_log.

Exportar a lista filtrada para CSV.

ABA 3 — CUSTOS

Lançamento mensal de faturas. Seletor de mês, lista de todas as ferramentas

ativas, campo de valor editável por linha, salvamento em lote.

Indicador visual de quais ferramentas ainda não tiveram custo lançado no mês.

Comparativo previsto (custo_mensal_brl) versus realizado (tool_costs), com

destaque para desvios acima de 10%.

Upload opcional de nota fiscal por lançamento.

═══════════════════════════════════════

DADOS INICIAIS

═══════════════════════════════════════

Categorias: Design, Marketing, Vendas, Financeiro, Desenvolvimento, IA,

Comunicação, Gestão, Infraestrutura, Jurídico, RH, Outros.

Áreas: Diretoria, Marketing, Comercial, Operações, Financeiro, Tecnologia, Criação.

Settings: chave 'cambio' com valor {"USD": 5.40, "EUR": 5.90}.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://antiparadigma.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3defffa3-d2c0-4314-9eb6-34188e58d035).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
