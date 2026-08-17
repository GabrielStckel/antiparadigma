import { FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";

import { ProjetoDialog } from "@/components/tarefas/projeto-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { usePerfis } from "@/hooks/use-ferramentas";
import {
  PRIORIDADE_LABEL,
  useProjetosDisponiveis,
  useSalvarTarefa,
  useStatusProjeto,
  type Prioridade,
  type Tarefa,
} from "@/hooks/use-tarefas";
import { MensagemErro, useErrosForm } from "@/lib/validacao-form";

type Props = {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  tarefa?: Tarefa | null;
  projetoPadrao?: string | null;
  parentTaskId?: string | null;
};

export function TarefaSheet({ aberto, onOpenChange, tarefa, projetoPadrao, parentTaskId }: Props) {
  const projetos = useProjetosDisponiveis(tarefa?.project_id ?? projetoPadrao ?? null);
  const perfis = usePerfis();
  const salvar = useSalvarTarefa();
  const { erros, validar, limpar, limparTudo, campoProps } = useErrosForm<
    "titulo" | "projeto" | "status"
  >();

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
  const [criandoProjeto, setCriandoProjeto] = useState(false);

  const status = useStatusProjeto(projectId || null);

  useEffect(() => {
    if (!aberto) return;
    limparTudo();
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
  }, [aberto, tarefa, projetoPadrao, limparTudo]);

  useEffect(() => {
    if (!statusId && status.data?.length) setStatusId(status.data[0]!.id);
  }, [status.data, statusId]);

  const enviar = async () => {
    const ok = validar([
      ["titulo", !titulo.trim(), "Informe o título da tarefa."],
      ["projeto", !projectId, "Escolha o projeto ao qual a tarefa pertence."],
      [
        "status",
        !!projectId && !statusId,
        status.isLoading ? "Aguarde o carregamento dos status." : "Escolha o status inicial.",
      ],
    ]);
    if (!ok) return;
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

  const carregandoProjetos = projetos.isLoading || projetos.isPending;
  const semProjetos = !carregandoProjetos && (projetos.data ?? []).length === 0;

  const placeholderStatus = !projectId
    ? "Selecione um projeto primeiro"
    : status.isLoading
      ? "Carregando status..."
      : "Selecione";

  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {tarefa ? "Editar tarefa" : parentTaskId ? "Nova subtarefa" : "Nova tarefa"}
          </SheetTitle>
        </SheetHeader>

        {carregandoProjetos ? (
          <div className="space-y-3 px-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        ) : semProjetos ? (
          <div className="px-4">
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-10 text-center">
              <FolderPlus className="h-6 w-6 text-muted-foreground" aria-hidden />
              <p className="text-sm">
                Toda tarefa pertence a um projeto. Crie o primeiro para começar.
              </p>
              <Button size="sm" onClick={() => setCriandoProjeto(true)}>
                Criar primeiro projeto
              </Button>
            </div>
            <ProjetoDialog
              aberto={criandoProjeto}
              onOpenChange={setCriandoProjeto}
              onSalvo={(id) => {
                setProjectId(id);
                setStatusId("");
              }}
            />
          </div>
        ) : (
          <div className="space-y-3 px-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-titulo">Título</Label>
              <Input
                id="t-titulo"
                value={titulo}
                {...campoProps("titulo")}
                onChange={(e) => {
                  setTitulo(e.target.value);
                  limpar("titulo");
                }}
              />
              <MensagemErro>{erros.titulo}</MensagemErro>
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
                    limpar("projeto");
                  }}
                  disabled={!!parentTaskId}
                >
                  <SelectTrigger {...campoProps("projeto")}>
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
                <MensagemErro>{erros.projeto}</MensagemErro>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={statusId}
                  onValueChange={(v) => {
                    setStatusId(v);
                    limpar("status");
                  }}
                  disabled={!projectId || status.isLoading}
                >
                  <SelectTrigger {...campoProps("status")}>
                    <SelectValue placeholder={placeholderStatus} />
                  </SelectTrigger>
                  <SelectContent>
                    {(status.data ?? []).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!projectId ? (
                  <p className="text-aux text-muted-foreground">
                    Os status vêm do projeto escolhido.
                  </p>
                ) : null}
                <MensagemErro>{erros.status}</MensagemErro>
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
        )}

        <SheetFooter>
          {!semProjetos ? (
            <Button onClick={enviar} disabled={salvar.isPending || carregandoProjetos}>
              {salvar.isPending ? "Salvando..." : "Salvar"}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {semProjetos ? "Fechar" : "Cancelar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
