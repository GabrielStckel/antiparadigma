import { createFileRoute } from "@tanstack/react-router";

import { useMeuAcesso } from "@/hooks/use-auth";
import { dataBR } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil · Antiparadigma OS" },
      { name: "description", content: "Seus dados de acesso no Antiparadigma OS." },
      { property: "og:title", content: "Perfil · Antiparadigma OS" },
      { property: "og:description", content: "Seus dados de acesso no Antiparadigma OS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  const { perfil, papeis, nivel } = useMeuAcesso();
  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="titulo-pagina">Perfil</h1>
        <p className="text-sm text-muted-foreground">Seus dados e permissões.</p>
      </header>
      <dl className="grid max-w-lg gap-2 rounded-md border p-4 text-sm">
        <Item rotulo="Nome" valor={perfil?.nome_completo ?? "—"} />
        <Item rotulo="E-mail" valor={perfil?.email ?? "—"} />
        <Item rotulo="Cargo" valor={perfil?.cargo ?? "—"} />
        <Item rotulo="Papel" valor={papeis.join(", ") || "—"} />
        <Item rotulo="Status" valor={perfil?.status ?? "—"} />
        <Item rotulo="Membro desde" valor={dataBR(perfil?.created_at)} />
        <Item rotulo="Ferramentas" valor={nivel("ferramentas")} />
        <Item rotulo="Tarefas" valor={nivel("tarefas")} />
        <Item rotulo="Administração" valor={nivel("admin")} />
      </dl>
    </div>
  );
}

function Item({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-1.5 last:border-0">
      <dt className="text-muted-foreground">{rotulo}</dt>
      <dd className="font-medium">{valor}</dd>
    </div>
  );
}
