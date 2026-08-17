import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { DetalheTarefa } from "@/components/tarefas/detalhe-tarefa";
import { ListaTarefas } from "@/components/tarefas/lista-tarefas";
import { TarefaSheet } from "@/components/tarefas/tarefa-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useHorasSemana,
  useMinhasTarefas,
  useTodosStatus,
  type Tarefa,
} from "@/hooks/use-tarefas";
import { diasAte, num } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tarefas/")({
  head: () => ({
    meta: [
      { title: "Minhas tarefas · Antiparadigma OS" },
      {
        name: "description",
        content: "Tarefas atribuídas a você, agrupadas por prazo, com prioridades e progresso.",
      },
      { property: "og:title", content: "Minhas tarefas · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Tarefas atribuídas a você, agrupadas por prazo, com prioridades e progresso.",
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
  const horasSemana = useHorasSemana();
  const [nova, setNova] = useState(false);
  const [aberta, setAberta] = useState<Tarefa | null>(null);

  const dados = useMemo(() => {
    const lista = tarefas.data ?? [];
    const tipo = (id: string) => status.data?.find((s) => s.id === id)?.tipo;
    const encerrada = (t: Tarefa) => tipo(t.status_id) === "concluido" || tipo(t.status_id) === "cancelado";
    const abertas = lista.filter((t) => !encerrada(t));

    const grupos = [
      {
        titulo: "Atrasadas",
        tom: "text-danger",
        itens: abertas.filter((t) => {
          const d = diasAte(t.prazo);
          return d !== null && d < 0;
        }),
      },
      { titulo: "Para hoje", tom: "", itens: abertas.filter((t) => diasAte(t.prazo) === 0) },
      {
        titulo: "Esta semana",
        tom: "",
        itens: abertas.filter((t) => {
          const d = diasAte(t.prazo);
          return d !== null && d > 0 && d <= 7;
        }),
      },
      {
        titulo: "Depois",
        tom: "",
        itens: abertas.filter((t) => {
          const d = diasAte(t.prazo);
          return d !== null && d > 7;
        }),
      },
      { titulo: "Sem prazo", tom: "", itens: abertas.filter((t) => !t.prazo) },
    ];

    const semanaAtras = Date.now() - 7 * 86_400_000;
    const concluidasSemana = lista.filter(
      (t) => t.concluida_em && new Date(t.concluida_em).getTime() >= semanaAtras,
    ).length;

    return { grupos, abertas, concluidasSemana };
  }, [tarefas.data, status.data]);

  const kpis = [
    { label: "Em aberto", valor: String(dados.abertas.length) },
    { label: "Atrasadas", valor: String(dados.grupos[0]!.itens.length) },
    { label: "Concluídas na semana", valor: String(dados.concluidasSemana) },
    { label: "Horas na semana", valor: `${num(horasSemana.data ?? 0, 1)} h` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Minhas tarefas</h1>
        <Button size="sm" onClick={() => setNova(true)}>
          Nova tarefa
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{k.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {dados.grupos
        .filter((g) => g.itens.length)
        .map((g) => (
          <section key={g.titulo} className="space-y-2">
            <h2 className={`text-sm font-medium ${g.tom}`}>
              {g.titulo} · {g.itens.length}
            </h2>
            <ListaTarefas tarefas={g.itens} onAbrir={setAberta} comFiltros={false} />
          </section>
        ))}

      {!dados.abertas.length ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma tarefa atribuída a você no momento.
        </p>
      ) : null}

      <TarefaSheet aberto={nova} onOpenChange={setNova} />
      <DetalheTarefa tarefa={aberta} onOpenChange={(v) => !v && setAberta(null)} />
    </div>
  );
}
