import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CustosLote } from "@/components/ferramentas/custos-lote";
import { FerramentaSheet } from "@/components/ferramentas/ferramenta-sheet";
import { TabelaFerramentas } from "@/components/ferramentas/tabela-ferramentas";
import { VisaoGeral } from "@/components/ferramentas/visao-geral";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMeuAcesso } from "@/hooks/use-auth";
import type { Ferramenta } from "@/hooks/use-ferramentas";
import {
  useAreas,
  useCambio,
  useCategorias,
  useFerramentas,
  usePerfis,
} from "@/hooks/use-ferramentas";
import { useIntencao } from "@/lib/intencao";

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

  const [aba, setAba] = useState("visao");
  const [sheetAberto, setSheetAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Ferramenta | null>(null);

  const podeEditar = pode("ferramentas", "edit");

  const abrirNova = useCallback(() => {
    setEmEdicao(null);
    setSheetAberto(true);
  }, []);

  const abrirEdicao = useCallback((f: Ferramenta) => {
    setEmEdicao(f);
    setSheetAberto(true);
  }, []);

  useIntencao(
    "nova-ferramenta",
    useCallback(() => {
      if (podeEditar) abrirNova();
    }, [podeEditar, abrirNova]),
  );

  useIntencao(
    "custos-mes",
    useCallback(() => setAba("custos"), []),
  );

  useEffect(() => {
    if (!podeEditar) return;
    const atalho = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      const alvo = e.target as HTMLElement | null;
      const digitando =
        !!alvo &&
        (alvo.tagName === "INPUT" ||
          alvo.tagName === "TEXTAREA" ||
          alvo.tagName === "SELECT" ||
          alvo.isContentEditable);
      if (digitando || document.querySelector("[role=dialog]")) return;
      e.preventDefault();
      abrirNova();
    };
    window.addEventListener("keydown", atalho);
    return () => window.removeEventListener("keydown", atalho);
  }, [podeEditar, abrirNova]);

  if (carregando || ferramentas.isLoading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="titulo-pagina">Ferramentas</h1>
          <p className="text-sm text-muted-foreground">
            Inventário, custos e faturamento real das ferramentas da Antiparadigma.
          </p>
        </div>
        {podeEditar && (
          <Button size="sm" className="h-8" onClick={abrirNova}>
            <Plus className="size-4" /> Nova ferramenta
            <span className="ml-1 rounded-sm border px-1 text-[10px] text-primary-foreground/70">
              N
            </span>
          </Button>
        )}
      </header>

      <Tabs value={aba} onValueChange={setAba}>
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
            onEditar={abrirEdicao}
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

      <FerramentaSheet
        aberto={sheetAberto}
        onOpenChange={setSheetAberto}
        ferramenta={emEdicao}
        areas={areas.data ?? []}
        categorias={categorias.data ?? []}
        perfis={perfis.data ?? []}
        podeEditar={podeEditar}
      />
    </div>
  );
}
