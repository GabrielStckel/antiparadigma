import { Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerfis } from "@/hooks/use-ferramentas";
import {
  PAPEL_PROJETO_LABEL,
  useMembrosMutations,
  useMembrosProjeto,
  useStatusMutations,
  useStatusProjeto,
  type Projeto,
} from "@/hooks/use-tarefas";

const TIPO_LABEL: Record<string, string> = {
  aberto: "Aberto",
  andamento: "Em andamento",
  revisao: "Em revisão",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export function ProjetoConfig({
  projeto,
  aberto,
  onOpenChange,
}: {
  projeto: Projeto | null;
  aberto: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  return (
    <Dialog open={aberto && !!projeto} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">
            Configurar projeto{projeto ? ` · ${projeto.nome}` : ""}
          </DialogTitle>
        </DialogHeader>
        {projeto ? (
          <Tabs defaultValue="status">
            <TabsList>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="membros">Membros</TabsTrigger>
            </TabsList>
            <TabsContent value="status" className="pt-3">
              <StatusProjeto projectId={projeto.id} />
            </TabsContent>
            <TabsContent value="membros" className="pt-3">
              <MembrosProjeto projeto={projeto} />
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function StatusProjeto({ projectId }: { projectId: string }) {
  const status = useStatusProjeto(projectId);
  const { salvar, remover } = useStatusMutations(projectId);
  const [nome, setNome] = useState("");
  const [cor, setCor] = useState("#6366f1");
  const [tipo, setTipo] = useState("aberto");

  const proximaOrdem = (status.data?.length ?? 0) + 1;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {(status.data ?? []).map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 rounded border px-2 py-1.5">
            <Input
              type="color"
              className="h-7 w-10 p-1"
              aria-label={`Cor de ${s.nome}`}
              defaultValue={s.cor}
              onBlur={(e) =>
                salvar.mutate({
                  id: s.id,
                  nome: s.nome,
                  cor: e.target.value,
                  tipo: s.tipo,
                  ordem: Number(s.ordem),
                })
              }
            />
            <Input
              className="h-7 flex-1 text-xs"
              defaultValue={s.nome}
              aria-label={`Nome de ${s.nome}`}
              onBlur={(e) =>
                e.target.value.trim() &&
                e.target.value !== s.nome &&
                salvar.mutate({
                  id: s.id,
                  nome: e.target.value.trim(),
                  cor: s.cor,
                  tipo: s.tipo,
                  ordem: Number(s.ordem),
                })
              }
            />
            <Badge variant="secondary" className="text-[10px]">
              {TIPO_LABEL[s.tipo]}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Subir ${s.nome}`}
              disabled={i === 0}
              onClick={() => {
                const anterior = status.data![i - 1]!;
                salvar.mutate({
                  id: s.id,
                  nome: s.nome,
                  cor: s.cor,
                  tipo: s.tipo,
                  ordem: Number(anterior.ordem) - 0.5,
                });
              }}
            >
              ↑
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Descer ${s.nome}`}
              disabled={i === (status.data?.length ?? 0) - 1}
              onClick={() => {
                const proximo = status.data![i + 1]!;
                salvar.mutate({
                  id: s.id,
                  nome: s.nome,
                  cor: s.cor,
                  tipo: s.tipo,
                  ordem: Number(proximo.ordem) + 0.5,
                });
              }}
            >
              ↓
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label={`Remover ${s.nome}`}
              onClick={() => remover.mutate(s.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <form
        className="flex flex-wrap items-end gap-2 border-t pt-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!nome.trim()) return;
          salvar.mutate(
            {
              nome: nome.trim(),
              cor,
              tipo: tipo as "aberto",
              ordem: proximaOrdem,
            },
            { onSuccess: () => setNome("") },
          );
        }}
      >
        <Input type="color" className="h-8 w-12 p-1" aria-label="Cor do novo status" value={cor} onChange={(e) => setCor(e.target.value)} />
        <Input
          className="h-8 w-40"
          placeholder="Novo status"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TIPO_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" size="sm">
          Adicionar
        </Button>
      </form>
    </div>
  );
}

function MembrosProjeto({ projeto }: { projeto: Projeto }) {
  const membros = useMembrosProjeto(projeto.id);
  const { adicionar, remover } = useMembrosMutations(projeto.id);
  const perfis = usePerfis();
  const [userId, setUserId] = useState("");
  const [papel, setPapel] = useState("editor");

  const disponiveis = (perfis.data ?? []).filter(
    (p) => !membros.data?.some((m) => m.user_id === p.id),
  );

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        {(membros.data ?? []).map((m) => (
          <div key={m.id} className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs">
            <span className="min-w-0 flex-1 truncate">
              {perfis.data?.find((p) => p.id === m.user_id)?.nome_completo ?? "Usuário"}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {PAPEL_PROJETO_LABEL[m.papel]}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Remover membro"
              disabled={m.papel === "owner"}
              onClick={() => remover.mutate(m.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {!membros.data?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum membro além do responsável.</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-2 border-t pt-3">
        <Select value={userId} onValueChange={setUserId}>
          <SelectTrigger className="h-8 w-52">
            <SelectValue placeholder="Selecione a pessoa" />
          </SelectTrigger>
          <SelectContent>
            {disponiveis.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nome_completo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={papel} onValueChange={setPapel}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="leitor">Leitor</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          disabled={!userId}
          onClick={() =>
            adicionar.mutate(
              { userId, papel: papel as "editor" },
              { onSuccess: () => setUserId("") },
            )
          }
        >
          Adicionar
        </Button>
      </div>
    </div>
  );
}
