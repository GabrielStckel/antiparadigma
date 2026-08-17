import { createFileRoute } from "@tanstack/react-router";

import { AbaAuditoria } from "@/components/admin/aba-auditoria";
import { AbaConfiguracoes } from "@/components/admin/aba-configuracoes";
import { AbaEstrutura } from "@/components/admin/aba-estrutura";
import { AbaPermissoes } from "@/components/admin/aba-permissoes";
import { AbaUsuarios } from "@/components/admin/aba-usuarios";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração · Antiparadigma OS" },
      {
        name: "description",
        content: "Usuários, permissões, áreas, categorias, câmbio e auditoria.",
      },
      { property: "og:title", content: "Administração · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Usuários, permissões, áreas, categorias, câmbio e auditoria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

function Admin() {
  return (
    <ProtectedRoute module="admin" minLevel="admin">
      <div className="space-y-4 p-6">
        <header>
          <h1 className="titulo-pagina">Administração</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Usuários, permissões por módulo, estrutura organizacional, câmbio e trilha de auditoria.
          </p>
        </header>

        <Tabs defaultValue="usuarios">
          <TabsList>
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            <TabsTrigger value="estrutura">Áreas e categorias</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
            <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          </TabsList>
          <TabsContent value="usuarios" className="mt-4">
            <AbaUsuarios />
          </TabsContent>
          <TabsContent value="permissoes" className="mt-4">
            <AbaPermissoes />
          </TabsContent>
          <TabsContent value="estrutura" className="mt-4">
            <AbaEstrutura />
          </TabsContent>
          <TabsContent value="configuracoes" className="mt-4">
            <AbaConfiguracoes />
          </TabsContent>
          <TabsContent value="auditoria" className="mt-4">
            <AbaAuditoria />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
