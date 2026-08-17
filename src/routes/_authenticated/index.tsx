import { createFileRoute, Link } from "@tanstack/react-router";

import { Progress } from "@/components/ui/progress";
import { useMeuAcesso } from "@/hooks/use-auth";
import { useFerramentas } from "@/hooks/use-ferramentas";
import { useMinhasTarefas, useProjetos, useTodosStatus } from "@/hooks/use-tarefas";
import { brl, dataBR, diasAte } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Início · Antiparadigma OS" },
      {
        name: "description",
        content: "Painel inicial do Antiparadigma OS: tarefas, projetos e custos de ferramentas.",
      },
      { property: "og:title", content: "Início · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Painel inicial do Antiparadigma OS: tarefas, projetos e custos de ferramentas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Hub,
});

function Hub() {
  const { perfil, pode } = useMeuAcesso();
  const podeTarefas = pode("tarefas", "view");
  const podeFerramentas = pode("ferramentas", "view");

  const tarefas = useMinhasTarefas();
  const projetos = useProjetos();
  const status = useTodosStatus();
  const ferramentas = useFerramentas();

  const tipo = (id: string) => status.data?.find((s) => s.id === id)?.tipo;
  const abertas = (tarefas.data ?? []).filter(
    (t) => tipo(t.status_id) !== "concluido" && tipo(t.status_id) !== "cancelado",
  );
  const atrasadas = abertas.filter((t) => {
    const d = diasAte(t.prazo);
    return d !== null && d < 0;
  });
  const proximas = abertas
    .filter((t) => t.prazo)
    .sort((a, b) => (a.prazo ?? "").localeCompare(b.prazo ?? ""))
    .slice(0, 5);

  const custoMensal = (ferramentas.data ?? [])
    .filter((f) => f.status !== "cancelada")
    .reduce((s, f) => s + Number(f.custo_mensal_brl ?? 0), 0);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="titulo-pagina">
          Olá, {perfil?.nome_completo?.split(" ")[0] ?? "bem-vindo"}
        </h1>
        <p className="text-sm text-muted-foreground">Visão geral do Antiparadigma OS.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {podeTarefas ? (
          <>
            <Kpi rotulo="Minhas tarefas em aberto" valor={String(abertas.length)} />
            <Kpi rotulo="Tarefas atrasadas" valor={String(atrasadas.length)} />
            <Kpi rotulo="Projetos ativos" valor={String((projetos.data ?? []).length)} />
          </>
        ) : null}
        {podeFerramentas ? (
          <Kpi rotulo="Custo mensal de ferramentas" valor={brl(custoMensal)} />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {podeTarefas ? (
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="titulo-secao">Próximos prazos</h2>
              <Link to="/tarefas" className="text-xs text-muted-foreground hover:underline">
                Ver tarefas
              </Link>
            </div>
            <div className="space-y-2">
              {proximas.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    <span className="mr-2 font-mono text-xs text-muted-foreground">{t.codigo}</span>
                    {t.titulo}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{dataBR(t.prazo)}</span>
                </div>
              ))}
              {!proximas.length ? (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa com prazo.</p>
              ) : null}
            </div>
          </section>
        ) : null}

        {podeTarefas ? (
          <section className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="titulo-secao">Projetos</h2>
              <Link to="/tarefas/projetos" className="text-xs text-muted-foreground hover:underline">
                Ver projetos
              </Link>
            </div>
            <div className="space-y-3">
              {(projetos.data ?? []).slice(0, 5).map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{p.nome}</span>
                    <span className="text-xs text-muted-foreground">{dataBR(p.data_fim_prevista)}</span>
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
              ))}
              {!projetos.data?.length ? (
                <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado.</p>
              ) : null}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Kpi({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{valor}</p>
    </div>
  );
}
