import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { usePerfis } from "@/hooks/use-ferramentas";
import {
  PRIORIDADE_LABEL,
  useChecklist,
  useChecklistMutations,
  useComentar,
  useComentarios,
  useHistoricoTarefa,
  useMudarStatus,
  useStatusProjeto,
  useSubtarefas,
  type Tarefa,
} from "@/hooks/use-tarefas";
import { dataBR, num } from "@/lib/format";

import { AnexosTarefa, ApontamentoHoras, DependenciasTarefa } from "./tarefa-extras";
import { TarefaSheet } from "./tarefa-sheet";

export function DetalheTarefa({
  tarefa,
  onOpenChange,
}: {
  tarefa: Tarefa | null;
  onOpenChange: (v: boolean) => void;
}) {
  const aberto = !!tarefa;
  const [editando, setEditando] = useState(false);
  const [novaSub, setNovaSub] = useState(false);

  return (
    <>
      <Sheet open={aberto} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {tarefa ? (
            <>
              <SheetHeader>
                <p className="text-xs font-mono text-muted-foreground">{tarefa.codigo}</p>
                <SheetTitle className="text-base">{tarefa.titulo}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-8">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditando(true)}>
                    Editar
                  </Button>
                  {tarefa.nivel < 2 ? (
                    <Button size="sm" variant="outline" onClick={() => setNovaSub(true)}>
                      Nova subtarefa
                    </Button>
                  ) : null}
                </div>

                <Cabecalho tarefa={tarefa} />

                <Tabs defaultValue="detalhes">
                  <TabsList>
                    <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
                    <TabsTrigger value="checklist">Checklist</TabsTrigger>
                    <TabsTrigger value="horas">Horas</TabsTrigger>
                    <TabsTrigger value="anexos">Anexos</TabsTrigger>
                    <TabsTrigger value="dependencias">Dependências</TabsTrigger>
                    <TabsTrigger value="comentarios">Comentários</TabsTrigger>
                    <TabsTrigger value="historico">Histórico</TabsTrigger>
                  </TabsList>

                  <TabsContent value="detalhes" className="space-y-4 pt-3">
                    {tarefa.descricao ? (
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {tarefa.descricao}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem descrição.</p>
                    )}
                    <Separator />
                    <Subtarefas parentId={tarefa.id} />
                  </TabsContent>

                  <TabsContent value="checklist" className="pt-3">
                    <Checklist taskId={tarefa.id} />
                  </TabsContent>

                  <TabsContent value="horas" className="pt-3">
                    <ApontamentoHoras taskId={tarefa.id} />
                  </TabsContent>

                  <TabsContent value="anexos" className="pt-3">
                    <AnexosTarefa taskId={tarefa.id} />
                  </TabsContent>

                  <TabsContent value="dependencias" className="pt-3">
                    <DependenciasTarefa tarefa={tarefa} />
                  </TabsContent>

                  <TabsContent value="comentarios" className="pt-3">
                    <Comentarios taskId={tarefa.id} />
                  </TabsContent>

                  <TabsContent value="historico" className="pt-3">
                    <Historico taskId={tarefa.id} />
                  </TabsContent>

                </Tabs>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <TarefaSheet aberto={editando} onOpenChange={setEditando} tarefa={tarefa} />
      <TarefaSheet
        aberto={novaSub}
        onOpenChange={setNovaSub}
        projetoPadrao={tarefa?.project_id ?? null}
        parentTaskId={tarefa?.id ?? null}
      />
    </>
  );
}

function Cabecalho({ tarefa }: { tarefa: Tarefa }) {
  const status = useStatusProjeto(tarefa.project_id);
  const perfis = usePerfis();
  const mudar = useMudarStatus();
  const responsavel = perfis.data?.find((p) => p.id === tarefa.responsavel_id);

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Status</p>
          <Select
            value={tarefa.status_id}
            onValueChange={(v) => mudar.mutate({ id: tarefa.id, statusId: v })}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(status.data ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Info rotulo="Prioridade" valor={PRIORIDADE_LABEL[tarefa.prioridade]} />
        <Info rotulo="Responsável" valor={responsavel?.nome_completo ?? "—"} />
        <Info rotulo="Prazo" valor={dataBR(tarefa.prazo)} />
        <Info rotulo="Início" valor={dataBR(tarefa.data_inicio)} />
        <Info
          rotulo="Horas"
          valor={`${num(tarefa.horas_gastas)} / ${tarefa.estimativa_horas ? num(tarefa.estimativa_horas) : "—"}`}
        />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso</span>
          <span>{tarefa.progresso}%</span>
        </div>
        <Progress value={tarefa.progresso} className="h-1.5" />
      </div>
      {tarefa.tags.length ? (
        <div className="flex flex-wrap gap-1">
          {tarefa.tags.map((t) => (
            <Badge key={t} variant="secondary" className="text-[10px]">
              {t}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className="text-sm">{valor}</p>
    </div>
  );
}

function Subtarefas({ parentId }: { parentId: string }) {
  const subs = useSubtarefas(parentId);
  if (!subs.data?.length) return <p className="text-sm text-muted-foreground">Sem subtarefas.</p>;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subtarefas</p>
      {subs.data.map((s) => (
        <div key={s.id} className="flex items-center justify-between rounded border px-2 py-1.5 text-sm">
          <span className="truncate">
            <span className="mr-2 font-mono text-xs text-muted-foreground">{s.codigo}</span>
            {s.titulo}
          </span>
          <span className="text-xs text-muted-foreground">{s.progresso}%</span>
        </div>
      ))}
    </div>
  );
}

function Checklist({ taskId }: { taskId: string }) {
  const itens = useChecklist(taskId);
  const { adicionar, alternar, remover } = useChecklistMutations(taskId);
  const [texto, setTexto] = useState("");

  return (
    <div className="space-y-2">
      {(itens.data ?? []).map((i) => (
        <div key={i.id} className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={i.concluido}
            onCheckedChange={(v) => alternar.mutate({ id: i.id, concluido: !!v })}
          />
          <span className={i.concluido ? "line-through text-muted-foreground" : ""}>{i.texto}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 text-xs"
            onClick={() => remover.mutate(i.id)}
          >
            Remover
          </Button>
        </div>
      ))}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!texto.trim()) return;
          adicionar.mutate(texto.trim());
          setTexto("");
        }}
      >
        <Input
          className="h-8"
          placeholder="Novo item"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Button type="submit" size="sm">
          Adicionar
        </Button>
      </form>
    </div>
  );
}

function Comentarios({ taskId }: { taskId: string }) {
  const comentarios = useComentarios(taskId);
  const perfis = usePerfis();
  const comentar = useComentar(taskId);
  const [texto, setTexto] = useState("");

  return (
    <div className="space-y-3">
      {(comentarios.data ?? []).map((c) => (
        <div key={c.id} className="rounded-md border p-2">
          <p className="text-xs text-muted-foreground">
            {perfis.data?.find((p) => p.id === c.user_id)?.nome_completo ?? "—"} ·{" "}
            {new Date(c.created_at).toLocaleString("pt-BR")}
          </p>
          <p className="whitespace-pre-wrap text-sm">{c.conteudo}</p>
        </div>
      ))}
      {!comentarios.data?.length ? (
        <p className="text-sm text-muted-foreground">Nenhum comentário.</p>
      ) : null}
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!texto.trim()) return;
          comentar.mutate(texto.trim());
          setTexto("");
        }}
      >
        <Textarea
          rows={3}
          placeholder="Escreva um comentário"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={comentar.isPending}>
          Comentar
        </Button>
      </form>
    </div>
  );
}

function Historico({ taskId }: { taskId: string }) {
  const historico = useHistoricoTarefa(taskId);
  const perfis = usePerfis();
  const nome = (id: string | null) =>
    id ? (perfis.data?.find((p) => p.id === id)?.nome_completo ?? id) : "—";

  if (!historico.data?.length)
    return <p className="text-sm text-muted-foreground">Sem alterações registradas.</p>;

  return (
    <div className="space-y-2 text-sm">
      {historico.data.map((h) => (
        <div key={h.id} className="rounded border px-2 py-1.5">
          <p className="text-xs text-muted-foreground">
            {new Date(h.created_at).toLocaleString("pt-BR")} · {nome(h.user_id)}
          </p>
          <p>
            <span className="font-medium">{h.campo}</span>:{" "}
            {h.campo === "responsavel" ? nome(h.valor_antes) : (h.valor_antes ?? "—")} →{" "}
            {h.campo === "responsavel" ? nome(h.valor_depois) : (h.valor_depois ?? "—")}
          </p>
        </div>
      ))}
    </div>
  );
}
