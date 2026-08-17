import { Badge } from "@/components/ui/badge";
import { usePerfis } from "@/hooks/use-ferramentas";
import {
  PRIORIDADE_COR,
  PRIORIDADE_LABEL,
  useMudarStatus,
  useStatusProjeto,
  type Tarefa,
} from "@/hooks/use-tarefas";
import { dataBR } from "@/lib/format";

export function QuadroTarefas({
  projectId,
  tarefas,
  onAbrir,
}: {
  projectId: string;
  tarefas: Tarefa[];
  onAbrir: (t: Tarefa) => void;
}) {
  const status = useStatusProjeto(projectId);
  const perfis = usePerfis();
  const mudar = useMudarStatus();

  const nomePessoa = (id: string | null) =>
    id ? (perfis.data?.find((p) => p.id === id)?.nome_completo ?? "—") : "Sem responsável";

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {(status.data ?? []).map((col) => {
        const itens = tarefas.filter((t) => t.status_id === col.id);
        return (
          <div
            key={col.id}
            className="w-64 shrink-0 rounded-md border bg-muted/30"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              if (id) mudar.mutate({ id, statusId: col.id });
            }}
          >
            <div className="flex items-center gap-2 border-b px-2 py-1.5">
              <span className="size-2 rounded-full" style={{ background: col.cor }} />
              <p className="text-xs font-medium">{col.nome}</p>
              <span className="ml-auto text-[10px] text-muted-foreground">{itens.length}</span>
            </div>
            <div className="space-y-2 p-2">
              {itens.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
                  onClick={() => onAbrir(t)}
                  className="w-full rounded-md border bg-card p-2 text-left transition-colors hover:bg-accent"
                >
                  <p className="font-mono text-[10px] text-muted-foreground">{t.codigo}</p>
                  <p className="text-sm leading-snug">{t.titulo}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className={PRIORIDADE_COR[t.prioridade]}>
                      {PRIORIDADE_LABEL[t.prioridade]}
                    </span>
                    <span>{dataBR(t.prazo)}</span>
                  </div>
                  <Badge variant="secondary" className="mt-1.5 text-[10px]">
                    {nomePessoa(t.responsavel_id)}
                  </Badge>
                </button>
              ))}
              {!itens.length ? (
                <p className="px-1 py-3 text-center text-[11px] text-muted-foreground">Vazio</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
