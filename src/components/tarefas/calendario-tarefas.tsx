import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { PRIORIDADE_COR, type Tarefa } from "@/hooks/use-tarefas";
import { cn } from "@/lib/utils";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const chave = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function CalendarioTarefas({
  tarefas,
  onAbrir,
}: {
  tarefas: Tarefa[];
  onAbrir: (t: Tarefa) => void;
}) {
  const hoje = new Date();
  const [ref, setRef] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  const porDia = useMemo(() => {
    const mapa = new Map<string, Tarefa[]>();
    for (const t of tarefas) {
      if (!t.prazo) continue;
      const k = t.prazo.split("T")[0]!;
      mapa.set(k, [...(mapa.get(k) ?? []), t]);
    }
    return mapa;
  }, [tarefas]);

  const celulas = useMemo(() => {
    const primeiro = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const inicio = new Date(primeiro);
    inicio.setDate(1 - primeiro.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(inicio);
      d.setDate(inicio.getDate() + i);
      return d;
    });
  }, [ref]);

  const semPrazo = tarefas.filter((t) => !t.prazo);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setRef(new Date(ref.getFullYear(), ref.getMonth() - 1, 1))}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setRef(new Date(ref.getFullYear(), ref.getMonth() + 1, 1))}
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {MESES[ref.getMonth()]} de {ref.getFullYear()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7"
          onClick={() => setRef(new Date(hoje.getFullYear(), hoje.getMonth(), 1))}
        >
          Hoje
        </Button>
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-md border text-xs">
        {DIAS.map((d) => (
          <div key={d} className="border-b bg-muted/50 px-2 py-1.5 font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {celulas.map((d) => {
          const doMes = d.getMonth() === ref.getMonth();
          const eHoje = chave(d) === chave(hoje);
          const itens = porDia.get(chave(d)) ?? [];
          return (
            <div
              key={d.toISOString()}
              className={cn(
                "min-h-24 border-b border-r p-1.5 last:border-r-0",
                !doMes && "bg-muted/30 text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                  eHoje && "bg-primary font-semibold text-primary-foreground",
                )}
              >
                {d.getDate()}
              </div>
              <div className="space-y-1">
                {itens.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onAbrir(t)}
                    className="block w-full truncate rounded bg-accent px-1.5 py-0.5 text-left text-[11px] hover:bg-accent/70"
                    title={t.titulo}
                  >
                    <span className={cn("font-medium", PRIORIDADE_COR[t.prioridade])}>
                      {t.codigo ?? "—"}
                    </span>{" "}
                    {t.titulo}
                  </button>
                ))}
                {itens.length > 4 ? (
                  <span className="block text-[11px] text-muted-foreground">
                    +{itens.length - 4}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {semPrazo.length ? (
        <div className="rounded-md border p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Sem prazo ({semPrazo.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {semPrazo.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onAbrir(t)}
                className="rounded border px-2 py-0.5 text-xs hover:bg-accent"
              >
                {t.codigo ?? "—"} {t.titulo}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
