import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
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
import { usePerfis } from "@/hooks/use-ferramentas";
import {
  PRIORIDADE_COR,
  PRIORIDADE_LABEL,
  useProjetos,
  useTodosStatus,
  type Tarefa,
} from "@/hooks/use-tarefas";
import { dataBR, diasAte } from "@/lib/format";

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

  const [busca, setBusca] = useState("");
  const [projeto, setProjeto] = useState("todos");
  const [prioridade, setPrioridade] = useState("todas");
  const [responsavel, setResponsavel] = useState("todos");

  const filtradas = useMemo(
    () =>
      tarefas.filter((t) => {
        if (busca && !`${t.codigo} ${t.titulo}`.toLowerCase().includes(busca.toLowerCase()))
          return false;
        if (projeto !== "todos" && t.project_id !== projeto) return false;
        if (prioridade !== "todas" && t.prioridade !== prioridade) return false;
        if (responsavel !== "todos" && t.responsavel_id !== responsavel) return false;
        return true;
      }),
    [tarefas, busca, projeto, prioridade, responsavel],
  );

  const nomeProjeto = (id: string) => projetos.data?.find((p) => p.id === id)?.nome ?? "—";
  const nomeStatus = (id: string) => status.data?.find((s) => s.id === id);
  const nomePessoa = (id: string | null) =>
    id ? (perfis.data?.find((p) => p.id === id)?.nome_completo ?? "—") : "—";

  return (
    <div className="space-y-3">
      {comFiltros ? (
        <div className="flex flex-wrap gap-2">
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
        </div>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Código</TableHead>
              <TableHead>Tarefa</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map((t) => {
              const dias = diasAte(t.prazo);
              const st = nomeStatus(t.status_id);
              const atrasada = dias !== null && dias < 0 && st?.tipo !== "concluido";
              return (
                <TableRow
                  key={t.id}
                  className="cursor-pointer"
                  onClick={() => onAbrir(t)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{t.codigo}</TableCell>
                  <TableCell className="max-w-[24rem] truncate">
                    <span style={{ paddingLeft: t.nivel * 12 }}>{t.titulo}</span>
                  </TableCell>
                  <TableCell className="text-xs">{nomeProjeto(t.project_id)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]" style={{ borderColor: st?.cor }}>
                      {st?.nome ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-xs ${PRIORIDADE_COR[t.prioridade]}`}>
                    {PRIORIDADE_LABEL[t.prioridade]}
                  </TableCell>
                  <TableCell className="text-xs">{nomePessoa(t.responsavel_id)}</TableCell>
                  <TableCell className={`text-xs ${atrasada ? "text-red-600 dark:text-red-400" : ""}`}>
                    {dataBR(t.prazo)}
                  </TableCell>
                </TableRow>
              );
            })}
            {!filtradas.length ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
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
