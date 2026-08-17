import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustos, type Ferramenta } from "@/hooks/use-ferramentas";
import { supabase } from "@/integrations/supabase/client";
import { brl, competenciaBR, num } from "@/lib/format";

type Linha = { valor: string; observacao: string; arquivo: File | null };

const competenciaAtual = () => new Date().toISOString().slice(0, 7);

export function CustosLote({
  ferramentas,
  cambio,
  podeEditar,
}: {
  ferramentas: Ferramenta[];
  cambio: Record<string, number>;
  podeEditar: boolean;
}) {
  const [mes, setMes] = useState(competenciaAtual());
  const competencia = `${mes}-01`;
  const { data: lancados } = useCustos(competencia);
  const [linhas, setLinhas] = useState<Record<string, Linha>>({});
  const queryClient = useQueryClient();

  const ativas = useMemo(
    () => ferramentas.filter((f) => f.status === "ativa" || f.status === "trial"),
    [ferramentas],
  );

  const lancadoPor = useMemo(
    () => Object.fromEntries((lancados ?? []).map((c) => [c.tool_id, c])),
    [lancados],
  );

  const set = (id: string, patch: Partial<Linha>) =>
    setLinhas((l) => ({
      ...l,
      [id]: { valor: "", observacao: "", arquivo: null, ...l[id], ...patch },
    }));

  const taxa = (moeda: string) => (moeda === "BRL" ? 1 : Number(cambio[moeda] ?? 1));

  const totalLancado = (lancados ?? []).reduce((s, c) => s + Number(c.valor_brl ?? 0), 0);

  const salvar = useMutation({
    mutationFn: async () => {
      const { data: sess } = await supabase.auth.getUser();
      const userId = sess.user?.id ?? null;
      const pendentes = Object.entries(linhas).filter(([, l]) => l.valor.trim() !== "");
      if (pendentes.length === 0) throw new Error("Preencha ao menos um valor.");

      for (const [toolId, linha] of pendentes) {
        const ferramenta = ativas.find((f) => f.id === toolId)!;
        const valor = Number(linha.valor.replace(",", "."));
        if (!Number.isFinite(valor)) throw new Error(`Valor inválido em ${ferramenta.nome}.`);
        const t = taxa(ferramenta.moeda);

        let notaUrl: string | null = null;
        if (linha.arquivo) {
          const ext = linha.arquivo.name.split(".").pop() ?? "pdf";
          const caminho = `${toolId}/${mes}-${Date.now()}.${ext}`;
          const up = await supabase.storage.from("notas-fiscais").upload(caminho, linha.arquivo);
          if (up.error) throw new Error(`Falha ao enviar a nota de ${ferramenta.nome}.`);
          notaUrl = up.data.path;
        }

        const payload = {
          tool_id: toolId,
          competencia,
          valor,
          moeda: ferramenta.moeda,
          taxa_cambio: t,
          valor_brl: valor * t,
          observacao: linha.observacao.trim() || null,
          nota_fiscal_url: notaUrl,
          created_by: userId,
        };

        const existente = lancadoPor[toolId];
        if (existente) {
          const { error } = await supabase
            .from("tool_costs")
            .update({ ...payload, nota_fiscal_url: notaUrl ?? existente.nota_fiscal_url })
            .eq("id", existente.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("tool_costs").insert(payload);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      toast.success("Custos lançados.");
      setLinhas({});
      void queryClient.invalidateQueries({ queryKey: ["custos", competencia] });
    },
    onError: (e: Error) => toast.error(e.message || "Não foi possível lançar os custos."),
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Competência</Label>
          <Input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="h-8 w-40 text-sm" />
        </div>
        <p className="text-xs text-muted-foreground">
          {competenciaBR(competencia)} · {(lancados ?? []).length} lançamento(s) · {brl(totalLancado)}
        </p>
        <Button
          size="sm"
          className="ml-auto h-8"
          disabled={!podeEditar || salvar.isPending}
          onClick={() => salvar.mutate()}
        >
          {salvar.isPending ? "Lançando…" : "Lançar em lote"}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="[&>th]:h-8 [&>th]:px-2">
              <TableHead>Ferramenta</TableHead>
              <TableHead>Moeda</TableHead>
              <TableHead className="w-32">Valor faturado</TableHead>
              <TableHead className="text-right">Câmbio</TableHead>
              <TableHead className="text-right">Em BRL</TableHead>
              <TableHead>Nota fiscal</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead>Já lançado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ativas.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  Cadastre ferramentas ativas para lançar custos.
                </TableCell>
              </TableRow>
            )}
            {ativas.map((f) => {
              const linha = linhas[f.id];
              const valor = Number((linha?.valor ?? "").replace(",", "."));
              const t = taxa(f.moeda);
              const existente = lancadoPor[f.id];
              return (
                <TableRow key={f.id} className="[&>td]:px-2 [&>td]:py-1.5">
                  <TableCell className="font-medium">{f.nome}</TableCell>
                  <TableCell>{f.moeda}</TableCell>
                  <TableCell>
                    <Input
                      inputMode="decimal"
                      className="h-7 text-xs"
                      placeholder={existente ? num(existente.valor) : "0,00"}
                      value={linha?.valor ?? ""}
                      onChange={(e) => set(f.id, { valor: e.target.value })}
                      disabled={!podeEditar}
                    />
                  </TableCell>
                  <TableCell className="text-right">{num(t, 2)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {Number.isFinite(valor) && valor > 0 ? brl(valor * t) : "—"}
                  </TableCell>
                  <TableCell>
                    <label className="flex cursor-pointer items-center gap-1 text-muted-foreground hover:text-foreground">
                      <Paperclip className="size-3.5" />
                      <span className="max-w-24 truncate">{linha?.arquivo?.name ?? "anexar"}</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        className="hidden"
                        disabled={!podeEditar}
                        onChange={(e) => set(f.id, { arquivo: e.target.files?.[0] ?? null })}
                      />
                    </label>
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-7 text-xs"
                      value={linha?.observacao ?? ""}
                      onChange={(e) => set(f.id, { observacao: e.target.value })}
                      disabled={!podeEditar}
                    />
                  </TableCell>
                  <TableCell className={existente ? "font-medium" : "text-muted-foreground"}>
                    {existente ? brl(existente.valor_brl) : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Lançar novamente na mesma competência atualiza o valor já registrado da ferramenta.
      </p>
    </div>
  );
}
