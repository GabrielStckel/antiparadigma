import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DetalheTarefa } from "@/components/tarefas/detalhe-tarefa";
import { ListaTarefas } from "@/components/tarefas/lista-tarefas";
import { TarefaSheet } from "@/components/tarefas/tarefa-sheet";
import { Button } from "@/components/ui/button";
import { useTarefas, type Tarefa } from "@/hooks/use-tarefas";

export const Route = createFileRoute("/_authenticated/tarefas/lista")({
  head: () => ({
    meta: [
      { title: "Lista de tarefas · Antiparadigma OS" },
      {
        name: "description",
        content: "Todas as tarefas dos projetos da Antiparadigma, com busca e filtros.",
      },
      { property: "og:title", content: "Lista de tarefas · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Todas as tarefas dos projetos da Antiparadigma, com busca e filtros.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ListaPagina,
});

function ListaPagina() {
  const tarefas = useTarefas();
  const [nova, setNova] = useState(false);
  const [aberta, setAberta] = useState<Tarefa | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Tarefas</h1>
          <p className="text-sm text-muted-foreground">
            {(tarefas.data ?? []).length} tarefas ativas
          </p>
        </div>
        <Button size="sm" onClick={() => setNova(true)}>
          Nova tarefa
        </Button>
      </div>

      <ListaTarefas tarefas={tarefas.data ?? []} onAbrir={setAberta} />

      <TarefaSheet aberto={nova} onOpenChange={setNova} />
      <DetalheTarefa tarefa={aberta} onOpenChange={(v) => !v && setAberta(null)} />
    </div>
  );
}
