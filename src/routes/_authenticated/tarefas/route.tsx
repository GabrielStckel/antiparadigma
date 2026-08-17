import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

import { ProtectedRoute } from "@/components/auth/protected-route";

const ABAS = [
  { to: "/tarefas", label: "Minhas tarefas", exact: true },
  { to: "/tarefas/lista", label: "Lista", exact: false },
  { to: "/tarefas/quadro", label: "Quadro", exact: false },
  { to: "/tarefas/calendario", label: "Calendário", exact: false },
  { to: "/tarefas/cronograma", label: "Cronograma", exact: false },
  { to: "/tarefas/dashboard", label: "Dashboard", exact: false },
  { to: "/tarefas/projetos", label: "Projetos", exact: false },
];


export const Route = createFileRoute("/_authenticated/tarefas")({
  component: () => (
    <ProtectedRoute module="tarefas" minLevel="view">
    <div className="flex min-h-full flex-col">
      <div className="flex items-center gap-1 border-b px-4 py-2">
        {ABAS.map((a) => (
          <Link
            key={a.to}
            to={a.to}
            activeOptions={{ exact: a.exact }}
            className="rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent data-[status=active]:bg-accent data-[status=active]:font-medium data-[status=active]:text-foreground"
          >
            {a.label}
          </Link>
        ))}
      </div>
      <div className="min-w-0 flex-1 p-4">
        <Outlet />
      </div>
    </div>
    </ProtectedRoute>
  ),
});
