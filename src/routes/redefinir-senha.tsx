import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Redefinir senha · Antiparadigma OS" },
      { name: "description", content: "Defina uma nova senha para sua conta do Antiparadigma OS." },
      { property: "og:title", content: "Redefinir senha · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Defina uma nova senha para sua conta do Antiparadigma OS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [pronto, setPronto] = useState<boolean | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let ativo = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setPronto(true);
    });

    void (async () => {
      // Links de recuperação podem vir como hash (#access_token) ou ?code=
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!ativo) return;
        setPronto(!error);
        return;
      }
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!ativo) return;
        setPronto(!error);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!ativo) return;
      setPronto(!!data.session);
    })();

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setEnviando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) {
      toast.error("Não foi possível redefinir a senha. Solicite um novo link.");
      return;
    }
    toast.success("Senha redefinida. Entre com a nova senha.");
    await supabase.auth.signOut();
    void navigate({ to: "/login", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">Redefinir senha</h1>
        {pronto === false ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Este link de redefinição é inválido ou expirou. Solicite um novo na tela de login.
            </p>
            <Button
              className="mt-5 w-full"
              variant="outline"
              onClick={() => void navigate({ to: "/login" })}
            >
              Voltar ao login
            </Button>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Escolha uma nova senha com pelo menos 8 caracteres.
            </p>
            <form onSubmit={salvar} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nova-senha">Nova senha</Label>
                <Input
                  id="nova-senha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
                <Input
                  id="confirmar-senha"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={enviando || pronto === null}>
                {enviando ? "Salvando…" : "Salvar nova senha"}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
