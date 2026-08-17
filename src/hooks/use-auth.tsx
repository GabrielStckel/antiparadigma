import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export type Papel = "master_admin" | "admin" | "gestor" | "membro" | "visualizador";
export type Nivel = "none" | "view" | "edit" | "admin";

const RANK: Record<Nivel, number> = { none: 0, view: 1, edit: 2, admin: 3 };

export function useSessionUser() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUserId(session?.user.id ?? null);
      if (event === "SIGNED_OUT") queryClient.clear();
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient]);

  return userId;
}

export function useMeuAcesso() {
  const userId = useSessionUser();

  const query = useQuery({
    enabled: !!userId,
    queryKey: ["meu-acesso", userId],
    queryFn: async () => {
      const [perfil, papeis, permissoes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId!),
        supabase.from("module_permissions").select("module, level").eq("user_id", userId!),
      ]);
      if (perfil.error) throw perfil.error;
      return {
        perfil: perfil.data,
        papeis: (papeis.data ?? []).map((p) => p.role as Papel),
        permissoes: permissoes.data ?? [],
      };
    },
  });

  const perfil = query.data?.perfil ?? null;
  const papeis = query.data?.papeis ?? [];
  const isAdmin = papeis.includes("admin") || papeis.includes("master_admin");

  const nivel = (modulo: "ferramentas" | "tarefas" | "admin"): Nivel => {
    if (isAdmin) return "admin";
    const p = query.data?.permissoes.find((x) => x.module === modulo);
    return (p?.level as Nivel) ?? "none";
  };

  const pode = (modulo: "ferramentas" | "tarefas" | "admin", minimo: Nivel) =>
    RANK[nivel(modulo)] >= RANK[minimo];

  return { userId, perfil, papeis, isAdmin, nivel, pode, carregando: query.isLoading };
}
