import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/acesso-pendente")({
  head: () => ({
    meta: [
      { title: "Acesso pendente · Antiparadigma OS" },
      {
        name: "description",
        content: "Sua conta ainda não está liberada para acessar o Antiparadigma OS.",
      },
      { property: "og:title", content: "Acesso pendente · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Sua conta ainda não está liberada para acessar o Antiparadigma OS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AcessoPendente,
});

function AcessoPendente() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"pending" | "suspended" | null>(null);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const { data: perfil } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .maybeSingle();
      if (perfil?.status === "active") {
        void navigate({ to: "/", replace: true });
        return;
      }
      setStatus(perfil?.status === "suspended" ? "suspended" : "pending");
    })();
  }, [navigate]);

  const sair = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/login", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 text-center shadow-sm">
        <Clock className="mx-auto size-7 text-muted-foreground" />
        <h1 className="mt-3 text-lg font-semibold tracking-tight">
          {status === "suspended" ? "Conta suspensa" : "Acesso aguardando aprovação"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {status === "suspended"
            ? "Sua conta está suspensa. Fale com um administrador para reativá-la."
            : "Sua conta foi criada, mas ainda precisa da aprovação de um administrador para acessar o sistema."}
        </p>
        <Button className="mt-5 w-full" variant="outline" onClick={() => void sair()}>
          Sair
        </Button>
      </div>
    </main>
  );
}
