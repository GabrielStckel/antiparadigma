import { Fragment, useState } from "react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditoria, useUsuariosAdmin, TAMANHO_PAGINA, type FiltrosAuditoria } from "@/hooks/use-admin";
import { baixarCSV } from "@/lib/csv";

const ENTIDADES = [
  "tools",
  "tool_costs",
  "tool_users",
  "profiles",
  "user_roles",
  "module_permissions",
  "areas",
  "tool_categories",
  "settings",
];

const ACOES = ["criacao", "alteracao", "exclusao", "recalculo_cambio", "convite"];

const ACAO_LABEL: Record<string, string> = {
  criacao: "Criação",
  alteracao: "Alteração",
  exclusao: "Exclusão",
  recalculo_cambio: "Recálculo de câmbio",
  convite: "Convite",
};

const dataHoraBR = (v: string) =>
  new Date(v).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

/** Lista os campos que mudaram entre antes/depois. */
function diff(antes: unknown, depois: unknown) {
  const a = (antes ?? {}) as Record<string, unknown>;
  const d = (depois ?? {}) as Record<string, unknown>;
  const chaves = [...new Set([...Object.keys(a), ...Object.keys(d)])].filter(
    (k) => !["updated_at", "created_at"].includes(k),
  );
  return chaves
    .filter((k) => JSON.stringify(a[k]) !== JSON.stringify(d[k]))
    .map((k) => ({
      campo: k,
      antes: a[k] === undefined ? "—" : JSON.stringify(a[k]),
      depois: d[k] === undefined ? "—" : JSON.stringify(d[k]),
    }));
}

export function AbaAuditoria() {
  const { data: usuarios } = useUsuariosAdmin();
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({
    usuario: "todos",
    entidade: "todos",
    acao: "todos",
    de: "",
    ate: "",
    pagina: 0,
  });
  const { data, isLoading } = useAuditoria(filtros);
  const [aberta, setAberta] = useState<string | null>(null);

  const set = (patch: Partial<FiltrosAuditoria>) =>
    setFiltros((f) => ({ ...f, pagina: 0, ...patch }));

  const nomePessoa = (id: string | null) =>
    id ? ((usuarios ?? []).find((u) => u.id === id)?.nome_completo ?? "—") : "Sistema";

  const total = data?.total ?? 0;
  const ultimaPagina = Math.max(0, Math.ceil(total / TAMANHO_PAGINA) - 1);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1.5">
          <Label>Usuário</Label>
          <Select value={filtros.usuario} onValueChange={(v) => set({ usuario: v })}>
            <SelectTrigger className="h-8 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {(usuarios ?? []).map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nome_completo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Entidade</Label>
          <Select value={filtros.entidade} onValueChange={(v) => set({ entidade: v })}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {ENTIDADES.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Ação</Label>
          <Select value={filtros.acao} onValueChange={(v) => set({ acao: v })}>
            <SelectTrigger className="h-8 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              {ACOES.map((a) => (
                <SelectItem key={a} value={a}>
                  {ACAO_LABEL[a] ?? a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="aud-de">De</Label>
          <Input
            id="aud-de"
            type="date"
            className="h-8 w-36"
            value={filtros.de}
            onChange={(e) => set({ de: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="aud-ate">Até</Label>
          <Input
            id="aud-ate"
            type="date"
            className="h-8 w-36"
            value={filtros.ate}
            onChange={(e) => set({ ate: e.target.value })}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8"
          onClick={() =>
            baixarCSV(
              "auditoria",
              ["Data", "Usuário", "Ação", "Entidade", "Registro", "Antes", "Depois"],
              (data?.linhas ?? []).map((l) => [
                dataHoraBR(l.created_at),
                nomePessoa(l.user_id),
                ACAO_LABEL[l.acao] ?? l.acao,
                l.entidade,
                l.entidade_id ?? "",
                JSON.stringify(l.dados_antes ?? ""),
                JSON.stringify(l.dados_depois ?? ""),
              ]),
            )
          }
        >
          Exportar CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead className="text-right">Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  Carregando…
                </TableCell>
              </TableRow>
            ) : (data?.linhas.length ?? 0) === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-sm text-muted-foreground">
                  Nenhum registro no período.
                </TableCell>
              </TableRow>
            ) : (
              (data?.linhas ?? []).map((l) => {
                const mudancas = diff(l.dados_antes, l.dados_depois);
                return (
                  <Fragment key={l.id}>
                    <TableRow>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {dataHoraBR(l.created_at)}
                      </TableCell>
                      <TableCell>{nomePessoa(l.user_id)}</TableCell>
                      <TableCell>{ACAO_LABEL[l.acao] ?? l.acao}</TableCell>
                      <TableCell className="text-muted-foreground">{l.entidade}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7"
                          onClick={() => setAberta(aberta === l.id ? null : l.id)}
                        >
                          {aberta === l.id ? "Ocultar" : `Ver (${mudancas.length})`}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {aberta === l.id && (
                      <TableRow>
                        <TableCell colSpan={5} className="bg-muted/40">
                          {mudancas.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Sem campos alterados.</p>
                          ) : (
                            <ul className="space-y-1 text-xs">
                              {mudancas.map((m) => (
                                <li key={m.campo} className="flex flex-wrap gap-2">
                                  <span className="font-medium">{m.campo}:</span>
                                  <span className="text-muted-foreground line-through">
                                    {m.antes}
                                  </span>
                                  <span>→</span>
                                  <span>{m.depois}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {total} registro(s) · página {filtros.pagina + 1} de {ultimaPagina + 1}
        </span>
        <div className="space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            disabled={filtros.pagina === 0}
            onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina - 1 }))}
          >
            Anterior
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7"
            disabled={filtros.pagina >= ultimaPagina}
            onClick={() => setFiltros((f) => ({ ...f, pagina: f.pagina + 1 }))}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  );
}
