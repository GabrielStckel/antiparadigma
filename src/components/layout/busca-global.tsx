import { useNavigate } from "@tanstack/react-router";
import { FolderPlus, ListPlus, Plus, Receipt, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useMeuAcesso } from "@/hooks/use-auth";
import { useFerramentas } from "@/hooks/use-ferramentas";
import { useProjetos, useTarefas } from "@/hooks/use-tarefas";
import { dispararIntencao, type Intencao } from "@/lib/intencao";

export function BuscaGlobal() {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const { pode } = useMeuAcesso();
  const podeTarefas = pode("tarefas", "view");
  const podeFerramentas = pode("ferramentas", "view");
  const podeEditarTarefas = pode("tarefas", "edit");
  const podeEditarFerramentas = pode("ferramentas", "edit");

  const tarefas = useTarefas();
  const projetos = useProjetos();
  const ferramentas = useFerramentas();

  useEffect(() => {
    const atalho = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setAberto((v) => !v);
      }
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, []);

  const ir = (to: string) => {
    setAberto(false);
    void navigate({ to });
  };

  const acao = (to: string, intencao: Intencao) => {
    setAberto(false);
    void navigate({ to }).then(() => dispararIntencao(intencao));
  };

  const acoes = [
    {
      chave: "nova-ferramenta" as Intencao,
      label: "Nova ferramenta",
      termos: "nova ferramenta cadastrar tool",
      atalho: "N",
      rota: "/ferramentas",
      icone: Plus,
      permitido: podeEditarFerramentas,
    },
    {
      chave: "custos-mes" as Intencao,
      label: "Lançar custos do mês",
      termos: "lancar custos mes fechamento nota fiscal",
      atalho: "",
      rota: "/ferramentas",
      icone: Receipt,
      permitido: podeEditarFerramentas,
    },
    {
      chave: "nova-tarefa" as Intencao,
      label: "Nova tarefa",
      termos: "nova tarefa criar task",
      atalho: "",
      rota: "/tarefas/lista",
      icone: ListPlus,
      permitido: podeEditarTarefas,
    },
    {
      chave: "novo-projeto" as Intencao,
      label: "Novo projeto",
      termos: "novo projeto criar",
      atalho: "",
      rota: "/tarefas/projetos",
      icone: FolderPlus,
      permitido: podeEditarTarefas,
    },
  ].filter((a) => a.permitido);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 justify-start gap-2 px-2 text-xs text-muted-foreground"
        onClick={() => setAberto(true)}
      >
        <Search className="size-3.5" />
        Buscar
        <span className="ml-auto hidden text-[10px] sm:inline">⌘K</span>
      </Button>

      <CommandDialog open={aberto} onOpenChange={setAberto}>
        <CommandInput placeholder="Buscar ou executar uma ação…" />
        <CommandList>
          <CommandEmpty>Nada encontrado.</CommandEmpty>

          {acoes.length > 0 ? (
            <>
              <CommandGroup heading="Ações">
                {acoes.map((a) => (
                  <CommandItem
                    key={a.chave}
                    value={`${a.label} ${a.termos}`}
                    onSelect={() => acao(a.rota, a.chave)}
                  >
                    <a.icone className="size-3.5 text-muted-foreground" />
                    {a.label}
                    {a.atalho ? <CommandShortcut>{a.atalho}</CommandShortcut> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          ) : null}

          {podeTarefas ? (
            <CommandGroup heading="Tarefas">
              {(tarefas.data ?? []).slice(0, 50).map((t) => (
                <CommandItem
                  key={t.id}
                  value={`${t.codigo} ${t.titulo}`}
                  onSelect={() => ir("/tarefas/lista")}
                >
                  <span className="font-mono text-xs text-muted-foreground">{t.codigo}</span>
                  {t.titulo}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {podeTarefas ? (
            <CommandGroup heading="Projetos">
              {(projetos.data ?? []).map((p) => (
                <CommandItem key={p.id} value={p.nome} onSelect={() => ir("/tarefas/projetos")}>
                  {p.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {podeFerramentas ? (
            <CommandGroup heading="Ferramentas">
              {(ferramentas.data ?? []).map((f) => (
                <CommandItem key={f.id} value={f.nome} onSelect={() => ir("/ferramentas")}>
                  {f.nome}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
