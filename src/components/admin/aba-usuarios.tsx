import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ConvidarUsuario } from "@/components/admin/convidar-usuario";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMeuAcesso, type Papel } from "@/hooks/use-auth";
import {
  useMutacoesUsuario,
  useUsuariosAdmin,
  type StatusUsuario,
  type UsuarioAdmin,
} from "@/hooks/use-admin";
import { useAreas } from "@/hooks/use-ferramentas";
import { dataBR } from "@/lib/format";

const PAPEIS: Papel[] = ["master_admin", "admin", "gestor", "membro", "visualizador"];

const PAPEL_LABEL: Record<Papel, string> = {
  master_admin: "Master admin",
  admin: "Admin",
  gestor: "Gestor",
  membro: "Membro",
  visualizador: "Visualizador",
};

const STATUS_LABEL: Record<StatusUsuario, string> = {
  pending: "Pendente",
  active: "Ativo",
  suspended: "Suspenso",
};

export function AbaUsuarios() {
  const { data: usuarios, isLoading } = useUsuariosAdmin();
  const { data: areas } = useAreas();
  const { alterarStatus, alternarPapel } = useMutacoesUsuario();
  const { papeis: meusPapeis } = useMeuAcesso();
  const souMaster = meusPapeis.includes("master_admin");

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<"todos" | StatusUsuario>("todos");
  const [papel, setPapel] = useState<"todos" | Papel>("todos");
  const [editando, setEditando] = useState<UsuarioAdmin | null>(null);
  const [papeisDe, setPapeisDe] = useState<UsuarioAdmin | null>(null);

  const totalMasters = (usuarios ?? []).filter((u) => u.papeis.includes("master_admin")).length;

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (usuarios ?? []).filter(
      (u) =>
        (status === "todos" || u.status === status) &&
        (papel === "todos" || u.papeis.includes(papel)) &&
        (!termo ||
          u.nome_completo.toLowerCase().includes(termo) ||
          u.email.toLowerCase().includes(termo)),
    );
  }, [usuarios, busca, status, papel]);

  const nomeArea = (id: string | null) =>
    id ? ((areas ?? []).find((a) => a.id === id)?.nome ?? "—") : "—";

  const mudarStatus = (id: string, novo: StatusUsuario) =>
    alterarStatus.mutate(
      { id, status: novo },
      {
        onSuccess: () => toast.success(`Usuário marcado como ${STATUS_LABEL[novo].toLowerCase()}.`),
      },
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-56 flex-1 space-y-1.5">
          <Label htmlFor="busca-usuarios">Buscar</Label>
          <Input
            id="busca-usuarios"
            className="h-8"
            placeholder="Nome ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="suspended">Suspenso</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Papel</Label>
          <Select value={papel} onValueChange={(v) => setPapel(v as typeof papel)}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {PAPEIS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PAPEL_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ConvidarUsuario />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Papéis</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-sm text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : filtrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-sm text-muted-foreground">
                  Nenhum usuário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtrados.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome_completo}</TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>{u.cargo ?? "—"}</TableCell>
                  <TableCell>{nomeArea(u.area_id)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.papeis.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        u.papeis.map((p) => (
                          <Badge key={p} variant="secondary" className="text-[11px]">
                            {PAPEL_LABEL[p]}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        u.status === "active"
                          ? "default"
                          : u.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[11px]"
                    >
                      {STATUS_LABEL[u.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{dataBR(u.ultimo_acesso)}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    {u.status !== "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        onClick={() => mudarStatus(u.id, "active")}
                      >
                        {u.status === "pending" ? "Aprovar" : "Reativar"}
                      </Button>
                    )}
                    {u.status === "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7"
                        onClick={() => mudarStatus(u.id, "suspended")}
                      >
                        Suspender
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => setEditando(u)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => setPapeisDe(u)}
                    >
                      Papéis
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EditarPerfil usuario={editando} onFechar={() => setEditando(null)} />

      <Dialog open={!!papeisDe} onOpenChange={(v) => !v && setPapeisDe(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">Papéis de {papeisDe?.nome_completo}</DialogTitle>
            <DialogDescription>
              Admin e master admin recebem acesso total a todos os módulos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {PAPEIS.map((p) => {
              const tem = papeisDe?.papeis.includes(p) ?? false;
              const ultimoMaster = p === "master_admin" && tem && totalMasters <= 1;
              const bloqueado = (p === "master_admin" && !souMaster) || ultimoMaster;
              return (
                <label key={p} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={tem}
                    disabled={bloqueado || alternarPapel.isPending}
                    onCheckedChange={(v) => {
                      if (!papeisDe) return;
                      alternarPapel.mutate(
                        { userId: papeisDe.id, role: p, conceder: v === true },
                        {
                          onSuccess: () => {
                            setPapeisDe((u) =>
                              u
                                ? {
                                    ...u,
                                    papeis:
                                      v === true
                                        ? [...u.papeis, p]
                                        : u.papeis.filter((x) => x !== p),
                                  }
                                : u,
                            );
                            toast.success("Papéis atualizados.");
                          },
                        },
                      );
                    }}
                  />
                  <span>{PAPEL_LABEL[p]}</span>
                  {ultimoMaster && (
                    <span className="text-xs text-muted-foreground">(último master admin)</span>
                  )}
                  {p === "master_admin" && !souMaster && (
                    <span className="text-xs text-muted-foreground">(só master admin)</span>
                  )}
                </label>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EditarPerfil({
  usuario,
  onFechar,
}: {
  usuario: UsuarioAdmin | null;
  onFechar: () => void;
}) {
  const { data: areas } = useAreas();
  const { salvarPerfil } = useMutacoesUsuario();
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [area, setArea] = useState("nenhuma");

  const abrir = (v: boolean) => {
    if (!v) onFechar();
  };

  return (
    <Dialog
      open={!!usuario}
      onOpenChange={abrir}
      key={usuario?.id ?? "vazio"}
      defaultOpen={false}
    >
      <DialogContent
        className="sm:max-w-sm"
        onOpenAutoFocus={() => {
          setNome(usuario?.nome_completo ?? "");
          setCargo(usuario?.cargo ?? "");
          setArea(usuario?.area_id ?? "nenhuma");
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base">Editar usuário</DialogTitle>
          <DialogDescription>{usuario?.email}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!usuario) return;
            salvarPerfil.mutate(
              {
                id: usuario.id,
                nome_completo: nome.trim(),
                cargo: cargo.trim() || null,
                area_id: area === "nenhuma" ? null : area,
              },
              {
                onSuccess: () => {
                  toast.success("Usuário atualizado.");
                  onFechar();
                },
              },
            );
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-nome">Nome completo</Label>
            <Input
              id="edit-nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-cargo">Cargo</Label>
            <Input id="edit-cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Área</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Sem área</SelectItem>
                {(areas ?? []).map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={salvarPerfil.isPending}>
            {salvarPerfil.isPending ? "Salvando…" : "Salvar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
