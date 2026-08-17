import { useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePerfis } from "@/hooks/use-ferramentas";
import {
  PRIORIDADE_LABEL,
  useStatusProjeto,
  type Prioridade,
  type Projeto,
  type Tarefa,
} from "@/hooks/use-tarefas";
import { dataBR, num } from "@/lib/format";

export function DashboardProjeto({ projeto, tarefas }: { projeto: Projeto; tarefas: Tarefa[] }) {
  const status = useStatusProjeto(projeto.id);
  const perfis = usePerfis();

  const dados = useMemo(() => {
    const lista = status.data ?? [];
    const concluidos = new Set(
      lista.filter((s) => s.tipo === "concluido" || s.tipo === "cancelado").map((s) => s.id),
    );
    const hoje = new Date().toISOString().split("T")[0]!;

    const porStatus = lista.map((s) => ({
      nome: s.nome,
      cor: s.cor,
      valor: tarefas.filter((t) => t.status_id === s.id).length,
    }));

    const prioridades: Prioridade[] = ["urgente", "alta", "normal", "baixa"];
    const porPrioridade = prioridades.map((p) => ({
      nome: PRIORIDADE_LABEL[p],
      valor: tarefas.filter((t) => t.prioridade === p).length,
    }));

    const porResponsavel = new Map<string, number>();
    for (const t of tarefas) {
      if (concluidos.has(t.status_id)) continue;
      const k = t.responsavel_id ?? "sem";
      porResponsavel.set(k, (porResponsavel.get(k) ?? 0) + 1);
    }

    const concluidas = tarefas.filter((t) => concluidos.has(t.status_id)).length;
    const atrasadas = tarefas.filter(
      (t) => t.prazo && t.prazo.split("T")[0]! < hoje && !concluidos.has(t.status_id),
    ).length;

    return {
      porStatus,
      porPrioridade,
      porResponsavel: [...porResponsavel.entries()].sort((a, b) => b[1] - a[1]),
      total: tarefas.length,
      concluidas,
      abertas: tarefas.length - concluidas,
      atrasadas,
      estimativa: tarefas.reduce((s, t) => s + Number(t.estimativa_horas ?? 0), 0),
      gastas: tarefas.reduce((s, t) => s + Number(t.horas_gastas ?? 0), 0),
      progresso: tarefas.length ? Math.round((concluidas / tarefas.length) * 100) : 0,
    };
  }, [status.data, tarefas]);

  const nome = (id: string) =>
    id === "sem"
      ? "Sem responsável"
      : (perfis.data?.find((p) => p.id === id)?.nome_completo ?? "Usuário");

  const kpis = [
    { label: "Tarefas", valor: String(dados.total) },
    { label: "Abertas", valor: String(dados.abertas) },
    { label: "Atrasadas", valor: String(dados.atrasadas) },
    { label: "Horas apontadas", valor: `${num(dados.gastas, 1)} / ${num(dados.estimativa, 1)}` },
  ];

  return (
    <div className="space-y-4">
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

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progresso do projeto ({dados.concluidas} concluídas)</span>
            <span className="tabular-nums">{dados.progresso}%</span>
          </div>
          <Progress value={dados.progresso} />
          <p className="text-xs text-muted-foreground">
            Início {dataBR(projeto.data_inicio)} · Entrega prevista{" "}
            {dataBR(projeto.data_fim_prevista)}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tarefas por status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={dados.porStatus} dataKey="valor" nameKey="nome" outerRadius={90} label>
                  {dados.porStatus.map((s) => (
                    <Cell key={s.nome} fill={s.cor} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tarefas por prioridade</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dados.porPrioridade}>
                <XAxis dataKey="nome" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />
                <Bar dataKey="valor" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Carga por responsável (tarefas abertas)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0">
          {dados.porResponsavel.length ? (
            dados.porResponsavel.map(([id, qtd]) => (
              <div key={id} className="flex items-center gap-3 text-xs">
                <span className="w-48 truncate">{nome(id)}</span>
                <Progress
                  value={(qtd / dados.porResponsavel[0]![1]) * 100}
                  className="h-2 flex-1"
                />
                <span className="w-8 text-right tabular-nums">{qtd}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Nenhuma tarefa aberta.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
