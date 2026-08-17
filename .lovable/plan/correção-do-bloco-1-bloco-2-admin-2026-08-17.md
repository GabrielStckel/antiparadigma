# Correção do Bloco 1 + Bloco 2 (/admin)

## Parte A — Centralizar o bloqueio de conta no layout autenticado

1. `src/routes/_authenticated/route.tsx` — no `beforeLoad`, após confirmar a sessão, ler `profiles.status` do usuário. Se `pending` ou `suspended`, `throw redirect({ to: "/acesso-pendente" })`. Redirects são reencaminhados (`isRedirect`) caso haja try/catch. Toda rota autenticada, presente e futura, passa a ficar coberta.
2. `src/routes/login.tsx` — remover a consulta de status e o redirect para `/acesso-pendente`; manter apenas o update de `ultimo_acesso` e a navegação para `/ferramentas`.
3. `src/components/auth/protected-route.tsx` — remover `perfil`, `bloqueado`, o `useEffect` de redirect e o `useNavigate`. O componente fica só com: skeleton enquanto carrega e tela de "sem acesso" quando `pode(module, minLevel)` reprova.
4. `/acesso-pendente` permanece rota de topo, fora de `_authenticated` (já está), evitando loop. A própria página continua devolvendo para `/` quando o status virar `active`.

Validação: navegador logado como master_admin abrindo `/`, `/perfil`, `/ferramentas`, `/tarefas` e `/admin` sem redirect indevido.

## Parte B — Bloco 2: módulo /admin

`/admin` com cinco abas; cada aba um componente em `src/components/admin/`, dados por novos hooks em `src/hooks/use-admin.ts`.

- **Usuários** — tabela (nome, e-mail, cargo, área, roles, status, último acesso), filtros por status/role e busca; ações por linha: aprovar, suspender, reativar, editar cargo/área, gerenciar roles. `master_admin` só concedível/removível por master_admin, com bloqueio de remoção do último master_admin. Botão "Convidar usuário".
- **Permissões** — matriz usuários × (ferramentas, tarefas, admin) com select none/view/edit/admin, salvamento por linha com loading, e aviso de que vale após o usuário recarregar a sessão.
- **Áreas e categorias** — CRUD de `areas` (nome, cor, responsável) e `tool_categories`; exclusão bloqueada quando em uso, mostrando a contagem de dependentes.
- **Configurações** — edição de `settings.cambio` (USD/EUR) com prévia do impacto no total mensal antes de confirmar.
- **Auditoria** — leitura de `audit_log` com filtros por usuário, entidade, ação e período; diff legível antes/depois, paginação e export CSV (reusando `src/lib/csv.ts`, extraído de `lista-tarefas`).

### Recálculo de câmbio — uma única entrada de auditoria

Nova função de banco que, em uma transação: recalcula `custo_mensal_brl` das ferramentas em moeda estrangeira com as novas taxas, suprime a auditoria por linha nessa operação, e grava **uma** linha em `audit_log` com `acao = 'recalculo_cambio'`, `entidade = 'settings'` e, em `dados_antes`/`dados_depois`, as taxas antigas/novas, a quantidade de ferramentas afetadas e o delta total em BRL. Nenhuma tabela, trigger ou função existente é alterada.

### Convite de usuário (server function)

`src/lib/convidar-usuario.functions.ts` (fora de `src/server/`) com `createServerFn` + `requireSupabaseAuth`. Valida por `has_role` que o chamador é admin/master_admin — senão 403 — e só então `await import('@/integrations/supabase/client.server')` e `inviteUserByEmail`. Preenche `profiles` (nome, cargo, área), `module_permissions`, role inicial e registra em `audit_log`.

**Verificação de vazamento da service role** no build de produção, com os três resultados reportados explicitamente:
1. grep pelo prefixo do **valor** da chave (`sb_secret_` e `eyJ`), não pelo nome da variável;
2. grep por `client.server` e por `createSupabaseAdminClient`;
3. rastreio dos chunks do entrypoint do cliente para confirmar que o chunk com `convidar-usuario` não é carregado por ele.

## Notas técnicas

- Toda leitura/escrita continua pelo cliente do navegador sob RLS; a única exceção é o convite.
- `head()` próprio nas rotas novas; `/admin` segue sob `_authenticated` com `<ProtectedRoute module="admin" minLevel="admin">`.
- Ao fim: lint + build e relatório de erros.
