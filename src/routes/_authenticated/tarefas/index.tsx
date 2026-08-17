import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ListaTarefas } from "@/components/tarefas/lista-tarefas";
import { DetalheTarefa } from "@/components/tarefas/detalhe-tarefa";
import { TarefaSheet } from "@/components/tarefas/tarefa-sheet";
import { Button } from "@/components/ui/button";
import { useMinhasTarefas, useTodosStatus, type Tarefa } from "@/hooks/use-tarefas";
import { diasAte } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tarefas/")({
  head: () => ({
    meta: [
      { title: "Minhas tarefas · Antiparadigma OS" },
      {
        name: "description",
        content: "Tarefas atribuídas a você, com prazos, prioridades e progresso.",
      },
      { property: "og:title", content: "Minhas tarefas · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Tarefas atribuídas a você, com prazos, prioridades e progresso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MinhasTarefas,
});

function MinhasTarefas() {
  const tarefas = useMinhasTarefas();
  const status = useTodosStatus();
  const [nova, setNova] = useState(false);
  const [aberta, setAberta] = useState<Tarefa | null>(null);

  const lista = tarefas.data ?? [];
  const tipo = (id: string) => status.data?.find((s) => s.id === id)?.tipo;
  const abertas = lista.filter((t) => tipo(t.status_id) !== "concluido" && tipo(t.status_id) !== "cancelado");
  const atrasadas = abertas.filter((t) => {
    const d = diasAte(t.prazo);
    return d !== null && d < 0;
  });
  const hoje = abertas.filter((t) => diasAte(t.prazo) === 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Minhas tarefas</h1>
          <p className="text-sm text-muted-foreground">
            {abertas.length} em aberto · {atrasadas.length} atrasadas · {hoje.length} para hoje
          </p>
        </div>
        <Button size="sm" onClick={() => setNova(true)}>
          Nova tarefa
        </Button>
      </div>

      <ListaTarefas tarefas={lista} onAbrir={setAberta} />

      <TarefaSheet aberto={nova} onOpenChange={setNova} />
      <DetalheTarefa tarefa={aberta} onOpenChange={(v) => !v && setAberta(null)} />
    </div>
  );
}
