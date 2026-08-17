import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { usePerfis } from "@/hooks/use-ferramentas";
import {
  PRIORIDADE_LABEL,
  useProjetos,
  useSalvarTarefa,
  useStatusProjeto,
  type Prioridade,
  type Tarefa,
} from "@/hooks/use-tarefas";

type Props = {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  tarefa?: Tarefa | null;
  projetoPadrao?: string | null;
  parentTaskId?: string | null;
};

export function TarefaSheet({ aberto, onOpenChange, tarefa, projetoPadrao, parentTaskId }: Props) {
  const projetos = useProjetos();
  const perfis = usePerfis();
  const salvar = useSalvarTarefa();

  const [projectId, setProjectId] = useState<string>("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [statusId, setStatusId] = useState("");
  const [prioridade, setPrioridade] = useState<Prioridade>("normal");
  const [responsavel, setResponsavel] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [prazo, setPrazo] = useState("");
  const [estimativa, setEstimativa] = useState("");
  const [tags, setTags] = useState("");

  const status = useStatusProjeto(projectId || null);

  useEffect(() => {
    if (!aberto) return;
    setProjectId(tarefa?.project_id ?? projetoPadrao ?? "");
    setTitulo(tarefa?.titulo ?? "");
    setDescricao(tarefa?.descricao ?? "");
    setStatusId(tarefa?.status_id ?? "");
    setPrioridade(tarefa?.prioridade ?? "normal");
    setResponsavel(tarefa?.responsavel_id ?? "");
    setDataInicio(tarefa?.data_inicio ?? "");
    setPrazo(tarefa?.prazo ?? "");
    setEstimativa(tarefa?.estimativa_horas != null ? String(tarefa.estimativa_horas) : "");
    setTags((tarefa?.tags ?? []).join(", "));
  }, [aberto, tarefa, projetoPadrao]);

  useEffect(() => {
    if (!statusId && status.data?.length) setStatusId(status.data[0]!.id);
  }, [status.data, statusId]);

  const enviar = async () => {
    if (!titulo.trim() || !projectId || !statusId) return;
    await salvar.mutateAsync({
      ...(tarefa?.id ? { id: tarefa.id } : {}),
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      project_id: projectId,
      status_id: statusId,
      prioridade,
      responsavel_id: responsavel || null,
      data_inicio: dataInicio || null,
      prazo: prazo || null,
      estimativa_horas: estimativa ? Number(estimativa) : null,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      ...(parentTaskId ? { parent_task_id: parentTaskId } : {}),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {tarefa ? "Editar tarefa" : parentTaskId ? "Nova subtarefa" : "Nova tarefa"}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-3 px-4">
          <div className="space-y-1.5">
            <Label htmlFor="t-titulo">Título</Label>
            <Input id="t-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Descrição</Label>
            <Textarea
              id="t-desc"
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Projeto</Label>
              <Select
                value={projectId}
                onValueChange={(v) => {
                  setProjectId(v);
                  setStatusId("");
                }}
                disabled={!!parentTaskId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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

            <div className="space-y-1.5">
              <Label>Prioridade</Label>
              <Select value={prioridade} onValueChange={(v) => setPrioridade(v as Prioridade)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORIDADE_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select value={responsavel} onValueChange={setResponsavel}>
                <SelectTrigger>
                  <SelectValue placeholder="Sem responsável" />
                </SelectTrigger>
                <SelectContent>
                  {(perfis.data ?? []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="t-inicio">Início</Label>
              <Input
                id="t-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="t-prazo">Prazo</Label>
              <Input
                id="t-prazo"
                type="date"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="t-est">Estimativa (h)</Label>
              <Input
                id="t-est"
                type="number"
                step="0.5"
                value={estimativa}
                onChange={(e) => setEstimativa(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="t-tags">Tags</Label>
              <Input
                id="t-tags"
                placeholder="site, urgente"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={enviar} disabled={salvar.isPending || !titulo.trim() || !projectId}>
            Salvar
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
