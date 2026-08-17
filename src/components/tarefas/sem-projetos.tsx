import { FolderPlus } from "lucide-react";
import { useState } from "react";

import { ProjetoDialog } from "@/components/tarefas/projeto-dialog";
import { Button } from "@/components/ui/button";

/**
 * Estado único e consistente para quando não existe nenhum projeto.
 * Toda tarefa pertence a um projeto, então a ação é criar o primeiro.
 */
export function SemProjetos({
  descricao = "Toda tarefa pertence a um projeto. Crie o primeiro para começar.",
}: {
  descricao?: string;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
      <FolderPlus className="h-6 w-6 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <p className="titulo-secao">Nenhum projeto por aqui</p>
        <p className="text-aux max-w-sm text-muted-foreground">{descricao}</p>
      </div>
      <Button size="sm" onClick={() => setAberto(true)}>
        Criar primeiro projeto
      </Button>
      <ProjetoDialog aberto={aberto} onOpenChange={setAberto} />
    </div>
  );
}
