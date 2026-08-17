# Tarefas: fim dos submits silenciosos e estado "sem projeto"

Nenhum dado será semeado. Só interface, validação e feedback.

## 1. Varredura (item 6) — onde uma ação pode falhar sem resposta

Confirmado no código:

**Retorno silencioso no submit (usuário clica e nada acontece, sem mensagem)**
- `tarefa-sheet.tsx:70` — `if (!titulo.trim() || !projectId || !statusId) return;`
- `projeto-dialog.tsx:62` — `if (!nome.trim()) return;`
- `projeto-config.tsx:172` — novo status sem nome: `if (!nome.trim()) return;`
- `detalhe-tarefa.tsx:249` — item de checklist vazio
- `detalhe-tarefa.tsx:292` — comentário vazio
- `tarefa-extras.tsx:48` — horas inválidas (`!n || n <= 0`), sem dizer o motivo

**Botão desabilitado sem explicar o que falta**
- `tarefa-sheet.tsx` (Salvar), `projeto-dialog.tsx` (Salvar)
- `/tarefas/quadro` — "Nova tarefa" desabilitado quando não há projeto selecionado
- `custos-lote.tsx` e `adicao-rapida.tsx` — botões de ação sem tooltip de motivo

**Mutações sem `onError` visível (falha de RLS/rede fica invisível)**
- `use-admin.ts`: `definirPapel`, `salvarArea`, `excluirArea`, `salvarCategoria`, `excluirCategoria`, `salvarPermissoes` — só têm `onSuccess: invalidar`; o toast existe apenas em alguns pontos de chamada (`aba-estrutura`, `aba-usuarios`, `aba-permissoes`), então caminhos que não passam por eles falham em silêncio.
- Exclusão de área/categoria em uso: hoje há checagem local com toast, mas o erro de FK do banco não tem tratamento próprio.

**Estados vazios sem explicação** (relacionado ao item 4)
- `/tarefas/lista`, `/tarefas/quadro`, `/tarefas/calendario`, `/tarefas/cronograma`, `/tarefas/dashboard` renderizam vazio quando não existe projeto algum.

Correções abaixo cobrem tudo isso.

## 2. Padrão único de validação

Criar `src/lib/validacao-form.ts` + hook `useErrosForm`:
- `marcar(campo, mensagem)` / `limpar(campo)`, mapa `campo -> mensagem`.
- Componente `MensagemErro` (12px, `text-danger`) renderizado abaixo do campo.
- Campo inválido recebe `aria-invalid` e borda `border-danger`.
- No submit: valida tudo, marca todos os inválidos, dá `focus()` no primeiro (via `ref` registrado) e não chama a mutação.
- Botões de submit ficam **habilitados**; onde permanecerem desabilitados por regra de permissão, ganham `Tooltip` com o motivo.

Aplicar em: `tarefa-sheet.tsx`, `projeto-dialog.tsx`, `projeto-config.tsx`, `detalhe-tarefa.tsx` (checklist e comentário), `tarefa-extras.tsx` (horas), e adicionar `onError` com toast nas mutações listadas de `use-admin.ts`.

## 3. Sheet de tarefa sem projeto disponível

Em `tarefa-sheet.tsx`, quando a lista de projetos elegíveis estiver vazia (e já carregada):
- Em vez dos campos, mostrar bloco de bloqueio: "Toda tarefa pertence a um projeto. Crie o primeiro para começar." + botão "Criar primeiro projeto".
- O botão abre `ProjetoDialog` por cima; ao salvar, o `id` retornado por `useSalvarProjeto` é usado para voltar ao formulário de tarefa já com o projeto selecionado (e o status padrão criado pelo trigger é carregado automaticamente).
- Enquanto os projetos carregam, mostrar skeleton, não estado de bloqueio.

## 4. Select de status dependente

Sem projeto selecionado: select de status `disabled`, placeholder "Selecione um projeto primeiro", com texto auxiliar. Com projeto selecionado e status carregando: "Carregando status...".

## 5. Filtro de projetos como destino

Novo `useProjetosDisponiveis()` (deriva de `useProjetos()`, sem query nova): exclui `arquivado`, `status = 'concluido'` e `status = 'cancelado'`. Usado apenas nos seletores de destino de tarefa (`tarefa-sheet`) e no seletor do quadro/calendário/cronograma. `/tarefas/projetos` continua listando tudo. Se a tarefa em edição pertencer a um projeto concluído, ele permanece visível na lista para não quebrar a edição.

## 6. Estado consistente "nenhum projeto" nas telas

Novo componente `src/components/tarefas/sem-projetos.tsx` (título, explicação, botão que abre `ProjetoDialog`), usado em:
- `/tarefas/lista`, `/tarefas/quadro`, `/tarefas/calendario`, `/tarefas/cronograma`, `/tarefas/dashboard`.
- Em `/tarefas/quadro`, a seleção automática do primeiro projeto passa a tratar lista vazia (não seleciona e mostra o estado).

## Notas técnicas

- Sem migração, sem alteração de schema, RLS, hooks de dados ou regra de negócio (apenas `onError` de toast e um derivado de filtro no cliente).
- Tokens já existentes: `text-danger`, `border-danger`, escala tipográfica, `num`. Nada de cor literal.
- Validação após: tipos, lint e verificação no navegador criando um projeto pelo fluxo de bloqueio e uma tarefa em seguida.
