import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" });

    // Bloqueio central de conta: cobre toda rota autenticada, inclusive as futuras.
    const { data: perfil } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", data.user.id)
      .maybeSingle();
    if (perfil?.status === "pending" || perfil?.status === "suspended") {
      throw redirect({ to: "/acesso-pendente" });
    }

    return { user: data.user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
