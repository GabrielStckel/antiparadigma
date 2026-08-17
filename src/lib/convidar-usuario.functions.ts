import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  email: z.string().email(),
  nome_completo: z.string().min(2),
  cargo: z.string().nullable().default(null),
  area_id: z.string().uuid().nullable().default(null),
  papel: z.enum(["admin", "gestor", "membro", "visualizador"]),
  permissoes: z.object({
    ferramentas: z.enum(["none", "view", "edit", "admin"]),
    tarefas: z.enum(["none", "view", "edit", "admin"]),
    admin: z.enum(["none", "view", "edit", "admin"]),
  }),
});

export const convidarUsuario = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data, context }) => {
    // Autorização: só admin ou master_admin podem convidar.
    const [admin, master] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("is_master_admin", { _user_id: context.userId }),
    ]);
    if (!(admin.data === true || master.data === true)) {
      throw new Response("Forbidden", { status: 403 });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const convite = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { nome_completo: data.nome_completo },
    });
    if (convite.error || !convite.data.user) {
      throw new Error(convite.error?.message ?? "Não foi possível enviar o convite.");
    }
    const novoId = convite.data.user.id;

    await supabaseAdmin
      .from("profiles")
      .update({
        nome_completo: data.nome_completo,
        cargo: data.cargo,
        area_id: data.area_id,
        status: "active",
      })
      .eq("id", novoId);

    await supabaseAdmin.from("user_roles").upsert(
      { user_id: novoId, role: data.papel },
      { onConflict: "user_id,role" },
    );

    const permissoes = (
      Object.entries(data.permissoes) as [
        "ferramentas" | "tarefas" | "admin",
        "none" | "view" | "edit" | "admin",
      ][]
    )
      .filter(([, nivel]) => nivel !== "none")
      .map(([module, level]) => ({
        user_id: novoId,
        module,
        level,
        granted_by: context.userId,
      }));

    await supabaseAdmin.from("module_permissions").delete().eq("user_id", novoId);
    if (permissoes.length > 0) {
      await supabaseAdmin.from("module_permissions").insert(permissoes);
    }

    await supabaseAdmin.from("audit_log").insert({
      user_id: context.userId,
      acao: "convite",
      entidade: "profiles",
      entidade_id: novoId,
      dados_depois: {
        email: data.email,
        nome_completo: data.nome_completo,
        papel: data.papel,
        permissoes: data.permissoes,
      },
    });

    return { ok: true as const, email: data.email };
  });
