import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ferramenta } from "@/hooks/use-ferramentas";
import { supabase } from "@/integrations/supabase/client";

export function AdicaoRapida({
  podeEditar,
  foco,
  destaque,
  onCriada,
}: {
  podeEditar: boolean;
  /** Foca o campo de nome ao montar. */
  foco?: boolean;
  destaque?: boolean;
  onCriada?: (f: Ferramenta) => void;
}) {
  const [nome, setNome] = useState("");
  const [valor, setValor] = useState("");
  const refNome = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const criar = useMutation({
    mutationFn: async () => {
      const limpo = nome.trim();
      if (!limpo) throw new Error("Informe o nome da ferramenta.");
      const { data: sess } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("tools")
        .insert({
          nome: limpo,
          descricao_uso: "",
          status: "ativa",
          ciclo: "mensal",
          moeda: "BRL",
          num_licencas: 1,
          valor: Number(valor.replace(/\./g, "").replace(",", ".")) || 0,
          created_by: sess.user?.id ?? null,
        })
        .select("*")
        .single();
      if (error) throw error;
      return data as Ferramenta;
    },
    onSuccess: (criada) => {
      void queryClient.invalidateQueries({ queryKey: ["ferramentas"] });
      setNome("");
      setValor("");
      refNome.current?.focus();
      toast.success(`“${criada.nome}” cadastrada.`, {
        description: "Faltam área, categoria, responsável e descrição de uso.",
        action: { label: "Completar dados", onClick: () => onCriada?.(criada) },
      });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível cadastrar."),
  });

  if (!podeEditar) return null;

  return (
    <div
      className={
        destaque
          ? "rounded-md border border-primary/40 bg-primary/5 p-3"
          : "rounded-md border bg-card p-2.5"
      }
    >
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!criar.isPending) criar.mutate();
        }}
      >
        <div className="min-w-48 flex-1 space-y-1">
          <Label htmlFor="rapida-nome" className="text-[11px] text-muted-foreground">
            Adicionar ferramenta
          </Label>
          <Input
            id="rapida-nome"
            ref={refNome}
            autoFocus={foco}
            className="h-8 text-sm"
            placeholder="Nome (ex.: Figma)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="w-36 space-y-1">
          <Label htmlFor="rapida-valor" className="text-[11px] text-muted-foreground">
            Valor mensal (R$)
          </Label>
          <Input
            id="rapida-valor"
            className="h-8 num text-sm"
            inputMode="decimal"
            placeholder="0,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" className="h-8" disabled={criar.isPending || !nome.trim()}>
          <Plus className="size-4" />
          {criar.isPending ? "Adicionando…" : "Adicionar"}
        </Button>
        <p className="w-full text-[11px] text-muted-foreground sm:w-auto">
          Enter cadastra e mantém o foco para a próxima.
        </p>
      </form>
    </div>
  );
}
