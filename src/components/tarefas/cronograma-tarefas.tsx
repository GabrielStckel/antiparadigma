import { useMemo } from "react";

import { PRIORIDADE_LABEL, type Tarefa } from "@/hooks/use-tarefas";
import { dataBR } from "@/lib/format";
import { cn } from "@/lib/utils";

const DIA_MS = 86_400_000;

const soData = (v: string) => new Date(`${v.split("T")[0]}T12:00:00`);

export function CronogramaTarefas({
  tarefas,
  onAbrir,
}: {
  tarefas: Tarefa[];
  onAbrir: (t: Tarefa) => void;
}) {
  const barras = useMemo(() => {
    const itens = tarefas
      .filter((t) => t.data_inicio || t.prazo)
      .map((t) => {
        const inicio = soData(t.data_inicio ?? t.prazo!);
        const fim = soData(t.prazo ?? t.data_inicio!);
        return { tarefa: t, inicio, fim: fim < inicio ? inicio : fim };
      })
      .sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
    if (!itens.length) return null;

    const min = new Date(Math.min(...itens.map((i) => i.inicio.getTime())));
    const max = new Date(Math.max(...itens.map((i) => i.fim.getTime())));
    min.setDate(min.getDate() - 2);
    max.setDate(max.getDate() + 2);
    const total = Math.max(1, Math.round((max.getTime() - min.getTime()) / DIA_MS));

    return {
      min,
      max,
      total,
      itens: itens.map((i) => ({
        ...i,
        esquerda: (Math.round((i.inicio.getTime() - min.getTime()) / DIA_MS) / total) * 100,
        largura: Math.max(
          1.5,
          ((Math.round((i.fim.getTime() - i.inicio.getTime()) / DIA_MS) + 1) / total) * 100,
        ),
      })),
    };
  }, [tarefas]);

  if (!barras) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma tarefa com data de início ou prazo definidos neste projeto.
      </p>
    );
  }

  const hoje = new Date();
  const hojePct = ((hoje.getTime() - barras.min.getTime()) / (barras.total * DIA_MS)) * 100;

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex items-center justify-between border-b bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
        <span>{dataBR(barras.min.toISOString())}</span>
        <span>{barras.total} dias</span>
        <span>{dataBR(barras.max.toISOString())}</span>
      </div>
      <div className="divide-y">
        {barras.itens.map(({ tarefa, inicio, fim, esquerda, largura }) => {
          const atrasada = fim < hoje && tarefa.progresso < 100;
          return (
            <div key={tarefa.id} className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent/40">
              <button
                type="button"
                onClick={() => onAbrir(tarefa)}
                className="w-56 shrink-0 truncate text-left text-xs"
                title={tarefa.titulo}
              >
                <span className="font-medium text-muted-foreground">{tarefa.codigo ?? "—"}</span>{" "}
                {tarefa.titulo}
              </button>
              <div className="relative h-5 min-w-0 flex-1 rounded bg-muted/60">
                {hojePct >= 0 && hojePct <= 100 ? (
                  <div
                    className="absolute top-0 h-full w-px bg-primary/60"
                    style={{ left: `${hojePct}%` }}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => onAbrir(tarefa)}
                  className={cn(
                    "absolute top-0.5 h-4 rounded text-[10px] text-primary-foreground",
                    atrasada ? "bg-danger" : "bg-primary/80 hover:bg-primary",
                  )}
                  style={{ left: `${esquerda}%`, width: `${largura}%` }}
                  title={`${dataBR(inicio.toISOString())} → ${dataBR(fim.toISOString())} · ${PRIORIDADE_LABEL[tarefa.prioridade]} · ${tarefa.progresso}%`}
                >
                  <span
                    className="block h-full rounded bg-white/30"
                    style={{ width: `${tarefa.progresso}%` }}
                  />
                </button>
              </div>
              <span className="w-10 shrink-0 text-right text-[11px] text-muted-foreground">
                {tarefa.progresso}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
