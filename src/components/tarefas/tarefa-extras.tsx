import { Paperclip, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePerfis } from "@/hooks/use-ferramentas";
import {
  abrirAnexo,
  DEPENDENCIA_LABEL,
  useAnexos,
  useAnexosMutations,
  useDependencias,
  useDependenciasMutations,
  useHoras,
  useHorasMutations,
  useTarefas,
  type Tarefa,
} from "@/hooks/use-tarefas";
import { dataBR, num } from "@/lib/format";

const hojeISO = () => new Date().toISOString().slice(0, 10);

export function ApontamentoHoras({ taskId }: { taskId: string }) {
  const horas = useHoras(taskId);
  const { lancar, remover } = useHorasMutations(taskId);
  const perfis = usePerfis();
  const [data, setData] = useState(hojeISO());
  const [qtd, setQtd] = useState("");
  const [descricao, setDescricao] = useState("");

  const total = (horas.data ?? []).reduce((s, h) => s + Number(h.horas), 0);

  return (
    <div className="space-y-3">
      <form
        className="flex flex-wrap items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(qtd.replace(",", "."));
          if (!n || n <= 0) return;
          lancar.mutate(
            { data, horas: n, descricao: descricao.trim() || null },
            {
              onSuccess: () => {
                setQtd("");
                setDescricao("");
              },
            },
          );
        }}
      >
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="horas-data">
            Data
          </label>
          <Input
            id="horas-data"
            type="date"
            className="h-8 w-36"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="horas-qtd">
            Horas
          </label>
          <Input
            id="horas-qtd"
            className="h-8 w-20"
            inputMode="decimal"
            placeholder="1,5"
            value={qtd}
            onChange={(e) => setQtd(e.target.value)}
          />
        </div>
        <div className="min-w-40 flex-1 space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="horas-desc">
            Descrição
          </label>
          <Input
            id="horas-desc"
            className="h-8"
            placeholder="O que foi feito"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" disabled={lancar.isPending}>
          Lançar
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">Total apontado: {num(total, 1)} h</p>

      <div className="space-y-1">
        {(horas.data ?? []).map((h) => (
          <div key={h.id} className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs">
            <span className="w-20 tabular-nums">{dataBR(h.data)}</span>
            <span className="w-14 tabular-nums">{num(Number(h.horas), 1)} h</span>
            <span className="min-w-0 flex-1 truncate">{h.descricao ?? "—"}</span>
            <span className="truncate text-muted-foreground">
              {perfis.data?.find((p) => p.id === h.user_id)?.nome_completo ?? "—"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Remover lançamento"
              onClick={() => remover.mutate(h.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {!horas.data?.length ? (
          <p className="text-sm text-muted-foreground">Nenhuma hora apontada.</p>
        ) : null}
      </div>
    </div>
  );
}

export function AnexosTarefa({ taskId }: { taskId: string }) {
  const anexos = useAnexos(taskId);
  const { enviar, remover } = useAnexosMutations(taskId);
  const [arrastando, setArrastando] = useState(false);

  const enviarLista = (arquivos: FileList | null) => {
    for (const a of Array.from(arquivos ?? [])) enviar.mutate(a);
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          enviarLista(e.dataTransfer.files);
        }}
        className={`rounded-md border border-dashed p-4 text-center text-xs ${
          arrastando ? "border-primary bg-accent" : "text-muted-foreground"
        }`}
      >
        Arraste arquivos aqui ou
        <label className="ml-1 cursor-pointer font-medium text-foreground underline">
          selecione
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => enviarLista(e.target.files)}
          />
        </label>
      </div>

      <div className="space-y-1">
        {(anexos.data ?? []).map((a) => (
          <div key={a.id} className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs">
            <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <button
              type="button"
              className="min-w-0 flex-1 truncate text-left hover:underline"
              onClick={() => void abrirAnexo(a.storage_path)}
            >
              {a.nome_arquivo}
            </button>
            <span className="text-muted-foreground">
              {a.tamanho_bytes ? `${num(Number(a.tamanho_bytes) / 1024, 0)} KB` : "—"}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Remover anexo"
              onClick={() => remover.mutate({ id: a.id, storagePath: a.storage_path })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {!anexos.data?.length ? (
          <p className="text-sm text-muted-foreground">Nenhum anexo.</p>
        ) : null}
      </div>
    </div>
  );
}

export function DependenciasTarefa({ tarefa }: { tarefa: Tarefa }) {
  const deps = useDependencias(tarefa.id);
  const { adicionar, remover } = useDependenciasMutations(tarefa.id);
  const tarefasProjeto = useTarefas({ projectId: tarefa.project_id });
  const [alvo, setAlvo] = useState("");
  const [tipo, setTipo] = useState<"bloqueia" | "aguarda" | "relacionada">("aguarda");

  const opcoes = (tarefasProjeto.data ?? []).filter((t) => t.id !== tarefa.id);
  const nome = (id: string) => {
    const t = opcoes.find((x) => x.id === id);
    return t ? `${t.codigo ?? "—"} ${t.titulo}` : "Tarefa";
  };
  const bloqueios = (deps.data ?? []).filter((d) => d.tipo === "aguarda");

  return (
    <div className="space-y-3">
      {bloqueios.length ? (
        <p className="rounded-md border border-warning-border bg-warning-bg px-2 py-1.5 text-xs text-warning-foreground">
          Esta tarefa aguarda {bloqueios.length} outra(s) tarefa(s) e pode estar bloqueada.
        </p>
      ) : null}

      <div className="flex flex-wrap items-end gap-2">
        <Select value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEPENDENCIA_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={alvo} onValueChange={setAlvo}>
          <SelectTrigger className="h-8 min-w-48 flex-1">
            <SelectValue placeholder="Selecione a tarefa" />
          </SelectTrigger>
          <SelectContent>
            {opcoes.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.codigo} {t.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          disabled={!alvo || adicionar.isPending}
          onClick={() =>
            adicionar.mutate({ dependsOnId: alvo, tipo }, { onSuccess: () => setAlvo("") })
          }
        >
          Adicionar
        </Button>
      </div>

      <div className="space-y-1">
        {(deps.data ?? []).map((d) => (
          <div key={d.id} className="flex items-center gap-2 rounded border px-2 py-1.5 text-xs">
            <Badge variant="secondary" className="text-[10px]">
              {DEPENDENCIA_LABEL[d.tipo]}
            </Badge>
            <span className="min-w-0 flex-1 truncate">{nome(d.depends_on_id)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Remover dependência"
              onClick={() => remover.mutate(d.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {!deps.data?.length ? (
          <p className="text-sm text-muted-foreground">Nenhuma dependência.</p>
        ) : null}
      </div>
    </div>
  );
}
