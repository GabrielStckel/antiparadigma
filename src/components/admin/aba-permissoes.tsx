import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutacoesUsuario, useUsuariosAdmin, type Modulo } from "@/hooks/use-admin";
import type { Nivel } from "@/hooks/use-auth";

const MODULOS: Modulo[] = ["ferramentas", "tarefas", "admin"];
const MODULO_LABEL: Record<Modulo, string> = {
  ferramentas: "Ferramentas",
  tarefas: "Tarefas",
  admin: "Administração",
};
const NIVEIS: Nivel[] = ["none", "view", "edit", "admin"];
const NIVEL_LABEL: Record<Nivel, string> = {
  none: "Sem acesso",
  view: "Ver",
  edit: "Editar",
  admin: "Administrar",
};

export function AbaPermissoes() {
  const { data: usuarios, isLoading } = useUsuariosAdmin();
  const { salvarPermissoes } = useMutacoesUsuario();
  const [rascunho, setRascunho] = useState<Record<string, Record<Modulo, Nivel>>>({});
  const [salvandoId, setSalvandoId] = useState<string | null>(null);

  useEffect(() => {
    if (!usuarios) return;
    setRascunho(Object.fromEntries(usuarios.map((u) => [u.id, { ...u.permissoes }])));
  }, [usuarios]);

  const alterado = (id: string) => {
    const u = (usuarios ?? []).find((x) => x.id === id);
    const r = rascunho[id];
    if (!u || !r) return false;
    return MODULOS.some((m) => u.permissoes[m] !== r[m]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Usuários com papel admin ou master admin têm acesso total independentemente desta matriz. As
        mudanças valem para o usuário depois que ele recarregar a sessão.
      </p>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              {MODULOS.map((m) => (
                <TableHead key={m}>{MODULO_LABEL[m]}</TableHead>
              ))}
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : (
              (usuarios ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.nome_completo}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  {MODULOS.map((m) => (
                    <TableCell key={m}>
                      <Select
                        value={rascunho[u.id]?.[m] ?? u.permissoes[m]}
                        onValueChange={(v) =>
                          setRascunho((r) => ({
                            ...r,
                            [u.id]: { ...(r[u.id] ?? u.permissoes), [m]: v as Nivel },
                          }))
                        }
                      >
                        <SelectTrigger className="h-8 w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {NIVEIS.map((n) => (
                            <SelectItem key={n} value={n}>
                              {NIVEL_LABEL[n]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7"
                      disabled={!alterado(u.id) || salvandoId === u.id}
                      onClick={() => {
                        const permissoes = rascunho[u.id];
                        if (!permissoes) return;
                        setSalvandoId(u.id);
                        salvarPermissoes.mutate(
                          { userId: u.id, permissoes },
                          {
                            onSuccess: () =>
                              toast.success(
                                `Permissões de ${u.nome_completo} salvas. Valem após ele recarregar a sessão.`,
                              ),
                            onSettled: () => setSalvandoId(null),
                          },
                        );
                      }}
                    >
                      {salvandoId === u.id ? "Salvando…" : "Salvar"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
