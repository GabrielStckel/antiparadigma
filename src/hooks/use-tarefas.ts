import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSessionUser } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Projeto = Database["public"]["Tables"]["projects"]["Row"];
export type Tarefa = Database["public"]["Tables"]["tasks"]["Row"];
export type StatusTarefa = Database["public"]["Tables"]["task_statuses"]["Row"];
export type Prioridade = Database["public"]["Enums"]["task_priority"];

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  urgente: "Urgente",
  alta: "Alta",
  normal: "Normal",
  baixa: "Baixa",
};

export const PRIORIDADE_COR: Record<Prioridade, string> = {
  urgente: "text-red-600 dark:text-red-400",
  alta: "text-amber-600 dark:text-amber-400",
  normal: "text-muted-foreground",
  baixa: "text-muted-foreground",
};

export const PROJETO_STATUS_LABEL: Record<string, string> = {
  planejado: "Planejado",
  ativo: "Ativo",
  pausado: "Pausado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export function useProjetos() {
  return useQuery({
    queryKey: ["projetos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("arquivado", false)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useStatusPadrao() {
  return useQuery({
    queryKey: ["status-padrao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_statuses")
        .select("*")
        .is("project_id", null)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useStatusProjeto(projectId: string | null) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["status-projeto", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_statuses")
        .select("*")
        .eq("project_id", projectId!)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useTodosStatus() {
  return useQuery({
    queryKey: ["status-todos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("task_statuses").select("*").order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useTarefas(filtros?: { projectId?: string | null }) {
  return useQuery({
    queryKey: ["tarefas", filtros?.projectId ?? "todas"],
    queryFn: async () => {
      let q = supabase.from("tasks").select("*").eq("arquivada", false);
      if (filtros?.projectId) q = q.eq("project_id", filtros.projectId);
      const { data, error } = await q.order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useMinhasTarefas() {
  const userId = useSessionUser();
  return useQuery({
    enabled: !!userId,
    queryKey: ["minhas-tarefas", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("arquivada", false)
        .eq("responsavel_id", userId!)
        .order("prazo", { nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useTarefa(id: string) {
  return useQuery({
    queryKey: ["tarefa", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSubtarefas(parentId: string) {
  return useQuery({
    queryKey: ["subtarefas", parentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("parent_task_id", parentId)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useChecklist(taskId: string) {
  return useQuery({
    queryKey: ["checklist", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_checklist_items")
        .select("*")
        .eq("task_id", taskId)
        .order("ordem");
      if (error) throw error;
      return data;
    },
  });
}

export function useComentarios(taskId: string) {
  return useQuery({
    queryKey: ["comentarios", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_comments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useHistoricoTarefa(taskId: string) {
  return useQuery({
    queryKey: ["historico-tarefa", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_activity")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function invalidarTarefas(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ["tarefas"] });
  void qc.invalidateQueries({ queryKey: ["minhas-tarefas"] });
  void qc.invalidateQueries({ queryKey: ["subtarefas"] });
}

export function useSalvarProjeto() {
  const qc = useQueryClient();
  const userId = useSessionUser();
  return useMutation({
    mutationFn: async (
      valores: Partial<Database["public"]["Tables"]["projects"]["Insert"]> & { id?: string },
    ) => {
      const { id, ...resto } = valores;
      if (id) {
        const { error } = await supabase.from("projects").update(resto).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("projects")
        .insert({
          ...(resto as Database["public"]["Tables"]["projects"]["Insert"]),
          owner_id: resto.owner_id ?? userId ?? null,
          created_by: userId ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["projetos"] });
      toast.success("Projeto salvo.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSalvarTarefa() {
  const qc = useQueryClient();
  const userId = useSessionUser();
  return useMutation({
    mutationFn: async (
      valores: Partial<Database["public"]["Tables"]["tasks"]["Insert"]> & { id?: string },
    ) => {
      const { id, ...resto } = valores;
      if (id) {
        const { error } = await supabase.from("tasks").update(resto).eq("id", id);
        if (error) throw error;
        return id;
      }
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...(resto as Database["public"]["Tables"]["tasks"]["Insert"]),
          created_by: userId ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: (id) => {
      invalidarTarefas(qc);
      void qc.invalidateQueries({ queryKey: ["tarefa", id] });
      toast.success("Tarefa salva.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useMudarStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, statusId }: { id: string; statusId: string }) => {
      const { error } = await supabase.from("tasks").update({ status_id: statusId }).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      invalidarTarefas(qc);
      void qc.invalidateQueries({ queryKey: ["tarefa", id] });
      void qc.invalidateQueries({ queryKey: ["historico-tarefa", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useExcluirTarefa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidarTarefas(qc);
      toast.success("Tarefa excluída.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useComentar(taskId: string) {
  const qc = useQueryClient();
  const userId = useSessionUser();
  return useMutation({
    mutationFn: async (conteudo: string) => {
      const { error } = await supabase
        .from("task_comments")
        .insert({ task_id: taskId, conteudo, user_id: userId! });
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["comentarios", taskId] }),
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useChecklistMutations(taskId: string) {
  const qc = useQueryClient();
  const recarregar = () => void qc.invalidateQueries({ queryKey: ["checklist", taskId] });

  const adicionar = useMutation({
    mutationFn: async (texto: string) => {
      const { error } = await supabase.from("task_checklist_items").insert({ task_id: taskId, texto });
      if (error) throw error;
    },
    onSuccess: recarregar,
    onError: (e: Error) => toast.error(e.message),
  });

  const alternar = useMutation({
    mutationFn: async ({ id, concluido }: { id: string; concluido: boolean }) => {
      const { error } = await supabase.from("task_checklist_items").update({ concluido }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: recarregar,
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: recarregar,
    onError: (e: Error) => toast.error(e.message),
  });

  return { adicionar, alternar, remover };
}

/* ------------------------------------------------------------------ *
 * Apontamento de horas
 * ------------------------------------------------------------------ */

export function useHoras(taskId: string) {
  return useQuery({
    queryKey: ["horas", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_time_entries")
        .select("*")
        .eq("task_id", taskId)
        .order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useHorasMutations(taskId: string) {
  const qc = useQueryClient();
  const userId = useSessionUser();
  const recarregar = () => {
    void qc.invalidateQueries({ queryKey: ["horas", taskId] });
    void qc.invalidateQueries({ queryKey: ["tarefa", taskId] });
    invalidarTarefas(qc);
  };

  const lancar = useMutation({
    mutationFn: async (v: { data: string; horas: number; descricao: string | null }) => {
      const { error } = await supabase
        .from("task_time_entries")
        .insert({ task_id: taskId, user_id: userId!, ...v });
      if (error) throw error;
    },
    onSuccess: () => {
      recarregar();
      toast.success("Horas lançadas.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_time_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: recarregar,
    onError: (e: Error) => toast.error(e.message),
  });

  return { lancar, remover };
}

/* ------------------------------------------------------------------ *
 * Anexos
 * ------------------------------------------------------------------ */

export function useAnexos(taskId: string) {
  return useQuery({
    queryKey: ["anexos", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_attachments")
        .select("*")
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAnexosMutations(taskId: string) {
  const qc = useQueryClient();
  const userId = useSessionUser();
  const recarregar = () => void qc.invalidateQueries({ queryKey: ["anexos", taskId] });

  const enviar = useMutation({
    mutationFn: async (arquivo: File) => {
      const caminho = `${taskId}/${Date.now()}-${arquivo.name.replace(/[^\w.\-]/g, "_")}`;
      const up = await supabase.storage.from("task-attachments").upload(caminho, arquivo);
      if (up.error) throw up.error;
      const { error } = await supabase.from("task_attachments").insert({
        task_id: taskId,
        nome_arquivo: arquivo.name,
        storage_path: caminho,
        tamanho_bytes: arquivo.size,
        mime_type: arquivo.type || null,
        uploaded_by: userId ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      recarregar();
      toast.success("Anexo enviado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async ({ id, storagePath }: { id: string; storagePath: string }) => {
      await supabase.storage.from("task-attachments").remove([storagePath]);
      const { error } = await supabase.from("task_attachments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: recarregar,
    onError: (e: Error) => toast.error(e.message),
  });

  return { enviar, remover };
}

export async function abrirAnexo(storagePath: string) {
  const { data, error } = await supabase.storage
    .from("task-attachments")
    .createSignedUrl(storagePath, 60);
  if (error || !data) {
    toast.error(error?.message ?? "Não foi possível abrir o anexo.");
    return;
  }
  window.open(data.signedUrl, "_blank", "noopener");
}

/* ------------------------------------------------------------------ *
 * Dependências
 * ------------------------------------------------------------------ */

export const DEPENDENCIA_LABEL: Record<string, string> = {
  bloqueia: "Bloqueia",
  aguarda: "Aguarda",
  relacionada: "Relacionada",
};

export function useDependencias(taskId: string) {
  return useQuery({
    queryKey: ["dependencias", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_dependencies")
        .select("*")
        .eq("task_id", taskId);
      if (error) throw error;
      return data;
    },
  });
}

export function useDependenciasMutations(taskId: string) {
  const qc = useQueryClient();
  const recarregar = () => void qc.invalidateQueries({ queryKey: ["dependencias", taskId] });

  const adicionar = useMutation({
    mutationFn: async (v: {
      dependsOnId: string;
      tipo: Database["public"]["Enums"]["dependency_type"];
    }) => {
      const { error } = await supabase
        .from("task_dependencies")
        .insert({ task_id: taskId, depends_on_id: v.dependsOnId, tipo: v.tipo });
      if (error) throw error;
    },
    onSuccess: () => {
      recarregar();
      toast.success("Dependência criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_dependencies").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: recarregar,
    onError: (e: Error) => toast.error(e.message),
  });

  return { adicionar, remover };
}

/* ------------------------------------------------------------------ *
 * Membros do projeto
 * ------------------------------------------------------------------ */

export const PAPEL_PROJETO_LABEL: Record<string, string> = {
  owner: "Responsável",
  editor: "Editor",
  leitor: "Leitor",
};

export function useMembrosProjeto(projectId: string | null) {
  return useQuery({
    enabled: !!projectId,
    queryKey: ["membros-projeto", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", projectId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useMembrosMutations(projectId: string) {
  const qc = useQueryClient();
  const recarregar = () => void qc.invalidateQueries({ queryKey: ["membros-projeto", projectId] });

  const adicionar = useMutation({
    mutationFn: async (v: {
      userId: string;
      papel: Database["public"]["Enums"]["project_role"];
    }) => {
      const { error } = await supabase
        .from("project_members")
        .insert({ project_id: projectId, user_id: v.userId, papel: v.papel });
      if (error) throw error;
    },
    onSuccess: () => {
      recarregar();
      toast.success("Membro adicionado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("project_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: recarregar,
    onError: (e: Error) => toast.error(e.message),
  });

  return { adicionar, remover };
}

/* ------------------------------------------------------------------ *
 * Status do projeto (renomear, recolorir, reordenar)
 * ------------------------------------------------------------------ */

export function useStatusMutations(projectId: string) {
  const qc = useQueryClient();
  const recarregar = () => {
    void qc.invalidateQueries({ queryKey: ["status-projeto", projectId] });
    void qc.invalidateQueries({ queryKey: ["status-todos"] });
  };

  const salvar = useMutation({
    mutationFn: async (v: {
      id?: string;
      nome: string;
      cor: string;
      tipo: Database["public"]["Enums"]["status_type"];
      ordem: number;
    }) => {
      const { id, ...resto } = v;
      if (id) {
        const { error } = await supabase.from("task_statuses").update(resto).eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("task_statuses")
        .insert({ ...resto, project_id: projectId });
      if (error) throw error;
    },
    onSuccess: () => {
      recarregar();
      toast.success("Status salvo.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("task_statuses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      recarregar();
      toast.success("Status removido.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { salvar, remover };
}

/* ------------------------------------------------------------------ *
 * Ações em lote e arquivamento
 * ------------------------------------------------------------------ */

export function useAcoesLote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      valores,
    }: {
      ids: string[];
      valores: Database["public"]["Tables"]["tasks"]["Update"];
    }) => {
      const { error } = await supabase.from("tasks").update(valores).in("id", ids);
      if (error) throw error;
      return ids.length;
    },
    onSuccess: (n) => {
      invalidarTarefas(qc);
      toast.success(`${n} tarefa(s) atualizada(s).`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useProjetosArquivados() {
  return useQuery({
    queryKey: ["projetos-arquivados"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("arquivado", true)
        .order("nome");
      if (error) throw error;
      return data;
    },
  });
}
