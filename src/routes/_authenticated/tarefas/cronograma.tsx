import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CronogramaTarefas } from "@/components/tarefas/cronograma-tarefas";
import { DetalheTarefa } from "@/components/tarefas/detalhe-tarefa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjetos, useTarefas, type Tarefa } from "@/hooks/use-tarefas";

export const Route = createFileRoute("/_authenticated/tarefas/cronograma")({
  head: () => ({
    meta: [
      { title: "Cronograma de tarefas · Antiparadigma OS" },
      {
        name: "description",
        content: "Linha do tempo tipo gantt com início, prazo e progresso das tarefas do projeto.",
      },
      { property: "og:title", content: "Cronograma de tarefas · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Linha do tempo tipo gantt com início, prazo e progresso das tarefas do projeto.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CronogramaPagina,
});

function CronogramaPagina() {
  const projetos = useProjetos();
  const [projectId, setProjectId] = useState("");
  const tarefas = useTarefas({ projectId: projectId || null });
  const [aberta, setAberta] = useState<Tarefa | null>(null);

  useEffect(() => {
    if (!projectId && projetos.data?.length) setProjectId(projetos.data[0]!.id);
  }, [projetos.data, projectId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="titulo-pagina">Cronograma</h1>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="h-8 w-56">
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            {(projetos.data ?? []).map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {projectId ? (
        <CronogramaTarefas tarefas={tarefas.data ?? []} onAbrir={setAberta} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Crie um projeto na aba Projetos para ver o cronograma.
        </p>
      )}
      <DetalheTarefa tarefa={aberta} onOpenChange={(v) => !v && setAberta(null)} />
    </div>
  );
}
