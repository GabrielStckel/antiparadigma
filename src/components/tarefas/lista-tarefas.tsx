import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { usePerfis } from "@/hooks/use-ferramentas";
import { baixarCSV } from "@/lib/csv";

import {
  PRIORIDADE_COR,
  PRIORIDADE_LABEL,
  useAcoesLote,
  useProjetos,
  useTodosStatus,
  type Prioridade,
  type Tarefa,
} from "@/hooks/use-tarefas";
import { dataBR, diasAte, num } from "@/lib/format";

type Agrupamento = "nenhum" | "status" | "responsavel" | "prioridade" | "projeto";

const AGRUPAMENTO_LABEL: Record<Agrupamento, string> = {
  nenhum: "Sem agrupamento",
  status: "Agrupar por status",
  responsavel: "Agrupar por responsável",
  prioridade: "Agrupar por prioridade",
  projeto: "Agrupar por projeto",
};

export function ListaTarefas({
  tarefas,
  onAbrir,
  comFiltros = true,
}: {
  tarefas: Tarefa[];
  onAbrir: (t: Tarefa) => void;
  comFiltros?: boolean;
}) {
  const projetos = useProjetos();
  const perfis = usePerfis();
  const status = useTodosStatus();
  const lote = useAcoesLote();

  const [busca, setBusca] = useState("");
  const [projeto, setProjeto] = useState("todos");
  const [prioridade, setPrioridade] = useState("todas");
  const [responsavel, setResponsavel] = useState("todos");
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [soAtrasadas, setSoAtrasadas] = useState(false);
  const [agrupar, setAgrupar] = useState<Agrupamento>("nenhum");
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [recolhidos, setRecolhidos] = useState<string[]>([]);

  const st = (id: string) => status.data?.find((s) => s.id === id);
  const nomeProjeto = (id: string) => projetos.data?.find((p) => p.id === id)?.nome ?? "—";
  const nomePessoa = (id: string | null) =>
    id ? (perfis.data?.find((p) => p.id === id)?.nome_completo ?? "—") : "Sem responsável";

  const filtradas = useMemo(
    () =>
      tarefas.filter((t) => {
        if (busca && !`${t.codigo} ${t.titulo}`.toLowerCase().includes(busca.toLowerCase()))
          return false;
        if (projeto !== "todos" && t.project_id !== projeto) return false;
        if (prioridade !== "todas" && t.prioridade !== prioridade) return false;
        if (responsavel !== "todos" && t.responsavel_id !== responsavel) return false;
        if (statusFiltro !== "todos" && st(t.status_id)?.tipo !== statusFiltro) return false;
        if (soAtrasadas) {
          const d = diasAte(t.prazo);
          const tipo = st(t.status_id)?.tipo;
          if (d === null || d >= 0 || tipo === "concluido" || tipo === "cancelado") return false;
        }
        return true;
      }),
    [tarefas, busca, projeto, prioridade, responsavel, statusFiltro, soAtrasadas, status.data],
  );

  /** Hierarquia: pais primeiro, subtarefas logo abaixo do pai. */
  const ordenadas = useMemo(() => {
    const porPai = new Map<string | null, Tarefa[]>();
    for (const t of filtradas) {
      const k = t.parent_task_id;
      porPai.set(k, [...(porPai.get(k) ?? []), t]);
    }
    const visiveis = new Set(filtradas.map((t) => t.id));
    const saida: Tarefa[] = [];
    const empilhar = (lista: Tarefa[]) => {
      for (const t of lista) {
        saida.push(t);
        if (!recolhidos.includes(t.id)) empilhar(porPai.get(t.id) ?? []);
      }
    };
    const raizes = filtradas.filter(
      (t) => !t.parent_task_id || !visiveis.has(t.parent_task_id),
    );
    empilhar(raizes);
    return saida;
  }, [filtradas, recolhidos]);

  const temFilhas = (id: string) => filtradas.some((t) => t.parent_task_id === id);

  const grupos = useMemo(() => {
    if (agrupar === "nenhum") return [{ titulo: "", itens: ordenadas }];
    const mapa = new Map<string, Tarefa[]>();
    for (const t of ordenadas) {
      const chave =
        agrupar === "status"
          ? (st(t.status_id)?.nome ?? "—")
          : agrupar === "responsavel"
            ? nomePessoa(t.responsavel_id)
            : agrupar === "prioridade"
              ? PRIORIDADE_LABEL[t.prioridade]
              : nomeProjeto(t.project_id);
      mapa.set(chave, [...(mapa.get(chave) ?? []), t]);
    }
    return [...mapa.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "pt-BR"))
      .map(([titulo, itens]) => ({ titulo, itens }));
  }, [ordenadas, agrupar, status.data, perfis.data, projetos.data]);

  const alternarSelecao = (id: string) =>
    setSelecionadas((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const statusDisponiveis = (status.data ?? []).filter((s) =>
    projeto !== "todos" ? s.project_id === projeto : false,
  );

  const exportarCSV = () => {
    const cabecalho = [
      "Código",
      "Título",
      "Projeto",
      "Status",
      "Prioridade",
      "Responsável",
      "Início",
      "Prazo",
      "Estimativa (h)",
      "Horas gastas",
      "Progresso (%)",
      "Tags",
    ];
    const linhas = filtradas.map((t) => [
      t.codigo ?? "",
      t.titulo,
      nomeProjeto(t.project_id),
      st(t.status_id)?.nome ?? "",
      PRIORIDADE_LABEL[t.prioridade],
      t.responsavel_id ? nomePessoa(t.responsavel_id) : "",
      dataBR(t.data_inicio),
      dataBR(t.prazo),
      t.estimativa_horas ? num(Number(t.estimativa_horas), 1) : "",
      num(Number(t.horas_gastas), 1),
      String(t.progresso),
      t.tags.join(" | "),
    ]);
    baixarCSV("tarefas", cabecalho, linhas);
  };


  const aplicarLote = (valores: Parameters<typeof lote.mutate>[0]["valores"]) =>
    lote.mutate(
      { ids: selecionadas, valores },
      { onSuccess: () => setSelecionadas([]) },
    );

  return (
    <div className="space-y-3">
      {comFiltros ? (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-8 w-56"
            placeholder="Buscar por código ou título"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <Select value={projeto} onValueChange={setProjeto}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os projetos</SelectItem>
              {(projetos.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="aberto">Abertas</SelectItem>
              <SelectItem value="andamento">Em andamento</SelectItem>
              <SelectItem value="revisao">Em revisão</SelectItem>
              <SelectItem value="concluido">Concluídas</SelectItem>
              <SelectItem value="cancelado">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={prioridade} onValueChange={setPrioridade}>
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Toda prioridade</SelectItem>
              {Object.entries(PRIORIDADE_LABEL).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={responsavel} onValueChange={setResponsavel}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os responsáveis</SelectItem>
              {(perfis.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={agrupar} onValueChange={(v) => setAgrupar(v as Agrupamento)}>
            <SelectTrigger className="h-8 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AGRUPAMENTO_LABEL).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant={soAtrasadas ? "default" : "outline"}
            className="h-8"
            onClick={() => setSoAtrasadas((v) => !v)}
          >
            Só atrasadas
          </Button>
          <Button size="sm" variant="outline" className="h-8" onClick={exportarCSV}>
            Exportar CSV
          </Button>
        </div>
      ) : null}

      {selecionadas.length ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border bg-accent/50 p-2 text-xs">
          <span className="font-medium">{selecionadas.length} selecionada(s)</span>
          {statusDisponiveis.length ? (
            <Select onValueChange={(v) => aplicarLote({ status_id: v })}>
              <SelectTrigger className="h-7 w-40">
                <SelectValue placeholder="Mudar status" />
              </SelectTrigger>
              <SelectContent>
                {statusDisponiveis.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
          <Select onValueChange={(v) => aplicarLote({ prioridade: v as Prioridade })}>
            <SelectTrigger className="h-7 w-36">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORIDADE_LABEL).map(([v, l]) => (
                <SelectItem key={v} value={v}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(v) => aplicarLote({ responsavel_id: v })}>
            <SelectTrigger className="h-7 w-44">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              {(perfis.data ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-7" onClick={() => aplicarLote({ arquivada: true })}>
            Arquivar
          </Button>
          <Button size="sm" variant="ghost" className="h-7" onClick={() => setSelecionadas([])}>
            Limpar seleção
          </Button>
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  aria-label="Selecionar tudo"
                  checked={!!ordenadas.length && selecionadas.length === ordenadas.length}
                  onCheckedChange={(v) =>
                    setSelecionadas(v ? ordenadas.map((t) => t.id) : [])
                  }
                />
              </TableHead>
              <TableHead className="w-24">Código</TableHead>
              <TableHead>Tarefa</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead className="w-24">Progresso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grupos.map((g) => (
              <Fragment key={g.titulo || "sem-grupo"}>
                {g.titulo ? (
                  <TableRow key={`g-${g.titulo}`} className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={9} className="py-1.5 text-xs font-medium">
                      {g.titulo} · {g.itens.length}
                    </TableCell>
                  </TableRow>
                ) : null}
                {g.itens.map((t) => {
                  const dias = diasAte(t.prazo);
                  const s = st(t.status_id);
                  const atrasada =
                    dias !== null && dias < 0 && s?.tipo !== "concluido" && s?.tipo !== "cancelado";
                  return (
                    <TableRow key={t.id} className="cursor-pointer" onClick={() => onAbrir(t)}>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          aria-label={`Selecionar ${t.codigo ?? t.titulo}`}
                          checked={selecionadas.includes(t.id)}
                          onCheckedChange={() => alternarSelecao(t.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {t.codigo}
                      </TableCell>
                      <TableCell className="max-w-[24rem] truncate">
                        <span
                          className="inline-flex items-center gap-1"
                          style={{ paddingLeft: t.nivel * 14 }}
                        >
                          {temFilhas(t.id) ? (
                            <button
                              type="button"
                              aria-label="Expandir subtarefas"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRecolhidos((r) =>
                                  r.includes(t.id) ? r.filter((x) => x !== t.id) : [...r, t.id],
                                );
                              }}
                              className="text-muted-foreground"
                            >
                              {recolhidos.includes(t.id) ? (
                                <ChevronRight className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="w-3.5" />
                          )}
                          {t.titulo}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{nomeProjeto(t.project_id)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px]"
                          style={{ borderColor: s?.cor }}
                        >
                          {s?.nome ?? "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-xs ${PRIORIDADE_COR[t.prioridade]}`}>
                        {PRIORIDADE_LABEL[t.prioridade]}
                      </TableCell>
                      <TableCell className="text-xs">{nomePessoa(t.responsavel_id)}</TableCell>
                      <TableCell
                        className={`text-xs ${atrasada ? "text-danger" : ""}`}
                      >
                        {dataBR(t.prazo)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Progress value={t.progresso} className="h-1.5 w-12" />
                          <span className="text-[10px] tabular-nums text-muted-foreground">
                            {t.progresso}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </Fragment>
            ))}
            {!ordenadas.length ? (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-sm text-muted-foreground">
                  Nenhuma tarefa encontrada.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
