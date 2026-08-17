import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ProjetoConfig } from "@/components/tarefas/projeto-config";
import { ProjetoDialog } from "@/components/tarefas/projeto-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAreas } from "@/hooks/use-ferramentas";
import {
  PROJETO_STATUS_LABEL,
  useProjetos,
  useProjetosArquivados,
  useSalvarProjeto,
  useTarefas,
  useTodosStatus,
  type Projeto,
} from "@/hooks/use-tarefas";
import { dataBR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/tarefas/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos · Antiparadigma OS" },
      {
        name: "description",
        content: "Projetos internos e de clientes da Antiparadigma, com progresso e prazos.",
      },
      { property: "og:title", content: "Projetos · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Projetos internos e de clientes da Antiparadigma, com progresso e prazos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProjetosPagina,
});

function ProjetosPagina() {
  const projetos = useProjetos();
  const tarefas = useTarefas();
  const status = useTodosStatus();
  const areas = useAreas();
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Projeto | null>(null);
  const [configurando, setConfigurando] = useState<Projeto | null>(null);
  const arquivados = useProjetosArquivados();
  const salvar = useSalvarProjeto();

  const resumo = (id: string) => {
    const lista = (tarefas.data ?? []).filter((t) => t.project_id === id);
    const feitas = lista.filter(
      (t) => status.data?.find((s) => s.id === t.status_id)?.tipo === "concluido",
    ).length;
    return {
      total: lista.length,
      feitas,
      pct: lista.length ? Math.round((feitas * 100) / lista.length) : 0,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm text-muted-foreground">
            {(projetos.data ?? []).length} projetos ativos
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditando(null);
            setAberto(true);
          }}
        >
          Novo projeto
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(projetos.data ?? []).map((p) => {
          const r = resumo(p.id);
          return (
            <div key={p.id} className="rounded-lg border p-3 transition-colors hover:bg-accent/50">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{p.nome}</p>
                <Badge variant="secondary" className="text-[10px]">
                  {PROJETO_STATUS_LABEL[p.status]}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {areas.data?.find((a) => a.id === p.area_id)?.nome ?? "Sem área"}
                {p.cliente ? ` · ${p.cliente}` : ""}
              </p>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    {r.feitas}/{r.total} tarefas
                  </span>
                  <span>{r.pct}%</span>
                </div>
                <Progress value={r.pct} className="h-1.5" />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Prazo: {dataBR(p.data_fim_prevista)}
              </p>
              <div className="mt-3 flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    setEditando(p);
                    setAberto(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => setConfigurando(p)}
                >
                  Configurar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => salvar.mutate({ id: p.id, arquivado: true })}
                >
                  Arquivar
                </Button>
              </div>
            </div>
          );
        })}
        {!projetos.data?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum projeto cadastrado.</p>
        ) : null}
      </div>

      {arquivados.data?.length ? (
        <details className="rounded-md border p-3">
          <summary className="cursor-pointer text-sm font-medium">
            Arquivados ({arquivados.data.length})
          </summary>
          <div className="mt-2 space-y-1">
            {arquivados.data.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs">
                <span className="min-w-0 flex-1 truncate">{p.nome}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs"
                  onClick={() => salvar.mutate({ id: p.id, arquivado: false })}
                >
                  Restaurar
                </Button>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      <ProjetoDialog aberto={aberto} onOpenChange={setAberto} projeto={editando} />
      <ProjetoConfig
        projeto={configurando}
        aberto={!!configurando}
        onOpenChange={(v) => !v && setConfigurando(null)}
      />
    </div>
  );
}
