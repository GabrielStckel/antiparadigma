import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useAreas } from "@/hooks/use-ferramentas";
import { convidarUsuario } from "@/lib/convidar-usuario.functions";

type Nivel = "none" | "view" | "edit" | "admin";
const NIVEIS: Nivel[] = ["none", "view", "edit", "admin"];
const NIVEL_LABEL: Record<Nivel, string> = {
  none: "Sem acesso",
  view: "Ver",
  edit: "Editar",
  admin: "Administrar",
};

export function ConvidarUsuario() {
  const enviarConvite = useServerFn(convidarUsuario);
  const queryClient = useQueryClient();
  const { data: areas } = useAreas();

  const [aberto, setAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [area, setArea] = useState("nenhuma");
  const [papel, setPapel] = useState<"admin" | "gestor" | "membro" | "visualizador">("membro");
  const [permissoes, setPermissoes] = useState<Record<"ferramentas" | "tarefas" | "admin", Nivel>>({
    ferramentas: "view",
    tarefas: "edit",
    admin: "none",
  });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await enviarConvite({
        data: {
          email: email.trim(),
          nome_completo: nome.trim(),
          cargo: cargo.trim() || null,
          area_id: area === "nenhuma" ? null : area,
          papel,
          permissoes,
        },
      });
      toast.success(`Convite enviado para ${email.trim()}.`);
      void queryClient.invalidateQueries({ queryKey: ["admin"] });
      setAberto(false);
      setEmail("");
      setNome("");
      setCargo("");
    } catch {
      toast.error("Não foi possível enviar o convite. Verifique o e-mail e tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8">
          <UserPlus className="mr-1.5 size-3.5" />
          Convidar usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Convidar usuário</DialogTitle>
          <DialogDescription>
            Enviamos um e-mail com o link para a pessoa definir a senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void enviar(e)} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="convite-email">E-mail</Label>
              <Input
                id="convite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="convite-nome">Nome completo</Label>
              <Input
                id="convite-nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="convite-cargo">Cargo</Label>
              <Input id="convite-cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
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
            <div className="space-y-1.5">
              <Label>Papel</Label>
              <Select value={papel} onValueChange={(v) => setPapel(v as typeof papel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="membro">Membro</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 rounded-md border p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Permissões por módulo
            </p>
            {(["ferramentas", "tarefas", "admin"] as const).map((m) => (
              <div key={m} className="flex items-center justify-between gap-3">
                <span className="text-sm capitalize">{m}</span>
                <Select
                  value={permissoes[m]}
                  onValueChange={(v) => setPermissoes((p) => ({ ...p, [m]: v as Nivel }))}
                >
                  <SelectTrigger className="h-8 w-40">
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
              </div>
            ))}
          </div>

          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Enviando convite…" : "Enviar convite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
