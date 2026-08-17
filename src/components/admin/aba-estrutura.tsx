import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COR_PADRAO, SeletorCor } from "@/components/ui/seletor-cor";
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
import { useAreasAdmin, useCategoriasAdmin, useMutacoesEstrutura } from "@/hooks/use-admin";
import { usePerfis } from "@/hooks/use-ferramentas";

export function AbaEstrutura() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Areas />
      <Categorias />
    </div>
  );
}

function Areas() {
  const { data: areas, isLoading } = useAreasAdmin();
  const { data: perfis } = usePerfis();
  const { salvarArea, excluirArea } = useMutacoesEstrutura();

  const [nome, setNome] = useState("");
  const [cor, setCor] = useState<string>(COR_PADRAO);
  const [responsavel, setResponsavel] = useState("nenhum");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const limpar = () => {
    setNome("");
    setCor(COR_PADRAO);
    setResponsavel("nenhum");
    setEditandoId(null);
  };

  const nomePessoa = (id: string | null) =>
    id ? ((perfis ?? []).find((p) => p.id === id)?.nome_completo ?? "—") : "—";

  return (
    <section className="space-y-3">
      <h2 className="titulo-secao">Áreas</h2>
      <form
        className="flex flex-wrap items-end gap-2 rounded-md border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          salvarArea.mutate(
            {
              ...(editandoId ? { id: editandoId } : {}),
              nome: nome.trim(),
              cor,
              responsavel_id: responsavel === "nenhum" ? null : responsavel,
            },
            {
              onSuccess: () => {
                toast.success(editandoId ? "Área atualizada." : "Área criada.");
                limpar();
              },
            },
          );
        }}
      >
        <div className="min-w-40 flex-1 space-y-1.5">
          <Label htmlFor="area-nome">Nome</Label>
          <Input
            id="area-nome"
            className="h-8"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Cor</Label>
          <SeletorCor valor={cor} onChange={setCor} className="pt-1" />
        </div>
        <div className="space-y-1.5">
          <Label>Responsável</Label>
          <Select value={responsavel} onValueChange={setResponsavel}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Sem responsável</SelectItem>
              {(perfis ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" size="sm" className="h-8" disabled={salvarArea.isPending}>
          {editandoId ? "Salvar" : "Adicionar"}
        </Button>
        {editandoId && (
          <Button type="button" size="sm" variant="ghost" className="h-8" onClick={limpar}>
            Cancelar
          </Button>
        )}
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Área</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Em uso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-sm text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : (
              (areas ?? []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full border"
                        style={{ backgroundColor: a.cor ?? "transparent" }}
                      />
                      {a.nome}
                    </span>
                  </TableCell>
                  <TableCell>{nomePessoa(a.responsavel_id)}</TableCell>
                  <TableCell className="text-muted-foreground">{a.usos}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => {
                        setEditandoId(a.id);
                        setNome(a.nome);
                        setCor(a.cor ?? COR_PADRAO);
                        setResponsavel(a.responsavel_id ?? "nenhum");
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => {
                        if (a.usos > 0) {
                          toast.error(
                            `Área em uso por ${a.usos} registro(s). Realoque-os antes de excluir.`,
                          );
                          return;
                        }
                        excluirArea.mutate(a.id, {
                          onSuccess: () => toast.success("Área excluída."),
                        });
                      }}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}

function Categorias() {
  const { data: categorias, isLoading } = useCategoriasAdmin();
  const { salvarCategoria, excluirCategoria } = useMutacoesEstrutura();
  const [nome, setNome] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const limpar = () => {
    setNome("");
    setEditandoId(null);
  };

  return (
    <section className="space-y-3">
      <h2 className="titulo-secao">Categorias de ferramentas</h2>
      <form
        className="flex flex-wrap items-end gap-2 rounded-md border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          salvarCategoria.mutate(
            { ...(editandoId ? { id: editandoId } : {}), nome: nome.trim() },
            {
              onSuccess: () => {
                toast.success(editandoId ? "Categoria atualizada." : "Categoria criada.");
                limpar();
              },
            },
          );
        }}
      >
        <div className="min-w-40 flex-1 space-y-1.5">
          <Label htmlFor="cat-nome">Nome</Label>
          <Input
            id="cat-nome"
            className="h-8"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" className="h-8" disabled={salvarCategoria.isPending}>
          {editandoId ? "Salvar" : "Adicionar"}
        </Button>
        {editandoId && (
          <Button type="button" size="sm" variant="ghost" className="h-8" onClick={limpar}>
            Cancelar
          </Button>
        )}
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Ferramentas</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-sm text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : (
              (categorias ?? []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.nome}</TableCell>
                  <TableCell className="text-muted-foreground">{c.usos}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => {
                        setEditandoId(c.id);
                        setNome(c.nome);
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7"
                      onClick={() => {
                        if (c.usos > 0) {
                          toast.error(
                            `Categoria usada por ${c.usos} ferramenta(s). Reclassifique antes de excluir.`,
                          );
                          return;
                        }
                        excluirCategoria.mutate(c.id, {
                          onSuccess: () => toast.success("Categoria excluída."),
                        });
                      }}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
