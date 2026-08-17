import { createFileRoute } from "@tanstack/react-router";

import { ProtectedRoute } from "@/components/auth/protected-route";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração · Antiparadigma OS" },
      { name: "description", content: "Usuários, permissões, áreas, categorias, câmbio e auditoria." },
      { property: "og:title", content: "Administração · Antiparadigma OS" },
      { property: "og:description", content: "Usuários, permissões, áreas, categorias, câmbio e auditoria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ProtectedRoute module="admin" minLevel="admin">
    <div className="p-8">
      <h1 className="text-lg font-semibold tracking-tight">Administração</h1>
      <p className="mt-1 text-sm text-muted-foreground">Módulo em construção.</p>
    </div>
    </ProtectedRoute>
  ),
});
