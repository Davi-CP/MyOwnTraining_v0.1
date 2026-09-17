import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
  head: () => ({ meta: [{ title: "Recuperar senha — MyOwnTraining" }] }),
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
        <Link to="/" className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold">Esqueceu a senha?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Digite seu email e enviaremos um link para criar uma nova senha.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-8 space-y-3"
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" className="h-12 rounded-xl pl-10" />
              </div>
              <Button type="submit" disabled={loading}
                className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90 disabled:opacity-50">
                {loading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-yellow)]">
              <Check className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold">Verifique seu email</h1>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Enviamos um link de verificação para <b>{email}</b>. Abra-o para criar uma nova senha.
            </p>
            <Link to="/reset-password"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-[var(--brand-yellow)] px-8 text-sm font-semibold text-[var(--brand-black)]">
              Já validei meu email
            </Link>
            <button onClick={() => setSent(false)} className="mt-4 text-xs text-muted-foreground underline">
              Reenviar email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
