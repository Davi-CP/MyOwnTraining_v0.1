import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Wallet } from "lucide-react";
import { ProBottomNav } from "../shared/components/pro-bottom-nav";
import { Button } from "../shared/components/button";

export const Route = createFileRoute("/_private/pro/profile")({
  component: ProProfilePage,
});

function ProProfilePage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">PT</p>
        <h1 className="mt-2 text-2xl font-bold">Perfil profissional</h1>

        <div className="mt-5 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[var(--brand-yellow)]" />
            <div>
              <p className="font-medium">CREF pendente de validação</p>
              <p className="text-sm text-muted-foreground">Estado visual pronto para o selo de aprovação/reprovação do admin.</p>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-[var(--brand-yellow)]" />
            <div>
              <p className="font-medium">Carteira e saque via PIX</p>
              <p className="text-sm text-muted-foreground">A UI já separa saldo disponível, extrato e verificação facial.</p>
            </div>
          </div>
        </div>

        <Button className="mt-5 h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
          Editar perfil
        </Button>
      </div>

      <ProBottomNav />
    </div>
  );
}
