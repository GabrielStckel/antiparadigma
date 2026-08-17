import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Ferramenta = Database["public"]["Tables"]["tools"]["Row"];
export type CustoFerramenta = Database["public"]["Tables"]["tool_costs"]["Row"];

export function useFerramentas() {
  return useQuery({
    queryKey: ["ferramentas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tools").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("areas").select("id, nome, cor").order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tool_categories").select("id, nome").order("nome");
      if (error) throw error;
      return data;
    },
  });
}

export function usePerfis() {
  return useQuery({
    queryKey: ["perfis-lista"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id, nome_completo").order("nome_completo");
      if (error) throw error;
      return data;
    },
  });
}

export function useCambio() {
  return useQuery({
    queryKey: ["cambio"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("valor").eq("chave", "cambio").maybeSingle();
      if (error) throw error;
      return (data?.valor ?? {}) as Record<string, number>;
    },
  });
}

export function useCustos(competencia: string) {
  return useQuery({
    queryKey: ["custos", competencia],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tool_costs")
        .select("*")
        .eq("competencia", competencia)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
