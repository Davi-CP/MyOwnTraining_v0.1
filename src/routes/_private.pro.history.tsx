import { createFileRoute } from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
import { ProBottomNav } from "../shared/components/pro-bottom-nav";
import { formatBRL, formatDate } from "../shared/lib/utils";
import { useProHistory } from "../modules/marketplace/hooks/use-pro-history";

export const Route = createFileRoute("/_private/pro/history")({
  component: ProHistoryPage,
});

function ProHistoryPage() {
  const { data: sessions = [], isLoading } = useProHistory();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Histórico</p>
        <h1 className="mt-2 text-2xl font-bold">Treinos concluídos</h1>

        <div className="mt-5 grid gap-3">
          {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando histórico...</p>}
          {!isLoading && sessions.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum treino concluído ainda.</p>
          )}
          {sessions.map((session) => (
            <div key={session.id} className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-[var(--brand-yellow)]" />
                <div>
                  <p className="font-medium">Sessão com {session.clienteNome}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(session.datetime)} · {formatBRL(session.value)}
                  </p>
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