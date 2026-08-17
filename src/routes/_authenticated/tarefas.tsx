import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({
    meta: [
      { title: "Tarefas · Antiparadigma OS" },
      { name: "description", content: "Módulo de tarefas internas da Antiparadigma." },
      { property: "og:title", content: "Tarefas · Antiparadigma OS" },
      { property: "og:description", content: "Módulo de tarefas internas da Antiparadigma." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="p-8">
      <h1 className="text-lg font-semibold tracking-tight">Tarefas</h1>
      <p className="mt-1 text-sm text-muted-foreground">Módulo em construção.</p>
    </div>
  ),
});
