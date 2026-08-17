import { Link, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, ListChecks, LogOut, Shield, User, Wrench } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMeuAcesso } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { BotaoTema } from "@/lib/tema";

const ITENS = [
  { to: "/", label: "Início", icon: LayoutGrid, modulo: null },
  { to: "/ferramentas", label: "Ferramentas", icon: Wrench, modulo: "ferramentas" as const },
  { to: "/tarefas", label: "Tarefas", icon: ListChecks, modulo: "tarefas" as const },
  { to: "/admin", label: "Administração", icon: Shield, modulo: "admin" as const },
  { to: "/perfil", label: "Perfil", icon: User, modulo: null },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { perfil, papeis, pode } = useMeuAcesso();
  const navigate = useNavigate();

  const iniciais = (perfil?.nome_completo ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const sair = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/login" });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <div className="px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Antiparadigma
          </p>
          <p className="text-sm font-semibold tracking-tight">OS</p>
        </div>
        <Separator />
        <nav className="flex-1 space-y-0.5 p-2">
          {ITENS.filter((i) => !i.modulo || pode(i.modulo, "view")).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:font-medium data-[status=active]:text-sidebar-accent-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="flex items-center gap-2 p-2">
          <Avatar className="size-7">
            <AvatarFallback className="text-[10px]">{iniciais}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{perfil?.nome_completo ?? "—"}</p>
            <p className="truncate text-[10px] text-muted-foreground">{papeis[0] ?? "membro"}</p>
          </div>
          <BotaoTema />
          <Button variant="ghost" size="icon" className="size-8" onClick={sair} aria-label="Sair">
            <LogOut className="size-4" />
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 overflow-x-auto border-b px-3 py-2 md:hidden">
          {ITENS.filter((i) => !i.modulo || pode(i.modulo, "view")).map((item) => (
            <Link key={item.to} to={item.to} className="whitespace-nowrap text-xs text-muted-foreground data-[status=active]:font-medium data-[status=active]:text-foreground">
              {item.label}
            </Link>
          ))}
          <div className="ml-auto flex items-center">
            <BotaoTema />
            <Button variant="ghost" size="icon" className="size-8" onClick={sair} aria-label="Sair">
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
