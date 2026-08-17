import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { DashboardProjeto } from "@/components/tarefas/dashboard-projeto";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjetos, useTarefas } from "@/hooks/use-tarefas";

export const Route = createFileRoute("/_authenticated/tarefas/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard do projeto · Antiparadigma OS" },
      {
        name: "description",
        content: "Indicadores do projeto: progresso, atrasos, horas e carga por responsável.",
      },
      { property: "og:title", content: "Dashboard do projeto · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Indicadores do projeto: progresso, atrasos, horas e carga por responsável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DashboardPagina,
});

function DashboardPagina() {
  const projetos = useProjetos();
  const [projectId, setProjectId] = useState("");
  const tarefas = useTarefas({ projectId: projectId || null });

  useEffect(() => {
    if (!projectId && projetos.data?.length) setProjectId(projetos.data[0]!.id);
  }, [projetos.data, projectId]);

  const projeto = projetos.data?.find((p) => p.id === projectId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="titulo-pagina">Dashboard do projeto</h1>
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

      {projeto ? (
        <DashboardProjeto projeto={projeto} tarefas={tarefas.data ?? []} />
      ) : (
        <p className="text-sm text-muted-foreground">
          Crie um projeto na aba Projetos para ver os indicadores.
        </p>
      )}
    </div>
  );
}
