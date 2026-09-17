import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Briefcase, Dumbbell, Lock, Mail, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "../shared/components/button";
import { Input } from "../shared/components/input";
import { toast } from "sonner";
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

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await signIn.mutateAsync({ email, password });
      nav({ to: role === "client" ? "/home" : "/pro/dashboard" });
    } catch (error: any) {
      toast.error(error?.message ?? "Não foi possível entrar");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
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
          <Button
            type="submit"
            disabled={signIn.isPending}
            className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90 disabled:opacity-50"
          >
            {signIn.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">ou</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" className="h-12 rounded-xl" onClick={() => toast.error("Login com Google não implementado ainda")}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 4.77c1.62 0 3.07.56 4.21 1.66l3.15-3.15C17.46 1.98 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            <path fill="none" d="M0 0h24v24H0z"/>
          </svg>
          Continuar com Google
        </Button>

        <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
          Novo por aqui?{" "}
          <span className="font-semibold text-foreground">Crie sua conta na próxima etapa</span>
        </p>
      </div>
    </div>
  );
}