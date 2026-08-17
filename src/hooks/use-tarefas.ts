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
