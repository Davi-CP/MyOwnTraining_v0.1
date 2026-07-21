import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Dumbbell, User, Briefcase } from "lucide-react";
import { useState } from "react";
import { Button } from "../shared/components/button"  // componente de botão estilizado
import { Input } from "../shared/components/input";     // componente de input estilizado
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";   // para obter o usuário após login           // Google OAuth
import { useSignIn } from "../modules/auth/hooks/use-sign-in";

export const Route = createFileRoute("/")({
  component: Login,
  head: () => ({ meta: [{ title: "MyOwnTraining — Personal trainers perto de você" }] }),
});

function Login() {
  const [role, setRole] = useState<"client" | "pro">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useSignIn();
  const nav = useNavigate();

  // Login com email/senha
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Atalho para administradores (legado)
    if (email.trim().toLowerCase().endsWith("@admin.com")) {
      //nav({ to: "/admin/dashboard" });
      return;
    }

    try {
      // Dispara a mutação de signIn (joga erro se falhar)
      await signIn.mutateAsync({ email, password });

      // Obtém o usuário autenticado para ler o papel (role)
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Usuário não encontrado após o login.");

      const userRole = (user.user_metadata?.role as "client" | "pro" | undefined) ?? role;
      //nav({ to: userRole === "client" ? "/home" : "/pro/dashboard" });
    } catch (error: any) {
      toast.error(error?.message ?? "Não foi possível entrar");
    }
  };

  // Login com Google
  /*const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) toast.error(result.error.message);
  };*/

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        {/* Logo / cabeçalho */}
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-yellow)]">
            <Dumbbell className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">MyOwnTraining</h1>
            <p className="text-xs text-muted-foreground">Treine onde você quiser</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Bem-vindo</h2>
          <p className="mt-1 text-sm text-muted-foreground">Entre para encontrar seu personal ideal.</p>
        </div>

        {/* Seletor de perfil */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
          {(["client", "pro"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all ${
                role === r ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              {r === "client" ? <User className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
              {r === "client" ? "Sou cliente" : "Sou profissional"}
            </button>
          ))}
        </div>

        {/* Formulário de login */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              required
              placeholder="seu@email.com"
              className="h-12 rounded-xl pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              required
              placeholder="Senha"
              className="h-12 rounded-xl pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* <Link
            to="/forgot-password"
            className="block text-right text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Esqueci minha senha
          </Link> */}
          <Button
            type="submit"
            disabled={signIn.isPending}   // usa o estado da mutação
            className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90 disabled:opacity-50"
          >
            {signIn.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Separador "ou" */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Login com Google */}
        <Button variant="outline" className="h-12 rounded-xl" onClick={() => toast.error("Login com Google não implementado ainda")}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1。18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 4.77c1.62 0 3.07.56 4.21 1.66l3.15-3.15C17.46 1.98 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            <path fill="none" d="M0 0h24v24H0z"/>
          </svg>
          Continuar com Google
        </Button>

        {/* Login com Facebook */}
        <Button variant="outline" className="mt-2 h-12 rounded-xl" onClick={() => toast.error("Login com Facebook não implementado ainda")}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#1877F2" d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.31h3.587l-.467 3.622h-3.12V24h-6.116C.593 24 0 23.407 0 22.676V1.325C0 .593.593 0 1.325 0h21.351z"/>
          </svg>
          Continuar com Facebook
        </Button>

        {/* Login com Apple */}
        <Button variant="outline" className="mt-2 h-12 rounded-xl" onClick={() => toast.error("Login com Apple não implementado ainda")}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#000000" d="M16.365 1.43c-.88.01-1.93.59-2.56 1.34-.56.66-.99 1.61-.99 2.57 0 .96.43 1.91.99 2.57.63.75 1.68 1.33 2.56 1.34h.01c.88-.01 1.93-.59 2.56-1.34.56-.66.99-1.61.99-2.57 0-.96-.43-1.91-.99-2.57-.63-.75-1.68-1.33-2.56-1.34h-.01z"/>
          </svg>
          Continuar com Apple
        </Button>

        {/* Link para criação de conta */}
        <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          Novo por aqui?{" "}
          {/* <Link
            to={role === "client" ? "/signup/client" : "/signup/professional"}
            className="font-semibold text-foreground underline-offset-2 hover:underline"
          >
            Criar conta
          </Link> */}
        </p>
      </div>
    </div>
  );
}