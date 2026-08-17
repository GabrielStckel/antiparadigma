import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { DetalheTarefa } from "@/components/tarefas/detalhe-tarefa";
import { QuadroTarefas } from "@/components/tarefas/quadro-tarefas";
import { TarefaSheet } from "@/components/tarefas/tarefa-sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjetos, useTarefas, type Tarefa } from "@/hooks/use-tarefas";

export const Route = createFileRoute("/_authenticated/tarefas/quadro")({
  head: () => ({
    meta: [
      { title: "Quadro de tarefas · Antiparadigma OS" },
      {
        name: "description",
        content: "Quadro kanban por projeto, com arrastar e soltar entre status.",
      },
      { property: "og:title", content: "Quadro de tarefas · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Quadro kanban por projeto, com arrastar e soltar entre status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuadroPagina,
});

function QuadroPagina() {
  const projetos = useProjetos();
  const [projectId, setProjectId] = useState("");
  const tarefas = useTarefas({ projectId: projectId || null });
  const [nova, setNova] = useState(false);
  const [aberta, setAberta] = useState<Tarefa | null>(null);

  useEffect(() => {
    if (!projectId && projetos.data?.length) setProjectId(projetos.data[0]!.id);
  }, [projetos.data, projectId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="titulo-pagina">Quadro</h1>
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
        <Button size="sm" onClick={() => setNova(true)} disabled={!projectId}>
          Nova tarefa
        </Button>
      </div>

      {projectId ? (
        <QuadroTarefas
          projectId={projectId}
          tarefas={tarefas.data ?? []}
          onAbrir={setAberta}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Crie um projeto na aba Projetos para usar o quadro.
        </p>
      )}

      <TarefaSheet aberto={nova} onOpenChange={setNova} projetoPadrao={projectId || null} />
      <DetalheTarefa tarefa={aberta} onOpenChange={(v) => !v && setAberta(null)} />
    </div>
  );
}
