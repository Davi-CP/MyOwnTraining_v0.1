import { createFileRoute } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
import { ProBottomNav } from "../shared/components/pro-bottom-nav";

export const Route = createFileRoute("/_private/pro/history")({
  component: ProHistoryPage,
});

function ProHistoryPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Histórico</p>
        <h1 className="mt-2 text-2xl font-bold">Treinos concluídos</h1>

        <div className="mt-5 grid gap-3">
          {[
            "Treino funcional com Ana Pereira",
            "Treino em grupo com Rafael Souza",
            "Sessão de mobilidade com Camila Oliveira",
          ].map((title, index) => (
            <div key={title} className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-[var(--brand-yellow)]" />
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">Sessão #{index + 1} · pagamento registrado</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProBottomNav />
    </div>
  );
}
