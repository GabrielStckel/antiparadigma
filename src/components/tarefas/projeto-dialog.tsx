import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAreas, usePerfis } from "@/hooks/use-ferramentas";
import { PROJETO_STATUS_LABEL, useSalvarProjeto, type Projeto } from "@/hooks/use-tarefas";
import type { Database } from "@/integrations/supabase/types";

type StatusProjeto = Database["public"]["Enums"]["project_status"];

export function ProjetoDialog({
  aberto,
  onOpenChange,
  projeto,
  onSalvo,
}: {
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
  projeto?: Projeto | null;
  onSalvo?: (id: string) => void;
}) {
  const areas = useAreas();
  const perfis = usePerfis();
  const salvar = useSalvarProjeto();
  const { erros, validar, limpar, limparTudo, campoProps } = useErrosForm<"nome">();

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [areaId, setAreaId] = useState("");
  const [status, setStatus] = useState<StatusProjeto>("ativo");
  const [owner, setOwner] = useState("");
  const [cliente, setCliente] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");

  useEffect(() => {
    if (!aberto) return;
    limparTudo();
    setNome(projeto?.nome ?? "");
    setDescricao(projeto?.descricao ?? "");
    setAreaId(projeto?.area_id ?? "");
    setStatus(projeto?.status ?? "ativo");
    setOwner(projeto?.owner_id ?? "");
    setCliente(projeto?.cliente ?? "");
    setInicio(projeto?.data_inicio ?? "");
    setFim(projeto?.data_fim_prevista ?? "");
  }, [aberto, projeto, limparTudo]);

  const enviar = async () => {
    if (!validar([["nome", !nome.trim(), "Informe o nome do projeto."]])) return;
    const id = await salvar.mutateAsync({
      ...(projeto?.id ? { id: projeto.id } : {}),
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      area_id: areaId || null,
      status,
      ...(owner ? { owner_id: owner } : {}),
      cliente: cliente.trim() || null,
      data_inicio: inicio || null,
      data_fim_prevista: fim || null,
    });
    onOpenChange(false);
    if (typeof id === "string") onSalvo?.(id);
  };

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{projeto ? "Editar projeto" : "Novo projeto"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-nome">Nome</Label>
            <Input
              id="p-nome"
              value={nome}
              {...campoProps("nome")}
              onChange={(e) => {
                setNome(e.target.value);
                limpar("nome");
              }}
            />
            <MensagemErro>{erros.nome}</MensagemErro>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Descrição</Label>
            <Textarea
              id="p-desc"
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Área</Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {(areas.data ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StatusProjeto)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROJETO_STATUS_LABEL).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Dono</Label>
              <Select value={owner} onValueChange={setOwner}>
                <SelectTrigger>
                  <SelectValue placeholder="Eu" />
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
              <Label htmlFor="p-cliente">Cliente</Label>
              <Input id="p-cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-inicio">Início</Label>
              <Input
                id="p-inicio"
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-fim">Fim previsto</Label>
              <Input id="p-fim" type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={enviar} disabled={salvar.isPending || !nome.trim()}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
