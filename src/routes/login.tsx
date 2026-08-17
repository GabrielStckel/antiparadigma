import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar · Antiparadigma OS" },
      {
        name: "description",
        content: "Acesso restrito ao sistema interno de gestão da Antiparadigma.",
      },
      { property: "og:title", content: "Entrar · Antiparadigma OS" },
      {
        property: "og:description",
        content: "Acesso restrito ao sistema interno de gestão da Antiparadigma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setEnviando(false);
    if (error) {
      toast.error(
        error.message.includes("Invalid login")
          ? "E-mail ou senha inválidos."
          : error.message.includes("not confirmed")
            ? "Confirme seu e-mail antes de entrar."
            : "Não foi possível entrar. Tente novamente.",
      );
      return;
    }
    if (data.user) {
      const { data: perfil } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .maybeSingle();
      if (perfil && perfil.status !== "active") {
        void navigate({ to: "/acesso-pendente", replace: true });
        return;
      }
      await supabase
        .from("profiles")
        .update({ ultimo_acesso: new Date().toISOString() })
        .eq("id", data.user.id);
      void navigate({ to: "/ferramentas" });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Antiparadigma
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Antiparadigma OS</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre com seu e-mail corporativo.</p>
        </div>
        <form onSubmit={entrar} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Entrando…" : "Entrar"}
          </Button>
        </form>
        <div className="mt-3 text-center">
          <EsqueciSenha emailInicial={email} />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          O cadastro é feito apenas por convite de um administrador.
        </p>
      </div>
    </main>
  );
}

function EsqueciSenha({ emailInicial }: { emailInicial: string }) {
  const [aberto, setAberto] = useState(false);
  const [email, setEmail] = useState(emailInicial);
  const [enviando, setEnviando] = useState(false);

  const MENSAGEM =
    "Se existir uma conta com esse e-mail, enviamos um link para redefinir a senha. Confira sua caixa de entrada e o spam.";

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    // Resposta idêntica exista ou não o e-mail: erros do provedor não são expostos.
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setEnviando(false);
    setAberto(false);
    toast.success(MENSAGEM);
  };

  return (
    <Dialog
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v);
        if (v) setEmail(emailInicial);
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Esqueci minha senha
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Recuperar senha</DialogTitle>
          <DialogDescription>
            Informe seu e-mail e enviaremos um link para definir uma nova senha.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={enviar} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <Label htmlFor="email-reset">E-mail</Label>
            <Input
              id="email-reset"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
