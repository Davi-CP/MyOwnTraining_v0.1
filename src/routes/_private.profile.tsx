import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "../shared/components/bottom-nav";
import { useAuthSession } from "../modules/auth/hooks/use-auth-session";
import { useSignOut } from "../modules/auth/hooks/use-sign-out";
import { Button } from "../shared/components/button";

export const Route = createFileRoute("/_private/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data } = useAuthSession();
  const signOut = useSignOut();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto flex max-w-md flex-col gap-6 px-5 pt-6 text-left">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Perfil</p>
          <h1 className="mt-2 text-2xl font-bold">Minha conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data?.user?.email}</p>
        </div>

        <div className="rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
          <p className="mt-2 text-lg font-semibold">Conta autenticada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Base pronta para perfil, histórico, segurança e páginas legais.
          </p>
        </div>

        <div className="grid gap-3">
          <Button variant="outline" className="h-12 rounded-xl justify-start px-4">
            Segurança e privacidade
          </Button>
          <Button variant="outline" className="h-12 rounded-xl justify-start px-4">
            Termos e política
          </Button>
          <Button
            variant="destructive"
            className="h-12 rounded-xl justify-start px-4"
            onClick={() => signOut.mutate()}
          >
            Sair
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}