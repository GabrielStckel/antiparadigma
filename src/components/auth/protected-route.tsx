import { Link } from "@tanstack/react-router";
import { ShieldOff } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMeuAcesso, type Nivel } from "@/hooks/use-auth";

type Modulo = "ferramentas" | "tarefas" | "admin";

const MODULO_LABEL: Record<Modulo, string> = {
  ferramentas: "Ferramentas",
  tarefas: "Tarefas",
  admin: "Administração",
};

/**
 * Guarda de permissão de módulo. O bloqueio de contas pending/suspended fica
 * centralizado no beforeLoad do layout _authenticated.
 */
export function ProtectedRoute({
  module,
  minLevel = "view",
  children,
}: {
  module: Modulo;
  minLevel?: Nivel;
  children: ReactNode;
}) {
  const { pode, carregando } = useMeuAcesso();

  if (carregando) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pode(module, minLevel)) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-24 text-center">
        <ShieldOff className="size-8 text-muted-foreground" />
        <div>
          <h1 className="titulo-pagina">
            Você não tem acesso a este módulo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O módulo {MODULO_LABEL[module]} exige permissão de nível{" "}
            <span className="font-medium">{minLevel}</span>. Fale com um administrador.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/">Voltar ao dashboard</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
