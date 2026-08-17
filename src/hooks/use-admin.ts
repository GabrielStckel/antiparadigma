import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Papel, Nivel } from "@/hooks/use-auth";

/** Nenhuma mutação de admin pode falhar em silêncio. */
const erroToast = (e: Error) =>
  toast.error(e.message || "Não foi possível concluir a ação. Tente novamente.");

export type Perfil = Database["public"]["Tables"]["profiles"]["Row"];
export type Modulo = Database["public"]["Enums"]["app_module"];
export type StatusUsuario = Database["public"]["Enums"]["user_status"];

export type UsuarioAdmin = Perfil & {
  papeis: Papel[];
  permissoes: Record<Modulo, Nivel>;
};

const MODULOS: Modulo[] = ["ferramentas", "tarefas", "admin"];

export function useUsuariosAdmin() {
  return useQuery({
    queryKey: ["admin", "usuarios"],
    queryFn: async (): Promise<UsuarioAdmin[]> => {
      const [perfis, papeis, permissoes] = await Promise.all([
        supabase.from("profiles").select("*").order("nome_completo"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("module_permissions").select("user_id, module, level"),
      ]);
      if (perfis.error) throw perfis.error;
      if (papeis.error) throw papeis.error;
      if (permissoes.error) throw permissoes.error;

      return (perfis.data ?? []).map((p) => {
        const base = Object.fromEntries(MODULOS.map((m) => [m, "none"])) as Record<Modulo, Nivel>;
        for (const perm of permissoes.data ?? []) {
          if (perm.user_id === p.id) base[perm.module] = perm.level as Nivel;
        }
        return {
          ...p,
          papeis: (papeis.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as Papel),
          permissoes: base,
        };
      });
    },
  });
}

function useInvalidarUsuarios() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "usuarios"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "auditoria"] });
    void queryClient.invalidateQueries({ queryKey: ["meu-acesso"] });
  };
}

export function useMutacoesUsuario() {
  const invalidar = useInvalidarUsuarios();

  const alterarStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: StatusUsuario }) => {
      const { error } = await supabase.from("profiles").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidar,
    onError: erroToast,
  });

  const salvarPerfil = useMutation({
    mutationFn: async ({
      id,
      nome_completo,
      cargo,
      area_id,
    }: {
      id: string;
      nome_completo: string;
      cargo: string | null;
      area_id: string | null;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ nome_completo, cargo, area_id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidar,
    onError: erroToast,
  });

  const alternarPapel = useMutation({
    mutationFn: async ({
      userId,
      role,
      conceder,
    }: {
      userId: string;
      role: Papel;
      conceder: boolean;
    }) => {
      if (conceder) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
    },
    onSuccess: invalidar,
    onError: erroToast,
  });

  const salvarPermissoes = useMutation({
    mutationFn: async ({
      userId,
      permissoes,
    }: {
      userId: string;
      permissoes: Record<Modulo, Nivel>;
    }) => {
      for (const modulo of MODULOS) {
        const nivel = permissoes[modulo];
        const { error: delErr } = await supabase
          .from("module_permissions")
          .delete()
          .eq("user_id", userId)
          .eq("module", modulo);
        if (delErr) throw delErr;
        if (nivel !== "none") {
          const { error } = await supabase
            .from("module_permissions")
            .insert({ user_id: userId, module: modulo, level: nivel });
          if (error) throw error;
        }
      }
    },
    onSuccess: invalidar,
    onError: erroToast,
  });

  return { alterarStatus, salvarPerfil, alternarPapel, salvarPermissoes };
}

export function useAreasAdmin() {
  return useQuery({
    queryKey: ["admin", "areas"],
    queryFn: async () => {
      const [areas, tools, projetos, perfis] = await Promise.all([
        supabase.from("areas").select("*").order("nome"),
        supabase.from("tools").select("area_id"),
        supabase.from("projects").select("area_id"),
        supabase.from("profiles").select("area_id"),
      ]);
      if (areas.error) throw areas.error;
      const usos = (id: string) =>
        (tools.data ?? []).filter((t) => t.area_id === id).length +
        (projetos.data ?? []).filter((p) => p.area_id === id).length +
        (perfis.data ?? []).filter((p) => p.area_id === id).length;
      return (areas.data ?? []).map((a) => ({ ...a, usos: usos(a.id) }));
    },
  });
}

export function useCategoriasAdmin() {
  return useQuery({
    queryKey: ["admin", "categorias"],
    queryFn: async () => {
      const [cats, tools] = await Promise.all([
        supabase.from("tool_categories").select("*").order("nome"),
        supabase.from("tools").select("categoria_id"),
      ]);
      if (cats.error) throw cats.error;
      return (cats.data ?? []).map((c) => ({
        ...c,
        usos: (tools.data ?? []).filter((t) => t.categoria_id === c.id).length,
      }));
    },
  });
}

export function useMutacoesEstrutura() {
  const queryClient = useQueryClient();
  const invalidar = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
    void queryClient.invalidateQueries({ queryKey: ["areas"] });
    void queryClient.invalidateQueries({ queryKey: ["categorias"] });
  };

  const salvarArea = useMutation({
    mutationFn: async (a: {
      id?: string;
      nome: string;
      cor: string | null;
      responsavel_id: string | null;
    }) => {
      if (a.id) {
        const { error } = await supabase
          .from("areas")
          .update({ nome: a.nome, cor: a.cor, responsavel_id: a.responsavel_id })
          .eq("id", a.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("areas")
        .insert({ nome: a.nome, cor: a.cor, responsavel_id: a.responsavel_id });
      if (error) throw error;
    },
    onSuccess: invalidar,
    onError: erroToast,
  });

  const excluirArea = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("areas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidar,
    onError: erroToast,
  });

  const salvarCategoria = useMutation({
    mutationFn: async (c: { id?: string; nome: string }) => {
      if (c.id) {
        const { error } = await supabase
          .from("tool_categories")
          .update({ nome: c.nome })
          .eq("id", c.id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("tool_categories").insert({ nome: c.nome });
      if (error) throw error;
    },
    onSuccess: invalidar,
    onError: erroToast,
  });

  const excluirCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tool_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidar,
    onError: erroToast,
  });

  return { salvarArea, excluirArea, salvarCategoria, excluirCategoria };
}

export function useAplicarCambio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taxas: Record<string, number>) => {
      const { data, error } = await supabase.rpc("aplicar_cambio", { _taxas: taxas });
      if (error) throw error;
      return data as {
        ferramentas_afetadas: number;
        total_antes: number;
        total_depois: number;
        delta_brl: number;
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cambio"] });
      void queryClient.invalidateQueries({ queryKey: ["ferramentas"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "auditoria"] });
    },
    onError: erroToast,
  });
}

export type FiltrosAuditoria = {
  usuario: string;
  entidade: string;
  acao: string;
  de: string;
  ate: string;
  pagina: number;
};

export const TAMANHO_PAGINA = 50;

export function useAuditoria(f: FiltrosAuditoria) {
  return useQuery({
    queryKey: ["admin", "auditoria", f],
    queryFn: async () => {
      let q = supabase
        .from("audit_log")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(f.pagina * TAMANHO_PAGINA, f.pagina * TAMANHO_PAGINA + TAMANHO_PAGINA - 1);
      if (f.usuario !== "todos") q = q.eq("user_id", f.usuario);
      if (f.entidade !== "todos") q = q.eq("entidade", f.entidade);
      if (f.acao !== "todos") q = q.eq("acao", f.acao);
      if (f.de) q = q.gte("created_at", `${f.de}T00:00:00`);
      if (f.ate) q = q.lte("created_at", `${f.ate}T23:59:59`);
      const { data, error, count } = await q;
      if (error) throw error;
      return { linhas: data ?? [], total: count ?? 0 };
    },
  });
}
