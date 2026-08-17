import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Ferramenta } from "@/hooks/use-ferramentas";
import { supabase } from "@/integrations/supabase/client";
import { estaIncompleta, faltandoEssenciais } from "@/lib/ferramentas-util";
import { brl, CICLO_LABEL, CRITICIDADE_LABEL, dataBR, inteiro, STATUS_LABEL } from "@/lib/format";
import { AdicaoRapida } from "./adicao-rapida";

const CRIT_VARIANTE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critica: "destructive",
  alta: "default",
  media: "secondary",
  baixa: "outline",
};

export function TabelaFerramentas({
  ferramentas,
  areas,
  categorias,
  perfis,
  podeEditar,
  podeExcluir,
  onNova,
  onEditar,
}: {
  ferramentas: Ferramenta[];
  areas: { id: string; nome: string }[];
  categorias: { id: string; nome: string }[];
  perfis: { id: string; nome_completo: string }[];
  podeEditar: boolean;
  podeExcluir: boolean;
  onNova: (preenchimento?: { nome?: string }) => void;
  onEditar: (f: Ferramenta) => void;
}) {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [categoria, setCategoria] = useState("todas");
  const [area, setArea] = useState("todas");
  const [criticidade, setCriticidade] = useState("todas");
  const [cadastro, setCadastro] = useState("todos");
  const [paraExcluir, setParaExcluir] = useState<Ferramenta | null>(null);
  const refBusca = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      const digitando =
        !!alvo &&
        (alvo.tagName === "INPUT" || alvo.tagName === "TEXTAREA" || alvo.isContentEditable);
      if (e.key === "/" && !digitando) {
        e.preventDefault();
        refBusca.current?.focus();
      }
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, []);

  const nomeArea = (id: string | null) => areas.find((a) => a.id === id)?.nome ?? "—";
  const nomeCategoria = (id: string | null) => categorias.find((c) => c.id === id)?.nome ?? "—";
  const nomeResponsavel = (id: string | null) => perfis.find((p) => p.id === id)?.nome_completo ?? "—";

  const filtradas = useMemo(
    () =>
      ferramentas.filter((f) => {
        const termo = busca.trim().toLowerCase();
        if (
          termo &&
          !`${f.nome} ${f.fornecedor ?? ""} ${f.plano ?? ""}`.toLowerCase().includes(termo)
        )
          return false;
        if (status !== "todos" && f.status !== status) return false;
        if (categoria !== "todas" && f.categoria_id !== categoria) return false;
        if (area !== "todas" && f.area_id !== area) return false;
        if (criticidade !== "todas" && f.criticidade !== criticidade) return false;
        if (cadastro === "incompletas" && !estaIncompleta(f)) return false;
        if (cadastro === "completas" && estaIncompleta(f)) return false;
        return true;
      }),
    [ferramentas, busca, status, categoria, area, criticidade, cadastro],
  );

  const limparFiltros = () => {
    setBusca("");
    setStatus("todos");
    setCategoria("todas");
    setArea("todas");
    setCriticidade("todas");
    setCadastro("todos");
  };

  const total = filtradas.reduce((s, f) => s + Number(f.custo_mensal_brl ?? 0), 0);

  const excluir = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tools").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ferramenta excluída.");
      void queryClient.invalidateQueries({ queryKey: ["ferramentas"] });
      setParaExcluir(null);
    },
    onError: () => toast.error("Não foi possível excluir."),
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Buscar por nome, fornecedor ou plano…"
          value={busca}
          ref={refBusca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur();
              limparFiltros();
            }
          }}
          className="h-8 w-full max-w-xs text-sm"
        />
        <Filtro valor={status} onValor={setStatus} placeholder="Status" vazio="todos" opcoes={STATUS_LABEL} />
        <Filtro
          valor={criticidade}
          onValor={setCriticidade}
          placeholder="Criticidade"
          vazio="todas"
          opcoes={CRITICIDADE_LABEL}
        />
        <Filtro
          valor={categoria}
          onValor={setCategoria}
          placeholder="Categoria"
          vazio="todas"
          opcoes={Object.fromEntries(categorias.map((c) => [c.id, c.nome]))}
        />
        <Filtro
          valor={area}
          onValor={setArea}
          placeholder="Área"
          vazio="todas"
          opcoes={Object.fromEntries(areas.map((a) => [a.id, a.nome]))}
        />
        <Filtro
          valor={cadastro}
          onValor={setCadastro}
          placeholder="Cadastro"
          vazio="todos"
          opcoes={{ incompletas: "Incompletas", completas: "Completas" }}
        />
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            <span className="num">{inteiro(filtradas.length)}</span> ferramenta(s) ·{" "}
            <span className="num">{brl(total)}</span>/mês
          </span>
        </div>
      </div>

      <AdicaoRapida podeEditar={podeEditar} onCriada={(f) => onEditar(f)} />

      <div className="overflow-x-auto rounded-md border">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="[&>th]:h-8 [&>th]:px-2">
              <TableHead>Ferramenta</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criticidade</TableHead>
              <TableHead>Ciclo</TableHead>
              <TableHead className="text-right">Licenças</TableHead>
              <TableHead className="text-right">Custo/mês</TableHead>
              <TableHead>Renovação</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center">
                  {ferramentas.length === 0 ? (
                    <div className="space-y-2 text-muted-foreground">
                      <p>Nenhuma ferramenta cadastrada ainda.</p>
                      <p className="text-xs">
                        Use a adição rápida acima — nome e valor bastam para começar.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-muted-foreground">
                      <p>Nenhuma ferramenta neste recorte de filtros.</p>
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={limparFiltros}>
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
            {filtradas.map((f) => (
              <TableRow key={f.id} className="[&>td]:px-2 [&>td]:py-1.5">
                <TableCell className="font-medium">
                  <span className="flex items-center gap-1.5">
                    {f.nome}
                    {f.site_url && (
                      <a href={f.site_url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    {f.fornecedor ?? "—"}
                    {estaIncompleta(f) && (
                      <span
                        className="rounded-sm bg-warning/15 px-1 py-px font-medium text-warning"
                        title={`Falta: ${faltandoEssenciais(f).join(", ")}`}
                      >
                        incompleto
                      </span>
                    )}
                  </span>
                </TableCell>
                <TableCell>{nomeCategoria(f.categoria_id)}</TableCell>
                <TableCell>{nomeArea(f.area_id)}</TableCell>
                <TableCell>{nomeResponsavel(f.responsavel_id)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px]">
                    {STATUS_LABEL[f.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={CRIT_VARIANTE[f.criticidade]} className="text-[10px]">
                    {CRITICIDADE_LABEL[f.criticidade]}
                  </Badge>
                </TableCell>
                <TableCell>{CICLO_LABEL[f.ciclo]}</TableCell>
                <TableCell className="num text-right">{inteiro(f.num_licencas)}</TableCell>
                <TableCell className="num text-right font-medium">{brl(f.custo_mensal_brl)}</TableCell>
                <TableCell className="num">{dataBR(f.data_renovacao)}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label="Editar"
                      onClick={() => onEditar(f)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    {podeExcluir && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive"
                        aria-label="Excluir"
                        onClick={() => setParaExcluir(f)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!paraExcluir} onOpenChange={(v) => !v && setParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir “{paraExcluir?.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>
              A exclusão fica registrada na auditoria e remove os custos vinculados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => paraExcluir && excluir.mutate(paraExcluir.id)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Filtro({
  valor,
  onValor,
  placeholder,
  vazio,
  opcoes,
}: {
  valor: string;
  onValor: (v: string) => void;
  placeholder: string;
  vazio: string;
  opcoes: Record<string, string>;
}) {
  return (
    <Select value={valor} onValueChange={onValor}>
      <SelectTrigger className="h-8 w-auto min-w-32 text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={vazio}>{placeholder}: todos</SelectItem>
        {Object.entries(opcoes).map(([v, label]) => (
          <SelectItem key={v} value={v}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
