import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CalendarioTarefas } from "@/components/tarefas/calendario-tarefas";
import { DetalheTarefa } from "@/components/tarefas/detalhe-tarefa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjetos, useTarefas, type Tarefa } from "@/hooks/use-tarefas";

export const Route = createFileRoute("/_authenticated/tarefas/calendario")({
  head: () => ({
    meta: [
      { title: "Calendário de tarefas · Antiparadigma OS" },
      {
        name: "description",
        content: "Prazos das tarefas em visão mensal, por projeto ou todos os projetos.",
      },
      { property: "og:title", content: "Calendário de tarefas · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Prazos das tarefas em visão mensal, por projeto ou todos os projetos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarioPagina,
});

function CalendarioPagina() {
  const projetos = useProjetos();
  const [projectId, setProjectId] = useState("todos");
  const tarefas = useTarefas({ projectId: projectId === "todos" ? null : projectId });
  const [aberta, setAberta] = useState<Tarefa | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="titulo-pagina">Calendário</h1>
        <Select value={projectId} onValueChange={setProjectId}>
          <SelectTrigger className="h-8 w-56">
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
      </div>

      <CalendarioTarefas tarefas={tarefas.data ?? []} onAbrir={setAberta} />
      <DetalheTarefa tarefa={aberta} onOpenChange={(v) => !v && setAberta(null)} />
    </div>
  );
}
