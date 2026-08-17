import { createFileRoute } from "@tanstack/react-router";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CustosLote } from "@/components/ferramentas/custos-lote";
import { TabelaFerramentas } from "@/components/ferramentas/tabela-ferramentas";
import { VisaoGeral } from "@/components/ferramentas/visao-geral";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeuAcesso } from "@/hooks/use-auth";
import {
  useAreas,
  useCambio,
  useCategorias,
  useFerramentas,
  usePerfis,
} from "@/hooks/use-ferramentas";

export const Route = createFileRoute("/_authenticated/ferramentas")({
  head: () => ({
    meta: [
      { title: "Ferramentas · Antiparadigma OS" },
      {
        name: "description",
        content: "Inventário de ferramentas, custos mensais em BRL, renovações e faturamento real.",
      },
      { property: "og:title", content: "Ferramentas · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Inventário de ferramentas, custos mensais em BRL, renovações e faturamento real.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ProtectedRoute module="ferramentas" minLevel="view">
      <Ferramentas />
    </ProtectedRoute>
  ),
});

function Ferramentas() {
  const { pode, isAdmin, carregando } = useMeuAcesso();
  const ferramentas = useFerramentas();
  const areas = useAreas();
  const categorias = useCategorias();
  const perfis = usePerfis();
  const cambio = useCambio();

  if (carregando || ferramentas.isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const podeEditar = pode("ferramentas", "edit");

  return (
    <div className="space-y-4 p-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight">Ferramentas</h1>
        <p className="text-sm text-muted-foreground">
          Inventário, custos e faturamento real das ferramentas da Antiparadigma.
        </p>
      </header>

      <Tabs defaultValue="visao">
        <TabsList className="h-8">
          <TabsTrigger value="visao" className="text-xs">
            Visão geral
          </TabsTrigger>
          <TabsTrigger value="inventario" className="text-xs">
            Inventário
          </TabsTrigger>
          <TabsTrigger value="custos" className="text-xs">
            Custos mensais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao" className="mt-4">
          <VisaoGeral
            ferramentas={ferramentas.data ?? []}
            areas={areas.data ?? []}
            categorias={categorias.data ?? []}
          />
        </TabsContent>

        <TabsContent value="inventario" className="mt-4">
          <TabelaFerramentas
            ferramentas={ferramentas.data ?? []}
            areas={areas.data ?? []}
            categorias={categorias.data ?? []}
            perfis={perfis.data ?? []}
            podeEditar={podeEditar}
            podeExcluir={isAdmin}
          />
        </TabsContent>

        <TabsContent value="custos" className="mt-4">
          <CustosLote
            ferramentas={ferramentas.data ?? []}
            cambio={cambio.data ?? {}}
            podeEditar={podeEditar}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
